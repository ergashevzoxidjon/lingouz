const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const pngSize = f => { const b = fs.readFileSync(path.join(root, f)); assert.equal(b.slice(1, 4).toString(), 'PNG', f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

function runBase(pathname, cap) {
  const out = []; const ctx = { location: { pathname }, document: { write: s => out.push(s) }, window: {} };
  ctx.window = ctx; if (cap) ctx.Capacitor = { isNativePlatform: () => true };
  vm.runInNewContext(read('base.js'), ctx); return { html: out.join(''), api: ctx.LINGO_API, native: ctx.LINGO_NATIVE };
}

test('base.js: istalgan yo‘lda to‘g‘ri <base> (mylogo.uz/lingouz/, admin, ildiz)', () => {
  assert.match(runBase('/lingouz/').html, /href="\/lingouz\/"/);
  assert.match(runBase('/lingouz').html, /href="\/lingouz\/"/);
  assert.match(runBase('/lingouz/admin').html, /href="\/lingouz\/"/);
  assert.match(runBase('/lingouz/index.html').html, /href="\/lingouz\/"/);
  assert.match(runBase('/').html, /href="\/"/);
  assert.equal(runBase('/a"><script>x/').html, '<base href="/ascriptx/">');   // <, >, " olib tashlanadi — teg injeksiyasi mumkin emas
});
test('base.js: native ilovada API serverning to‘liq manzili, veb-da nisbiy', () => {
  assert.equal(runBase('/', true).api, 'https://mylogo.uz/lingouz/'); assert.equal(runBase('/', true).native, true);
  assert.equal(runBase('/lingouz/').api, ''); assert.equal(runBase('/lingouz/').native, false);
});
test('manifest: PNG ikonkalar mavjud, o‘lchamlari to‘g‘ri, maskable bor', () => {
  const m = JSON.parse(read('manifest.webmanifest'));
  assert.equal(m.display, 'standalone'); assert.equal(m.start_url, './'); assert.ok(m.theme_color && m.background_color);
  for (const i of m.icons.filter(x => x.type === 'image/png')) { const [w, h] = pngSize(i.src), [sw, sh] = i.sizes.split('x').map(Number); assert.deepEqual([w, h], [sw, sh], i.src); }
  assert.ok(m.icons.some(i => i.purpose === 'maskable' && i.sizes === '512x512'));
  assert.ok(m.icons.some(i => i.purpose === 'any' && i.sizes === '512x512'));
  assert.deepEqual(pngSize('icons/apple-touch-icon.png'), [180, 180]);
  assert.deepEqual(pngSize('resources/icon-only.png'), [1024, 1024]);
  assert.deepEqual(pngSize('resources/splash.png'), [2732, 2732]);
});
test('HTML: iPhone/Android uchun meta teglar va mobil uslub ulangan', () => {
  for (const f of ['index.html', 'admin.html']) { const h = read(f); assert.match(h, /viewport-fit=cover/, f); assert.match(h, /mobile\.css/, f); assert.match(h, /src="base\.js"/, f); }
  const h = read('index.html');
  for (const k of ['apple-mobile-web-app-capable', 'mobile-web-app-capable', 'apple-touch-icon', 'theme-color', 'rel="manifest"']) assert.ok(h.includes(k), k);
  assert.ok(h.indexOf('base.js') < h.indexOf('ui.css'), 'base.js uslublardan oldin yuklanishi kerak');
});
test('mobile.css: xavfsiz zonalar, 16px kiritish, sensorli boshqaruv', () => {
  const c = read('mobile.css');
  assert.match(c, /safe-area-inset-top/); assert.match(c, /safe-area-inset-bottom/); assert.match(c, /input,select,textarea\{font-size:16px/);
  assert.match(c, /touch-action:manipulation/); assert.match(c, /@media\(hover:none\)/); assert.match(c, /max-width:340px/);
});
test('Capacitor sozlamasi: ilova identifikatori va papkalar', () => {
  const c = JSON.parse(read('capacitor.config.json'));
  assert.match(c.appId, /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/); assert.equal(c.webDir, 'www'); assert.equal(c.server.androidScheme, 'https');
  assert.ok(fs.existsSync(path.join(root, 'android', 'app', 'build.gradle'))); assert.ok(fs.existsSync(path.join(root, 'ios', 'App')));
  assert.match(read('android/app/src/main/AndroidManifest.xml'), /RECORD_AUDIO/);
  const plist = read('ios/App/App/Info.plist'); assert.match(plist, /NSMicrophoneUsageDescription/); assert.match(plist, /NSSpeechRecognitionUsageDescription/);
});
test('www/ yig‘ish: admin, server va baza ilovaga kirmaydi; audio va emoji kiradi', () => {
  cp.execFileSync(process.execPath, [path.join(root, 'tools', 'build-www.js')]);
  const w = f => fs.existsSync(path.join(root, 'www', f));
  assert.ok(w('index.html') && w('base.js') && w('audio/apple.mp3') && w('emoji/1f431.svg') && w('icons/icon-512.png'));
  for (const bad of ['admin.html', 'admin.js', 'server.js', 'server', 'package.json', 'tests', 'docs', 'audio/samples', 'sw.js']) assert.ok(!w(bad), bad + ' www ichida bo‘lmasligi kerak');
});
