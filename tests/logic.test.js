const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../logic.js');

test('talaffuz: aniq moslik yuqori ball', () => {
  assert.ok(L.scoreSpeech([{ t: 'Blue' }], 'blue').score >= 92);
  assert.ok(L.scoreSpeech([{ t: 'the sky is blue' }], 'The sky is blue.').score >= 92);
});
test('talaffuz: boshqa so‘z past ball', () => {
  assert.ok(L.scoreSpeech([{ t: 'banana' }], 'blue').score < 40);
  assert.equal(L.scoreSpeech([], 'blue').score, 0);
});
test('talaffuz: eng yaxshi muqobil tanlanadi', () => {
  const r = L.scoreSpeech([{ t: 'glue' }, { t: 'blue' }], 'blue');
  assert.equal(r.heard, 'blue');
});
test('talaffuz: tovushga yaqin xato yumshoq baholanadi (very~wery)', () => {
  const near = L.scoreSpeech([{ t: 'wery' }], 'very').score;
  const far = L.scoreSpeech([{ t: 'mary' }], 'very').score;
  assert.ok(near > far);
});
test('so‘zma-so‘z natija: qaysi so‘z xato', () => {
  const r = L.scoreSpeech([{ t: 'the sky is red' }], 'the sky is blue');
  assert.equal(r.words.find(w => w.w === 'blue').ok, false);
  assert.equal(r.words.find(w => w.w === 'sky').ok, true);
});
test('charDiff xato harflarni belgilaydi', () => {
  const d = L.charDiff('think', 'sink');
  assert.equal(d.map(x => x.ch).join(''), 'think');
  assert.ok(d.some(x => !x.ok));
});
test('yulduz faqat yaxshilanishga beriladi', () => {
  assert.equal(L.starDelta(4, 2), 2);
  assert.equal(L.starDelta(2, 4), 0);
  assert.equal(L.starDelta(5, undefined), 5);
});
test('Leitner: to‘g‘ri javob qutini oshiradi, xato 1-qutiga qaytaradi', () => {
  const now = 1e12;
  const a = L.reviewUpdate({ b: 2 }, true, now);
  assert.equal(a.b, 3); assert.equal(a.due, now + 2 * 86400000);
  assert.equal(L.reviewUpdate({ b: 5 }, false, now).b, 1);
  assert.deepEqual(L.dueWords({ x: { b: 1, due: 0 }, y: { b: 3, due: now + 1 } }, now), ['x']);
});
test('seriya: ketma-ket kun, uzilish, takroriy kirish', () => {
  let s = L.streakUpdate(null, '2026-11-20');
  assert.equal(s.n, 1);
  s = L.streakUpdate(s, '2026-11-21'); assert.equal(s.n, 2);
  s = L.streakUpdate(s, '2026-11-21'); assert.equal(s.n, 2);
  s = L.streakUpdate(s, '2026-11-22'); assert.equal(s.n, 3); assert.equal(s.bonus, 2);
  s = L.streakUpdate(s, '2026-11-25'); assert.equal(s.n, 1);
});
test('daraja avtomatik o‘zgaradi', () => {
  assert.equal(L.nextLevel(0, 5, 5), 1);
  assert.equal(L.nextLevel(2, 5, 5), 2);
  assert.equal(L.nextLevel(1, 1, 5), 0);
  assert.equal(L.nextLevel(1, 3, 5), 1);
});
test('emoji fayl nomi (twemoji)', () => {
  assert.equal(L.emojiFile('🐱'), '1f431');
  assert.equal(L.emojiFile('☀️'), '2600');
  assert.equal(L.emojiFile('1️⃣'), '31-20e3');
  assert.equal(L.emojiFile('👩‍🏫'), '1f469-200d-1f3eb');
});
test('migratsiya: eski saqlash yangi tuzilmaga o‘tadi', () => {
  const m = L.migrate({ grade: 3, stars: 40, done: { g1t1: 1 }, name: 'Aziza' });
  assert.equal(m.v, 2);
  assert.equal(m.profiles.p1.data.stars, 40);
  assert.equal(m.profiles.p1.name, 'Aziza');
  assert.ok(m.profiles.p1.data.box);
  assert.equal(L.migrate(null).v, 2);
});
test('hash/tanlov barqaror, sha256 deterministik', async () => {
  assert.equal(L.seededPick(['a', 'b', 'c'], 'x'), L.seededPick(['a', 'b', 'c'], 'x'));
  assert.equal(await L.sha256('1234'), await L.sha256('1234'));
  assert.notEqual(await L.sha256('1234'), await L.sha256('1235'));
});
test('weekKey va dayKey formati', () => {
  assert.match(L.weekKey(new Date('2026-11-22')), /^2026-W4\d$/);
  assert.match(L.dayKey(), /^\d{4}-\d\d-\d\d$/);
});
