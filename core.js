/* core.js — holat, sozlamalar, ovoz, maskot, router, qulaylik (3-versiya: serverdagi hisob bilan) */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pick = (a, n) => shuffle(a).slice(0, n);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const T = id => TOPICS.find(t => t.id === id);
const ACT = {};          // data-act ishlovchilari (har modul to'ldiradi)
const PAGES = {};

/* ---------- Mahalliy sozlamalar (qurilmada) va foydalanuvchi holati (serverda) ---------- */
const KEY = 'lingouz-local';
let ST;
{
  const d = LG.defaultStore(); let raw = {};
  try { raw = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { /* buzilgan saqlash */ }
  ST = { settings: Object.assign(d.settings, raw.settings), consent: raw.consent || d.consent, parent: { limit: 0 } };
}
let P = { id: '', name: '', avatar: '🦁', section: '' };
let S = LG.defaultData();
/* Server holatini joriy foydalanuvchi sifatida o'rnatish */
function useState(user, state) {
  P = { id: user.id, name: user.name, avatar: '🦁', section: user.section || '' };
  S = Object.assign(LG.defaultData(), state || {}); S.grade = user.grade; ST.parent.limit = user.limit || 0;
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify({ settings: ST.settings, consent: ST.consent })); } catch (e) { /* xotira to'la */ }
  if (P.id) { try { localStorage.setItem('lingouz-cache-' + P.id, JSON.stringify(S)); } catch (e) { /* ... */ } if (typeof Net !== 'undefined') Net.scheduleSync(); }
  const el = $('#starsPill'); if (el) el.textContent = '⭐ ' + S.stars;
  const pb = $('#profBtn'); if (pb) pb.innerHTML = `<span class="av">${esc((P.name || '?').trim().charAt(0).toUpperCase())}</span><span class="pn">${esc(P.name)}</span>`;
}
const gradeName = g => g + '-sinf';
const topicsOf = g => TOPICS.filter(t => t.grade === g);
const builtIn = g => topicsOf(g).filter(t => /^g\dt\d$/.test(t.id));
const gradeProgress = g => builtIn(g).filter(t => S.done[t.id]).length;

const WORDS = {};
function buildWords() { TOPICS.forEach(t => t.words.forEach(w => { const k = w.en.toLowerCase(); if (!WORDS[k]) WORDS[k] = { ...w, tid: t.id }; })); }
buildWords();

/* ---------- Rasm: emoji (lokal Twemoji) | rang namunasi | son belgisi ---------- */
const em = e => `<img class="emj" src="emoji/${LG.emojiFile(e)}.svg" alt="${esc(e)}" draggable="false">`;
const pic = w => { const e = typeof w === 'string' ? w : w.e; return e.startsWith('#') ? `<span class="swatch" style="background:${esc(e)}" role="img" aria-label="rang"></span>` : e.startsWith('n:') ? `<span class="numpic">${esc(e.slice(2))}</span>` : em(e); };
const picText = w => { const e = w.e; return e.startsWith('#') ? 'rang ' + w.en : e.startsWith('n:') ? e.slice(2) : e; };
document.addEventListener('error', e => { const i = e.target; if (i.tagName === 'IMG' && i.classList.contains('emj')) i.replaceWith(document.createTextNode(i.alt)); }, true);

/* ---------- Sozlamalar ---------- */
function applySettings() {
  const s = ST.settings, r = document.documentElement;
  r.style.fontSize = [15, 17, 19, 22][s.font] + 'px';
  r.classList.toggle('hc', !!s.contrast);
  r.classList.toggle('nomotion', !s.motion);
}
function applyGrade() { document.body.dataset.grade = S.grade; }
applySettings();

