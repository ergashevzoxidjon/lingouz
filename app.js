/* app.js — ishga tushirish (boot): menyu, kirish, holatni yuklash */
const NAV = [['home', 'Bosh sahifa', '🏠'], ['grades', 'Mening yo‘lim', '🗺️'], ['lessons', 'Darslar', '📘'], ['stories', 'Ertaklar', '🧚'], ['sing', 'Qo‘shiqlar', '🎵'], ['riddles', 'Topishmoq', '🧩'], ['coach', 'AI Coach', '🎤'], ['games', 'O‘yinlar', '🎮'], ['progress', 'Natijam', '🏆'], ['about', 'Haqida', 'ℹ️']];
const TABS = ['home', 'lessons', 'games', 'coach', 'progress'];
$('#nav').innerHTML = NAV.map(n => `<a href="#/${n[0]}" data-p="${n[0]}"><span class="ni">${n[2]}</span><span>${n[1]}</span></a>`).join('');
$('#tabbar').innerHTML = NAV.filter(n => TABS.includes(n[0])).map(n => `<a href="#/${n[0]}" data-p="${n[0]}"><span class="ni">${n[2]}</span><small>${n[1].split(' ')[0]}</small></a>`).join('') + `<button id="moreBtn" aria-label="Boshqa bo‘limlar"><span class="ni">☰</span><small>Yana</small></button>`;
$('#sheetNav').innerHTML = NAV.map(n => `<a href="#/${n[0]}" data-p="${n[0]}"><span class="ni">${n[2]}</span><span>${n[1]}</span></a>`).join('');
$('#moreBtn').onclick = () => { $('#sheet').classList.add('open'); };
$('#sheetClose').onclick = () => $('#sheet').classList.remove('open');
$('#sheet').onclick = e => { if (e.target.id === 'sheet' || e.target.closest('a')) $('#sheet').classList.remove('open'); };

if (ST.settings.motionSet === undefined) { ST.settings.motionSet = true; if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) ST.settings.motion = false; applySettings(); }

async function startApp() {
  try { const u = await Net.loadState(); Net.rememberUser(u); }
  catch (e) {
    if (e.status === 401 || e.status === 403) { try { localStorage.removeItem(TOKEN_KEY); } catch (x) { /* ... */ } Net.token = ''; return showLogin(e.status === 403 ? e.message : 'Qayta kiring.'); }
    return showLogin('Server bilan aloqa yo‘q. Internetni tekshiring.');
  }
  document.body.classList.remove('logged-out'); $('#login').innerHTML = '';
  $('#logo-m').innerHTML = mascot('happy'); $('#logo-m2').innerHTML = mascot('happy');
  applyGrade(); initDay(); route();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { /* oflayn rejim ixtiyoriy */ });
}
if (Net.token) startApp(); else showLogin();
