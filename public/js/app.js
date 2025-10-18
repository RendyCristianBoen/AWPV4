/* app.js - Shared front-end utilities (navigation, auth guard, theme, logout, notifications)
   Versi perbaikan penuh untuk Vercel.
*/

(function () {
  const app = (window.app = window.app || {});
  const ls = window.localStorage;

  // ==== STORAGE HELPER ====
  app.isLoggedIn = () => ls.getItem("isLoggedIn") === "true";
  app.getUser = () => ({
    name: ls.getItem("userName") || "",
    role: ls.getItem("userRole") || "",
    id: ls.getItem("userId") || "",
  });

  // ==== SYNC SESSION DENGAN BACKEND ====
  app.syncSession = async function () {
    try {
      const response = await fetch("/check-session", {
        method: "GET",
        credentials: "include",
      });
      const result = await response.json();

      console.log("Session sync - backend result:", result);

      if (result.success && result.isLoggedIn && result.user) {
        ls.setItem("isLoggedIn", "true");
        ls.setItem("userName", result.user.nama);
        ls.setItem("userRole", result.user.role);
        ls.setItem("userId", result.user.id);
        console.log("Session sync - updated localStorage with backend data");
      } else {
        console.warn("Session sync - user not logged in, clearing localStorage");
        ls.removeItem("isLoggedIn");
        ls.removeItem("userName");
        ls.removeItem("userRole");
        ls.removeItem("userId");
      }
    } catch (error) {
      console.error("Session sync error:", error);
      console.log("Session sync - keeping localStorage as fallback");
    }
  };

  // ==== DETEKSI HALAMAN ====
  function getPageKey() {
    const p = location.pathname.toLowerCase();
    if (p === "/" || p.endsWith("/index.html")) return "home";
    if (p.endsWith("/dashboard.html")) return "dashboard";
    if (p.endsWith("/catalog.html")) return "catalog";
    if (p.endsWith("/loanhistory.html")) return "loan-history";
    if (p === "/about") return "about";
    if (p === "/login") return "login";
    if (p === "/register") return "register";
    return "";
  }

  // ==== AUTH GUARD ====
  app.ensureAuth = function () {
    const key = getPageKey();
    const publicPages = ["about", "login", "register"];
    const isLoggedIn = app.isLoggedIn();

    console.log("Auth guard - page:", key, "| loggedIn:", isLoggedIn);

    if (!isLoggedIn && !publicPages.includes(key)) {
      console.warn("Auth guard - not logged in, redirecting to /login");
      window.location.href = "/login";
    }

    if (isLoggedIn && ["login", "register"].includes(key)) {
      console.info("Auth guard - already logged in, redirecting to /");
      window.location.href = "/";
    }
  };

  // ==== NAVIGATION HANDLER ====
  app.updateNav = function () {
    const isLogged = app.isLoggedIn();
    const user = app.getUser();
    const key = getPageKey();

    console.log("=== NAVIGATION UPDATE ===", { isLogged, user, key });

    try {
      document.body.classList.toggle("auth-yes", !!isLogged);
      document.body.classList.toggle("auth-no", !isLogged);
    } catch (_) {}

    const nav = document.querySelector("nav");
    if (!nav) return;

    const hideSelector =
      'nav [data-page="home"], nav [data-page="dashboard"], nav [data-page="catalog"], nav [data-page="loan-history"]';
    const loginEl = document.getElementById("nav-login");
    const registerEl = document.getElementById("nav-register");
    const userEl = document.getElementById("nav-username");
    const logoutEl = document.getElementById("nav-logout");

    // Reset tampilan
    nav.querySelectorAll("ul li").forEach((li) => {
      li.style.display = "flex";
      li.style.visibility = "visible";
      li.style.opacity = "1";
    });

    if (isLogged) {
      if (loginEl) loginEl.style.display = "none";
      if (registerEl) loginEl.style.display = "none";
      if (userEl) {
        userEl.style.display = "flex";
        userEl.textContent = `👋 Halo, ${user.name} (${user.role})`;
      }
      if (logoutEl) logoutEl.style.display = "flex";
      nav.querySelectorAll(hideSelector).forEach((el) => (el.style.display = "flex"));
    } else {
      nav.querySelectorAll(hideSelector).forEach((el) => (el.style.display = "none"));
      if (userEl) userEl.style.display = "none";
      if (logoutEl) logoutEl.style.display = "none";
      if (loginEl) loginEl.style.display = "flex";
      if (registerEl) registerEl.style.display = "flex";
    }

    if (key) {
      const current = nav.querySelector(`*[data-page="${key}"]`);
      if (current) current.style.display = "none";
    }
  };

  // ==== DARK MODE ====
  app.attachModeToggle = function () {
    const btn = document.getElementById("mode-toggle");
    if (!btn) return;
    const body = document.body;
    const root = document.documentElement;

    if (ls.getItem("mode") === "dark") {
      body.classList.add("dark-mode");
      root.classList.add("dark-mode");
      btn.textContent = "☀️ Mode Terang";
    }

    btn.addEventListener("click", () => {
      const isDark = body.classList.toggle("dark-mode");
      root.classList.toggle("dark-mode", isDark);
      if (isDark) {
        btn.textContent = "☀️ Mode Terang";
        ls.setItem("mode", "dark");
      } else {
        btn.textContent = "🌓 Mode Gelap";
        ls.setItem("mode", "light");
      }
    });
  };

  // ==== LOGOUT ====
  app.bindLogout = function () {
    const link = document.getElementById("logout-link");
    if (!link) return;
    if (link.dataset.bound === "1") return;
    link.dataset.bound = "1";

    link.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await fetch("/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
      } catch (_) {}
      ls.clear();
      app.notify("👋 Anda telah logout.", "success");
      setTimeout(() => (window.location.href = "/login"), 1000);
    });
  };

  // ==== NOTIFICATION ====
  app.notify = function (msg, type) {
    try {
      if (window.Toastify) {
        Toastify({
          text: msg,
          duration: 3000,
          close: true,
          gravity: "top",
          position: "right",
          backgroundColor:
            type === "error"
              ? "linear-gradient(135deg,#dc3545,#e83e8c)"
              : "linear-gradient(135deg,#28a745,#20c997)",
        }).showToast();
        return;
      }
    } catch (_) {}
    console.log(type ? `[${type.toUpperCase()}]` : "", msg);
  };

  // ==== AUTO INIT ====
  document.addEventListener("DOMContentLoaded", async () => {
    console.log("=== APP INIT START ===");

    await app.syncSession?.();
    app.updateNav?.();
    app.bindLogout?.();
    app.attachModeToggle?.();
    app.ensureAuth?.();

    console.log("=== APP INIT COMPLETE ===");
  });
})();