/* ---------- Ovoz: haqiqiy audio (bo'lsa) → brauzer TTS (zaxira) ---------- */
let AUDIO = new Set(), curAudio = null, VOICES = [];
fetch('audio/manifest.json').then(r => r.json()).then(a => AUDIO = new Set(a)).catch(() => {});
function loadVoices() { VOICES = ('speechSynthesis' in window ? speechSynthesis.getVoices() : []).filter(v => /^en/i.test(v.lang)); }
if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function bestVoice() {
  if (ST.settings.voice) { const v = VOICES.find(v => v.name === ST.settings.voice); if (v) return v; }
  const pref = /Aria|Jenny|Samantha|Google US English|Google UK English Female|Zira|Natural|Online/i;
  return VOICES.find(v => pref.test(v.name) && /en-(US|GB)/i.test(v.lang)) || VOICES.find(v => /en-US/i.test(v.lang)) || VOICES[0] || null;
}
function speak(t, rate) {
  return new Promise(res => {
    rate = rate || ST.settings.rate;
    if (curAudio) { curAudio.pause(); curAudio = null; }
    if (!ST.settings.sound) { toast('🔇 ' + t); return setTimeout(res, 700); }
    const sl = LG.slug(t);
    const robot = () => {   // zaxira: brauzer ovozi (faqat yozib olingan audio topilmasa)
      if (!('speechSynthesis' in window)) return res();
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(t); u.lang = 'en-US'; u.rate = Math.min(rate, .8); u.pitch = 1;
      const v = bestVoice(); if (v) { u.voice = v; u.lang = v.lang; }
      u.onend = u.onerror = () => res(); speechSynthesis.speak(u);
    };
    if (ST.settings.natural !== false && AUDIO.has(sl)) {       // tabiiy neyron ovoz (audio/*.mp3)
      const a = curAudio = new Audio('audio/' + sl + '.mp3'); a.preservesPitch = true; a.playbackRate = rate / .85;
      a.onended = () => res(); a.onerror = () => { if (curAudio === a) robot(); else res(); };
      a.play().catch(() => { if (curAudio === a) robot(); else res(); }); return;
    }
    robot();
  });
}
let playTok = 0;
function stopSound() { playTok++; if ('speechSynthesis' in window) speechSynthesis.cancel(); if (curAudio) { curAudio.pause(); curAudio = null; } stopMusic(); }
async function playLines(lines, withMusic) {
  const t = ++playTok; if (withMusic) startMusic();
  for (let i = 0; i < lines.length; i++) {
    if (t !== playTok) return;
    $$('.line').forEach((el, k) => el.classList.toggle('on', k === i));
    await speak(lines[i][0], .8);
  }
  $$('.line').forEach(el => el.classList.remove('on')); stopMusic();
}
let MUS = null;   // karaoke uchun oddiy fon musiqa (WebAudio)
function startMusic() {
  if (!ST.settings.music || !ST.settings.sound || MUS) return;
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)(), g = ac.createGain(); g.gain.value = .05; g.connect(ac.destination);
    const notes = [261.6, 329.6, 392, 440, 392, 329.6, 293.7, 349.2]; let i = 0;
    const id = setInterval(() => { const o = ac.createOscillator(), e = ac.createGain(); o.type = 'triangle'; o.frequency.value = notes[i++ % notes.length];
      e.gain.setValueAtTime(.9, ac.currentTime); e.gain.exponentialRampToValueAtTime(.001, ac.currentTime + .42); o.connect(e); e.connect(g); o.start(); o.stop(ac.currentTime + .45); }, 480);
    MUS = { ac, id };
  } catch (e) { MUS = null; }
}
function stopMusic() { if (MUS) { clearInterval(MUS.id); MUS.ac.close().catch(() => {}); MUS = null; } }

/* ---------- Kichik UI yordamchilari ---------- */
function toast(m) { const d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = m; document.body.appendChild(d); setTimeout(() => d.remove(), 1800); }
function confetti() {
  if (!ST.settings.motion) return;
  const c = document.createElement('div'); c.className = 'confetti'; c.setAttribute('aria-hidden', 'true');
  c.innerHTML = Array.from({ length: 40 }, (_, i) => `<i style="left:${Math.random() * 100}%;background:hsl(${i * 37 % 360} 95% 60%);animation-delay:${Math.random() * .5}s;animation-duration:${1.4 + Math.random() * 1.2}s"></i>`).join('');
  document.body.appendChild(c); setTimeout(() => c.remove(), 3000);
}
function modal(html, closable = true) {
  const d = document.createElement('div'); d.className = 'modal';
  d.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(d); d.close = () => d.remove();
  if (closable) { d.addEventListener('click', e => { if (e.target === d) d.remove(); }); d.addEventListener('keydown', e => { if (e.key === 'Escape') d.remove(); }); }
  const f = $('input,select,button', d); if (f) f.focus(); return d;
}

