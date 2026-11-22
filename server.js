/* server.js — LingoUz Kids serveri (tashqi kutubxonasiz, Node 18+).
   Statik fayllar + API: login, foydalanuvchilar (admin qo'shadi), progress sinxroni va javoblar jurnali.
   Ishga tushirish:  node server.js    (PORT, DB_FILE, ADMIN_PASSWORD muhit o'zgaruvchilari ixtiyoriy) */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');

const ROOT = __dirname;
const PORT = +process.env.PORT || 5173;
const DB_FILE = process.env.DB_FILE || path.join(ROOT, 'server', 'db.json');
const MAX_EVENTS = 5000;                     // bir foydalanuvchi uchun saqlanadigan javoblar soni
const TOKEN_TTL = { admin: 12 * 3600e3, user: 30 * 24 * 3600e3 };

/* ---------- Ma'lumotlar bazasi (JSON fayl, atomik yozish) ---------- */
let db;
const hashPw = (pw, salt) => crypto.scryptSync(String(pw), salt, 32).toString('hex');
const newSalt = () => crypto.randomBytes(16).toString('hex');
const setPw = (obj, pw) => { obj.salt = newSalt(); obj.hash = hashPw(pw, obj.salt); };
const checkPw = (obj, pw) => { if (!obj || !obj.hash) return false; const a = Buffer.from(hashPw(pw, obj.salt), 'hex'), b = Buffer.from(obj.hash, 'hex'); return a.length === b.length && crypto.timingSafeEqual(a, b); };

function loadDb() {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (process.env.ADMIN_PASSWORD) { setPw(db.admin, process.env.ADMIN_PASSWORD); flushNow(); console.log('Admin paroli ADMIN_PASSWORD muhit o‘zgaruvchisi bo‘yicha o‘rnatildi.'); }   // parolni tiklash usuli
  } catch (e) {
    db = { secret: crypto.randomBytes(32).toString('hex'), admin: { login: 'admin' }, users: {}, events: {} };
    const pw = process.env.ADMIN_PASSWORD || crypto.randomBytes(6).toString('base64url');
    setPw(db.admin, pw); flushNow();
    console.log('\n=== BIRINCHI ISHGA TUSHIRISH ===\nAdmin login: admin\nAdmin parol: ' + pw + '\n(Parolni admin sahifasida o\'zgartiring. Bu xabar bir marta chiqadi.)\n');
  }
}
let writeTimer = null;
function flushNow() {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  const tmp = DB_FILE + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(db)); fs.renameSync(tmp, DB_FILE);
}
function persist() { clearTimeout(writeTimer); writeTimer = setTimeout(() => { try { flushNow(); } catch (e) { console.error('DB yozilmadi', e.message); } }, 400); }
process.on('SIGINT', () => { try { flushNow(); } catch (e) { /* e'tiborsiz */ } process.exit(0); });
loadDb();

/* ---------- Token (HMAC imzo) ---------- */
const b64 = o => Buffer.from(o).toString('base64url');
function signToken(payload) { const p = b64(JSON.stringify(payload)); return p + '.' + crypto.createHmac('sha256', db.secret).update(p).digest('base64url'); }
function readToken(tok) {
  if (typeof tok !== 'string' || !tok.includes('.')) return null;
  const [p, sig] = tok.split('.'), exp = crypto.createHmac('sha256', db.secret).update(p).digest('base64url');
  if (sig.length !== exp.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(exp))) return null;
  try { const d = JSON.parse(Buffer.from(p, 'base64url').toString()); return d.exp > Date.now() ? d : null; } catch (e) { return null; }
}

