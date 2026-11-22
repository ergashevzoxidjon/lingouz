const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path'), cp = require('child_process');
const root = path.join(__dirname, '..');
const list = JSON.parse(cp.execFileSync(process.execPath, [path.join(root, 'tools', 'collect-speech.js')], { maxBuffer: 1e8 }).toString());
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'audio', 'manifest.json'), 'utf8'));

test('ilova ovoz chiqaradigan har bir matn uchun tabiiy audio fayl bor', () => {
  const have = new Set(manifest), missing = list.filter(x => !have.has(x.slug)).map(x => x.text);
  assert.deepEqual(missing.slice(0, 20), [], `${missing.length} ta matn uchun audio yo'q — tools/gen-audio.py ni qayta ishga tushiring`);
});
test('manifestdagi har bir fayl mavjud, bo‘sh emas va MP3 sarlavhasiga ega', () => {
  for (const s of manifest) {
    const f = path.join(root, 'audio', s + '.mp3'); assert.ok(fs.existsSync(f), s);
    const b = fs.readFileSync(f); assert.ok(b.length > 600, s + ' juda kichik');
    assert.ok((b[0] === 0xff && (b[1] & 0xe0) === 0xe0) || b.slice(0, 3).toString() === 'ID3', s + ' MP3 emas');
  }
});
test('audio fayllari hajmi me‘yorida (oflayn kesh uchun)', () => {
  const total = manifest.reduce((a, s) => a + fs.statSync(path.join(root, 'audio', s + '.mp3')).size, 0);
  assert.ok(total < 40e6, 'audio hajmi ' + Math.round(total / 1e6) + ' MB');
});
