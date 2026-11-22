/* pages.js — sahifalar: bosh sahifa, sinflar, darslar, ertaklar, qo'shiqlar, topishmoqlar, alifbo, do'kon, maxfiylik, haqida */
const GCOLS = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'];
const topicTile = (t, href, i) => `<a class="tile c${i % 6}" href="${href}"><span class="big">${em(t.icon)}</span>${esc(t.uz)}<br><small class="muted">${esc(t.en)}</small>${S.done[t.id] ? '<br>✅' : ''}</a>`;
const gradeTabs = (cur, base) => `<div class="tabs">${[1, 2, 3, 4].map(g => `<a class="tab ${g === cur ? 'on' : ''}" href="#/${base}/g${g}">${gradeName(g)}</a>`).join('')}</div>`;
const dueCount = () => LG.dueWords(S.box, Date.now()).length;

/* ---------- 1. Bosh sahifa ---------- */
PAGES.home = () => {
  const d = S.daily, dt = d && T(d.tid), g = d && GAMES.find(x => x.id === d.gid);
  const wk = Math.min(30, S.stars - (S.weekly ? S.weekly.base : 0)), due = dueCount();
  return `
${installBanner()}
<section class="hero">
  <div>
    <span class="tag">🇺🇿 1–4-sinflar uchun AI ingliz tili</span>
    <h1>Learn English, <span>Play, Explore</span> and Dream!</h1>
    <p class="slogan-uz">O‘yna, o‘rgan, kashf et va ingliz tilida so‘zla!</p>
    <p>Salom, <b>${esc(P.name)}</b>! Men <b>Lingo</b>man. 6 ta mavzu, 20 ta ertak, qo‘shiq, topishmoq va o‘yinlar orqali ingliz tilini o‘zbek tilida tushuntirib o‘rganamiz. Talaffuzingizni sun’iy intellekt tekshiradi!</p>
    <div class="row"><a class="btn" href="#/grades">🚀 Boshlaymiz!</a><a class="btn alt" href="#/coach">🎤 AI Coach</a><a class="btn ghost" href="#/alphabet">🔤 Alifbo</a></div>
  </div>
  <div class="mascot-box">${mascot('happy')}<span class="float" style="top:2%;left:8%">⭐</span><span class="float" style="top:20%;right:2%;animation-delay:1s">📚</span><span class="float" style="bottom:6%;left:4%;animation-delay:2s">🎈</span></div>
</section>
<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(250px,1fr))">
  <div class="card c3"><h3>🔥 Seriya: ${S.streak.n} kun</h3><p class="muted">Har kuni kiring — har 3-kunda +2 ⭐!</p></div>
  <div class="card c2"><h3>📅 Kunning topshirig‘i</h3>${dt ? (d.done ? '<p>✅ Bajarildi! Ertaga yangi topshiriq.</p>' : `<p>${g.icon} <b>${g.uz}</b> o‘yinini «${esc(dt.uz)}» mavzusida o‘ynang va kamida 3 ta to‘g‘ri javob bering (+3 ⭐)</p><a class="btn sm" href="#/games/${g.id}/${dt.id}">Boshlash</a>`) : ''}</div>
  <div class="card c1"><h3>🏅 Haftalik maqsad</h3><div class="bar-out"><div class="bar-in" style="width:${wk / 30 * 100}%"></div></div><p class="muted">${wk}/30 ⭐ ${S.weekly && S.weekly.paid ? '— bajarildi!' : '(mukofot +10 ⭐)'}</p></div>
  <div class="card c0"><h3>🔁 Takrorlash</h3><p>${due ? `${due} ta so‘z takrorlashni kutyapti.` : 'Hozircha takrorlash kerak emas.'}</p><a class="btn sm alt" href="#/games/review">Takrorlash o‘yini</a></div>
</div>
<div class="stats">
  <div class="card stat c3"><b>4</b>sinf</div><div class="card stat c2"><b>${builtIn(S.grade).length}</b>mavzu</div>
  <div class="card stat c0"><b>20</b>ertak</div><div class="card stat c1"><b>${GAMES.filter(x => !x.hidden).length}</b>o‘yin turi</div><div class="card stat c4"><b>${Object.keys(WORDS).length}</b>so‘z</div>
</div>
<h2>Bugun nima qilamiz?</h2>
<div class="grid">
  <a class="tile c1" href="#/lessons"><span class="big">📘</span>Ingliz tili darslari</a>
  <a class="tile c0" href="#/stories"><span class="big">🧚</span>Sehrli ertaklar</a>
  <a class="tile c3" href="#/sing"><span class="big">🎵</span>Qo‘shiq va she’rlar</a>
  <a class="tile c4" href="#/riddles"><span class="big">🧩</span>Topishmoq va miya o‘yinlari</a>
  <a class="tile c2" href="#/games"><span class="big">🎮</span>Ta’limiy o‘yinlar</a>
  <a class="tile c5" href="#/progress"><span class="big">🏆</span>Natijalarim</a>
  <a class="tile c1" href="#/coach/chat"><span class="big">💬</span>Lingo bilan suhbat</a>
  <a class="tile c3" href="#/shop"><span class="big">🛍️</span>Lingo do‘koni</a>
</div>`;
};

