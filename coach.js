/* coach.js — AI Speaking Coach: ota-ona roziligi, tovushga yaqin baho, so'z/harf ajratish, mikrofonsiz rejim, suhbat */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let COACH = { target: '', topic: null };
// Ixtiyoriy: haqiqiy fonema darajasidagi xizmat (backend orqali). window.LINGO_PRON_ENDPOINT = 'https://.../assess'
// POST {audio (webm), target} -> {score:0..100, words:[{w, score}]}. Hozircha sinovdan o'tmagan ulanish nuqtasi.
const REMOTE = () => window.LINGO_PRON_ENDPOINT || '';

PAGES.coach = a => {
  if (a === 'chat') return chatHTML();
  const t = (a && T(a) && T(a).grade === S.grade && T(a)) || topicsOf(S.grade)[0]; COACH.topic = t; COACH.target = t.words[0].en;
  const last = S.speak.slice(-5).reverse();
  return `<h1>🎤 AI Speaking Coach</h1><div class="tabs"><a class="tab on" href="#/coach">🎤 Talaffuz</a><a class="tab" href="#/coach/chat">💬 Lingo bilan suhbat</a><a class="tab" href="#/alphabet/sounds">🦷 Qiyin tovushlar</a></div>
<p class="muted">So‘zni tinglang, so‘ng o‘zingiz ayting — Lingo qaysi so‘z/harf yaxshi, qaysi biri mashq talab qilishini ko‘rsatadi.</p>
<div class="card"><label>Mavzu: <select id="coachTopic" data-chg="coachTopic" aria-label="Mavzu">${topicsOf(S.grade).map(x => `<option value="${x.id}" ${x.id === t.id ? 'selected' : ''}>${esc(x.uz)} — ${esc(x.en)}</option>`).join('')}</select></label>
<p style="margin-top:14px"><b>Nimani aytamiz?</b></p>
<div id="coachChips">${[...t.words.map(w => w.en), t.s.en].map((w, i) => `<button class="chip btnchip ${i === 0 ? 'sel' : ''}" data-act="target" data-w="${esc(w)}">${esc(w)}</button>`).join('')}</div></div>
<div class="card center" style="margin-top:16px"><div class="muted">Ayting:</div><div id="target" style="font-size:2.2rem;font-weight:900">${esc(t.words[0].en)}</div>
<div class="row" style="justify-content:center;margin:10px 0"><button class="btn sm ghost" data-act="sayTarget">🔊 Namuna</button><button class="btn sm ghost" data-act="sayTargetSlow">🐢 Sekin</button></div>
${ST.consent.mic === false || !SR ? micFree() : `<button class="mic" id="mic" data-act="record" aria-label="Yozib olish">🎤</button>`}
<p id="coachMsg" class="muted">${!SR ? '⚠️ Bu brauzerda ovoz aniqlash yo‘q (Chrome/Edge tavsiya etiladi). Mikrofonsiz rejim ishlaydi.' : ST.consent.mic === null ? 'Mikrofon uchun ota-ona roziligi kerak (tugmani bosganda so‘raladi).' : 'Tugmani bosing va gapiring.'}</p>
<div id="coachRes" aria-live="polite"></div></div>
<div class="card" style="margin-top:16px"><h3>📈 O‘sish</h3>${sparkline(S.speak.map(x => x.s))}</div>
<div class="card" style="margin-top:16px"><h3>So‘nggi natijalar</h3>${last.length ? last.map(r => `<div class="row" style="justify-content:space-between"><span>${esc(r.w)}</span><b>${r.s}%${r.self ? ' (o‘zim baholadim)' : ''}</b></div>`).join('') : '<span class="muted">Hali natija yo‘q.</span>'}</div>`;
};
const micFree = () => `<div class="selfrate"><p><b>Mikrofonsiz rejim:</b> namunani tinglang, ovoz chiqarib ayting, so‘ng o‘zingizni baholang:</p>
<button class="btn sm ghost" data-act="selfRate" data-v="90">😀 Yaxshi</button> <button class="btn sm ghost" data-act="selfRate" data-v="60">🙂 O‘rtacha</button> <button class="btn sm ghost" data-act="selfRate" data-v="30">😕 Qiyin</button></div>`;
function sparkline(vals) {
  const v = vals.slice(-20); if (v.length < 2) return '<span class="muted">Kamida 2 ta mashq kerak.</span>';
  const w = 300, h = 70, step = w / (v.length - 1), pts = v.map((y, i) => `${(i * step).toFixed(1)},${(h - y / 100 * h).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" class="spark" role="img" aria-label="Talaffuz bali grafigi"><polyline points="${pts}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linejoin="round"/>${v.map((y, i) => `<circle cx="${(i * step).toFixed(1)}" cy="${(h - y / 100 * h).toFixed(1)}" r="3.5" fill="var(--accent)"/>`).join('')}</svg><small class="muted">So‘nggi ${v.length} ta natija (0–100%)</small>`;
}
ACT.coachTopic = (d, el) => { location.hash = '#/coach/' + el.value; };
ACT.target = (d, el) => { COACH.target = d.w; $('#target').textContent = d.w; $$('#coachChips .chip').forEach(c => c.classList.remove('sel')); el.classList.add('sel'); $('#coachRes').innerHTML = ''; };
ACT.sayTarget = () => speak(COACH.target);
ACT.sayTargetSlow = () => speak(COACH.target, .55);

function coachResult(res, self) {
  const sc = res.score, stars = LG.starsFor(sc), best = S.speakBest[COACH.target] || 0;
  S.speak.push({ w: COACH.target, s: sc, t: Date.now(), self: self ? 1 : 0, h: res.heard || '' }); if (S.speak.length > 200) S.speak.shift();
  addStars(LG.starDelta(stars, best)); S.speakBest[COACH.target] = Math.max(best, stars);
  res.words && res.words.forEach(w => trackWord(w.w, w.ok));
  track({ type: 'speak', w: COACH.target, s: sc, a: res.heard || '', ok: sc >= 60 ? 1 : 0 });
  save();
  const msg = sc >= 85 ? 'Ajoyib! Siz haqiqiy ingliz tili ustasisiz! 🎉' : sc >= 60 ? 'Yaxshi! Yana bir marta aytib ko‘ring, yanada yaxshi bo‘ladi. 👍' : sc >= 35 ? 'Yomon emas! Namunani sekin tinglab, takrorlang. 🐢' : 'Hechqisi yo‘q! Namunani tinglang va qayta urinib ko‘ring. 💪';
  const wordHtml = res.words ? `<p>${res.words.map(w => `<span class="wd ${w.ok ? 'good' : 'bad'}">${esc(w.w)}</span>`).join(' ')}</p>` : '';
  let letters = ''; const bad = res.words ? res.words.filter(w => !w.ok && w.heard) : [];
  if (bad.length) letters = '<p class="muted">Harflar (qizil — eshitilmadi):</p>' + bad.map(w => `<p class="letters">${LG.charDiff(w.w, w.heard).map(c => `<b class="${c.ok ? 'good' : 'bad'}">${esc(c.ch)}</b>`).join('')} <small>(eshitildi: ${esc(w.heard)})</small></p>`).join('');
  $('#coachRes').innerHTML = `${mascot(sc >= 60 ? 'cheer' : 'sad').replace('<svg', '<svg style="width:110px"')}<div class="meter"><i style="width:${sc}%"></i></div><h2>${sc}% ${'⭐'.repeat(stars)}</h2>${self ? '' : `<p>Eshitildi: <b>${esc(res.heard || '—')}</b></p>`}${wordHtml}${letters}<p>${msg}</p>`;
  $('#coachMsg').textContent = ''; if (sc >= 85) confetti();
}
ACT.selfRate = d => coachResult({ score: +d.v, heard: '', words: null }, true);

async function ensureConsent() {
  if (ST.consent.mic === true) return true;
  return new Promise(res => {
    const d = modal(`<h2>🎙️ Mikrofon uchun ota-ona roziligi</h2><p>Talaffuzni tekshirish uchun brauzerning ovoz aniqlash xizmatidan foydalaniladi. Chrome/Edge'da audio <b>brauzer ishlab chiqaruvchisi serverida</b> qayta ishlanishi mumkin. LingoUz Kids audioni saqlamaydi va yubormaydi.</p>
    <p><a href="#/privacy" target="_blank">Maxfiylik siyosati</a></p><label><input type="checkbox" id="cOk"> Men ota-onaman/vasiyman va roziman</label>
    <div class="row"><button class="btn sm" id="cYes">Roziman</button><button class="btn sm ghost" id="cNo">Mikrofonsiz davom etish</button></div>`, false);
    $('#cYes', d).onclick = () => { if (!$('#cOk', d).checked) return toast('Avval belgini qo‘ying'); ST.consent = { mic: true, ts: Date.now() }; save(); d.close(); res(true); };
    $('#cNo', d).onclick = () => { ST.consent = { mic: false, ts: Date.now() }; save(); d.close(); res(false); route(); };
  });
}
ACT.record = async () => {
  if (!(await ensureConsent())) return;
  const mic = $('#mic'), msg = $('#coachMsg'); if (!mic || mic.classList.contains('rec')) return;
  const r = new SR(); r.lang = 'en-US'; r.maxAlternatives = 4; r.interimResults = false;
  try { if ('processLocally' in r) r.processLocally = true; } catch (e) { /* qurilmada qayta ishlash qo'llanmasa — oddiy rejim */ }
  mic.classList.add('rec'); msg.textContent = 'Tinglayapman... gapiring! 👂';
  r.onresult = e => { const alts = [...e.results[0]].map(x => ({ t: x.transcript, c: x.confidence })); coachResult(LG.scoreSpeech(alts, COACH.target)); };
  r.onerror = e => { msg.textContent = e.error === 'not-allowed' ? 'Mikrofonga ruxsat bering, iltimos. 🎙️' : e.error === 'no-speech' ? 'Hech narsa eshitilmadi, yana urinib ko‘ring.' : 'Eshitolmadim, qayta urinib ko‘ring.'; };
  r.onend = () => mic.classList.remove('rec');
  try { r.start(); } catch (e) { mic.classList.remove('rec'); }
};

/* ---- Lingo bilan suhbat (qoidaga asoslangan, bola uchun xavfsiz) ---- */
let CH = null;
function chatHTML() {
  CH = CH && CH.fresh === false ? CH : { sc: 0, turn: 0, log: [], fresh: false };
  return `<h1>💬 Lingo bilan suhbat</h1><div class="tabs"><a class="tab" href="#/coach">🎤 Talaffuz</a><a class="tab on" href="#/coach/chat">💬 Lingo bilan suhbat</a></div>
<p class="muted">Oldindan yozilgan xavfsiz stsenariylar. Javobni tanlang va ovoz chiqarib ayting!</p><div class="tabs">${CHAT.map((c, i) => `<button class="tab ${CH.sc === i ? 'on' : ''}" data-act="chatSc" data-i="${i}">${em(c.e)} ${c.t}</button>`).join('')}</div>
<div class="card" id="chat" aria-live="polite">${chatTurn()}</div>`;
}
function chatTurn() {
  const sc = CHAT[CH.sc], t = sc.turns[CH.turn];
  const hist = CH.log.map(m => `<div class="bubble ${m.me ? 'me' : 'lingo'}"><b>${esc(m.en)}</b><br><small class="muted">${esc(m.uz || '')}</small></div>`).join('');
  if (!t) return `${hist}<div class="center">${mascot('cheer')}<h3>Barakalla! Suhbat tugadi 🎉</h3><button class="btn" data-act="chatSc" data-i="${CH.sc}">🔄 Qayta</button></div>`;
  return `${hist}<div class="bubble lingo"><div class="row"><div style="width:56px">${mascot('happy')}</div><div><b>${esc(t.l)}</b><br><small class="muted">${esc(t.u)}</small></div></div><button class="btn sm ghost" data-act="say" data-t="${esc(t.l)}">🔊</button></div>
  <p><b>Javobingizni tanlang:</b></p><div class="opts" style="grid-template-columns:1fr">${t.r.map((r, i) => `<button class="opt" style="text-align:left" data-act="chatReply" data-i="${i}">${esc(r[0])}<br><small class="muted">${esc(r[1])}</small></button>`).join('')}</div>`;
}
ACT.chatSc = d => { CH = { sc: +d.i, turn: 0, log: [], fresh: false }; $('#app .page').innerHTML = chatHTML(); const t = CHAT[CH.sc].turns[0]; speak(t.l); };
ACT.chatReply = d => {
  const t = CHAT[CH.sc].turns[CH.turn], r = t.r[+d.i];
  CH.log.push({ me: 0, en: t.l, uz: t.u }, { me: 1, en: r[0], uz: r[1] }, { me: 0, en: r[2], uz: '' });
  CH.turn++; speak(r[0]).then(() => speak(r[2]));
  $('#chat').innerHTML = chatTurn();
  if (!CHAT[CH.sc].turns[CH.turn]) { if (!S.ack['chat' + CH.sc]) { S.ack['chat' + CH.sc] = 1; addStars(2); } confetti(); } else setTimeout(() => speak(CHAT[CH.sc].turns[CH.turn].l), 3200);
};
