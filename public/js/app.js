/* app.js - Shared front-end utilities (navigation, auth guard, theme, logout, notifications)
   This file auto-runs on every page that includes <script src="/app.js"></script>.
   It is designed to be idempotent and non-intrusive to existing inline scripts.
*/
(function(){
  const app = (window.app = window.app || {});

  // ---- Storage helpers ----
  const ls = window.localStorage;
  app.isLoggedIn = () => ls.getItem('isLoggedIn') === 'true';
  app.getUser = () => ({
    name: ls.getItem('userName') || '',
    role: ls.getItem('userRole') || '',
    id: ls.getItem('userId') || ''
  });

  // ---- Session sync with backend ----
  app.syncSession = async function() {
    try {
      const response = await fetch('/check-session', {
        method: 'GET',
        credentials: 'include'
      });
      const result = await response.json();
      
      if (result.success) {
        if (result.isLoggedIn && result.user) {
          // Update localStorage with backend session data
          ls.setItem('isLoggedIn', 'true');
          ls.setItem('userName', result.user.nama);
          ls.setItem('userRole', result.user.role);
          ls.setItem('userId', result.user.id);
        } else {
          // Clear localStorage if not logged in
          ls.removeItem('isLoggedIn');
          ls.removeItem('userName');
          ls.removeItem('userRole');
          ls.removeItem('userId');
        }
      }
    } catch (error) {
      console.error('Session sync error:', error);
    }
  };

  // ---- Page helpers ----
  function getPageKey(){
    const p = location.pathname.toLowerCase();
    if (p === '/' || p.endsWith('/index.html')) return 'home';
    if (p.endsWith('/dashboard.html')) return 'dashboard';
    if (p.endsWith('/catalog.html')) return 'catalog';
    if (p.endsWith('/loanhistory.html')) return 'loan-history';
    if (p === '/about') return 'about';
    if (p === '/login') return 'login';
    if (p === '/register') return 'register';
    return '';
  }

  // ---- Auth guard ----
  app.ensureAuth = function(){
    const key = getPageKey();
    const publicPages = ['about','login','register'];
    
    // Temporarily disable auth guard for testing
    console.log('Auth guard - page:', key, 'isLoggedIn:', app.isLoggedIn());
    
    // if (!app.isLoggedIn() && !publicPages.includes(key)) {
    //   // Halaman dilindungi, redirect ke login
    //   try { location.replace('/login'); } catch(_) { location.href = '/login'; }
    // }
  };

  // ---- Navigation updater ----
  app.updateNav = function(){
    const isLogged = app.isLoggedIn();
    const user = app.getUser();
    const key = getPageKey();
    // Set body auth class for CSS-based fallbacks
    try {
      document.body.classList.toggle('auth-yes', !!isLogged);
      document.body.classList.toggle('auth-no', !isLogged);
    } catch(_) {}

    const nav = document.querySelector('nav');
    if (!nav) return;
    const hideSelector = 'nav [data-page="home"], nav [data-page="dashboard"], nav [data-page="catalog"], nav [data-page="loan-history"]';
    const loginEl = document.getElementById('nav-login');
    const registerEl = document.getElementById('nav-register');
    const userEl = document.getElementById('nav-username');
    const logoutEl = document.getElementById('nav-logout');

    // Reset tampil default
    nav.querySelectorAll('ul li').forEach(li=>{
      li.style.display = 'flex';
      li.style.visibility = 'visible';
      li.style.opacity = '1';
    });

    if (isLogged) {
      if (loginEl) loginEl.style.display = 'none';
      if (registerEl) registerEl.style.display = 'none';
      if (userEl) {
        userEl.style.display = 'flex';
        userEl.textContent = user.name ? `👋 Halo, ${user.name} (${user.role})` : '';
      }
      if (logoutEl) logoutEl.style.display = 'flex';
    } else {
      // Belum login: sembunyikan menu yang butuh auth
      nav.querySelectorAll(hideSelector).forEach(el => el.style.display = 'none');
      if (userEl) userEl.style.display = 'none';
      if (logoutEl) logoutEl.style.display = 'none';
      if (loginEl) loginEl.style.display = 'flex';
      if (registerEl) registerEl.style.display = 'flex';
    }

    // Sembunyikan link halaman saat ini bila ada atribut data-page yang cocok
    if (key) {
      const current = nav.querySelector(`*[data-page="${key}"]`);
      if (current) current.style.display = 'none';
    }
  };

  // ---- Theme (dark mode) ----
  app.attachModeToggle = function(){
    const btn = document.getElementById('mode-toggle');
    if (!btn) return;
    const body = document.body;
    const root = document.documentElement; // <html>
    if (ls.getItem('mode') === 'dark') {
      body.classList.add('dark-mode');
      root.classList.add('dark-mode');
      btn.textContent = '☀️ Mode Terang';
    }
    btn.addEventListener('click', () => {
      const isDark = body.classList.toggle('dark-mode');
      root.classList.toggle('dark-mode', isDark);
      if (isDark) {
        btn.textContent = '☀️ Mode Terang';
        ls.setItem('mode', 'dark');
      } else {
        btn.textContent = '🌓 Mode Gelap';
        ls.setItem('mode', 'light');
      }
    }, { once:false });
  };

  // ---- Logout binding ----
  app.bindLogout = function(){
    const link = document.getElementById('logout-link');
    if (!link) return;
    if (link.dataset.bound === '1') return; // idempotent
    link.dataset.bound = '1';
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await fetch('/logout', { 
          method:'POST', 
          headers:{'Content-Type':'application/json'},
          credentials: 'include'
        });
      } catch(_) {}
      localStorage.clear();
      try { location.replace('/login'); } catch(_) { location.href = '/login'; }
    });
  };

  // ---- Notifications wrapper (Toastify optional) ----
  app.notify = function(msg, type){
    try {
      if (window.Toastify) {
        Toastify({
          text: msg,
          duration: 3000,
          close: true,
          gravity: 'top',
          position: 'right',
          backgroundColor: type === 'error' ? 'linear-gradient(135deg,#dc3545,#e83e8c)' : 'linear-gradient(135deg,#28a745,#20c997)'
        }).showToast();
        return;
      }
    } catch(_) {}
    // Fallback
    console.log(type ? `[${type.toUpperCase()}]` : '', msg);
  };

  // ---- Auto init ----
  // ---- Performance mode (auto) ----
  app.enablePerformanceMode = function(){
    try {
      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const saveData = navigator.connection && navigator.connection.saveData;
      if (prefersReduced || saveData) {
        document.body.classList.add('perf-lite');
      }
    } catch(_) {}
  };

  async function autoInit(){
    await app.syncSession(); // Sync with backend session first
    app.ensureAuth();
    app.enablePerformanceMode();
    app.updateNav();
    app.attachModeToggle();
    app.bindLogout();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
})();