/* ---------- 2. Mening yo'lim (sinf administrator tomonidan belgilanadi) ---------- */
const GINFO = ['Birinchi qadamlar: ranglar, sonlar, hayvonlar, meva-sabzavot, oila, o‘yinchoqlar.', 'Kundalik hayot: tana, taom, kiyim, maktab, uy, hovli.', 'Faol hayot: kun tartibi, ob-havo, transport, kasblar.', 'Katta sayohat: Navro‘z, salomatlik, tabiat, texnologiya.'];
PAGES.grades = () => {
  const ts = builtIn(S.grade), next = ts.find(t => !S.done[t.id]);
  return `<h1>🗺️ Mening yo‘lim</h1><p class="muted">Sinfingiz: <b>${gradeName(S.grade)}</b>${P.section ? ' (' + esc(P.section) + ')' : ''} — ${GINFO[S.grade - 1]}</p>
<div class="path">${ts.map((t, i) => { const done = S.done[t.id], cur = next && next.id === t.id;
  return `<a class="step ${done ? 'done' : cur ? 'cur' : ''}" href="#/lessons/${t.id}"><span class="dot">${done ? '✓' : i + 1}</span><span class="ico">${em(t.icon)}</span><span><b>${esc(t.uz)}</b><br><small>${esc(t.en)} · ${t.words.length} so‘z</small></span>${cur ? '<span class="here">Siz shu yerdasiz</span>' : ''}</a>`; }).join('')}</div>
<div class="card" style="margin-top:18px"><div class="bar-out"><div class="bar-in" style="width:${gradeProgress(S.grade) / 6 * 100}%"></div></div><p>${gradeProgress(S.grade)}/6 mavzu tugallangan${next ? ` · Keyingi: <a href="#/lessons/${next.id}">${esc(next.uz)}</a>` : ' · 🎉 Barcha mavzular tugadi!'}</p></div>`;
};

