/* progress.js — Natijam (o'quvchi paneli), yutuqlar, sertifikat */
const ACH = [
  ['🌟', 'Birinchi yulduz', () => S.stars >= 1], ['📘', 'Birinchi dars', () => Object.keys(S.done).length >= 1],
  ['📚', 'Ertak sevar (5)', () => Object.keys(S.stories).length >= 5], ['🎤', 'Notiq so‘zlovchi (5 mashq)', () => S.speak.length >= 5],
  ['🧠', 'Bilimdon (5 o‘yin)', () => Object.keys(S.scores).length >= 5], ['⭐', '25 yulduz', () => S.stars >= 25],
  ['🔥', '3 kunlik seriya', () => S.streak.n >= 3], ['🧩', 'Topishmoqchi (6)', () => Object.keys(S.riddles).length >= 6],
  ['🏆', 'Sinf chempioni', () => gradeProgress(S.grade) === 6], ['🌍', 'Super yulduz (100 ⭐)', () => S.stars >= 100],
  ['🎵', 'Qo‘shiqchi (3)', () => Object.keys(S.songs).length >= 3], ['🛍️', 'Modniy Lingo', () => S.items.owned.length >= 2]
];
const GOAL_OF = { match: 2, drag: 2, build: 4 };
const avgSpeak = p => p.speak.length ? Math.round(p.speak.reduce((a, r) => a + r.s, 0) / p.speak.length) : 0;

PAGES.progress = () => {
  const done = builtIn(S.grade).filter(t => S.done[t.id]).length, avg = avgSpeak(S);
  const sc = Object.entries(S.scores).map(([k, v]) => { const [gid, tid] = k.split(':'), g = GAMES.find(x => x.id === gid), t = T(tid); return g ? `<div class="row" style="justify-content:space-between"><span>${g.icon} ${g.uz}${t ? ' · ' + esc(t.en) : ''}</span><b>${v}/${GOAL_OF[gid] || 5}</b></div>` : ''; });
  const due = dueCount(), weak = LG.weakWords(S.miss, 5), cert = gradeProgress(S.grade) === 6;
  return `<h1>🏆 Mening natijalarim</h1>
<div class="card row hero-mini"><div style="width:110px">${mascot('happy')}</div><div><h2 style="margin:0">${esc(P.name)} · Daraja ${Math.floor(S.stars / 20) + 1}</h2><div>Sinf: <b>${gradeName(S.grade)}</b>${P.section ? ' (' + esc(P.section) + ')' : ''} · 🔥 ${S.streak.n} kun</div><div class="bar-out" style="width:260px;max-width:100%;margin-top:8px"><div class="bar-in" style="width:${S.stars % 20 * 5}%"></div></div><small>Keyingi darajagacha ${20 - S.stars % 20} ⭐</small> · <a href="#/shop">🛍️ Do‘kon</a></div></div>
<div class="stats"><div class="card stat"><b>${S.stars}</b>yulduz</div><div class="card stat"><b>${done}/6</b>mavzu</div><div class="card stat"><b>${Object.keys(S.stories).length}/20</b>ertak</div><div class="card stat"><b>${avg}%</b>talaffuz o‘rtachasi</div></div>
<h2>O‘quv jarayoni</h2><div class="card"><div class="bar-out"><div class="bar-in" style="width:${done / 6 * 100}%"></div></div><p>${done}/6 mavzu tugallangan. <a href="#/grades">Yo‘lni ko‘rish</a></p></div>
<div class="grid" style="margin-top:16px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
 <div class="card"><h3>🧠 O‘yin natijalari</h3>${sc.length ? sc.join('') : '<span class="muted">Hali o‘yin o‘ynalmagan.</span>'}</div>
 <div class="card"><h3>🎤 Talaffuz o‘sishi</h3>${sparkline(S.speak.map(x => x.s))}</div>
 <div class="card"><h3>🔁 Takrorlash</h3><p>${due} ta so‘z kutyapti.${weak.length ? '<br>Qiyin so‘zlar: <b>' + weak.map(esc).join(', ') + '</b>' : ''}</p><a class="btn sm alt" href="#/games/review">Takrorlash</a></div>
 <div class="card"><h3>🧪 Bilim darajasi testi</h3>${S.diag.length ? S.diag.slice(-3).map(x => `<div>${new Date(x.t).toLocaleDateString('uz-UZ')}: <b>${x.score}/${x.total}</b></div>`).join('') : '<span class="muted">Hali topshirilmagan.</span>'}<br><a class="btn sm ghost" href="#/games/diag">Testni boshlash</a></div></div>
<h2 style="margin-top:24px">Yutuqlar</h2><div class="grid sm">${ACH.map(a => `<div class="badge ${a[2]() ? '' : 'lock'}"><span class="big">${em(a[0])}</span>${a[1]}</div>`).join('')}</div>
<h2 style="margin-top:24px">Sertifikat</h2>${cert ? `<button class="btn" data-act="cert" data-g="${S.grade}">📜 ${gradeName(S.grade)} sertifikati</button>` : '<p class="muted">Sinfning 6 ta mavzusini yakuniy testdan o‘tib tugatsangiz, sertifikat olasiz!</p>'}`;
};
ACT.cert = d => {
  const g = +d.g, el = document.createElement('div'); el.className = 'cert';
  el.innerHTML = `<div class="cert-paper">${mascot('cheer')}<h2>SERTIFIKAT · CERTIFICATE</h2><p>LingoUz Kids ushbu sertifikatni taqdim etadi:</p><div class="nm">${esc(P.name)}</div>
  <p>${gradeName(g)} ingliz tili dasturining barcha 6 ta mavzusini muvaffaqiyatli tugatgani uchun.<br><i>Learn English, Play, Explore and Dream!</i></p><p>⭐ ${S.stars} yulduz · ${new Date().toLocaleDateString('uz-UZ')}</p><p><b>Malokhatkhon Toshboltayeva — LingoUz loyihasi</b></p>
  <div class="noprint row" style="justify-content:center"><button class="btn sm" id="cprint">🖨️ Chop etish</button><button class="btn sm ghost" id="cclose">Yopish</button></div></div>`;
  document.body.appendChild(el);
  $('#cprint').onclick = () => window.print(); $('#cclose').onclick = () => el.remove();
};
