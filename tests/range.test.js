const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), os = require('os'), path = require('path');
process.env.DB_FILE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'lingouz-r-')), 'db.json');
process.env.ADMIN_PASSWORD = 'adminpass123';
process.env.LINGOUZ_NO_LISTEN = '1';
const { server } = require('../server.js');
let base;
test.before(async () => { await new Promise(r => server.listen(0, r)); base = 'http://127.0.0.1:' + server.address().port; });
test.after(() => server.close());

const FILE = '/audio/apple.mp3';
test('MP3 uchun Range (206) qo‘llanadi — iPhone/Safari audio uchun shart', async () => {
  const full = await fetch(base + FILE); assert.equal(full.status, 200); const buf = Buffer.from(await full.arrayBuffer());
  const part = await fetch(base + FILE, { headers: { Range: 'bytes=0-99' } });
  assert.equal(part.status, 206); assert.equal(part.headers.get('content-range'), `bytes 0-99/${buf.length}`);
  assert.equal((await part.arrayBuffer()).byteLength, 100);
  const tail = await fetch(base + FILE, { headers: { Range: 'bytes=-50' } }); assert.equal(tail.status, 206);
  assert.equal((await tail.arrayBuffer()).byteLength, 50);
  assert.equal((await fetch(base + FILE, { headers: { Range: 'bytes=99999999-' } })).status, 416);
});