/* ---------- 3. Darslar (4 bosqich) ---------- */
PAGES.lessons = a => {
  if (a && T(a) && T(a).grade === S.grade) return lessonView(T(a));
  const g = S.grade;
  return `<h1>📘 Ingliz tili darslari · ${gradeName(g)}</h1><div class="grid">${topicsOf(g).map((t, i) => topicTile(t, '#/lessons/' + t.id, i)).join('')}</div><p><a class="btn sm ghost" href="#/alphabet">🔤 Alifbo va fonika</a></p>`;
};
function lessonView(t) {
  const lvl = t.grade <= 2 ? 'Pre-A1' : 'A1';
  return `<a href="#/lessons">← Mavzular</a>
<div class="row"><div style="font-size:4rem">${em(t.icon)}</div><div><h1 style="margin:0">${esc(t.en)}</h1><h2 style="margin:0" class="muted">${esc(t.uz)} · ${gradeName(t.grade)} · ${lvl}</h2></div></div>
<div class="card c3" style="margin:16px 0"><b>🇺🇿 O‘zbekcha izoh:</b> ${esc(t.culture)}</div>
<div class="card" style="margin-bottom:16px"><b>🎯 O‘quv maqsadi:</b> ${t.words.length} ta so‘zni tanish va eshitib tushunish; «${esc(t.s.en)}» gapini ayta olish; yakuniy testda kamida 4/5.<br><small class="muted">Daraja (CEFR bo‘yicha taxminiy): ${lvl}</small></div>
<ol class="steps"><li class="on">1 · Tanishuv</li><li>2 · Mashq</li><li>3 · O‘yin</li><li>4 · Test</li></ol>
<h3>1️⃣ Tanishuv — so‘zni bosing, Lingo o‘qib beradi 🔊</h3>
<div class="grid sm">${t.words.map(w => `<button class="wcard" data-act="say" data-t="${esc(w.en)}" aria-label="${esc(w.en)} — ${esc(w.uz)}"><span class="wface"><span class="em">${pic(w)}</span><b>${esc(w.en)}</b><small>${esc(w.uz)}</small></span></button>`).join('')}</div>
<div class="card c1" style="margin:20px 0"><h3>Gap / Sentence</h3><div class="line"><div class="en">${esc(t.s.en)}</div><div class="uz">${esc(t.s.uz)}</div></div>
<button class="btn sm" data-act="say" data-t="${esc(t.s.en)}">🔊 Tinglash</button> <a class="btn sm alt" href="#/coach/${t.id}">🎤 Aytib ko‘rish</a></div>
<h3>2️⃣ Mashq</h3><div class="row"><a class="btn sm ghost" href="#/games/match/${t.id}">🖼️ Rasm moslash</a><a class="btn sm ghost" href="#/games/listen/${t.id}">🎧 Tinglang</a><a class="btn sm ghost" href="#/games/spell/${t.id}">🔤 Harflang</a><a class="btn sm ghost" href="#/games/complete/${t.id}">✍️ Gap to‘ldiring</a></div>
<h3>3️⃣ O‘yin</h3><div class="row"><a class="btn sm ghost" href="#/games/catch/${t.id}">🎣 Baliq tutish</a><a class="btn sm ghost" href="#/games/drag/${t.id}">🧲 Sudrash</a><a class="btn sm ghost" href="#/games/build/${t.id}">🧱 Gap tuzish</a></div>
<div class="card c2" style="margin-top:18px"><b>👪 Oila bilan mashq:</b> ota-onangiz yoki aka-opangiz bilan «${esc(t.s.en)}» gapini 3 marta ayting va uydan shu mavzuga oid 3 ta narsani toping — ularning inglizcha nomini ayting.</div>
<h3 style="margin-top:20px">4️⃣ Yakuniy test</h3>
<p>${S.done[t.id] ? '✅ Bu mavzu tugallangan! Testni qayta topshirish mumkin.' : '5 ta savol. Mavzu tugallangan bo‘lishi uchun kamida <b>4 ta</b> to‘g‘ri javob kerak (+5 ⭐).'}</p>
<a class="btn" href="#/games/quiz/${t.id}">📝 Testni boshlash</a>`;
}

