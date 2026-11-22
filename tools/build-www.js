// Native ilova (Capacitor) uchun veb fayllarni www/ papkasiga yig'adi: admin va server fayllarsiz, audio va emoji ichida (oflayn).
// Ishlatish: node tools/build-www.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), out = path.join(root, 'www');
const FILES = ['index.html', 'base.js', 'ui.css', 'mobile.css', 'data.js', 'data2.js', 'data3.js', 'logic.js', 'core.js', 'auth.js', 'pages.js', 'games.js', 'coach.js', 'progress.js', 'app.js'];
const DIRS = ['emoji', 'icons', 'audio'];
const SKIP = new Set(['samples', 'README.md']);

if (fs.existsSync(out)) fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
let n = 0;
const copy = (src, dst) => {
  if (fs.statSync(src).isDirectory()) { fs.mkdirSync(dst, { recursive: true }); for (const f of fs.readdirSync(src)) if (!SKIP.has(f)) copy(path.join(src, f), path.join(dst, f)); }
  else { fs.copyFileSync(src, dst); n++; }
};
FILES.forEach(f => copy(path.join(root, f), path.join(out, f)));
DIRS.forEach(d => copy(path.join(root, d), path.join(out, d)));
const mb = (() => { let s = 0; (function w(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? w(p) : (s += fs.statSync(p).size); } })(out); return (s / 1e6).toFixed(1); })();
console.log(`www/ tayyor: ${n} fayl, ${mb} MB`);