/* ---------- Yordamchilar ---------- */
const json = (res, code, obj) => { const b = JSON.stringify(obj); res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); res.end(b); };
const fail = (res, code, msg) => json(res, code, { error: msg });
function readBody(req, limit = 1.5e6) {
  return new Promise((resolve, reject) => {
    let n = 0; const chunks = [];
    req.on('data', c => { n += c.length; if (n > limit) { reject(Object.assign(new Error('Hajm katta'), { code: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}); } catch (e) { reject(Object.assign(new Error('JSON xato'), { code: 400 })); } });
    req.on('error', reject);
  });
}
const str = (v, n) => String(v == null ? '' : v).slice(0, n);
const validLogin = l => /^[a-z0-9._-]{3,32}$/.test(l);
const validPw = p => typeof p === 'string' && p.length >= 4 && p.length <= 64;
const publicUser = u => ({ id: u.id, name: u.name, login: u.login, grade: u.grade, section: u.section || '', active: u.active !== false, limit: u.limit || 0, created: u.created, lastSeen: u.lastSeen || 0 });
const today = () => new Date().toISOString().slice(0, 10);

/* Login urinishlarini cheklash */
const tries = new Map();
function throttled(key) { const t = tries.get(key); return t && t.n >= 5 && Date.now() - t.at < 60e3; }
function noteFail(key) { const t = tries.get(key) || { n: 0, at: 0 }; t.n++; t.at = Date.now(); tries.set(key, t); }

/* Hisoblangan ko'rsatkichlar (admin uchun) */
function statsFor(u) {
  const ev = db.events[u.id] || [], st = u.state || {};
  const ans = ev.filter(e => e.type === 'ans');
  const agg = (key) => { const m = {}; ans.forEach(e => { const k = e[key] || '-'; (m[k] = m[k] || { n: 0, ok: 0 }); m[k].n++; if (e.ok) m[k].ok++; }); return m; };
  const wrong = {}; ans.filter(e => !e.ok && e.w).forEach(e => { wrong[e.w] = (wrong[e.w] || 0) + 1; });
  return {
    answered: ans.length, correct: ans.filter(e => e.ok).length,
    byGame: agg('g'), byTopic: agg('tid'),
    weak: Object.entries(wrong).sort((a, b) => b[1] - a[1]).slice(0, 12),
    games: ev.filter(e => e.type === 'game').slice(-60).reverse(),
    speak: ev.filter(e => e.type === 'speak').slice(-40).reverse(),
    done: Object.keys(st.done || {}), stars: st.stars || 0, streak: (st.streak && st.streak.n) || 0,
    minutesToday: Math.round((st.time && st.time[today()]) || 0), stories: Object.keys(st.stories || {}).length
  };
}
const csvCell = v => { let s = String(v == null ? '' : v); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };

/* ---------- API ---------- */
async function api(req, res, url) {
  const p = url.pathname, m = req.method;
  let body = {};
  if (m === 'POST' || m === 'PUT' || m === 'PATCH') {
    try { body = await readBody(req, p === '/api/state' ? 1.5e6 : 3e5); } catch (e) { return fail(res, e.code || 400, e.message); }
  }
  // --- login ---
  if (p === '/api/login' && m === 'POST') {
    const login = str(body.login, 40).trim().toLowerCase(), pw = str(body.password, 80), key = (req.socket.remoteAddress || '') + '|' + login;
    if (throttled(key)) return fail(res, 429, 'Juda ko‘p urinish. 1 daqiqadan keyin qayta urinib ko‘ring.');
    if (login === db.admin.login && checkPw(db.admin, pw)) { tries.delete(key); return json(res, 200, { token: signToken({ sub: 'admin', role: 'admin', exp: Date.now() + TOKEN_TTL.admin }), role: 'admin', user: { name: 'Admin', login } }); }
    const u = Object.values(db.users).find(x => x.login === login);
    if (!u || !checkPw(u, pw)) { noteFail(key); return fail(res, 401, 'Login yoki parol noto‘g‘ri.'); }
    if (u.active === false) return fail(res, 403, 'Hisob o‘chirilgan. Administratorga murojaat qiling.');
    tries.delete(key); u.lastSeen = Date.now(); persist();
    return json(res, 200, { token: signToken({ sub: u.id, role: 'user', exp: Date.now() + TOKEN_TTL.user }), role: 'user', user: publicUser(u) });
  }
  // --- autentifikatsiya ---
  const auth = readToken((req.headers.authorization || '').replace(/^Bearer /, ''));
  if (!auth) return fail(res, 401, 'Kirish talab qilinadi.');

  if (auth.role === 'user') {
    const u = db.users[auth.sub]; if (!u || u.active === false) return fail(res, 401, 'Hisob topilmadi yoki o‘chirilgan.');
    if (p === '/api/me' && m === 'GET') return json(res, 200, { user: publicUser(u) });
    if (p === '/api/state' && m === 'GET') return json(res, 200, { user: publicUser(u), state: Object.assign({}, u.state || {}, { grade: u.grade }) });
    if (p === '/api/state' && m === 'PUT') {
      if (!body.state || typeof body.state !== 'object' || Array.isArray(body.state)) return fail(res, 400, 'Holat noto‘g‘ri.');
      const s = body.state; s.grade = u.grade; u.state = s; u.lastSeen = Date.now(); persist(); return json(res, 200, { ok: true });
    }
    if (p === '/api/events' && m === 'POST') {
      const list = Array.isArray(body.events) ? body.events.slice(0, 200) : [], arr = db.events[u.id] = db.events[u.id] || [];
      for (const e of list) {
        if (!e || typeof e !== 'object' || !['ans', 'game', 'speak', 'story', 'riddle', 'lesson', 'misc'].includes(e.type)) continue;
        arr.push({ t: +e.t || Date.now(), type: e.type, g: str(e.g, 20), tid: str(e.tid, 12), w: str(e.w, 60), q: str(e.q, 200), a: str(e.a, 120), r: str(e.r, 120), ok: e.ok ? 1 : 0, score: +e.score || 0, total: +e.total || 0, s: +e.s || 0, lvl: +e.lvl || 0, id: str(e.id, 20) });
      }
      if (arr.length > MAX_EVENTS) arr.splice(0, arr.length - MAX_EVENTS);
      u.lastSeen = Date.now(); persist(); return json(res, 200, { ok: true, n: list.length });
    }
    return fail(res, p.startsWith('/api/admin') ? 403 : 404, p.startsWith('/api/admin') ? 'Ruxsat yo‘q.' : 'Topilmadi');
  }

  /* --- admin --- */
  if (auth.role !== 'admin') return fail(res, 403, 'Ruxsat yo‘q.');
  if (p === '/api/admin/summary' && m === 'GET') {
    const us = Object.values(db.users), byGrade = { 1: 0, 2: 0, 3: 0, 4: 0 };
    us.forEach(u => { byGrade[u.grade] = (byGrade[u.grade] || 0) + 1; });
    const dayStart = new Date().setHours(0, 0, 0, 0);
    return json(res, 200, { total: us.length, byGrade, activeToday: us.filter(u => (u.lastSeen || 0) >= dayStart).length, avgStars: us.length ? Math.round(us.reduce((a, u) => a + ((u.state && u.state.stars) || 0), 0) / us.length) : 0 });
  }
  if (p === '/api/admin/users' && m === 'GET') {
    return json(res, 200, { users: Object.values(db.users).map(u => { const s = statsFor(u); return { ...publicUser(u), stars: s.stars, topicsDone: s.done.filter(d => /^g\dt\d$/.test(d)).length, answered: s.answered, correct: s.correct }; }) });
  }
  if (p === '/api/admin/users' && m === 'POST') {
    const name = str(body.name, 60).trim(), login = str(body.login, 40).trim().toLowerCase(), grade = +body.grade;
    if (!name) return fail(res, 400, 'Ism kiriting.');
    if (!validLogin(login)) return fail(res, 400, 'Login 3–32 belgi: kichik lotin harf, raqam, nuqta, chiziqcha.');
    if (!validPw(body.password)) return fail(res, 400, 'Parol kamida 4 belgi bo‘lsin.');
    if (![1, 2, 3, 4].includes(grade)) return fail(res, 400, 'Sinf 1–4 bo‘lsin.');
    if (login === db.admin.login || Object.values(db.users).some(u => u.login === login)) return fail(res, 409, 'Bu login band.');
    const u = { id: 'u' + crypto.randomBytes(5).toString('hex'), name, login, grade, section: str(body.section, 6).trim(), active: true, limit: Math.max(0, Math.min(240, +body.limit || 0)), created: Date.now(), state: null };
    setPw(u, body.password); db.users[u.id] = u; db.events[u.id] = []; persist();
    return json(res, 201, { user: publicUser(u) });
  }
  let mm;
  if ((mm = p.match(/^\/api\/admin\/users\/(u[0-9a-f]+)(\/events\.csv)?$/))) {
    const u = db.users[mm[1]]; if (!u) return fail(res, 404, 'Foydalanuvchi topilmadi.');
    if (mm[2] && m === 'GET') {
      const rows = ['sana,turi,oyin,mavzu,savol,javob,togri_javob,natija,ball,jami'];
      (db.events[u.id] || []).forEach(e => rows.push([new Date(e.t).toISOString(), e.type, e.g, e.tid, e.q || e.w, e.a, e.r, e.type === 'ans' ? (e.ok ? 'togri' : 'xato') : '', e.score || e.s || '', e.total || ''].map(csvCell).join(',')));
      res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${u.login}.csv"` }); return res.end('﻿' + rows.join('\n'));
    }
    if (m === 'GET') return json(res, 200, { user: publicUser(u), state: u.state || {}, stats: statsFor(u), events: (db.events[u.id] || []).filter(e => e.type === 'ans').slice(-800).reverse() });
    if (m === 'PATCH') {
      if (body.name != null) { const n = str(body.name, 60).trim(); if (!n) return fail(res, 400, 'Ism bo‘sh.'); u.name = n; }
      if (body.grade != null) { if (![1, 2, 3, 4].includes(+body.grade)) return fail(res, 400, 'Sinf 1–4.'); u.grade = +body.grade; }
      if (body.section != null) u.section = str(body.section, 6).trim();
      if (body.active != null) u.active = !!body.active;
      if (body.limit != null) u.limit = Math.max(0, Math.min(240, +body.limit || 0));
      if (body.password != null) { if (!validPw(body.password)) return fail(res, 400, 'Parol kamida 4 belgi.'); setPw(u, body.password); }
      persist(); return json(res, 200, { user: publicUser(u) });
    }
    if (m === 'DELETE') { delete db.users[u.id]; delete db.events[u.id]; persist(); return json(res, 200, { ok: true }); }
  }
  if (p === '/api/admin/password' && m === 'POST') {
    if (!checkPw(db.admin, str(body.current, 80))) return fail(res, 403, 'Joriy parol noto‘g‘ri.');
    if (!validPw(body.password) || body.password.length < 8) return fail(res, 400, 'Yangi parol kamida 8 belgi bo‘lsin.');
    setPw(db.admin, body.password); persist(); return json(res, 200, { ok: true });
  }
  return fail(res, 404, 'Topilmadi');
}

/* ---------- Statik fayllar (faqat ruxsat etilganlar) ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.png': 'image/png', '.ico': 'image/x-icon' };
const PUBLIC_DIRS = new Set(['emoji', 'icons', 'audio']);
const BLOCKED = new Set(['server.js', 'package.json', 'package-lock.json']);
function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
  if (rel === 'admin') rel = 'admin.html';
  const parts = rel.split('/');
  if (rel.includes('..') || rel.includes('\0') || parts.some(x => x.startsWith('.')) || BLOCKED.has(rel) || (parts.length > 1 && !PUBLIC_DIRS.has(parts[0])) || (parts.length === 1 && !MIME[path.extname(rel)])) { res.writeHead(404); return res.end('Topilmadi'); }
  const file = path.join(ROOT, rel);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Topilmadi'); }
    const rg = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (rg && path.extname(file) === '.mp3') {          // Safari/iOS audio uchun Range (206) kerak
      let s = rg[1] === '' ? Math.max(0, data.length - +rg[2]) : +rg[1], e = rg[1] === '' || rg[2] === '' ? data.length - 1 : Math.min(+rg[2], data.length - 1);
      if (s > e || s >= data.length) { res.writeHead(416, { 'Content-Range': `bytes */${data.length}` }); return res.end(); }
      res.writeHead(206, { 'Content-Type': 'audio/mpeg', 'Content-Range': `bytes ${s}-${e}/${data.length}`, 'Content-Length': e - s + 1, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      return res.end(data.subarray(s, e + 1));
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer' });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    serveStatic(req, res, url);
  } catch (e) { console.error(e); if (!res.headersSent) fail(res, 500, 'Server xatosi'); }
});
server.on('error', e => {
  if (e.code === 'EADDRINUSE') { console.error(`\n${PORT}-port band: server allaqachon ishlayapti bo'lishi mumkin. Brauzerda http://localhost:${PORT} ni oching,\nyoki boshqa port bilan ishga tushiring:  $env:PORT=5174; node server.js\n`); process.exit(1); }
  throw e;
});
// cPanel (Passenger) ilovani require orqali yuklaydi, shuning uchun require.main ga tayanmaymiz; testlar LINGOUZ_NO_LISTEN=1 qo'yadi
if (!process.env.LINGOUZ_NO_LISTEN) server.listen(PORT, () => console.log(`LingoUz Kids: http://localhost:${PORT}   (admin: http://localhost:${PORT}/admin)`));
module.exports = { server, flushNow };