/* ---------- 4. Ertaklar (tushunish savoli bilan) ---------- */
PAGES.stories = a => {
  const s = a && STORIES.find(x => x.id == a);
  if (s) return `<a href="#/stories">← Barcha ertaklar</a>
<div class="row"><div style="font-size:4rem">${em(s.e)}</div><div><h1 style="margin:0">${s.en}</h1><h3 class="muted" style="margin:0">${s.uz} · ${gradeName(s.grade)}</h3></div></div>
<div class="row noprint" style="margin:14px 0"><button class="btn sm" data-act="playLines" data-kind="story" data-id="${s.id}">▶️ Hammasini tinglash</button><button class="btn sm ghost" data-act="toggleUz">🇺🇿 Tarjimani yashirish/ko‘rsatish</button></div>
${s.lines.map((l, i) => `<div class="line" role="button" tabindex="0" data-act="sayLine" data-kind="story" data-id="${s.id}" data-i="${i}"><div class="en">${l[0]}</div><div class="uz">${l[1]}</div></div>`).join('')}
<div class="card c4" style="margin-top:16px"><h3>🧠 Tushundingizmi?</h3><p><b>${s.q[0]}</b><br><span class="muted">${s.q[1]}</span></p>
${S.stories[s.id] ? '<p>✅ To‘g‘ri javob berilgan!</p>' : `<div class="opts">${shuffle([s.q[2], s.q[3], s.q[4]]).map(o => `<button class="opt" data-act="storyQ" data-id="${s.id}" data-a="${esc(o)}">${o}</button>`).join('')}</div>`}</div>`;
  return `<h1>🧚 Magic Story World</h1><p class="muted">20 ta ertak. Har bir jumla ingliz va o‘zbek tilida. Tinglang, o‘qing va savolga javob bering!</p>
<div class="grid">${STORIES.map((x, i) => `<a class="tile c${i % 6}" href="#/stories/${x.id}"><span class="big">${em(x.e)}</span>${x.en}<br><small class="muted">${x.uz}</small><br><small>${gradeName(x.grade)} ${S.stories[x.id] ? '✅' : ''}</small></a>`).join('')}</div>`;
};
ACT.storyQ = (d, el) => {
  const s = STORIES.find(x => x.id == d.id), ok = d.a === s.q[2]; el.classList.add(ok ? 'ok' : 'bad');
  track({ type: 'story', id: String(s.id), q: s.q[0], a: d.a, r: s.q[2], ok: ok ? 1 : 0 });
  if (ok) { if (!S.stories[s.id]) { S.stories[s.id] = 1; addStars(3); confetti(); } setTimeout(route, 900); } else toast('Yana bir bor o‘ylab ko‘ring 🤔');
};
ACT.toggleUz = () => $('#app').classList.toggle('hideuz');
const linesOf = d => (d.kind === 'story' ? STORIES : [...SONGS, ...POEMS]).find(x => String(x.id) === String(d.id)).lines;
ACT.playLines = d => playLines(linesOf(d), d.kind === 'song');
ACT.sayLine = d => { stopSound(); speak(linesOf(d)[+d.i][0], .8); };

/* ---------- 5. Qo'shiq va she'rlar ---------- */
PAGES.sing = a => {
  const s = a && [...SONGS, ...POEMS].find(x => x.id === a);
  if (s) return `<a href="#/sing">← Orqaga</a>
<div class="row"><div style="font-size:4rem">${em(s.e)}</div><div><h1 style="margin:0">${s.en}</h1><h3 class="muted" style="margin:0">${s.uz} · ${s.kind === 'song' ? 'Qo‘shiq' : 'She’r'}</h3></div></div>
<div class="row noprint" style="margin:14px 0"><button class="btn" data-act="playLines" data-kind="${s.kind}" data-id="${s.id}">🎤 Birga kuylaymiz${s.kind === 'song' ? ' (musiqa bilan)' : ''}!</button><button class="btn sm ghost" data-act="toggleUz">🇺🇿 Tarjima</button><button class="btn sm ghost" data-act="stopAll">⏹️ To‘xtatish</button></div>
${s.lines.map((l, i) => `<div class="line" role="button" tabindex="0" data-act="sayLine" data-kind="${s.kind}" data-id="${s.id}" data-i="${i}"><div class="en">${l[0]}</div><div class="uz">${l[1]}</div></div>`).join('')}
<p>${S.songs[s.id] ? '✅ Yod olingan' : `<button class="btn sm alt" data-act="singDone" data-id="${s.id}">⭐ Yod oldim (+2 ⭐)</button>`}</p>`;
  const list = (arr, off) => `<div class="grid">${arr.map((x, i) => `<a class="tile c${(i + off) % 6}" href="#/sing/${x.id}"><span class="big">${em(x.e)}</span>${x.en}<br><small class="muted">${x.uz}</small>${S.songs[x.id] ? '<br>✅' : ''}</a>`).join('')}</div>`;
  return `<h1>🎵 Sing & Learn</h1><h2>Qo‘shiqlar</h2>${list(SONGS, 0)}<h2 style="margin-top:28px">She’rlar</h2>${list(POEMS, 3)}`;
};
ACT.stopAll = () => { stopSound(); $$('.line').forEach(l => l.classList.remove('on')); };
ACT.singDone = d => { if (!S.songs[d.id]) { S.songs[d.id] = 1; addStars(2); route(); } };

