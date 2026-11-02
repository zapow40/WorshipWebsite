/* global APP:true, Api:true, AdminAuth:true, login:true */

/**
 * admin.js — admin dashboard shell.
 * - Enforces authentication (redirects to /admin/login if missing).
 * - Routes navigation between admin views.
 * - Handles logout.
 */
(function (global) {
  'use strict';

  var viewCache = {};

  function requireAuth() {
    if (!Api.session.getToken()) {
      APP.showToast('Administrator login required.', 'error');
      window.location.href = 'admin-login.html';
      return false;
    }
    return true;
  }

  function showView(name) {
    if (!requireAuth()) return;
    var title = {
      dashboard: 'Dashboard',
      songs: 'Songs',
      website: 'Website',
      users: 'Users',
      logs: 'Activity logs'
    }[name] || 'Dashboard';
    document.title = title + ' — Christ the Rock Covenant Church Camarin';
    document.getElementById('admin-title').textContent = title;
    document.querySelectorAll('[data-admin-view]').forEach(function (a) {
      a.classList.toggle('active', a.dataset.adminView === name);
    });

    // render (cached)
    if (!viewCache[name]) {
      viewCache[name] = renderView(name);
    }
    var app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(viewCache[name]);
  }

  function renderView(name) {
    var container = APP.createEl('div');
    if (name === 'dashboard') return AdminDashboard.render(container);
    if (name === 'songs') return AdminSongs.render(container);
    if (name === 'website') return AdminSettings.render(container);
    if (name === 'users') return AdminUsers.render(container);
    if (name === 'logs') return AdminLogs.render(container);
    return container;
  }

  function logout() {
    Api.Admin.logout().then(function () {
      Api.session.clearToken();
      Api.session.clearUser();
      APP.showToast('You have been logged out.', 'info');
      window.location.href = 'admin-login.html';
    }).catch(function () {
      Api.session.clearToken();
      Api.session.clearUser();
      window.location.href = 'admin-login.html';
    });
  }

  function init() {
    requireAuth();
    var user = Api.session.getUser();
    var nameEl = document.getElementById('admin-user-name');
    var roleEl = document.getElementById('admin-user-role');
    if (nameEl) nameEl.textContent = user && user.display_name ? user.display_name : 'Admin';
    if (roleEl) roleEl.textContent = user && user.role ? user.role : 'admin';

    document.querySelectorAll('[data-admin-view]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        showView(a.dataset.adminView);
      });
    });

    var logoutLink = document.getElementById('logout-link');
    if (logoutLink) logoutLink.addEventListener('click', function (e) { e.preventDefault(); logout(); });
    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
  }

  global.AdminNav = { init: init, showView: showView, logout: logout, requireAuth: requireAuth };
})(window);

document.addEventListener('DOMContentLoaded', function () {
  AdminNav.init();
});
