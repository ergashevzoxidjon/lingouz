/* auth.js — login, serverdan holatni olish/saqlash, javoblar hodisalari (admin kuzatishi uchun) */
const TOKEN_KEY = 'lingouz-token', QUEUE_KEY = 'lingouz-evq';
const Net = {
  token: (() => { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; } })(),
  queue: (() => { try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch (e) { return []; } })(),
  syncTimer: null, dirty: false,

  async api(path, opt = {}) {
    const r = await NETFETCH(path, { method: opt.method || 'GET', headers: { 'Content-Type': 'application/json', ...(this.token ? { Authorization: 'Bearer ' + this.token } : {}) }, body: opt.body ? JSON.stringify(opt.body) : undefined, keepalive: !!opt.keepalive });
    let data = {}; try { data = await r.json(); } catch (e) { /* bo'sh javob */ }
    if (r.status === 404 && !data.error) throw Object.assign(new Error('Server topilmadi. Sahifani «node server.js» orqali oching (http://localhost:5173).'), { status: 0 });
    if (!r.ok) throw Object.assign(new Error(data.error || 'Xato'), { status: r.status });
    return data;
  },
  async login(login, password) {
    const d = await this.api('api/login', { method: 'POST', body: { login, password } });
    if (d.role !== 'user') throw new Error('Bu sahifa o‘quvchilar uchun. Administrator uchun /admin sahifasi.');
    this.token = d.token; try { localStorage.setItem(TOKEN_KEY, d.token); } catch (e) { /* ... */ }
    return d.user;
  },
  logout() {
    this.flush(); this.syncNow();
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* ... */ }
    location.hash = '#/home'; location.reload();
  },
  /* Holatni serverdan olish; server yetib bo'lmasa — keshdan (oflayn) */
  async loadState() {
    try {
      const d = await this.api('api/state');
      const cached = (() => { try { return JSON.parse(localStorage.getItem('lingouz-cache-' + d.user.id) || 'null'); } catch (e) { return null; } })();
      // qurilmadagi kesh yangiroq bo'lsa (oflayn o'ynalgan) — o'shani saqlaymiz
      const useCache = cached && this.dirtyFlag(d.user.id) && (cached.stars || 0) >= (d.state.stars || 0);
      useState(d.user, useCache ? cached : d.state); return d.user;
    } catch (e) {
      if (e.status === 401 || e.status === 403) throw e;
      const uid = this.cachedUserId(); const raw = uid && localStorage.getItem('lingouz-cache-' + uid);
      if (!raw) throw e;
      const u = JSON.parse(localStorage.getItem('lingouz-user') || 'null'); if (!u) throw e;
      useState(u, JSON.parse(raw)); return u;
    }
  },
  dirtyFlag(uid) { try { return localStorage.getItem('lingouz-dirty') === uid; } catch (e) { return false; } },
  cachedUserId() { try { return (JSON.parse(localStorage.getItem('lingouz-user') || 'null') || {}).id; } catch (e) { return ''; } },
  rememberUser(u) { try { localStorage.setItem('lingouz-user', JSON.stringify(u)); } catch (e) { /* ... */ } },

  scheduleSync() { this.dirty = true; try { localStorage.setItem('lingouz-dirty', P.id); } catch (e) { /* ... */ } clearTimeout(this.syncTimer); this.syncTimer = setTimeout(() => this.syncNow(), 2500); },
  async syncNow() {
    if (!this.token || !P.id || !this.dirty) return;
    try { await this.api('api/state', { method: 'PUT', body: { state: S }, keepalive: true }); this.dirty = false; try { localStorage.removeItem('lingouz-dirty'); } catch (e) { /* ... */ } }
    catch (e) { if (e.status === 401) this.expired(); }
  },
  expired() { try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* ... */ } toast('Seans tugadi, qayta kiring'); setTimeout(() => location.reload(), 1200); },

  /* Javoblar jurnali: admin har bir savol natijasini ko'radi */
  track(ev) {
    this.queue.push({ t: Date.now(), ...ev }); if (this.queue.length > 1000) this.queue.splice(0, this.queue.length - 1000);
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue)); } catch (e) { /* ... */ }
    clearTimeout(this.flushTimer); this.flushTimer = setTimeout(() => this.flush(), ev.type === 'ans' ? 6000 : 800);
  },
  async flush() {
    if (!this.token || !this.queue.length || this.flushing) return;
    this.flushing = true; const batch = this.queue.slice(0, 150);
    try { await this.api('api/events', { method: 'POST', body: { events: batch }, keepalive: true }); this.queue.splice(0, batch.length); localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue)); if (this.queue.length) setTimeout(() => this.flush(), 300); }
    catch (e) { if (e.status === 401) this.expired(); }
    this.flushing = false;
  }
};
const track = ev => { if (P.id) Net.track(ev); };
window.addEventListener('online', () => { Net.flush(); Net.syncNow(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { Net.flush(); Net.syncNow(); } });
window.addEventListener('pagehide', () => { Net.flush(); Net.syncNow(); });
setInterval(() => { Net.flush(); Net.syncNow(); }, 20000);

/* ---------- Kirish oynasi ---------- */
function showLogin(msg) {
  document.body.classList.add('logged-out');
  $('#login').innerHTML = `<div class="login-card"><div class="login-mascot">${mascot('cheer', [])}</div>
    <h1>Lingo<span>Uz</span> Kids</h1><p class="slogan-uz">O‘yna, o‘rgan, kashf et va ingliz tilida so‘zla!</p>
    <form id="loginForm" autocomplete="on"><label>Login<input id="lgUser" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" required></label>
    <label>Parol<input id="lgPass" type="password" autocomplete="current-password" required></label>
    <p id="lgMsg" class="lgmsg" role="alert">${msg ? esc(msg) : ''}</p>
    <button class="btn" type="submit">🚀 Kirish</button></form>
    <p class="muted small">Login va parolni administrator (o‘qituvchi) beradi.</p><p class="credit small">Malokhatkhon Toshboltayeva — LingoUz loyihasi</p></div>`;
  $('#loginForm').onsubmit = async e => {
    e.preventDefault(); const b = $('#loginForm button'); b.disabled = true; $('#lgMsg').textContent = '';
    try { const u = await Net.login($('#lgUser').value.trim(), $('#lgPass').value); Net.rememberUser(u); await startApp(); }
    catch (err) { $('#lgMsg').textContent = err.message || 'Xato'; b.disabled = false; }
  };
  $('#lgUser').focus();
}

async function NETFETCH(...a) { try { return await fetch(...a); } catch (e) { throw Object.assign(new Error('Server bilan aloqa yo‘q. Serverni ishga tushiring: node server.js, so‘ng http://localhost:5173 manzilini oching.'), { status: 0 }); } }
