/* logic.js — sof (toza) funksiyalar: talaffuz bahosi, takrorlash (Leitner), seriya, saqlash.
   Brauzerda ham, Node testlarida ham ishlaydi. */
(function (root) {
  'use strict';

  const lev = (a, b) => {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  };
  const norm = s => String(s || '').toLowerCase().replace(/[^a-z' ]/g, ' ').replace(/\s+/g, ' ').trim();
  const sim = (a, b) => { const m = Math.max(a.length, b.length); return m ? 1 - lev(a, b) / m : 1; };

  /* Soddalashtirilgan tovush kaliti (metaphone-ga o'xshash): imlo emas, tovushga yaqin solishtirish.
     Bolalar talaffuzidagi o'xshash tovushlar (th~t/s, w~v) yumshoq baholanadi. */
  function phoneticKey(word) {
    let s = norm(word).replace(/ /g, '');
    s = s.replace(/ph/g, 'f').replace(/ck/g, 'k').replace(/ch/g, 'C').replace(/sh/g, 'S').replace(/th/g, 'T')
      .replace(/wh/g, 'w').replace(/kn/g, 'n').replace(/wr/g, 'r').replace(/ng/g, 'N')
      .replace(/c(?=[eiy])/g, 's').replace(/c/g, 'k').replace(/q/g, 'k').replace(/x/g, 'ks').replace(/z/g, 's').replace(/y(?=[aeiou])/g, 'j')
      .replace(/e$/, '').replace(/[aeiouy]+/g, 'a').replace(/(.)\1+/g, '$1');
    return s.replace(/T/g, 't').replace(/v/g, 'w');   // th~t, v~w yumshoq
  }

  /* Talaffuz bahosi. alts = [{t:'matn', c:ishonch 0..1|undefined}], target = kutilgan gap.
     Qaytaradi: {score 0..100, heard, words:[{w, ok, heard, sim}]} */
  function scoreSpeech(alts, target) {
    const tw = norm(target).split(' ').filter(Boolean);
    let best = { score: 0, heard: '', words: tw.map(w => ({ w, ok: false, heard: '', sim: 0 })) };
    for (const alt of alts || []) {
      const hw = norm(alt.t).split(' ').filter(Boolean);
      if (!hw.length) continue;
      const used = new Set();
      const words = tw.map(w => {
        let bi = -1, bs = 0;
        hw.forEach((h, i) => {
          if (used.has(i)) return;
          const s = Math.max(sim(w, h), 0.9 * sim(phoneticKey(w), phoneticKey(h)));
          if (s > bs) { bs = s; bi = i; }
        });
        if (bi >= 0 && bs >= .5) used.add(bi);
        return { w, ok: bs >= .75, heard: bi >= 0 ? hw[bi] : '', sim: Math.round(bs * 100) };
      });
      const coverage = words.reduce((a, x) => a + x.sim, 0) / words.length / 100;
      const text = sim(norm(alt.t), tw.join(' '));
      const phon = sim(phoneticKey(alt.t), phoneticKey(target));
      const extra = Math.max(0, hw.length - tw.length) * 0.05;           // ortiqcha so'zlar uchun jarima
      let sc = (0.45 * coverage + 0.25 * text + 0.30 * phon) - extra;
      if (typeof alt.c === 'number' && sc > .5) sc = 0.85 * sc + 0.15 * alt.c;
      if (norm(alt.t) === tw.join(' ')) sc = Math.max(sc, 0.92);
      const score = Math.max(0, Math.min(100, Math.round(sc * 100)));
      if (score > best.score) best = { score, heard: alt.t, words };
    }
    return best;
  }

  /* Harflar darajasida farq: maqsad so'zning qaysi harflari eshitilgan so'zda yo'q (LCS) */
  function charDiff(target, heard) {
    const a = norm(target), b = norm(heard);
    const L = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--)
      L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const out = []; let i = 0, j = 0;
    while (i < a.length) {
      if (j < b.length && a[i] === b[j]) { out.push({ ch: a[i], ok: true }); i++; j++; }
      else if (j < b.length && L[i][j + 1] >= L[i + 1][j]) j++;
      else { out.push({ ch: a[i], ok: a[i] === ' ' }); i++; }
    }
    return out;
  }

  const starsFor = sc => sc >= 85 ? 3 : sc >= 60 ? 2 : sc >= 35 ? 1 : 0;
  const starDelta = (now, best) => Math.max(0, (now || 0) - (best || 0));   // yulduz faqat yaxshilanishga

  /* Leitner: 5 quti, oraliq kunlarda */
  const INTERVALS = [0, 0, 1, 2, 4, 8, 16];
  function reviewUpdate(entry, correct, now) {
    const b = Math.max(1, Math.min(6, (entry && entry.b) || 1));
    const nb = correct ? Math.min(6, b + 1) : 1;
    return { b: nb, due: now + INTERVALS[nb] * 86400000 };
  }
  const dueWords = (boxes, now) => Object.keys(boxes || {}).filter(w => boxes[w].due <= now && boxes[w].b < 6)
    .sort((x, y) => boxes[x].b - boxes[y].b);
  const weakWords = (miss, n) => Object.entries(miss || {}).sort((a, b) => b[1] - a[1]).slice(0, n || 10).map(e => e[0]);

  const dayKey = (d = new Date()) => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); };
  function weekKey(d = new Date()) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n);
    const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return t.getUTCFullYear() + '-W' + String(Math.ceil(((t - y0) / 86400000 + 1) / 7)).padStart(2, '0');
  }
  /* Kunlik seriya: kecha kirgan bo'lsa +1, bugun allaqachon bo'lsa o'zgarmaydi, aks holda 1 */
  function streakUpdate(st, today) {
    st = st || { last: '', n: 0 };
    if (st.last === today) return { ...st, bonus: 0 };
    const y = new Date(today + 'T00:00:00Z'); y.setUTCDate(y.getUTCDate() - 1);
    const n = st.last === y.toISOString().slice(0, 10) ? st.n + 1 : 1;
    return { last: today, n, bonus: n % 3 === 0 ? 2 : 0 };
  }
  const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const seededPick = (arr, seed) => arr[hash(seed) % arr.length];

  /* Daraja: 0 oson (3 variant), 1 o'rta (4), 2 qiyin (6). Natijaga qarab o'zgaradi */
  const OPT_COUNT = [3, 4, 6];
  const nextLevel = (lvl, score, total) => { const p = score / total; return p === 1 ? Math.min(2, lvl + 1) : p <= .4 ? Math.max(0, lvl - 1) : lvl; };

  /* Twemoji fayl nomi: ZWJ bo'lmasa FE0F olib tashlanadi */
  function emojiFile(e) {
    const cps = Array.from(e).map(c => c.codePointAt(0));
    const keep = cps.includes(0x200d) ? cps : cps.filter(c => c !== 0xfe0f);
    return keep.map(c => c.toString(16)).join('-');
  }
  const slug = s => norm(s).replace(/ /g, '-');

  const sha256 = async s => {
    const buf = await (root.crypto || require('node:crypto').webcrypto).subtle.digest('SHA-256', new TextEncoder().encode('lingouz:' + s));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const defaultData = () => ({ grade: 1, stars: 0, done: {}, scores: {}, speak: [], stories: {}, songs: {}, riddles: {}, miss: {}, box: {},
    streak: { last: '', n: 0 }, daily: null, weekly: null, level: {}, items: { owned: [], worn: [] }, diag: [], time: {}, memBest: 0, speakBest: {}, ack: {} });
  const defaultStore = () => ({ v: 2, cur: 'p1', profiles: { p1: { id: 'p1', name: 'Bolajon', avatar: '🦁', data: defaultData() } },
    settings: { font: 1, contrast: false, motion: true, sound: true, music: true, voice: '', rate: .85, kid1: true },
    parent: { pin: '', limit: 0 }, consent: { mic: null, ts: 0 }, custom: [], reports: [] });
  function migrate(raw) {
    const s = defaultStore();
    if (raw && raw.v === 2) return Object.assign(s, raw, { settings: Object.assign(s.settings, raw.settings) });
    if (raw && typeof raw === 'object') { s.profiles.p1.data = Object.assign(defaultData(), raw); s.profiles.p1.name = raw.name || 'Bolajon'; }
    return s;
  }

  const api = { lev, norm, sim, phoneticKey, scoreSpeech, charDiff, starsFor, starDelta, reviewUpdate, dueWords, weakWords, dayKey, weekKey,
    streakUpdate, hash, seededPick, OPT_COUNT, nextLevel, emojiFile, slug, sha256, defaultData, defaultStore, migrate, INTERVALS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else Object.assign(root, { LG: api });
})(typeof window !== 'undefined' ? window : globalThis);
