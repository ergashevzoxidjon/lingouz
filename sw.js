/* sw.js — oflayn ishlash (PWA). Versiyani o'zgartirsangiz, kesh yangilanadi. */
const VER = 'lingouz-v3-3';
const CORE = ['./', 'index.html', 'ui.css', 'data.js', 'data2.js', 'data3.js', 'logic.js', 'core.js', 'auth.js', 'pages.js', 'games.js', 'coach.js', 'progress.js', 'app.js', 'manifest.webmanifest', 'icons/icon.svg', 'audio/manifest.json'];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VER);
    await Promise.all(CORE.map(u => c.add(u).catch(() => {})));
    try { const list = await (await fetch('emoji/index.json')).json(); await Promise.all(list.map(f => c.add('emoji/' + f).catch(() => {}))); } catch (x) { /* emoji keyin ham keshlanadi */ }
    try { const au = await (await fetch('audio/manifest.json')).json(); for (let i = 0; i < au.length; i += 40) await Promise.all(au.slice(i, i + 40).map(s => c.add('audio/' + s + '.mp3').catch(() => {}))); } catch (x) { /* audio keyin ham keshlanadi */ }
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== VER) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url); if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/') || u.pathname.startsWith('/admin')) return;   // API va admin keshlanmaydi
  const heavy = /\/(emoji|icons|audio)\/[^?]*\.(svg|mp3)$/.test(u.pathname);   // manifest.json bu yerga kirmaydi — doim yangi olinadi   // rasm/audio: avval keshdan; kod: avval tarmoqdan (yangilanish ko'rinsin), oflaynda keshdan
  e.respondWith((async () => {
    if (heavy) { const hit = await caches.match(r); if (hit) return hit; }
    try { const res = await fetch(r); if (res.ok) (await caches.open(VER)).put(r, res.clone()); return res; }
    catch (err) { return (await caches.match(r, { ignoreSearch: true })) || (await caches.match('index.html')) || Response.error(); }
  })());
});