/* ---------- 6. Topishmoq va miya o'yinlari ---------- */
PAGES.riddles = a => {
  if (a === 'memory') return memoryHTML();
  return `<h1>🧩 Riddles & Brain Games</h1><div class="tabs"><a class="tab on" href="#/riddles">Topishmoqlar</a><a class="tab" href="#/riddles/memory">🧠 Xotira o‘yini</a></div>
<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(290px,1fr))">${RIDDLES.map((r, i) => `<div class="card c${i % 6}" id="rd${i}"><div style="font-size:2.4rem">❓</div><b>${r.q}</b><div class="muted">${r.uz}</div>
${S.riddles[i] ? `<p><b>${em(r.e)} ${r.ans}</b> ✅</p>` : `<div class="opts" style="margin-top:10px">${shuffle(r.opts).map(o => `<button class="opt" data-act="riddle" data-i="${i}" data-a="${o}">${o}</button>`).join('')}</div>`}
<button class="btn sm ghost" style="margin-top:10px" data-act="say" data-t="${esc(r.q)}" aria-label="Eshitish">🔊</button></div>`).join('')}</div>`;
};
ACT.riddle = (d, el) => {
  const r = RIDDLES[+d.i], ok = d.a === r.ans; el.classList.add(ok ? 'ok' : 'bad');
  track({ type: 'riddle', id: String(d.i), q: r.q, a: d.a, r: r.ans, ok: ok ? 1 : 0 });
  if (ok) { if (!S.riddles[d.i]) { S.riddles[d.i] = 1; addStars(1); } speak(r.ans); setTimeout(route, 900); }
};
let MEM = null;
function memoryHTML() {
  const t = shuffle(TOPICS.filter(x => x.words.length >= 6))[0], ws = pick(t.words, 6);
  MEM = { cards: shuffle(ws.flatMap(w => [{ k: w.en, h: `<span>${pic(w)}</span>` }, { k: w.en, h: `<small>${esc(w.en)}</small>` }])), open: [], got: 0, moves: 0, lock: false };
  return `<h1>🧠 Xotira o‘yini</h1><div class="tabs"><a class="tab" href="#/riddles">Topishmoqlar</a><a class="tab on" href="#/riddles/memory">🧠 Xotira o‘yini</a></div>
<p class="center">Mavzu: <b>${em(t.icon)} ${esc(t.en)}</b> — rasm va so‘zni juftlang! Urinishlar: <b id="mv">0</b></p>
<div class="mem">${MEM.cards.map((c, i) => `<button class="mcard" data-act="flip" data-i="${i}" aria-label="Karta ${i + 1}">?</button>`).join('')}</div>
<p class="center"><button class="btn sm ghost" data-act="memAgain">🔄 Qayta boshlash</button></p>`;
}
ACT.memAgain = () => route();
ACT.flip = (d, el) => {
  const i = +d.i; if (!MEM || MEM.lock || MEM.open.includes(i) || el.classList.contains('got')) return;
  const c = MEM.cards[i]; el.classList.add('up'); el.innerHTML = c.h; MEM.open.push(i);
  if (MEM.open.length < 2) return;
  MEM.moves++; $('#mv').textContent = MEM.moves;
  const [a, b] = MEM.open, els = $$('.mcard'), ea = els[a], eb = els[b];
  if (MEM.cards[a].k === MEM.cards[b].k) {
    ea.classList.add('got'); eb.classList.add('got'); MEM.open = []; speak(c.k); trackWord(c.k, true);
    if (++MEM.got === 6) { const tier = MEM.moves <= 8 ? 3 : MEM.moves <= 12 ? 2 : 1; addStars(LG.starDelta(tier, S.memBest)); S.memBest = Math.max(S.memBest, tier); save(); confetti(); toast('Barakalla! ' + MEM.moves + ' urinishda!'); }
  } else { MEM.lock = true; setTimeout(() => { [ea, eb].forEach(e => { e.className = 'mcard'; e.textContent = '?'; }); MEM.open = []; MEM.lock = false; }, 800); }
};

