/* global APP:true, Api:true */

/** admin-auth.js — secure administrator login. */
(function (global) {
  'use strict';

  var els = {
    form: document.getElementById('login-form'),
    email: document.getElementById('login-email'),
    password: document.getElementById('login-password'),
    error: document.getElementById('login-error'),
    submitting: document.getElementById('submitting'),
    showRegister: document.getElementById('show-register'),
    registerForm: document.getElementById('register-form'),
    registerError: document.getElementById('register-error'),
    regName: document.getElementById('reg-name'),
    regEmail: document.getElementById('reg-email'),
    regPassword: document.getElementById('reg-password'),
    regRole: document.getElementById('reg-role'),
    registerSubmitting: document.getElementById('register-submitting'),
    registerBtn: document.getElementById('register-btn')
  };

  function setError(el, msg) { if (el) el.textContent = msg || ''; }
  function hideError(el) { setError(el, ''); }

  function onLoginSubmit(e) {
    e.preventDefault();
    hideError(els.error);
    if (els.submitting) els.submitting.classList.remove('hidden');
    var email = els.email.value.trim().toLowerCase();
    var password = els.password.value;
    if (!email || !password) {
      setError(els.error, 'Email and password are required.');
      els.submitting && els.submitting.classList.add('hidden');
      return;
    }
    Api.Admin.login(email, password).then(function (data) {
      Api.session.setToken(data.token);
      APP.showToast('Welcome back, ' + (data.user.display_name || email) + '.', 'success');
      window.location.href = 'admin.html';
    }).catch(function (err) {
      els.submitting && els.submitting.classList.add('hidden');
      setError(els.error, err.message || 'Invalid email or password.');
    });
  }

  /* ---------- registration ---------- */

  function onRegisterSubmit(e) {
    e.preventDefault();
    hideError(els.registerError);
    if (els.registerSubmitting) els.registerSubmitting.classList.remove('hidden');
    var name = els.regName.value.trim();
    var email = els.regEmail.value.trim().toLowerCase();
    var password = els.regPassword.value;
    var role = els.regRole.value;
    if (!name || !email || !password) {
      setError(els.registerError, 'Full name, email and password are required.');
      els.registerSubmitting && els.registerSubmitting.classList.add('hidden');
      return;
    }
    if (password.length < 8) {
      setError(els.registerError, 'Password must be at least 8 characters.');
      els.registerSubmitting && els.registerSubmitting.classList.add('hidden');
      return;
    }
    Api.Admin.register({ display_name: name, email: email, password: password, role: role }).then(function (data) {
      els.registerSubmitting && els.registerSubmitting.classList.add('hidden');
      if (data.isFirst) {
        APP.showToast('Welcome, Super Admin! Your account is active.', 'success');
        window.location.href = 'admin.html';
      } else {
        APP.showToast('Registration submitted. An admin will approve your account shortly.', 'success');
        els.registerForm.classList.add('hidden');
        if (els.showRegister) els.showRegister.style.display = 'inline';
        hideError(els.error);
        els.email.value = email;
        els.password.value = '';
      }
    }).catch(function (err) {
      els.registerSubmitting && els.registerSubmitting.classList.add('hidden');
      setError(els.registerError, err.message || 'Registration failed.');
    });
  }

  function toggleRegister(show) {
    if (els.registerForm) els.registerForm.classList.toggle('hidden', !show);
    if (els.showRegister) els.showRegister.style.display = show ? 'none' : 'inline';
    if (show) {
      hideError(els.error);
      hideError(els.registerError);
      els.email.value = '';
      els.password.value = '';
      if (els.regName) els.regName.value = '';
      if (els.regEmail) els.regEmail.value = '';
      if (els.regPassword) els.regPassword.value = '';
      if (els.regRole) els.regRole.value = 'super_admin';
      if (els.registerBtn) els.registerBtn.focus();
    }
  }

  function init() {
    if (els.form) els.form.addEventListener('submit', onLoginSubmit);
    if (els.showRegister) els.showRegister.addEventListener('click', function (e) {
      e.preventDefault();
      toggleRegister(true);
    });
    if (els.registerForm) els.registerForm.addEventListener('submit', onRegisterSubmit);
    if (els.error) els.error.classList.add('hidden');
    global.login = function (email, password) { return Api.Admin.login(email, password); };
  }

  global.AdminAuth = { init: init };
})(window);

document.addEventListener('DOMContentLoaded', function () {
  AdminAuth.init();
});