/* ---------- Maskot Lingo: kayfiyat + aksessuarlar + animatsiya ---------- */
function mascot(mood = 'happy', worn) {
  worn = worn || (S && S.items.worn) || [];
  const eyes = mood === 'sleepy' ? '<path d="M66 104 q10 6 20 0M114 104 q10 6 20 0" stroke="#3a3358" stroke-width="4" fill="none" stroke-linecap="round"/>'
    : `<g class="eyes"><circle cx="76" cy="102" r="11" fill="#fff"/><circle cx="124" cy="102" r="11" fill="#fff"/><circle cx="78" cy="104" r="6.5" fill="#3a3358"/><circle cx="126" cy="104" r="6.5" fill="#3a3358"/><circle cx="80" cy="101" r="2.2" fill="#fff"/><circle cx="128" cy="101" r="2.2" fill="#fff"/></g>`;
  const brows = mood === 'sad' ? '<path d="M64 88 l22 -6M136 88 l-22 -6" stroke="#7a4a2e" stroke-width="4" stroke-linecap="round"/>' : '';
  const mouth = { wow: '<ellipse cx="100" cy="130" rx="10" ry="12" fill="#7a2e2e"/>', sad: '<path d="M82 134 Q100 118 118 134" stroke="#7a2e2e" stroke-width="5" fill="none" stroke-linecap="round"/>',
    sleepy: '<ellipse cx="100" cy="130" rx="6" ry="4" fill="#7a2e2e"/>', cheer: '<path d="M74 118 Q100 156 126 118Z" fill="#7a2e2e"/><path d="M88 134 Q100 146 112 134Z" fill="#ff8a9a"/>' }[mood]
    || '<path d="M78 118 Q100 146 122 118 Q100 130 78 118Z" fill="#7a2e2e"/><path d="M90 128 Q100 138 110 128 Q100 133 90 128Z" fill="#ff8a9a"/>';
  const arms = mood === 'cheer' ? '<g class="wave"><circle cx="22" cy="70" r="14" fill="#F28A1E"/><circle cx="178" cy="70" r="14" fill="#F28A1E"/></g>' : '';
  const A = {
    glasses: '<g stroke="#222" stroke-width="4" fill="rgba(255,255,255,.25)"><circle cx="76" cy="102" r="16"/><circle cx="124" cy="102" r="16"/><path d="M92 102h16"/></g>',
    bow: '<g transform="translate(150 50)"><path d="M0 0 l-16 -10 v20z M0 0 l16 -10 v20z" fill="#ff5c93"/><circle r="5" fill="#d6336c"/></g>',
    headphones: '<path d="M38 100 A62 62 0 0 1 162 100" stroke="#3b3b58" stroke-width="8" fill="none"/><rect x="28" y="92" width="18" height="30" rx="8" fill="#7c5cff"/><rect x="154" y="92" width="18" height="30" rx="8" fill="#7c5cff"/>',
    scarf: '<path d="M58 160 Q100 182 142 160 L146 176 Q100 200 54 176Z" fill="#e5484d"/><rect x="124" y="168" width="14" height="30" rx="5" fill="#c92a2a"/>',
    crown: '<path d="M70 38 L82 12 L100 30 L118 12 L130 38Z" fill="#ffd43b" stroke="#e8a317" stroke-width="3"/>'
  };
  const hat = worn.includes('crown') ? '' : `<path d="M52 62 Q100 20 148 62 L142 72 Q100 48 58 72Z" fill="#1f2a5a"/><path d="M60 66 Q100 30 140 66" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="2 7" stroke-linecap="round"/><path d="M100 36 L104 46 L100 56 L96 46Z" fill="#fff"/>`;
  return `<svg viewBox="0 0 200 200" role="img" aria-label="Lingo maskoti" class="mascot">
  <circle cx="100" cy="108" r="78" fill="#FFA43B"/>${[...Array(12)].map((_, i) => `<circle cx="${100 + 80 * Math.cos(i * Math.PI / 6)}" cy="${108 + 80 * Math.sin(i * Math.PI / 6)}" r="17" fill="#F28A1E"/>`).join('')}
  ${arms}<circle cx="45" cy="62" r="20" fill="#FFB962"/><circle cx="155" cy="62" r="20" fill="#FFB962"/><circle cx="45" cy="62" r="10" fill="#FF9AA8"/><circle cx="155" cy="62" r="10" fill="#FF9AA8"/>
  <circle cx="100" cy="110" r="62" fill="#FFD28A"/><ellipse cx="100" cy="128" rx="30" ry="22" fill="#FFF1D6"/>${eyes}${brows}
  <circle cx="58" cy="124" r="9" fill="#FF9AA8" opacity=".7"/><circle cx="142" cy="124" r="9" fill="#FF9AA8" opacity=".7"/>
  <path d="M92 116 Q100 110 108 116 Q100 126 92 116Z" fill="#7a4a2e"/>${mouth}${hat}
  ${worn.map(w => A[w] || '').join('')}</svg>`;
}

