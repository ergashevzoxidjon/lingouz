// Ilova ovoz chiqaradigan BARCHA inglizcha matnlarni yig'adi (so'z, gap, ertak, qo'shiq, topishmoq, suhbat, alifbo...).
// Chiqish: JSON [{slug, text}] — tools/gen-audio.py shu ro'yxat bo'yicha audio yaratadi.
// Ishlatish: node tools/collect-speech.js > speech-list.json
const fs = require('fs'), path = require('path'), vm = require('vm');
const L = require('../logic.js');
const root = path.join(__dirname, '..');
const ctx = vm.createContext({});
vm.runInContext(['data.js', 'data2.js', 'data3.js'].map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n') +
  ';this.D={TOPICS,STORIES,SONGS,POEMS,RIDDLES,ALPHABET,CHAT,CLUES,HARD_SOUNDS,SOUND_PAIRS}', ctx);
const D = ctx.D, map = new Map();
const add = (text, kind) => { text = String(text).trim(); if (!text) return; const slug = L.slug(text); if (slug && !map.has(slug)) map.set(slug, { slug, text, kind }); };

D.TOPICS.forEach(t => { t.words.forEach(w => add(w.en, 'word')); add(t.s.en, 'sentence'); });
D.STORIES.forEach(s => { s.lines.forEach(l => add(l[0], 'story')); add(s.q[0], 'story'); s.q.slice(2).forEach(a => add(a, 'word')); });
[...D.SONGS, ...D.POEMS].forEach(s => s.lines.forEach(l => add(l[0], 'song')));
D.RIDDLES.forEach(r => { add(r.q, 'riddle'); add(r.ans, 'word'); });
D.CHAT.forEach(c => c.turns.forEach(t => { add(t.l, 'chat'); t.r.forEach(r => { add(r[0], 'chat'); add(r[2], 'chat'); }); }));
D.ALPHABET.forEach(a => add(a.l + '. ' + a.l + ' for ' + a.en, 'alphabet'));
D.HARD_SOUNDS.forEach(h => h[2].forEach(w => add(w, 'word')));
D.SOUND_PAIRS.forEach(p => add(p.replace('/', ', '), 'pair'));
Object.values(D.CLUES).forEach(c => add(c.join(' '), 'clue'));
['Hello! I am Lingo. Let us learn English!'].forEach(x => add(x, 'misc'));

process.stdout.write(JSON.stringify([...map.values()]));
