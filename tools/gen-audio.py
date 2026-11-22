"""LingoUz Kids — bepul, oflayn neyron ovoz (Kokoro, Apache-2.0) bilan audiolarni yaratish.

Tayyorgarlik (bir marta, loyiha papkasidan tashqarida):
    python -m venv tts && tts\\Scripts\\pip install kokoro-onnx soundfile lameenc
    # model fayllari (GitHub: thewh1teagle/kokoro-onnx, release "model-files-v1.0"):
    #   kokoro-v1.0.int8.onnx  va  voices-v1.0.bin
Ishlatish:
    node tools/collect-speech.js > speech-list.json
    tts\\Scripts\\python tools/gen-audio.py --list speech-list.json --models <papka> --voice af_heart
    tts\\Scripts\\python tools/gen-audio.py --samples --models <papka>      # ovozlarni solishtirish uchun namunalar
Natija: audio/<slug>.mp3 va audio/manifest.json (ilova avtomatik ishlatadi).
"""
import argparse, json, os, re, sys, time
import numpy as np
import lameenc
from kokoro_onnx import Kokoro

ap = argparse.ArgumentParser()
ap.add_argument('--list'); ap.add_argument('--models', required=True)
ap.add_argument('--out', default=os.path.join(os.path.dirname(__file__), '..', 'audio'))
ap.add_argument('--voice', default='af_heart'); ap.add_argument('--speed', type=float, default=0.9)
ap.add_argument('--samples', action='store_true'); ap.add_argument('--limit', type=int, default=0)
ap.add_argument('--force', action='store_true')
a = ap.parse_args()
out = os.path.abspath(a.out); os.makedirs(out, exist_ok=True)

k = Kokoro(os.path.join(a.models, 'kokoro-v1.0.int8.onnx'), os.path.join(a.models, 'voices-v1.0.bin'))
LETTER = dict(A='Ay', B='Bee', C='See', D='Dee', E='Ee', F='Eff', G='Jee', H='Aitch', I='Eye', J='Jay', K='Kay', L='El', M='Em', N='En', O='Oh', P='Pee', Q='Cue', R='Are', S='Ess', T='Tee', U='You', V='Vee', W='Double you', X='Ex', Y='Why', Z='Zee')
FIX = {'TV': 'T V', 'UFO': 'U F O', 'yo-yo': 'yo yo', 'pinata': 'piñata', 'Nowruz': 'Nawrooz', 'sumalak': 'soomalak', 'plov': 'plov', 'samsa': 'sumsa', 'dutar': 'dootar', 'Bukhara': 'Bookhara', 'Khiva': 'Kheeva', 'Samarkand': 'Samarkand'}

def prep(t):
    m = re.match(r'^([A-Z])\. \1 for (.+)$', t)
    if m: return f'{LETTER[m.group(1)]}. {LETTER[m.group(1)]} for {m.group(2)}.'
    for s, r in FIX.items(): t = re.sub(rf'\b{re.escape(s)}\b', r, t)
    return t

def mp3(samples, sr):
    x = np.asarray(samples, dtype=np.float32)
    # bosh/oxiridagi sukunatni kesish (80 ms qoldiramiz) — tugma bosilganda kechikish bo'lmasin
    idx = np.where(np.abs(x) > 0.01)[0]
    if len(idx): x = x[max(0, idx[0] - int(sr * .08)): idx[-1] + int(sr * .15)]
    rms = float(np.sqrt(np.mean(x ** 2)) + 1e-9); x = x * (0.09 / rms)           # barcha fayllar bir xil balandlikda
    peak = float(np.max(np.abs(x))); x = x * min(1.0, 0.89 / peak)                # kliplashdan himoya
    fade = int(sr * .03); x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
    e = lameenc.Encoder(); e.set_bit_rate(80); e.set_in_sample_rate(sr); e.set_channels(1); e.set_quality(2)
    return bytes(e.encode((x * 32767).astype(np.int16).tobytes()) + e.flush()), len(x) / sr

if a.samples:
    sd = os.path.join(out, 'samples'); os.makedirs(sd, exist_ok=True)
    for v in ['af_heart', 'af_bella', 'af_nicole', 'af_sarah', 'af_sky', 'bf_emma', 'am_michael']:
        for name, text in [('words', 'Red. Blue. Green. Apple. Elephant. Mother. Grandfather.'), ('sentence', 'The sky is blue. I love my mother. We travel to Samarkand.')]:
            s, sr = k.create(text, voice=v, speed=a.speed, lang='en-us' if not v.startswith('b') else 'en-gb')
            data, d = mp3(s, sr); open(os.path.join(sd, f'{v}-{name}.mp3'), 'wb').write(data); print(v, name, round(d, 1), 's')
    sys.exit(0)

items = json.load(open(a.list, encoding='utf-8'))
if a.limit: items = items[:a.limit]
done, t0, total_bytes = [], time.time(), 0
for i, it in enumerate(items, 1):
    f = os.path.join(out, it['slug'] + '.mp3')
    if os.path.exists(f) and not a.force: done.append(it['slug']); continue
    s, sr = k.create(prep(it['text']), voice=a.voice, speed=a.speed, lang='en-us')
    data, d = mp3(s, sr)
    if d < 0.15 or len(data) < 600: print('BO\'SH/QISQA:', it['text'], d); continue
    open(f, 'wb').write(data); done.append(it['slug']); total_bytes += len(data)
    if i % 25 == 0: print(f'{i}/{len(items)}  {time.time() - t0:.0f}s', flush=True)
json.dump(sorted(set(done)), open(os.path.join(out, 'manifest.json'), 'w'))
print('Tayyor:', len(done), 'fayl; yangi hajm', round(total_bytes / 1e6, 1), 'MB; vaqt', round(time.time() - t0), 's')
