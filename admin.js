/* admin.js — administrator paneli: foydalanuvchi qo'shish, sinflarga ajratish, har bir o'quvchini kuzatish */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const GNAME = { match: 'Rasm moslash', listen: 'Tinglab tanlash', spell: 'Harflash', complete: 'Gap to‘ldirish', drag: 'Sudrash', animal: 'Hayvonni topish', color: 'Rang topish', build: 'Gap tuzish', catch: 'Baliq tutish', review: 'Takrorlash', quiz: 'Yakuniy test', diag: 'Bilim testi' };
const topicName = id => { const t = TOPICS.find(x => x.id === id); return t ? t.uz : (id || '—'); };
const TK = 'lingouz-admin-token';
let token = ''; try { token = sessionStorage.getItem(TK) || ''; } catch (e) { /* ... */ }
let users = [], sel = null, filter = { grade: 0, q: '' }, detail = null, tab = 'overview', ansFilter = { r: 'all', g: '', t: '' };

async function api(path, opt = {}) {
  const r = await NETFETCH(path, { method: opt.method || 'GET', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: opt.body ? JSON.stringify(opt.body) : undefined });
  let d = {}; try { d = await r.json(); } catch (e) { /* ... */ }
  if (!r.ok) { if (r.status === 401 && token) { logout(); } throw new Error(d.error || 'Xato'); }
  return d;
}
const root = $('#adminRoot');
const fmtDate = t => t ? new Date(t).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
const ago = t => { if (!t) return 'hech qachon'; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'hozirgina' : m < 60 ? m + ' daq oldin' : m < 1440 ? Math.round(m / 60) + ' soat oldin' : Math.round(m / 1440) + ' kun oldin'; };
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const genPw = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), b => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('');
const bar = (p, cls = '') => `<div class="bar-out"><div class="bar-in ${cls}" style="width:${p}%"></div></div>`;

/* ---------- Kirish ---------- */
function loginView(msg) {
  root.innerHTML = `<div class="a-login"><div class="login-card"><h1>🛡️ Admin</h1><p class="muted">LingoUz Kids boshqaruv paneli</p><p class="credit small">Malokhatkhon Toshboltayeva — LingoUz loyihasi</p>
  <form id="lf"><label>Login<input id="lu" type="text" value="admin" autocomplete="username"></label><label>Parol<input id="lp" type="password" autocomplete="current-password" autofocus></label>
  <p class="lgmsg" role="alert">${esc(msg || '')}</p><button class="btn" type="submit">Kirish</button></form></div></div>`;
  $('#lf').onsubmit = async e => {
    e.preventDefault();
    try { const d = await api('/api/login', { method: 'POST', body: { login: $('#lu').value, password: $('#lp').value } }); if (d.role !== 'admin') throw new Error('Bu hisob administrator emas.'); token = d.token; try { sessionStorage.setItem(TK, token); } catch (x) { /* ... */ } start(); }
    catch (err) { loginView(err.message); }
  };
}
function logout() { token = ''; try { sessionStorage.removeItem(TK); } catch (e) { /* ... */ } loginView(); }

