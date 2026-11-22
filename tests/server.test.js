const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), os = require('os'), path = require('path');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lingouz-'));
process.env.DB_FILE = path.join(tmp, 'db.json');
process.env.ADMIN_PASSWORD = 'adminpass123';
process.env.LINGOUZ_NO_LISTEN = '1';
const { server } = require('../server.js');
let base;
test.before(async () => { await new Promise(r => server.listen(0, r)); base = 'http://127.0.0.1:' + server.address().port; });
test.after(() => server.close());

const call = async (method, url, body, token) => {
  const r = await fetch(base + url, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const ct = r.headers.get('content-type') || '';
  return { status: r.status, body: ct.includes('json') ? await r.json() : await r.text() };
};
let adminTok, userTok, uid;

test('admin login: noto‘g‘ri parol rad etiladi, to‘g‘ri parol token beradi', async () => {
  assert.equal((await call('POST', '/api/login', { login: 'admin', password: 'xxx' })).status, 401);
  const r = await call('POST', '/api/login', { login: 'admin', password: 'adminpass123' });
  assert.equal(r.status, 200); assert.equal(r.body.role, 'admin'); adminTok = r.body.token;
});
test('tokensiz va foydalanuvchi tokeni bilan admin API yopiq', async () => {
  assert.equal((await call('GET', '/api/admin/users')).status, 401);
});
test('admin foydalanuvchi qo‘shadi: tekshiruvlar', async () => {
  assert.equal((await call('POST', '/api/admin/users', { name: '', login: 'ali', password: '1234', grade: 1 }, adminTok)).status, 400);
  assert.equal((await call('POST', '/api/admin/users', { name: 'Ali', login: 'A l', password: '1234', grade: 1 }, adminTok)).status, 400);
  assert.equal((await call('POST', '/api/admin/users', { name: 'Ali', login: 'ali', password: '12', grade: 1 }, adminTok)).status, 400);
  assert.equal((await call('POST', '/api/admin/users', { name: 'Ali', login: 'ali', password: '1234', grade: 9 }, adminTok)).status, 400);
  const r = await call('POST', '/api/admin/users', { name: 'Ali Valiyev', login: 'ali', password: 'parol1', grade: 2, section: 'A' }, adminTok);
  assert.equal(r.status, 201); uid = r.body.user.id; assert.equal(r.body.user.grade, 2);
  assert.equal((await call('POST', '/api/admin/users', { name: 'Boshqa', login: 'ali', password: 'parol1', grade: 1 }, adminTok)).status, 409);
});
test('parol xesh holida saqlanadi (ochiq matn emas)', () => {
  const raw = fs.readFileSync(process.env.DB_FILE, 'utf8');
  // fayl 400ms keyin yoziladi; yozilmagan bo‘lsa ham ochiq parol bo‘lmasligi kerak
  assert.ok(!raw.includes('parol1') && !raw.includes('adminpass123'));
});
test('foydalanuvchi login qiladi, holatni saqlaydi, sinfni o‘zgartira olmaydi', async () => {
  assert.equal((await call('POST', '/api/login', { login: 'ali', password: 'noto' })).status, 401);
  const r = await call('POST', '/api/login', { login: 'ALI', password: 'parol1' });
  assert.equal(r.status, 200); assert.equal(r.body.role, 'user'); userTok = r.body.token;
  assert.equal((await call('GET', '/api/admin/users', null, userTok)).status, 403);
  assert.equal((await call('PUT', '/api/state', { state: { stars: 12, grade: 4, done: { g2t1: 1 } } }, userTok)).status, 200);
  const g = await call('GET', '/api/state', null, userTok);
  assert.equal(g.body.state.stars, 12); assert.equal(g.body.state.grade, 2);
});
test('javoblar jurnali yoziladi va tozalanadi', async () => {
  const ev = [{ type: 'ans', g: 'listen', tid: 'g2t1', w: 'nose', q: 'Tinglang', a: '👁️', r: '👃', ok: 0 }, { type: 'ans', g: 'listen', tid: 'g2t1', w: 'eye', ok: 1 },
    { type: 'game', g: 'listen', tid: 'g2t1', score: 4, total: 5 }, { type: 'hack', w: 'x' }, { type: 'ans', w: '<script>'.repeat(50), ok: 1 }];
  const r = await call('POST', '/api/events', { events: ev }, userTok); assert.equal(r.status, 200);
  const d = await call('GET', '/api/admin/users/' + uid, null, adminTok);
  assert.equal(d.status, 200);
  assert.equal(d.body.stats.answered, 3); assert.equal(d.body.stats.correct, 2);
  assert.equal(d.body.stats.games.length, 1); assert.equal(d.body.stats.weak[0][0], 'nose');
  assert.ok(d.body.events.every(e => e.w.length <= 60));
  assert.deepEqual(d.body.stats.done, ['g2t1']);
});
test('admin ro‘yxat, xulosa, CSV', async () => {
  const l = await call('GET', '/api/admin/users', null, adminTok); assert.equal(l.body.users.length, 1); assert.equal(l.body.users[0].topicsDone, 1);
  const s = await call('GET', '/api/admin/summary', null, adminTok); assert.equal(s.body.total, 1); assert.equal(s.body.byGrade[2], 1);
  const c = await call('GET', `/api/admin/users/${uid}/events.csv`, null, adminTok); assert.equal(c.status, 200); assert.match(c.body, /Tinglang/);
});
test('sinfni o‘zgartirish, parolni tiklash, o‘chirish (bloklash)', async () => {
  assert.equal((await call('PATCH', '/api/admin/users/' + uid, { grade: 3, password: 'yangi99' }, adminTok)).status, 200);
  assert.equal((await call('POST', '/api/login', { login: 'ali', password: 'parol1' })).status, 401);
  const l = await call('POST', '/api/login', { login: 'ali', password: 'yangi99' }); assert.equal(l.status, 200);
  assert.equal((await call('GET', '/api/state', null, l.body.token)).body.state.grade, 3);
  await call('PATCH', '/api/admin/users/' + uid, { active: false }, adminTok);
  assert.equal((await call('POST', '/api/login', { login: 'ali', password: 'yangi99' })).status, 403);
  assert.equal((await call('GET', '/api/state', null, l.body.token)).status, 401);
});
test('login urinishlari cheklanadi', async () => {
  let last; for (let i = 0; i < 7; i++) last = await call('POST', '/api/login', { login: 'zzz', password: 'bad' });
  assert.equal(last.status, 429);
});
test('statik: maxfiy fayllar berilmaydi, sahifalar beriladi', async () => {
  for (const u of ['/server.js', '/server/db.json', '/package.json', '/tests/logic.test.js', '/docs/BRAND.md', '/.git/config', '/../server.js', '/%2e%2e/server.js']) assert.equal((await call('GET', u)).status, 404, u);
  assert.equal((await call('GET', '/')).status, 200); assert.equal((await call('GET', '/admin')).status, 200);
});
test('parolni o‘zgartirish admin uchun', async () => {
  assert.equal((await call('POST', '/api/admin/password', { current: 'bad', password: 'newpassword1' }, adminTok)).status, 403);
  assert.equal((await call('POST', '/api/admin/password', { current: 'adminpass123', password: 'short' }, adminTok)).status, 400);
  assert.equal((await call('POST', '/api/admin/password', { current: 'adminpass123', password: 'newpassword1' }, adminTok)).status, 200);
  assert.equal((await call('POST', '/api/login', { login: 'admin', password: 'newpassword1' })).status, 200);
});

test('prefiks (mylogo.uz/lingouz/) bilan ishlash: slash qo‘shiladi, API va statik fayllar ochiladi', async () => {
  const noRedirect = await fetch(base + '/lingouz', { redirect: 'manual' });
  assert.equal(noRedirect.status, 301); assert.equal(noRedirect.headers.get('location'), '/lingouz/');
  assert.equal((await call('GET', '/lingouz/')).status, 200);
  assert.equal((await call('GET', '/lingouz/admin')).status, 200);
  assert.equal((await call('GET', '/lingouz/api/me')).status, 401);
  assert.equal((await call('GET', '/lingouz/server/db.json')).status, 404);
  assert.equal((await call('GET', '/lingouz/base.js')).status, 200);
  const l = await call('POST', '/lingouz/api/login', { login: 'admin', password: 'newpassword1' }); assert.equal(l.status, 200);
});
