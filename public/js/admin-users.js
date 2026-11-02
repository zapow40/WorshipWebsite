/* global APP:true, Api:true */

/**
 * admin-users.js — user account management with role-based access.
 * *Only* Super Admins may create, edit, or reassign roles. Plain admins may
 * view accounts but the management controls are hidden/disabled.
 * Password reset sets a new password for a selected account (admin action,
 * server-side hashed + logged).
 */
(function (global) {
  'use strict';

  var state = { users: [], search: '', roleFilter: 'all', statusFilter: 'all' };
  var els = {};
  function $(id) { return document.getElementById(id); }

  function boot() {
    els.search = $('user-search');
    els.role = $('user-role-filter');
    els.status = $('user-status-filter');
    els.list = $('user-list');
    els.loading = $('users-loading');
    els.empty = $('users-empty');
    els.createBtn = $('create-user-btn');
    els.closeCreate = $('close-create-user');
    els.createForm = $('create-user-form');
    els.createTitle = $('create-user-title');
    els.createCancel = $('create-user-cancel');
    els.createSubmit = $('create-user-submit');
    els.editingId = $('editing-user-id');
    els.editingForm = $('editing-user-form');
    els.editingTitle = $('editing-user-title');
    els.editingName = $('editing-user-name');
    els.editingRole = $('editing-user-role');
    els.editingStatus = $('editing-user-status-select');
    els.editingPassword = $('editing-user-password');
    els.editingPasswordConfirm = $('editing-user-password-confirm');
    els.editingCancel = $('editing-cancel');
    els.editingSubmit = $('editing-submit');
    els.toast = $('users-toast');
    if (els.createBtn) els.createBtn.addEventListener('click', openCreate);
    if (els.closeCreate) els.closeCreate.addEventListener('click', closeCreate);
    if (els.createCancel) els.createCancel.addEventListener('click', closeCreate);
    if (els.createSubmit) els.createSubmit.addEventListener('click', createUser);
    if (els.editingCancel) els.editingCancel.addEventListener('click', closeEdit);
    if (els.editingSubmit) els.editingSubmit.addEventListener('click', saveEdit);
  }

  function isSuperAdmin() { return Api.session.getUser() && Api.session.getUser().role === 'super_admin'; }

  function applyPermissionState() {
    var allowed = isSuperAdmin();
    var show = els.createBtn;
    if (show) show.style.display = allowed ? 'inline-block' : 'none';
    if (els.createForm) els.createForm.style.display = allowed ? 'block' : 'none';
    if (els.editingForm) els.editingForm.style.display = allowed ? 'block' : 'none';
    if (els.toast) els.toast.style.display = allowed ? 'none' : 'block';
  }

  function loadUsers() {
    els.loading && els.loading.classList.remove('hidden');
    Api.Admin.listUsers().then(function (data) {
      els.loading && els.loading.classList.add('hidden');
      state.users = (data && data.users) || [];
      filterUsers();
      if (state.users.length === 0) { els.empty && els.empty.classList.remove('hidden'); }
    }).catch(function (e) {
      els.loading && els.loading.classList.add('hidden');
      APP.showToast(e.message || 'Could not load users.', 'error');
    });
  }

  function filterUsers() {
    var list = state.users;
    if (state.search) list = list.filter(function (u) {
      var q = state.search.toLowerCase();
      return (u.email || '').toLowerCase().indexOf(q) !== -1 ||
        (u.display_name || '').toLowerCase().indexOf(q) !== -1;
    });
    if (state.roleFilter !== 'all') list = list.filter(function (u) { return u.role === state.roleFilter; });
    if (state.statusFilter !== 'all') list = list.filter(function (u) { return u.status === state.statusFilter; });
    var html = list.map(function (u) {
      return '<tr>' +
        '<td class="mono">' + APP.escapeHtml(u.user_id || '') + '</td>' +
        '<td><b>' + APP.escapeHtml(u.display_name || '') + '</b><br><span class="soft">' + APP.escapeHtml(u.email) + '</span></td>' +
        '<td><span class="tag ' + APP.escapeHtml(u.role).toLowerCase() + '">' + APP.escapeHtml(u.role) + '</span></td>' +
        '<td><span class="status-' + (u.status === 'active' ? 'published' : 'draft') + '">' + APP.escapeHtml(u.status) + '</span></td>' +
        '<td class="row-actions">' +
          '<button class="btn btn-sm btn-ghost" onclick="window.AdminUsers.editUser(\'' + APP.escapeHtml(u.user_id) + '\')">Edit</button>' +
          '<button class="btn btn-sm btn-ghost" style="color:var(--danger);" onclick="window.AdminUsers.deleteUser(\'' + APP.escapeHtml(u.user_id) + '\')">Delete</button>' +
        '</td>' +
      '</tr>';
    }).join('');
    els.list.innerHTML = html || '<tr><td colspan="5" class="soft text-center">No accounts found.</td></tr>';
  }

  /* ---------- create ---------- */
  function openCreate() {
    if (!isSuperAdmin()) { APP.showToast('Insufficient permissions.', 'error'); return; }
    els.createForm.reset();
    els.editingId.value = '';
    els.createForm.style.display = 'block';
    els.createTitle.textContent = 'Create account';
    els.toast.style.display = 'none';
  }

  function closeCreate() {
    els.createForm.style.display = 'none';
    els.createForm.reset();
  }

  function createUser() {
    var data = {
      display_name: els.createForm.display_name.value.trim(),
      email: els.createForm.email.value.trim().toLowerCase(),
      password: els.createForm.password.value,
      role: els.createForm.role.value,
      status: els.createForm.status.value
    };
    if (!data.display_name || !data.email || !data.password) { APP.showToast('Display name, email and password are required.', 'error'); return; }
    if (data.password.length < 8) { APP.showToast('Password must be at least 8 characters.', 'error'); return; }
    if (data.role === 'super_admin') { APP.showToast('Only a Super Admin can grant the Super Admin role.', 'error'); return; }
    Api.Admin.createUser(data).then(function () {
      APP.showToast('Account created.', 'success');
      closeCreate();
      loadUsers();
    }).catch(function (e) { APP.showToast(e.message || 'Create failed.', 'error'); });
  }

  /* ---------- edit ---------- */
  function editUser(id) {
    if (!isSuperAdmin()) { APP.showToast('Insufficient permissions.', 'error'); return; }
    var u = state.users.find(function (x) { return x.user_id === id; });
    if (!u) { APP.showToast('User not found.', 'error'); return; }
    state.editingId = id;
    els.editingName.value = u.display_name;
    els.editingRole.value = u.role;
    els.editingStatus.value = u.status;
    els.editingPassword.value = '';
    els.editingPasswordConfirm.value = '';
    els.editingForm.style.display = 'block';
    els.editingTitle.textContent = 'Edit account · ' + u.email;
  }

  function closeEdit() {
    els.editingId.value = '';
    els.editingForm.style.display = 'none';
    els.editingPassword.value = '';
    els.editingPasswordConfirm.value = '';
  }

  function saveEdit() {
    var id = els.editingId.value;
    if (!id) { APP.showToast('Nothing to save.', 'error'); return; }
    var data = {
      display_name: els.editingName.value.trim(),
      role: els.editingRole.value,
      status: els.editingStatus.value,
      password: els.editingPassword.value
    };
    if (data.password) {
      if (data.password.length < 8) { APP.showToast('New password must be at least 8 characters.', 'error'); return; }
      if (data.password !== els.editingPasswordConfirm.value) { APP.showToast('Passwords do not match.', 'error'); return; }
    }
    Api.Admin.updateUser(id, data).then(function () {
      APP.showToast('Account updated.', 'success');
      closeEdit();
      loadUsers();
    }).catch(function (e) { APP.showToast(e.message || 'Update failed.', 'error'); });
  }

  /* ---------- delete / reset ---------- */
  function deleteUser(id) {
    var u = state.users.find(function (x) { return x.user_id === id; });
    if (!u) { APP.showToast('User not found.', 'error'); return; }
    if (!window.confirm('Delete ' + (u.display_name || u.email) + '?')) return;
    Api.Admin.updateUserStatus(id, 'suspended').then(function () {
      APP.showToast('Account suspended.', 'success');
      loadUsers();
    }).catch(function (e) { APP.showToast(e.message || 'Delete failed.', 'error'); });
  }

  /* ---------- misc ---------- */
  function init() {
    boot();
    applyPermissionState();
    loadUsers();
  }

  global.AdminUsers = {
    init: init,
    loadUsers: loadUsers,
    editUser: editUser,
    deleteUser: deleteUser
  };
})(window);

document.addEventListener('DOMContentLoaded', function () {
  AdminUsers.init();
});