/* ---------- Kun boshlanishi: seriya, kunlik vazifa, haftalik maqsad ---------- */
function initDay() {
  const today = LG.dayKey(), wk = LG.weekKey();
  const st = LG.streakUpdate(S.streak, today); S.streak = { last: st.last, n: st.n };
  if (st.bonus) { S.stars += st.bonus; setTimeout(() => toast(`🔥 ${st.n} kunlik seriya! +${st.bonus} ⭐`), 600); }
  if (!S.daily || S.daily.d !== today) {
    const tp = LG.seededPick(topicsOf(S.grade), today + P.id), gid = LG.seededPick(['match', 'listen', 'spell', 'complete'], today + tp.id);
    S.daily = { d: today, tid: tp.id, gid, done: false };
  }
  if (!S.weekly || S.weekly.w !== wk) S.weekly = { w: wk, base: S.stars, paid: false };
  save();
}
function addStars(n) {
  if (n <= 0) return; S.stars += n; toast('+' + n + ' ⭐ yulduz!');
  if (S.weekly && !S.weekly.paid && S.stars - S.weekly.base >= 30) { S.weekly.paid = true; S.stars += 10; setTimeout(() => { toast('🏅 Haftalik maqsad bajarildi! +10 ⭐'); confetti(); }, 900); }
  save();
}
function trackWord(w, ok) {   // xatolar va takrorlash qutilari (adaptiv o'rganish)
  if (!w) return; w = w.toLowerCase();
  if (!ok) S.miss[w] = (S.miss[w] || 0) + 1;
  S.box[w] = LG.reviewUpdate(S.box[w], ok, Date.now());
}

/* ---------- Vaqt hisobi va admin belgilagan kunlik limit ---------- */
setInterval(() => {
  if (document.hidden || !P.id) return;
  const d = LG.dayKey(); S.time[d] = (S.time[d] || 0) + .5; save();
  const lim = ST.parent.limit; if (lim > 0 && S.time[d] >= lim && !$('.lock')) lockScreen();
}, 30000);
function lockScreen() {
  const d = modal(`<div class="center">${mascot('sleepy')}<h2>😴 Bugungi vaqt tugadi!</h2><p>Lingo dam olmoqda. Ertaga yana o‘ynaymiz!</p><button class="btn sm ghost" id="unl">Chiqish</button></div>`, false);
  d.classList.add('lock'); $('#unl', d).onclick = () => Net.logout();
}

