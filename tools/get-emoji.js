// Kontentdagi emojilar uchun Twemoji (CC-BY 4.0) SVG fayllarini emoji/ papkasiga yuklaydi (bir marta).
// Ishlatish: node tools/get-emoji.js
const fs = require('fs'), path = require('path');
const { emojiFile } = require('../logic.js');
const root = path.join(__dirname, '..');
const BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.0.3/assets/svg/';
const src = ['data.js', 'data2.js', 'data3.js'].map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
const re = /(?:\p{Regional_Indicator}{2}|[0-9#*]️?⃣|\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier})?(?:‍\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier})?)*)/gu;
const set = new Set((src.match(re) || []).filter(e => !/^[0-9#*]$/.test(e)));
['🔊','🎤','⭐','🎉','🏆'].forEach(e => set.add(e));
fs.mkdirSync(path.join(root, 'emoji'), { recursive: true });
(async () => {
  let ok = 0, miss = [];
  for (const e of set) {
    const f = emojiFile(e), out = path.join(root, 'emoji', f + '.svg');
    if (fs.existsSync(out)) { ok++; continue; }
    try {
      const r = await fetch(BASE + f + '.svg');
      const t = await r.text();
      if (!r.ok || !t.trim().startsWith('<svg')) throw new Error(r.status);
      fs.writeFileSync(out, t); ok++;
    } catch (err) { miss.push(e + ' ' + f); }
  }
  console.log('Yuklandi/bor:', ok, ' Topilmadi:', miss.length, miss.join(' | '));
})();