/* ---------- Asosiy ko'rinish ---------- */
async function start() {
  try {
    const [sum, us] = await Promise.all([api('/api/admin/summary'), api('/api/admin/users')]);
    users = us.users;
    root.innerHTML = `<header class="a-top"><h1>🛡️ LingoUz Kids · Admin</h1><span class="spacer"></span><span class="a-credit">Malokhatkhon Toshboltayeva — LingoUz loyihasi</span><button class="btn sm ghost" id="pwBtn">🔑 Parol</button><button class="btn sm ghost" id="outBtn">Chiqish</button></header>
    <div class="a-wrap"><div class="a-sum">
      <div class="card stat"><b>${sum.total}</b>o‘quvchi</div>
      ${[1, 2, 3, 4].map(g => `<div class="card stat"><b>${sum.byGrade[g] || 0}</b>${g}-sinf</div>`).join('')}
      <div class="card stat"><b>${sum.activeToday}</b>bugun faol</div><div class="card stat"><b>${sum.avgStars}</b>o‘rtacha ⭐</div></div>
      <div class="a-grid"><section class="card a-list"><div class="row"><h2 style="margin:0">O‘quvchilar</h2><span class="spacer"></span><button class="btn sm" id="addBtn">➕ Qo‘shish</button></div>
        <div class="tabs" id="gf">${[[0, 'Hammasi'], [1, '1-sinf'], [2, '2-sinf'], [3, '3-sinf'], [4, '4-sinf']].map(g => `<button class="tab ${filter.grade === g[0] ? 'on' : ''}" data-g="${g[0]}">${g[1]}</button>`).join('')}</div>
        <input type="text" id="sq" placeholder="🔎 Ism yoki login" value="${esc(filter.q)}" aria-label="Qidirish"><div id="ulist"></div></section>
      <section id="udetail" class="a-detail"><div class="card center muted"><h2>O‘quvchini tanlang</h2><p>Chapdagi ro‘yxatdan o‘quvchini bosing — uning bosqichi va javoblari shu yerda ko‘rinadi.</p></div></section></div></div>`;
    $('#outBtn').onclick = logout; $('#pwBtn').onclick = pwModal; $('#addBtn').onclick = addModal;
    $('#gf').onclick = e => { const b = e.target.closest('[data-g]'); if (b) { filter.grade = +b.dataset.g; start2(); } };
    $('#sq').oninput = e => { filter.q = e.target.value; renderList(); };
    renderList(); if (sel) openUser(sel);
  } catch (e) { loginView(e.message); }
}
async function start2() { // faqat ro'yxatni yangilash
  const us = await api('/api/admin/users'); users = us.users; $$('#gf .tab').forEach(b => b.classList.toggle('on', +b.dataset.g === filter.grade)); renderList();
}
function renderList() {
  const q = filter.q.trim().toLowerCase();
  const list = users.filter(u => (!filter.grade || u.grade === filter.grade) && (!q || u.name.toLowerCase().includes(q) || u.login.includes(q))).sort((a, b) => a.grade - b.grade || a.name.localeCompare(b.name));
  $('#ulist').innerHTML = list.length ? list.map(u => `<button class="urow ${sel === u.id ? 'on' : ''} ${u.active ? '' : 'off'}" data-id="${u.id}"><span class="g g${u.grade}">${u.grade}${esc(u.section)}</span><span class="un"><b>${esc(u.name)}</b><small>${esc(u.login)} · ${ago(u.lastSeen)}</small></span><span class="uk"><b>${u.topicsDone}/6</b><small>${pct(u.correct, u.answered)}% to‘g‘ri</small></span></button>`).join('') : '<p class="muted center">O‘quvchi topilmadi.</p>';
  $$('.urow').forEach(b => b.onclick = () => openUser(b.dataset.id));
}

