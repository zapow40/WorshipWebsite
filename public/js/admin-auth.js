/* global APP:true, Api:true */

/**
 * admin-auth.js — secure administrator login.
 * Password is hashed server-side (SHA-256 + salt). Tokens live in memory
 * only. No public registration endpoint exists.
 */
(function (global) {
  'use strict';

  var els = {
    form: document.getElementById('login-form'),
    email: document.getElementById('login-email'),
    password: document.getElementById('login-password'),
    error: document.getElementById('login-error'),
    submitting: document.getElementById('submitting')
  };

  function setError(msg) {
    if (els.error) els.error.textContent = msg || '';
  }

  function hideError() { setError(''); }

  function onSubmit(e) {
    e.preventDefault();
    hideError();
    if (els.submitting) els.submitting.classList.remove('hidden');
    var email = els.email.value.trim().toLowerCase();
    var password = els.password.value;
    if (!email || !password) {
      setError('Email and password are required.');
      els.submitting && els.submitting.classList.add('hidden');
      return;
    }
    Api.Admin.login(email, password).then(function (data) {
      Api.session.setToken(data.token);
      APP.showToast('Welcome back, ' + (data.user.display_name || email) + '.', 'success');
      window.location.href = 'admin.html';
    }).catch(function (err) {
      els.submitting && els.submitting.classList.add('hidden');
      var msg = err.message || 'Invalid email or password.';
      setError(msg);
    });
  }

  function init() {
    if (els.form) els.form.addEventListener('submit', onSubmit);
    if (els.error) els.error.classList.add('hidden');
    // expose a plain login() helper used by the shell when re-auth is needed
    global.login = function (email, password) { return Api.Admin.login(email, password); };
  }

  global.AdminAuth = { init: init };
})(window);

document.addEventListener('DOMContentLoaded', function () {
  AdminAuth.init();
});
