const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const server = path.join(__dirname, '..', 'server.js');

function run(env) {
  return cp.spawnSync(process.execPath, [server], { env: { ...process.env, LINGOUZ_NO_LISTEN: '1', ...env }, encoding: 'utf8' });
}

test('admin parolini tiklash: belgi fayli bo‘lsa yangi parol yaratiladi, fayl o‘chadi, eski parol ishlamaydi', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-reset-'));
  const dbFile = path.join(dir, 'db.json'), flag = path.join(dir, 'reset-admin');
  const env = { DB_FILE: dbFile, RESET_FLAG_FILE: flag, ADMIN_PASSWORD: 'Eski-Parol-123' };
  run(env);                                                    // baza va admin yaratiladi
  const before = JSON.parse(fs.readFileSync(dbFile, 'utf8')).admin;
  fs.writeFileSync(flag, '');
  delete env.ADMIN_PASSWORD;
  const r = run(env);
  assert.match(r.stdout, /ADMIN PAROLI TIKLANDI/);
  assert.match(r.stdout, /Admin parol: [A-Za-z0-9_-]{12}/);
  assert.ok(!fs.existsSync(flag), 'belgi fayli o‘chirilishi kerak');
  const after = JSON.parse(fs.readFileSync(dbFile, 'utf8')).admin;
  assert.notDeepEqual(after, before, 'parol xeshi o‘zgarishi kerak');
});

test('admin parolini tiklash: belgi fayli yo‘q bo‘lsa hech narsa o‘zgarmaydi', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-reset-'));
  const env = { DB_FILE: path.join(dir, 'db.json'), RESET_FLAG_FILE: path.join(dir, 'reset-admin'), ADMIN_PASSWORD: 'Parol-12345' };
  run(env);
  const before = fs.readFileSync(env.DB_FILE, 'utf8');
  delete env.ADMIN_PASSWORD;
  const r = run(env);
  assert.ok(!/TIKLANDI/.test(r.stdout));
  assert.equal(fs.readFileSync(env.DB_FILE, 'utf8'), before);
});