/* ---------- O'quvchi tafsilotlari ---------- */
async function openUser(id) {
  sel = id; renderList();
  try { detail = await api('/api/admin/users/' + id); } catch (e) { return; }
  drawDetail();
}
function drawDetail() {
  const d = detail, u = d.user, s = d.stats, st = d.state || {};
  const ts = TOPICS.filter(t => t.grade === u.grade && /^g\dt\d$/.test(t.id)), next = ts.find(t => !s.done.includes(t.id));
  const head = `<div class="card c1 u-head"><div class="row"><span class="g g${u.grade} big">${u.grade}${esc(u.section)}</span><div><h2 style="margin:0">${esc(u.name)}</h2><div class="muted">Login: <b>${esc(u.login)}</b> · oxirgi kirish: ${ago(u.lastSeen)}${u.active ? '' : ' · <b style="color:#e11d48">bloklangan</b>'}</div></div><span class="spacer"></span>
    <button class="btn sm ghost" data-a="pw">🔑 Parol</button><button class="btn sm ghost" data-a="grade">🎓 Sinf</button><button class="btn sm ghost" data-a="limit">⏱️ Vaqt</button><button class="btn sm ghost" data-a="toggle">${u.active ? '⛔ Bloklash' : '✅ Faollashtirish'}</button><a class="btn sm ghost" href="/api/admin/users/${u.id}/events.csv" data-csv>⬇️ CSV</a><button class="btn sm ghost" data-a="del">🗑️</button></div></div>`;
  const tabs = `<div class="tabs">${[['overview', '📊 Umumiy'], ['answers', '✍️ Javoblar'], ['games', '🎮 O‘yinlar'], ['speak', '🎤 Talaffuz']].map(t => `<button class="tab ${tab === t[0] ? 'on' : ''}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>`;
  let body = '';
  if (tab === 'overview') {
    body = `<div class="a-sum sm"><div class="card stat"><b>${s.stars}</b>yulduz</div><div class="card stat"><b>${s.done.filter(x => /^g\dt\d$/.test(x)).length}/6</b>mavzu</div><div class="card stat"><b>${pct(s.correct, s.answered)}%</b>to‘g‘ri javob</div><div class="card stat"><b>${s.answered}</b>javob</div><div class="card stat"><b>${s.streak}</b>kun seriya</div><div class="card stat"><b>${s.minutesToday}</b>bugun (daq)</div></div>
    <div class="card"><h3>🗺️ Bosqich — ${u.grade}-sinf yo‘li</h3>${next ? `<p>Hozirgi bosqich: <b>${esc(next.uz)}</b> (${esc(next.en)})</p>` : '<p><b>🎉 Barcha mavzular tugallangan!</b></p>'}
      ${ts.map((t, i) => { const a = s.byTopic[t.id], done = s.done.includes(t.id); return `<div class="trow ${done ? 'done' : next && next.id === t.id ? 'cur' : ''}"><span class="dot">${done ? '✓' : i + 1}</span><span class="tn"><b>${esc(t.uz)}</b><small>${a ? a.ok + '/' + a.n + ' to‘g‘ri' : 'javob yo‘q'}</small></span><span class="tb">${a ? bar(pct(a.ok, a.n), pct(a.ok, a.n) < 50 ? 'low' : '') : ''}</span><b>${a ? pct(a.ok, a.n) + '%' : ''}</b></div>`; }).join('')}</div>
    <div class="a-two"><div class="card"><h3>🎮 O‘yin turlari bo‘yicha</h3>${Object.entries(s.byGame).map(([g, a]) => `<div class="trow"><span class="tn"><b>${esc(GNAME[g] || g)}</b><small>${a.ok}/${a.n}</small></span><span class="tb">${bar(pct(a.ok, a.n), pct(a.ok, a.n) < 50 ? 'low' : '')}</span><b>${pct(a.ok, a.n)}%</b></div>`).join('') || '<p class="muted">Hali ma’lumot yo‘q.</p>'}</div>
    <div class="card"><h3>⚠️ Eng ko‘p xato qilgan so‘zlari</h3>${s.weak.length ? s.weak.map(w => `<span class="chip">${esc(w[0])} <b>×${w[1]}</b></span>`).join('') : '<p class="muted">Xato yo‘q yoki ma’lumot kam.</p>'}<p class="muted small">Ertaklar: ${s.stories}/20 · Kunlik limit: ${u.limit ? u.limit + ' daq' : 'cheklanmagan'}</p></div></div>`;
  }
  if (tab === 'answers') {
    const evs = d.events.filter(e => (ansFilter.r === 'all' || (ansFilter.r === 'ok' ? e.ok : !e.ok)) && (!ansFilter.g || e.g === ansFilter.g) && (!ansFilter.t || e.tid === ansFilter.t));
    const gs = [...new Set(d.events.map(e => e.g).filter(Boolean))], tps = [...new Set(d.events.map(e => e.tid).filter(Boolean))];
    body = `<div class="card"><div class="row"><select id="fR" aria-label="Natija"><option value="all">Hammasi</option><option value="ok" ${ansFilter.r === 'ok' ? 'selected' : ''}>✅ To‘g‘ri</option><option value="bad" ${ansFilter.r === 'bad' ? 'selected' : ''}>❌ Xato</option></select>
      <select id="fG" aria-label="O‘yin"><option value="">Barcha o‘yinlar</option>${gs.map(g => `<option value="${esc(g)}" ${ansFilter.g === g ? 'selected' : ''}>${esc(GNAME[g] || g)}</option>`).join('')}</select>
      <select id="fT" aria-label="Mavzu"><option value="">Barcha mavzular</option>${tps.map(t => `<option value="${esc(t)}" ${ansFilter.t === t ? 'selected' : ''}>${esc(topicName(t))}</option>`).join('')}</select><span class="muted">${evs.length} ta javob</span></div>
      <div style="overflow:auto"><table class="tbl"><tr><th></th><th>Vaqt</th><th>O‘yin</th><th>Mavzu</th><th>Savol</th><th>Javobi</th><th>To‘g‘ri javob</th></tr>
      ${evs.slice(0, 300).map(e => `<tr class="${e.ok ? 'rok' : 'rbad'}"><td>${e.ok ? '✅' : '❌'}</td><td>${fmtDate(e.t)}</td><td>${esc(GNAME[e.g] || e.g)}</td><td>${esc(topicName(e.tid))}</td><td>${esc(e.q || e.w)}</td><td>${esc(e.a)}</td><td>${esc(e.r)}</td></tr>`).join('') || '<tr><td colspan="7" class="muted">Javoblar yo‘q.</td></tr>'}</table></div></div>`;
  }
  if (tab === 'games') body = `<div class="card"><h3>So‘nggi o‘yinlar</h3><table class="tbl"><tr><th>Vaqt</th><th>O‘yin</th><th>Mavzu</th><th>Natija</th><th>Daraja</th></tr>${s.games.map(e => `<tr><td>${fmtDate(e.t)}</td><td>${esc(GNAME[e.g] || e.g)}</td><td>${esc(topicName(e.tid))}</td><td><b>${e.score}/${e.total}</b> ${e.g === 'quiz' ? (e.id === 'pass' ? '✅ o‘tdi' : '❌ o‘tmadi') : ''}</td><td>${['Oson', 'O‘rta', 'Qiyin'][e.lvl] || ''}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">O‘yin yo‘q.</td></tr>'}</table></div>`;
  if (tab === 'speak') body = `<div class="card"><h3>Talaffuz mashqlari</h3><table class="tbl"><tr><th>Vaqt</th><th>Aytilishi kerak</th><th>Eshitildi</th><th>Ball</th></tr>${s.speak.map(e => `<tr><td>${fmtDate(e.t)}</td><td>${esc(e.w)}</td><td>${esc(e.a) || '—'}</td><td><b>${e.s}%</b></td></tr>`).join('') || '<tr><td colspan="4" class="muted">Mashq yo‘q.</td></tr>'}</table></div>`;
  $('#udetail').innerHTML = head + tabs + body;
  $$('#udetail [data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; drawDetail(); });
  $$('#udetail [data-a]').forEach(b => b.onclick = () => userAction(b.dataset.a));
  const csv = $('[data-csv]'); if (csv) csv.onclick = async e => { e.preventDefault(); const r = await fetch(csv.getAttribute('href'), { headers: { Authorization: 'Bearer ' + token } }); const a = document.createElement('a'); a.href = URL.createObjectURL(await r.blob()); a.download = u.login + '.csv'; a.click(); };
  ['fR', 'fG', 'fT'].forEach(id => { const el = $('#' + id); if (el) el.onchange = () => { ansFilter = { r: $('#fR').value, g: $('#fG').value, t: $('#fT').value }; drawDetail(); }; });
}
async function patch(body) { await api('/api/admin/users/' + sel, { method: 'PATCH', body }); await start2(); await openUser(sel); }
async function userAction(a) {
  const u = detail.user;
  if (a === 'toggle') return patch({ active: !u.active });
  if (a === 'grade') { const g = prompt('Yangi sinf (1–4):', u.grade); if (g) { const sec = prompt('Sinf harfi (masalan A), bo‘sh qoldirish mumkin:', u.section || ''); try { await patch({ grade: +g, section: sec || '' }); } catch (e) { alert(e.message); } } return; }
  if (a === 'limit') { const m = prompt('Kunlik vaqt chegarasi (daqiqa, 0 = cheklovsiz):', u.limit || 0); if (m != null) try { await patch({ limit: +m }); } catch (e) { alert(e.message); } return; }
  if (a === 'pw') return credModal(u, true);
  if (a === 'del') { if (confirm(`${u.name} butunlay o‘chiriladi (natijalari bilan). Qaytarib bo‘lmaydi. Davom etasizmi?`)) { await api('/api/admin/users/' + u.id, { method: 'DELETE' }); sel = null; detail = null; await start(); } }
}

/* ---------- Oynalar ---------- */
function modal(html) { const d = document.createElement('div'); d.className = 'modal'; d.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true">${html}</div>`; document.body.appendChild(d); d.addEventListener('click', e => { if (e.target === d) d.remove(); }); const f = $('input,select', d); if (f) f.focus(); return d; }
function showCreds(name, login, pw) {
  const d = modal(`<h2>✅ Tayyor!</h2><p><b>${esc(name)}</b> uchun kirish ma’lumotlari:</p><div class="creds"><div>Login: <b id="cl">${esc(login)}</b></div><div>Parol: <b id="cp">${esc(pw)}</b></div><div class="muted small">Sayt: ${esc(location.origin)}</div></div>
  <p class="muted small">Parol faqat hozir ko‘rinadi (keyin faqat tiklash mumkin). O‘quvchiga bering.</p><div class="row"><button class="btn sm" id="cpy">📋 Nusxalash</button><button class="btn sm ghost" id="prn">🖨️ Chop etish</button><button class="btn sm ghost" id="ok">Yopish</button></div>`);
  $('#cpy', d).onclick = () => navigator.clipboard && navigator.clipboard.writeText(`${name}\nSayt: ${location.origin}\nLogin: ${login}\nParol: ${pw}`);
  $('#prn', d).onclick = () => window.print(); $('#ok', d).onclick = () => d.remove();
}
function addModal() {
  const d = modal(`<h2>➕ Yangi o‘quvchi</h2><form id="af" class="form"><label>Ism familiya<input id="aN" type="text" maxlength="60" required></label>
  <div class="row2"><label>Sinf<select id="aG"><option>1</option><option>2</option><option>3</option><option>4</option></select></label><label>Sinf harfi<input id="aS" type="text" maxlength="3" placeholder="A"></label></div>
  <label>Login<input id="aL" type="text" maxlength="32" placeholder="masalan: ali.v" required></label>
  <label>Parol<div class="row"><input id="aP" type="text" value="${genPw()}" style="flex:1" required><button type="button" class="btn sm ghost" id="aGen">🎲</button></div></label>
  <label>Kunlik vaqt (daqiqa, 0 = cheksiz)<input id="aM" type="number" min="0" max="240" value="0"></label><p class="lgmsg" id="aMsg"></p>
  <div class="row"><button class="btn" type="submit">Qo‘shish</button><button type="button" class="btn ghost" id="aX">Bekor</button></div></form>`);
  const nameIn = $('#aN', d); nameIn.addEventListener('blur', () => { const l = $('#aL', d); if (!l.value && nameIn.value) l.value = nameIn.value.toLowerCase().normalize('NFKD').replace(/[ʻʼ’‘'`]/g, '').replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '').slice(0, 24); });
  $('#aGen', d).onclick = () => { $('#aP', d).value = genPw(); }; $('#aX', d).onclick = () => d.remove();
  $('#af', d).onsubmit = async e => {
    e.preventDefault();
    try { const body = { name: $('#aN', d).value, login: $('#aL', d).value, password: $('#aP', d).value, grade: +$('#aG', d).value, section: $('#aS', d).value, limit: +$('#aM', d).value }; const r = await api('/api/admin/users', { method: 'POST', body }); d.remove(); sel = r.user.id; await start(); showCreds(r.user.name, r.user.login, body.password); }
    catch (err) { $('#aMsg', d).textContent = err.message; }
  };
}
function credModal(u) {
  const d = modal(`<h2>🔑 Yangi parol</h2><p><b>${esc(u.name)}</b> (${esc(u.login)}) uchun yangi parol:</p><div class="row"><input id="rP" type="text" value="${genPw()}" style="flex:1"><button class="btn sm ghost" id="rG">🎲</button></div><p class="lgmsg" id="rMsg"></p><div class="row"><button class="btn" id="rOk">Saqlash</button><button class="btn ghost" id="rX">Bekor</button></div>`);
  $('#rG', d).onclick = () => { $('#rP', d).value = genPw(); }; $('#rX', d).onclick = () => d.remove();
  $('#rOk', d).onclick = async () => { const pw = $('#rP', d).value; try { await api('/api/admin/users/' + u.id, { method: 'PATCH', body: { password: pw } }); d.remove(); showCreds(u.name, u.login, pw); } catch (e) { $('#rMsg', d).textContent = e.message; } };
}
function pwModal() {
  const d = modal(`<h2>🔑 Admin parolini o‘zgartirish</h2><form class="form" id="pf"><label>Joriy parol<input id="pC" type="password" autocomplete="current-password"></label><label>Yangi parol (kamida 8 belgi)<input id="pN" type="password" autocomplete="new-password"></label><p class="lgmsg" id="pM"></p><div class="row"><button class="btn" type="submit">Saqlash</button><button type="button" class="btn ghost" id="pX">Bekor</button></div></form>`);
  $('#pX', d).onclick = () => d.remove();
  $('#pf', d).onsubmit = async e => { e.preventDefault(); try { await api('/api/admin/password', { method: 'POST', body: { current: $('#pC', d).value, password: $('#pN', d).value } }); d.remove(); alert('Parol o‘zgartirildi.'); } catch (err) { $('#pM', d).textContent = err.message; } };
}

if (token) start(); else loginView();

async function NETFETCH(...a) { try { return await fetch(...a); } catch (e) { throw Object.assign(new Error('Server bilan aloqa yo‘q. Serverni ishga tushiring: node server.js, so‘ng http://localhost:5173 manzilini oching.'), { status: 0 }); } }