/* ---------- Router ---------- */
function route() {
  stopSound();
  const [p = 'home', a, b] = location.hash.replace(/^#\/?/, '').split('/');
  const page = PAGES[p] ? p : 'home';
  $$('#nav a, #tabbar a').forEach(x => x.classList.toggle('on', x.dataset.p === page));
  $('#sheet') && $('#sheet').classList.remove('open');
  $('#app').className = 'wrap';
  $('#app').innerHTML = `<div class="page">${PAGES[page](a, b)}</div>`;
  window.scrollTo(0, 0); save();
  if (PAGES[page].after) PAGES[page].after(a, b);
  const h = $('#app h1'); if (h) { h.tabIndex = -1; $('#live').textContent = h.textContent; }
}
window.addEventListener('hashchange', () => { if (P.id) route(); });

/* ---------- Hodisalar va qulaylik (klaviatura) ---------- */
document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (el && ACT[el.dataset.act]) ACT[el.dataset.act](el.dataset, el, e); });
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role=button][data-act]')) { e.preventDefault(); e.target.click(); }
});
document.addEventListener('change', e => { const a = e.target.dataset.chg; if (a && ACT[a]) ACT[a](e.target.dataset, e.target, e); });

/* ---------- Sozlamalar va hisob oynalari ---------- */
ACT.settings = () => {
  const s = ST.settings;
  const d = modal(`<h2>⚙️ Sozlamalar</h2>
  <label>Matn o‘lchami: <input type="range" id="sFont" min="0" max="3" value="${s.font}" aria-label="Matn o‘lchami"></label>
  <label><input type="checkbox" id="sHc" ${s.contrast ? 'checked' : ''}> Yuqori kontrast</label>
  <label><input type="checkbox" id="sMo" ${s.motion ? 'checked' : ''}> Animatsiyalar</label>
  <label><input type="checkbox" id="sSo" ${s.sound ? 'checked' : ''}> Ovoz (o‘chirilsa matn ko‘rsatiladi)</label>
  <label><input type="checkbox" id="sNat" ${s.natural !== false ? 'checked' : ''}> Tabiiy ovoz (tavsiya) — o‘chirilsa brauzerning robot ovozi</label>
  <label><input type="checkbox" id="sMu" ${s.music ? 'checked' : ''}> Qo‘shiq uchun fon musiqa</label>
  <label>Ovoz tezligi: <input type="range" id="sRate" min="0.5" max="1.1" step="0.05" value="${s.rate}" aria-label="Ovoz tezligi"></label>
  <label>Ingliz ovozi: <select id="sVoice"><option value="">Avtomatik (eng yaxshisi)</option>${VOICES.map(v => `<option ${v.name === s.voice ? 'selected' : ''} value="${esc(v.name)}">${esc(v.name)} (${v.lang})</option>`).join('')}</select></label>
  <div class="row"><button class="btn sm" id="sTest">🔊 Sinash</button><button class="btn sm ghost" id="sClose">Yopish</button></div>`);
  const upd = () => { Object.assign(s, { font: +$('#sFont', d).value, contrast: $('#sHc', d).checked, motion: $('#sMo', d).checked, sound: $('#sSo', d).checked, natural: $('#sNat', d).checked, music: $('#sMu', d).checked, rate: +$('#sRate', d).value, voice: $('#sVoice', d).value }); applySettings(); save(); };
  $$('input,select', d).forEach(i => i.addEventListener('input', upd));
  $('#sTest', d).onclick = () => speak('Hello! I am Lingo. Let us learn English!');
  $('#sClose', d).onclick = () => d.close();
};
ACT.profiles = () => {
  const d = modal(`<div class="center">${mascot('happy')}<h2>${esc(P.name)}</h2><p>${gradeName(S.grade)}${P.section ? ' · ' + esc(P.section) : ''} · ⭐ ${S.stars}</p>
  <p class="muted">Sinfni faqat administrator o‘zgartiradi.</p><div class="row" style="justify-content:center"><button class="btn sm ghost" id="acOut">🚪 Chiqish</button><button class="btn sm" id="acClose">Yopish</button></div></div>`);
  $('#acClose', d).onclick = () => d.close(); $('#acOut', d).onclick = () => Net.logout();
};
