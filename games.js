/* games.js — o'yin dvigateli: 10 ta ko'rinadigan o'yin + yakuniy test + kirish testi + takrorlash. Daraja adaptiv. */
const GAMES = [
  { id: 'match', icon: '🖼️', uz: 'So‘zni rasmga moslang', en: 'Match the word with the picture', topic: true },
  { id: 'listen', icon: '🎧', uz: 'Tinglang va tanlang', en: 'Listen and choose', topic: true },
  { id: 'spell', icon: '🔤', uz: 'So‘zni harflang', en: 'Spell the word', topic: true },
  { id: 'complete', icon: '✍️', uz: 'Gapni to‘ldiring', en: 'Complete the sentence', topic: true },
  { id: 'drag', icon: '🧲', uz: 'Sudrab joylashtiring', en: 'Drag and drop', topic: true },
  { id: 'animal', icon: '🦁', uz: 'Hayvonni toping', en: 'Guess the animal', topic: false },
  { id: 'color', icon: '🎨', uz: 'To‘g‘ri rangni toping', en: 'Find the correct color', topic: false },
  { id: 'build', icon: '🧱', uz: 'Gap tuzing', en: 'Build a sentence', topic: true },
  { id: 'catch', icon: '🎣', uz: 'Baliq tutish', en: 'Catch the word', topic: true },
  { id: 'review', icon: '🔁', uz: 'Takrorlash', en: 'Smart review', topic: false },
  { id: 'quiz', icon: '📝', uz: 'Yakuniy test', en: 'Final quiz', topic: true, hidden: true },
  { id: 'diag', icon: '🧪', uz: 'Bilim darajasi testi', en: 'Placement test', topic: false, hidden: true }
];
const LEVEL_NAMES = ['🙂 Oson', '😎 O‘rta', '🔥 Qiyin'];
let G = null;
const box = () => $('#gamebox');

PAGES.games = (a, b) => {
  const g = GAMES.find(x => x.id === a);
  if (!g || (g.hidden && a !== 'quiz' && a !== 'diag')) return `<h1>🎮 Educational Games</h1><p class="muted">Har bir to‘g‘ri javob uchun ⭐ olasiz. Qiyinlik darajasi natijangizga qarab o‘zi o‘zgaradi.</p>
<div class="grid">${GAMES.filter(x => !x.hidden).map((x, i) => `<a class="tile c${i % 6}" href="#/games/${x.id}"><span class="big">${x.icon}</span>${x.uz}<br><small class="muted">${x.en}</small>${x.topic !== undefined && S.level[x.id] !== undefined ? `<br><small>${LEVEL_NAMES[S.level[x.id]]}</small>` : ''}</a>`).join('')}</div>
<p style="margin-top:20px"><a class="btn sm ghost" href="#/games/diag">🧪 Bilim darajasi testi (${S.diag.length ? 'qayta' : 'kirish testi'})</a></p>`;
  if (g.topic && !(b && T(b))) return `<a href="#/games">← O‘yinlar</a><h1>${g.icon} ${g.uz}</h1><p class="muted">Mavzuni tanlang:</p><div class="grid sm">${topicsOf(S.grade).map((t, i) => topicTile(t, `#/games/${g.id}/${t.id}`, i)).join('')}</div>`;
  return '<div id="gamebox" class="game"></div>';
};
PAGES.games.after = (a, b) => { const g = GAMES.find(x => x.id === a); if (g && (!g.topic || T(b))) startGame(g, b); };

