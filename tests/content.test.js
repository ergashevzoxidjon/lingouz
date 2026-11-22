const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path'), vm = require('vm');
const L = require('../logic.js');
const root = path.join(__dirname, '..');
const ctx = vm.createContext({});
const code = ['data.js', 'data2.js', 'data3.js'].map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n') +
  '\n;this.D={TOPICS,STORIES,SONGS,POEMS,RIDDLES,ALPHABET,CHAT,COLORS,CLUES,HARD_SOUNDS};';
vm.runInContext(code, ctx);
const D = ctx.D;

test('24 mavzu, har sinfda 6 ta', () => {
  assert.equal(D.TOPICS.length, 24);
  for (let g = 1; g <= 4; g++) assert.equal(D.TOPICS.filter(t => t.grade === g).length, 6);
});
const BIG5 = ['g1t1', 'g1t2', 'g1t3', 'g1t4', 'g1t6'];
test('har mavzuda kamida 12 ta so‘z, so‘z va rasm takrorlanmaydi', () => {
  for (const t of D.TOPICS) {
    assert.ok(t.words.length >= 12, t.id);
    assert.equal(new Set(t.words.map(w => w.en.toLowerCase())).size, t.words.length, t.id + ' so‘z takrori');
    assert.equal(new Set(t.words.map(w => w.e)).size, t.words.length, t.id + ' rasm takrori');
    t.words.forEach(w => assert.ok(w.en && w.uz && w.e, t.id));
  }
});
test('ranglar, sonlar, hayvonlar, mevalar, o‘yinchoqlarda kamida 50 ta namuna', () => {
  for (const id of BIG5) assert.ok(D.TOPICS.find(t => t.id === id).words.length >= 50, id);
});
test('oila a‘zolari to‘liq (ota-ona, aka-uka, buvi-bobo, amaki, xola, qaynona, kelin...)', () => {
  const w = D.TOPICS.find(t => t.id === 'g1t5').words.map(x => x.en);
  ['mother', 'father', 'sister', 'brother', 'grandmother', 'grandfather', 'uncle', 'aunt', 'cousin', 'husband', 'wife', 'son', 'daughter', 'baby', 'mother-in-law', 'daughter-in-law', 'nephew', 'niece', 'twins', 'stepmother'].forEach(x => assert.ok(w.includes(x), x));
  assert.ok(w.length >= 40);
});
test('rang so‘zlari to‘g‘ri hex, son so‘zlari n: belgisiga ega', () => {
  D.TOPICS.find(t => t.id === 'g1t1').words.forEach(w => assert.match(w.e, /^#[0-9a-f]{6}$/i, w.en));
  D.TOPICS.find(t => t.id === 'g1t2').words.forEach(w => assert.match(w.e, /^n:/, w.en));
});
test('namuna gapda to‘g‘ri so‘z bor va xato variantlardan farq qiladi', () => {
  for (const t of D.TOPICS) {
    assert.ok(t.s.en.includes(t.s.ans), t.id);
    assert.ok(!t.s.wrong.includes(t.s.ans), t.id);
  }
});
test('20 ertak: 6 qator, savol va javoblar', () => {
  assert.equal(D.STORIES.length, 20);
  for (const s of D.STORIES) { assert.equal(s.lines.length, 6, s.en); assert.equal(s.q.length, 5, s.en); assert.ok(!s.q.slice(3).includes(s.q[2])); }
});
test('qo‘shiq 6, she’r 6, topishmoq 12 va javob variantlar ichida', () => {
  assert.equal(D.SONGS.length, 6); assert.equal(D.POEMS.length, 6); assert.equal(D.RIDDLES.length, 12);
  D.RIDDLES.forEach(r => assert.ok(r.opts.includes(r.ans), r.q));
});
test('alifbo 26 harf', () => { assert.equal(D.ALPHABET.length, 26); });
test('o‘zbekcha matnda ASCII apostrof (o\' g\') qolmagan', () => {
  const bad = [];
  const chk = (s, w) => { if (/[oOgG]'/.test(s)) bad.push(w + ': ' + s); };
  D.TOPICS.forEach(t => { chk(t.culture, t.id); chk(t.s.uz, t.id); t.words.forEach(w => chk(w.uz, w.en)); });
  D.STORIES.forEach(s => s.lines.forEach(l => chk(l[1], s.en)));
  assert.deepEqual(bad, []);
});
test('har emoji uchun lokal SVG fayl bor (oflayn)', () => {
  const re = /(?:\p{Regional_Indicator}{2}|[0-9#*]️?⃣|\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier})?(?:‍\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier})?)*)/gu;
  const src = fs.readFileSync(path.join(root, 'data.js'), 'utf8') + fs.readFileSync(path.join(root, 'data2.js'), 'utf8') + fs.readFileSync(path.join(root, 'data3.js'), 'utf8');
  const miss = [...new Set(src.match(re) || [])].filter(e => !/^[0-9#*]$/.test(e)).filter(e => !fs.existsSync(path.join(root, 'emoji', L.emojiFile(e) + '.svg')));
  assert.deepEqual(miss, []);
});