/* ---------- Alifbo va qiyin tovushlar ---------- */
PAGES.alphabet = a => {
  const tabs = `<div class="tabs"><a class="tab ${a !== 'sounds' ? 'on' : ''}" href="#/alphabet">🔤 Alifbo A–Z</a><a class="tab ${a === 'sounds' ? 'on' : ''}" href="#/alphabet/sounds">🦷 Qiyin tovushlar</a></div>`;
  if (a === 'sounds') return `<h1>🦷 Qiyin tovushlar</h1>${tabs}<p class="muted">O‘zbek tilida bo‘lmagan yoki o‘xshash tovushlar. So‘zni bosib eshiting, keyin AI Coach'da ayting.</p>
<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">${HARD_SOUNDS.map((h, i) => `<div class="card c${i}"><div style="font-size:2.2rem">${em(h[3])} <b>${h[0]}</b></div><p>${h[1]}</p><div>${h[2].map(w => `<button class="chip" data-act="say" data-t="${w}">🔊 ${w}</button>`).join('')}</div></div>`).join('')}</div>
<h3 style="margin-top:20px">Juft so‘zlar (eshitib farqlang)</h3><div>${SOUND_PAIRS.map(p => `<button class="chip" data-act="sayPair" data-t="${p}">🔊 ${p}</button>`).join('')}</div>`;
  return `<h1>🔤 Alifbo va fonika</h1>${tabs}<p class="muted">Harfni bosing — Lingo harfni va so‘zni o‘qiydi.</p>
<div class="grid sm">${ALPHABET.map((x, i) => `<button class="tile c${i % 6}" data-act="letter" data-i="${i}"><span class="big" style="font-weight:900">${x.l}${x.l.toLowerCase()}</span>${em(x.e)} ${x.en}<br><small class="muted">${x.uz}</small></button>`).join('')}</div>`;
};
ACT.letter = d => { const x = ALPHABET[+d.i]; speak(x.l + '. ' + x.l + ' for ' + x.en, .75); };
ACT.sayPair = d => speak(d.t.replace('/', ', '), .7);

/* ---------- Lingo do'koni ---------- */
PAGES.shop = () => `<h1>🛍️ Lingo do‘koni</h1><p class="muted">Yulduzlaringizga Lingo uchun aksessuar oling. ⭐ ${S.stars}</p>
<div class="hero" style="grid-template-columns:1fr 1.4fr"><div class="mascot-box">${mascot('cheer')}</div>
<div class="grid sm">${ACCESSORIES.map(a => { const own = S.items.owned.includes(a[0]), on = S.items.worn.includes(a[0]);
  return `<div class="card center"><div style="font-size:2.4rem">${em(a[2])}</div><b>${a[1]}</b><br>${own ? `<button class="btn sm ${on ? 'alt' : 'ghost'}" data-act="wear" data-id="${a[0]}">${on ? 'Kiyilgan ✓' : 'Kiyish'}</button>` : `<button class="btn sm" data-act="buy" data-id="${a[0]}" ${S.stars < a[3] ? 'disabled' : ''}>⭐ ${a[3]}</button>`}</div>`; }).join('')}</div></div>`;
ACT.buy = d => { const a = ACCESSORIES.find(x => x[0] === d.id); if (S.stars < a[3]) return; S.stars -= a[3]; S.items.owned.push(a[0]); S.items.worn.push(a[0]); if (S.weekly) S.weekly.base -= a[3]; save(); confetti(); route(); };
ACT.wear = d => { const w = S.items.worn, i = w.indexOf(d.id); i < 0 ? w.push(d.id) : w.splice(i, 1); save(); route(); };

/* ---------- Maxfiylik siyosati ---------- */
PAGES.privacy = () => `<h1>🛡️ Maxfiylik siyosati</h1>
<div class="card"><h3>Qanday ma’lumot saqlanadi?</h3><p>Hisobingizni administrator (o‘qituvchi) yaratadi. Server quyidagilarni saqlaydi: ism, login, sinf, parol (faqat <b>xesh</b> ko‘rinishida), yulduzlar, tugallangan mavzular va <b>har bir savolga bergan javobingiz</b> (to‘g‘ri/xato). Administrator buni o‘quvchining bosqichini kuzatish uchun ko‘radi. Reklama va uchinchi tomon kuzatuvchilari yo‘q.</p>
<h3>Mikrofon va ovoz</h3><p>AI Coach talaffuzni tekshirish uchun brauzerning ovoz aniqlash xizmatidan foydalanadi. Chrome/Edge'da audio <b>brauzer ishlab chiqaruvchisi serverida (masalan, Google)</b> qayta ishlanishi mumkin. Shuning uchun mikrofon faqat ota-ona roziligidan keyin yoqiladi; rozilik bermasangiz mikrofonsiz rejim ishlaydi. LingoUz Kids audioni saqlamaydi.</p>
<h3>Ma’lumotni ko‘rish va o‘chirish</h3><p>Ota-ona o‘quvchi ma’lumotlarini ko‘rish yoki o‘chirishni administratordan so‘rashi mumkin (administrator hisobni CSV ko‘rinishida yuklab olishi yoki o‘chirishi mumkin).</p>
<h3>Bolalar xavfsizligi</h3><p>Ichki xarid yo‘q, begona odamlar bilan yozishma yo‘q. «Lingo bilan suhbat» oldindan yozilgan xavfsiz stsenariylardan iborat.</p>
<p class="muted">Eslatma: bu hujjat prototip uchun yozilgan. Rasmiy ishga tushirishdan oldin O‘zbekiston Respublikasining «Shaxsga doir ma’lumotlar to‘g‘risida»gi qonuni talablariga mos huquqiy ekspertizadan o‘tkazilishi kerak.</p></div>`;