/* ---- Raund generatorlari ---- */
const allWords = () => Object.values(WORDS);
const gradeWords = gr => topicsOf(gr).flatMap(t => t.words);
function prioritize(pool) {            // xato qilingan so'zlar oldinroq (adaptiv)
  const weak = pool.filter(w => S.miss[w.en.toLowerCase()]).sort((a, b) => S.miss[b.en.toLowerCase()] - S.miss[a.en.toLowerCase()]).slice(0, 2);
  return [...weak, ...shuffle(pool.filter(w => !weak.includes(w)))];
}
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const farColor = (a, b) => { if (!a.e.startsWith('#') || !b.e.startsWith('#')) return true; const x = hexRgb(a.e), y = hexRgb(b.e); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) > 110; };
const sameKind = (a, b) => (a.e.startsWith('#') === b.e.startsWith('#')) && (a.e.startsWith('n:') === b.e.startsWith('n:'));
const distract = (w, pool, n) => { const kind = pool.filter(x => sameKind(w, x)); const cands = shuffle([...(kind.length > n ? kind : [...pool, ...allWords()])].filter(x => x.en !== w.en && x.e !== w.e && x.uz !== w.uz && sameKind(w, x) && farColor(w, x))); const out = []; cands.forEach(c => { if (out.length < n && !out.some(o => o.en === c.en || o.e === c.e || !farColor(o, c))) out.push(c); }); if (out.length < n) shuffle(allWords().filter(x => sameKind(w, x) && x.en !== w.en && x.e !== w.e)).forEach(c => { if (out.length < n && !out.some(o => o.e === c.e)) out.push(c); }); return out; };
function mcFor(w, pool, optN, fn) { return shuffle([w, ...distract(w, pool, optN - 1)]).map(x => fn(x, x === w)); }
function mixedRounds(src, n, optN, pool) {
  const types = ['p2w', 'w2u', 'l2p', 'u2w', 'p2w', 'w2u'];
  return prioritize(src).slice(0, n).map((w, i) => {
    const ty = types[i % types.length];
    if (ty === 'p2w') return { w: w.en, prompt: pic(w), sub: 'Bu inglizchada nima?', speak: w.en, opts: mcFor(w, pool, optN, (x, ok) => ({ h: esc(x.en), ok })) };
    if (ty === 'w2u') return { w: w.en, prompt: esc(w.en), sub: 'O‘zbekchada nima?', speak: w.en, opts: mcFor(w, pool, optN, (x, ok) => ({ h: esc(x.uz), ok })) };
    if (ty === 'u2w') return { w: w.en, prompt: esc(w.uz), sub: 'Inglizchasi qaysi?', opts: mcFor(w, pool, optN, (x, ok) => ({ h: esc(x.en), ok })) };
    return { w: w.en, prompt: '🔊 Tinglang', sub: 'To‘g‘ri rasmni tanlang', speak: w.en, opts: mcFor(w, pool, optN, (x, ok) => ({ h: pic(x), ok, emo: 1 })) };
  });
}
function startGame(g, tid) {
  const t = tid && T(tid), lvl = S.level[g.id] ?? 1, optN = LG.OPT_COUNT[lvl];
  const pool = t ? t.words : gradeWords(S.grade), id = g.id;
  const gradeSent = t ? [t, ...shuffle(topicsOf(t.grade).filter(x => x !== t))].map(x => x.s) : [];
  const pri = prioritize(pool);
  let rounds = [];
  if (id === 'match' || id === 'drag') { const k = lvl === 2 ? 4 : 3; rounds = [{ items: pri.slice(0, k) }, { items: pri.slice(k, 2 * k) }]; }
  if (id === 'listen' || id === 'catch') rounds = pri.slice(0, 5).map(w => ({ w: w.en, speak: w.en, pond: id === 'catch', prompt: id === 'catch' ? '🎣 Tinglang va to‘g‘ri baliqni tuting!' : '🔊 Tinglang va to‘g‘ri rasmni tanlang', opts: mcFor(w, pool, optN, (x, ok) => ({ h: pic(x), ok, emo: 1 })) }));
  if (id === 'complete') rounds = gradeSent.slice(0, 5).map(s => ({ w: s.ans, prompt: esc(s.en.replace(s.ans, '____')), sub: s.uz, speak: s.en, opts: shuffle([s.ans, ...s.wrong]).map(x => ({ h: esc(x), ok: x === s.ans })) }));
  if (id === 'animal') { const an = allWords().filter(w => CLUES[w.en]); rounds = pick(an, 5).map(w => ({ w: w.en, prompt: '🕵️ ' + CLUES[w.en].join(' '), speak: CLUES[w.en].join(' '), sub: 'Bu qaysi hayvon?', opts: mcFor(w, an, optN, (x, ok) => ({ h: pic(x), ok, emo: 1 })) })); }
  if (id === 'color') { const BASIC = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray']; const cs = T('g1t1').words.filter(w => BASIC.includes(w.en)); rounds = pick(cs, 5).map(w => ({ w: w.en, prompt: 'Find: <u>' + w.en + '</u>', sub: w.uz + ' rangini toping', speak: w.en, opts: shuffle([w, ...pick(cs.filter(x => x !== w), optN - 1)]).map(x => ({ h: pic(x), ok: x === w, t: x.en })) })); }
  if (id === 'spell') { let w = pri.filter(x => !x.en.includes(' ') && (lvl > 0 || x.en.length <= 6)); if (w.length < 5) w = pri.filter(x => !x.en.includes(' ')); rounds = w.slice(0, 5).map(x => ({ w: x.en, prompt: pic(x) + ' ' + esc(x.uz), speak: x.en, target: x.en.replace(/ /g, '').split(''), join: '' })); }
  if (id === 'build') rounds = gradeSent.slice(0, 4).map(s => ({ w: s.ans, prompt: esc(s.uz), speak: s.en, target: s.en.split(' '), join: ' ' }));
  if (id === 'quiz') rounds = mixedRounds(t.words, 5, 4, t.words);
  if (id === 'diag') rounds = mixedRounds(gradeWords(S.grade), 10, 4, gradeWords(S.grade));
  if (id === 'review') {
    const due = LG.dueWords(S.box, Date.now()), weak = LG.weakWords(S.miss, 10), keys = [...new Set([...due, ...weak])].filter(k => WORDS[k]);
    const src = keys.length >= 3 ? keys.map(k => WORDS[k]) : gradeWords(S.grade);
    rounds = prioritize(src).slice(0, 5).map(w => ({ w: w.en, speak: w.en, prompt: '🔊 Tinglang', sub: keys.length >= 3 ? 'Takrorlash: bu so‘z sizga qiyin edi' : 'Yangi so‘zlarni mustahkamlaymiz', opts: mcFor(w, src, optN, (x, ok) => ({ h: pic(x), ok, emo: 1 })) }));
  }
  G = { g, t, rounds, i: 0, score: 0, lvl, key: id + (t ? ':' + t.id : ''), tid };
  showRound();
}
const dots = () => `<div class="prog-dots" aria-hidden="true">${G.rounds.map((_, i) => `<i class="${i <= G.i ? 'on' : ''}"></i>`).join('')}</div>`;
const autoSpeak = () => S.grade === 1 || ['listen', 'catch', 'animal', 'color', 'review'].includes(G.g.id);
function showRound() {
  const r = G.rounds[G.i]; delete box().dataset.lock;
  if (!r || (r.items && !r.items.length)) return finishGame();
  const id = G.g.id, head = `<h2 class="center">${G.g.icon} ${G.g.uz}${G.t ? ' · ' + esc(G.t.en) : ''}</h2><p class="center muted" style="margin:0">${LEVEL_NAMES[G.lvl]} · ${G.i + 1}/${G.rounds.length}</p>${dots()}`;
  if (r.opts) {
    box().innerHTML = head + `<div class="prompt ${r.prompt.includes('<img') ? 'bigp' : ''}">${r.prompt}</div>${r.sub ? `<p class="center muted">${r.sub}</p>` : ''}${r.speak ? `<p class="center"><button class="btn sm ghost" data-act="say" data-t="${esc(r.speak)}">🔊 Tinglash</button></p>` : ''}
    <div class="opts ${r.pond ? 'pond' : ''}" id="optbox">${r.opts.map((o, k) => `<button class="opt ${o.emo ? 'emo' : ''}" data-act="mc" data-k="${k}">${o.h}</button>`).join('')}</div>`;
    if (r.speak && autoSpeak()) speak(r.speak);
  } else if (r.target) {
    G.cur = []; const tiles = shuffle(r.target.map((x, k) => ({ x, k })));
    box().innerHTML = head + `<div class="prompt">${r.prompt}</div><p class="center"><button class="btn sm ghost" data-act="say" data-t="${esc(r.speak)}">🔊 Tinglash</button></p>
    <div class="center" id="slots" style="min-height:70px">${r.target.map(() => '<span class="slot"></span>').join('')}</div>
    <div class="center" id="tiles" style="margin-top:12px">${tiles.map(o => `<button class="tile-w" data-act="tile" data-k="${o.k}" data-x="${esc(o.x)}">${esc(o.x)}</button>`).join('')}</div>
    <p class="center"><button class="btn sm ghost" data-act="resetTiles">↺ Qaytadan</button></p>`;
    if (S.grade === 1) speak(r.speak);
  } else if (id === 'match') {
    G.sel = null; G.left = r.items.length; G.miss = 0;
    box().innerHTML = head + `<p class="center muted">So‘zni va mos rasmni bosing</p><div class="pairs"><div class="opts" style="grid-template-columns:1fr">${shuffle(r.items).map(w => `<button class="opt" data-act="pair" data-s="w" data-w="${esc(w.en)}">${esc(w.en)}</button>`).join('')}</div><div class="opts" style="grid-template-columns:1fr">${shuffle(r.items).map(w => `<button class="opt emo" data-act="pair" data-s="e" data-w="${esc(w.en)}" aria-label="rasm">${pic(w)}</button>`).join('')}</div></div>`;
  } else if (id === 'drag') {
    G.sel = null; G.left = r.items.length; G.miss = 0;
    box().innerHTML = head + `<p class="center muted">So‘zni rasmga sudrang (yoki avval so‘zni, keyin rasmni bosing)</p>
    <div class="opts" style="grid-template-columns:repeat(auto-fit,minmax(110px,1fr))">${r.items.map(w => `<div class="dz" role="button" tabindex="0" data-act="drop" data-w="${esc(w.en)}" aria-label="rasm joyi">${pic(w)}</div>`).join('')}</div>
    <div class="center" style="margin-top:16px">${shuffle(r.items).map(w => `<button class="tile-w" draggable="true" data-act="chip" data-w="${esc(w.en)}">${esc(w.en)}</button>`).join('')}</div>`;
  }
}
const nextRound = ok => { if (ok) G.score++; setTimeout(() => { G.i++; showRound(); }, 950); };
function finishGame() {
  const total = G.rounds.length, id = G.g.id, pct = G.score / total;
  let extra = '', gain = 0;
  if (id === 'quiz') {
    if (G.score >= 4) { if (!S.done[G.t.id]) { S.done[G.t.id] = 1; gain = 5; extra = '<p><b>✅ Mavzu tugallandi! +5 ⭐</b></p>'; } else extra = '<p>✅ Mavzu allaqachon tugallangan.</p>'; }
    else extra = `<p>Mavzuni tugatish uchun kamida 4/5 kerak. <a href="#/lessons/${G.t.id}">Darsni qayta ko‘rib chiqing</a> va yana urinib ko‘ring! 💪</p>`;
  } else if (id === 'diag') {
    S.diag.push({ t: Date.now(), score: G.score, total, grade: S.grade });
    extra = `<p>${S.diag.length === 1 ? 'Bu sizning <b>kirish testingiz</b>.' : 'Oldingi natija: ' + S.diag[S.diag.length - 2].score + '/' + S.diag[S.diag.length - 2].total}. Natija ota-ona panelida saqlanadi.</p>`;
  } else {
    const best = S.scores[G.key] || 0; gain = LG.starDelta(G.score, best); if (G.score > best) S.scores[G.key] = G.score;
    S.level[id] = LG.nextLevel(G.lvl, G.score, total);
    if (S.level[id] !== G.lvl) extra = `<p>Daraja o‘zgardi: <b>${LEVEL_NAMES[S.level[id]]}</b></p>`;
    if (S.daily && !S.daily.done && S.daily.gid === id && S.daily.tid === G.tid && G.score >= 3) { S.daily.done = true; gain += 3; extra += '<p>📅 Kunning topshirig‘i bajarildi! +3 ⭐</p>'; }
  }
  track({ type: 'game', g: id, tid: G.tid || '', score: G.score, total, lvl: G.lvl, id: id === 'quiz' ? (G.score >= 4 ? 'pass' : 'fail') : '' });
  addStars(gain); save(); if (pct >= .8) confetti();
  const msg = pct === 1 ? 'Mukammal! 🏆' : pct >= .6 ? 'Ajoyib natija! 🎉' : 'Yaxshi urinish! Yana bir marta o‘ynaymiz! 💪';
  box().innerHTML = `<div class="card center">${mascot(pct >= .8 ? 'cheer' : pct >= .6 ? 'happy' : 'sad').replace('<svg', '<svg style="width:170px"')}<h2>${msg}</h2><h1>${G.score} / ${total}</h1><p>${'⭐'.repeat(G.score)} ${gain ? '(+' + gain + ' yangi ⭐)' : ''}</p>${extra}
  <div class="row" style="justify-content:center"><button class="btn" data-act="again">🔄 Qayta o‘ynash</button><a class="btn alt" href="#/games">🎮 Boshqa o‘yin</a></div></div>`;
}
/* ---- o'yin ichidagi harakatlar ---- */
const optText = el => { const i = el.querySelector('img'); const n = el.querySelector('.numpic'); return i ? i.alt : n ? n.textContent : el.textContent.trim(); };
function ansEvent(ok, r, el, k) {
  const right = r.opts.findIndex(o => o.ok), all = $$('#optbox .opt'), lab = (o, e) => o.t || (e ? optText(e) : '');
  track({ type: 'ans', g: G.g.id, tid: G.tid || '', w: r.w, q: (($('.prompt') ? $('.prompt').textContent.trim() : '') + ' ' + (r.sub || '')).trim(), a: lab(r.opts[k], el), r: lab(r.opts[right], all[right]), ok: ok ? 1 : 0 });
}
ACT.mc = (d, el) => {
  const bx = box(); if (bx.dataset.lock) return; bx.dataset.lock = 1;
  const r = G.rounds[G.i], o = r.opts[+d.k]; el.classList.add(o.ok ? 'ok' : 'bad'); trackWord(r.w, o.ok); ansEvent(o.ok, r, el, +d.k);
  if (!o.ok) $$('#optbox .opt').forEach((b, k) => { if (r.opts[k].ok) b.classList.add('ok'); });
  if (o.ok && r.speak && G.g.id !== 'animal') speak(r.w);
  $('#live').textContent = o.ok ? 'To‘g‘ri!' : 'Noto‘g‘ri, to‘g‘ri javob belgilandi.';
  nextRound(o.ok);
};
ACT.pair = (d, el) => {
  const r = G.rounds[G.i]; if (el.classList.contains('done')) return;
  if (!G.sel) { G.sel = el; el.classList.add('sel'); return; }
  if (G.sel.dataset.s === el.dataset.s) { G.sel.classList.remove('sel'); G.sel = el; el.classList.add('sel'); return; }
  const a = G.sel; a.classList.remove('sel'); G.sel = null;
  if (a.dataset.w === el.dataset.w) { a.classList.add('done'); el.classList.add('done'); speak(el.dataset.w); trackWord(el.dataset.w, true); track({ type: 'ans', g: G.g.id, tid: G.tid || '', w: el.dataset.w, q: 'Moslash: ' + el.dataset.w, a: el.dataset.w, r: el.dataset.w, ok: 1 }); if (--G.left === 0) nextRound(G.miss <= 1); }
  else { G.miss++; trackWord(a.dataset.w, false); track({ type: 'ans', g: G.g.id, tid: G.tid || '', w: a.dataset.w, q: 'Moslash: ' + a.dataset.w, a: el.dataset.w, r: a.dataset.w, ok: 0 }); el.classList.add('bad'); a.classList.add('bad'); setTimeout(() => { el.classList.remove('bad'); a.classList.remove('bad'); }, 500); }
};
ACT.chip = (d, el) => { G.sel = el; $$('[data-act=chip]', box()).forEach(c => c.style.outline = ''); el.style.outline = '3px solid var(--primary)'; };
function dropOn(zone, w) {
  if (zone.classList.contains('done') || !w) return;
  if (zone.dataset.w === w) { zone.classList.add('done'); zone.insertAdjacentHTML('beforeend', `<span class="w">${esc(w)}</span>`); $$('[data-act=chip]', box()).forEach(c => { if (c.dataset.w === w) c.classList.add('used'); }); speak(w); trackWord(w, true); track({ type: 'ans', g: G.g.id, tid: G.tid || '', w, q: 'Sudrash: ' + w, a: w, r: w, ok: 1 }); if (--G.left === 0) nextRound(G.miss <= 1); }
  else { G.miss++; trackWord(w, false); track({ type: 'ans', g: G.g.id, tid: G.tid || '', w: zone.dataset.w, q: 'Sudrash: ' + zone.dataset.w, a: w, r: zone.dataset.w, ok: 0 }); zone.classList.add('over'); setTimeout(() => zone.classList.remove('over'), 400); }
}
ACT.drop = (d, el) => { if (G.sel) dropOn(el, G.sel.dataset.w); };
ACT.tile = (d, el) => {
  const r = G.rounds[G.i]; el.classList.add('used'); G.cur.push(el.dataset.x);
  const slots = [...$('#slots').children]; slots[G.cur.length - 1].textContent = el.dataset.x; slots[G.cur.length - 1].classList.add('fill');
  if (G.cur.length === r.target.length) {
    const ok = G.cur.join(r.join) === r.target.join(r.join);
    slots.forEach(s => s.style.background = ok ? 'var(--green)' : 'var(--pink)');
    if (ok) { speak(r.speak); trackWord(r.w, !r.fail); track({ type: 'ans', g: G.g.id, tid: G.tid || '', w: r.w, q: $('.prompt').textContent.trim(), a: G.cur.join(r.join), r: r.target.join(r.join), ok: r.fail ? 0 : 1 }); nextRound(!r.fail); } else { r.fail = 1; trackWord(r.w, false); track({ type: 'ans', g: G.g.id, tid: G.tid || '', w: r.w, q: $('.prompt').textContent.trim(), a: G.cur.join(r.join), r: r.target.join(r.join), ok: 0 }); setTimeout(() => ACT.resetTiles(), 800); }
  }
};
ACT.resetTiles = () => { G.cur = []; $$('#slots .slot').forEach(s => { s.textContent = ''; s.className = 'slot'; s.style.background = ''; }); $$('#tiles .tile-w').forEach(t => t.classList.remove('used')); };
ACT.again = () => startGame(G.g, G.t && G.t.id);
ACT.say = d => speak(d.t);
document.addEventListener('dragstart', e => { const c = e.target.closest && e.target.closest('[data-act=chip]'); if (c) { e.dataTransfer.setData('text/plain', c.dataset.w); G.sel = c; } });
document.addEventListener('dragover', e => { if (e.target.closest && e.target.closest('.dz')) e.preventDefault(); });
document.addEventListener('drop', e => { const z = e.target.closest && e.target.closest('.dz'); if (z) { e.preventDefault(); dropOn(z, e.dataTransfer.getData('text/plain')); } });
