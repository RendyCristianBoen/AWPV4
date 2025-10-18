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
      console.log('Session sync - checking localStorage before:', {
        isLoggedIn: ls.getItem('isLoggedIn'),
        userName: ls.getItem('userName')
      });
      
      // Sementara disable session sync untuk testing
      console.log('Session sync - disabled for testing, using localStorage only');
      return;
      
      const response = await fetch('/check-session', {
        method: 'GET',
        credentials: 'include'
      });
      const result = await response.json();
      
      console.log('Session sync - backend response:', result);
      
      if (result.success) {
        if (result.isLoggedIn && result.user) {
          // Update localStorage with backend session data
          ls.setItem('isLoggedIn', 'true');
          ls.setItem('userName', result.user.nama);
          ls.setItem('userRole', result.user.role);
          ls.setItem('userId', result.user.id);
          console.log('Session sync - updated localStorage with backend data');
        } else {
          // Check if we have localStorage data as fallback
          const localIsLoggedIn = ls.getItem('isLoggedIn') === 'true';
          if (localIsLoggedIn) {
            console.log('Session sync - backend session invalid, but localStorage exists - keeping local data');
            // Keep localStorage data as fallback
          } else {
            console.log('Session sync - backend says not logged in, clearing localStorage');
            ls.removeItem('isLoggedIn');
            ls.removeItem('userName');
            ls.removeItem('userRole');
            ls.removeItem('userId');
          }
        }
      } else {
        console.log('Session sync - backend error, keeping localStorage as fallback');
      }
    } catch (error) {
      console.error('Session sync error:', error);
      // Keep localStorage on error as fallback
      console.log('Session sync - network error, keeping localStorage as fallback');
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
    const isLoggedIn = app.isLoggedIn();
    
    console.log('Auth guard - page:', key, 'isLoggedIn:', isLoggedIn);
    
    // Sementara disable auth guard untuk testing
    console.log('Auth guard - disabled for testing');
    return;
    
    // Auth guard completely disabled for testing
  };

  // ---- Navigation updater ----
  app.updateNav = function(){
    const isLogged = app.isLoggedIn();
    const user = app.getUser();
    const key = getPageKey();
    
    console.log('=== NAVIGATION UPDATE ===');
    console.log('updateNav - isLogged:', isLogged, 'user:', user, 'page:', key);
    console.log('updateNav - localStorage:', {
      isLoggedIn: ls.getItem('isLoggedIn'),
      userName: ls.getItem('userName'),
      userRole: ls.getItem('userRole'),
      userId: ls.getItem('userId')
    });
    
    // Set body auth class for CSS-based fallbacks
    try {
      document.body.classList.toggle('auth-yes', !!isLogged);
      document.body.classList.toggle('auth-no', !isLogged);
    } catch(_) {}

    const nav = document.querySelector('nav');
    if (!nav) {
      console.log('updateNav - nav element not found');
      return;
    }
    
    const hideSelector = 'nav [data-page="home"], nav [data-page="dashboard"], nav [data-page="catalog"], nav [data-page="loan-history"]';
    const loginEl = document.getElementById('nav-login');
    const registerEl = document.getElementById('nav-register');
    const userEl = document.getElementById('nav-username');
    const logoutEl = document.getElementById('nav-logout');

    console.log('updateNav - nav elements found:', {
      loginEl: !!loginEl,
      registerEl: !!registerEl,
      userEl: !!userEl,
      logoutEl: !!logoutEl
    });

    // Reset tampil default
    nav.querySelectorAll('ul li').forEach(li=>{
      li.style.display = 'flex';
      li.style.visibility = 'visible';
      li.style.opacity = '1';
    });

    if (isLogged) {
      console.log('updateNav - user is logged in, showing logged-in navigation');
      // User sudah login: tampilkan menu yang sesuai
      if (loginEl) loginEl.style.display = 'none';
      if (registerEl) registerEl.style.display = 'none';
      if (userEl) {
        userEl.style.display = 'flex';
        userEl.textContent = user.name ? `👋 Halo, ${user.name} (${user.role})` : '';
      }
      if (logoutEl) logoutEl.style.display = 'flex';
      
      // Tampilkan menu yang bisa diakses user yang sudah login
      nav.querySelectorAll(hideSelector).forEach(el => el.style.display = 'flex');
    } else {
      console.log('updateNav - user is not logged in, showing guest navigation');
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
    
    console.log('=== NAVIGATION UPDATE COMPLETE ===');
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
      // Redirect disabled for testing
      console.log('Logout successful, localStorage cleared');
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
    console.log('=== AUTO INIT START ===');
    console.log('Auto init - localStorage status:', {
      isLoggedIn: ls.getItem('isLoggedIn'),
      userName: ls.getItem('userName'),
      userRole: ls.getItem('userRole'),
      userId: ls.getItem('userId')
    });
    
    // Set flag untuk mencegah redirect loop
    if (!sessionStorage.getItem('initComplete')) {
      sessionStorage.setItem('initComplete', 'true');
      console.log('Auto init - first time init, setting flag');
    } else {
      console.log('Auto init - already initialized, skipping');
    }
    
    // Sementara disable session sync dan auth guard untuk testing
    console.log('Auto init - session sync and auth guard disabled for testing');
    
    app.enablePerformanceMode();
    app.updateNav();
    app.attachModeToggle();
    app.bindLogout();
    
    console.log('=== AUTO INIT COMPLETE ===');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
})();