/* ---------- 10. Haqida ---------- */
PAGES.about = () => `<h1>ℹ️ LingoUz Kids haqida</h1>
<div class="card row c3"><div style="width:160px">${mascot('cheer')}</div><div><h2 style="margin:0">Learn English, Play, Explore and Dream!</h2><p class="slogan-uz" style="color:var(--accent);font-weight:800">O‘yna, o‘rgan, kashf et va ingliz tilida so‘zla!</p><p>LingoUz Kids — 1–4-sinf o‘quvchilari uchun sun’iy intellektga asoslangan ingliz tili platformasi. Maqsadimiz: O‘zbekiston boshlang‘ich ta’lim tizimiga mos, innovatsion va milliy xususiyatlarni hisobga olgan ta’lim muhitini yaratish.</p></div></div>
<div class="grid" style="margin-top:18px">
 <div class="card"><h3>🔬 Ilmiy asos</h3>O‘yin orqali o‘rganish, oraliq takrorlash (Leitner), ko‘p sezgili o‘rganish (rasm + ovoz + harakat) va fonika tamoyillariga tayanadi.</div>
 <div class="card"><h3>🤖 AI va talaffuz</h3>Ovozni aniqlash + tovushga yaqin solishtirish bilan talaffuz baholanadi, xato so‘z va harflar ajratib ko‘rsatiladi.</div>
 <div class="card"><h3>🇺🇿 Milliy o‘ziga xoslik</h3>Navro‘z, plov, atlas, Samarqand — bola o‘ziga tanish dunyo orqali o‘rganadi.</div>
 <div class="card"><h3>🛡️ Xavfsizlik</h3>Reklamasiz, ma’lumot qurilmada. <a href="#/privacy">Maxfiylik siyosati</a>.</div></div>
<div class="card c4" style="margin-top:16px"><h3>📋 Holat (shaffoflik)</h3><ul><li>Prototip: ishlaydi; o‘yin mantiqi, talaffuz bahosi va server API avtomatik testlardan o‘tgan.</li><li>Metodik ekspertiza (DTS va darsliklarga moslik): <b>hali o‘tkazilmagan</b> — o‘qituvchi-metodist ko‘rigi kerak.</li><li>Haqiqiy diktor audiolari: <b>qo‘shilmagan</b> (hozir brauzer ovozi; <code>audio/</code> papka orqali almashtiriladi).</li><li>Maktablarda pilot: <b>rejalashtirilgan</b>.</li></ul></div>
<h2 style="margin-top:24px">Yo‘l xaritasi</h2>
<div class="grid"><div class="card c2"><b>1 · MVP</b><br>288+ so‘z, ertaklar, 10 o‘yin, AI Coach (hozir)</div><div class="card c1"><b>2 · Pilot</b><br>2–3 maktab, oldin/keyin test, o‘qituvchi paneli</div><div class="card c4"><b>3 · Mobil ilova</b><br>iOS/Android (Capacitor), bulutli hisob</div><div class="card c0"><b>4 · Kengayish</b><br>5–9-sinflar, xalqaro bozor</div></div>
<p class="center credit" style="margin-top:24px">Malokhatkhon Toshboltayeva — LingoUz loyihasi</p><p class="center"><a class="btn" href="#/grades">🚀 O‘rganishni boshlash</a></p>`;
