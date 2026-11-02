/* global APP:true, Api:true */

/**
 * admin-logs.js — activity log viewer.
 * Super Admins only. Shows song/account/website activity recorded by the
 * server during the session.
 */
(function (global) {
  'use strict';

  var els = {};

  function $(id) { return document.getElementById(id); }

  function boot() {
    els.loading = $('logs-loading');
    els.empty = $('logs-empty');
    els.list = $('logs-list');
    els.more = $('logs-more');
    els.toast = $('logs-toast');
    if (els.more) els.more.addEventListener('click', loadMore);
  }

  function loadLogs(page) {
    page = page || 1;
    els.loading && els.loading.classList.remove('hidden');
    Api.Admin.listActivityLogs().then(function (data) {
      els.loading && els.loading.classList.add('hidden');
      var logs = (data && data.logs) || [];
      var html = logs.map(function (l) {
        var actor = l.actor_user_id || '—';
        var name = '';
        // resolve actor name if possible (simple)
        var cls = 'result-' + (l.result === 'ok' ? 'ok' : 'error');
        return '<div class="log-row ' + cls + '">' +
          '<div class="mono">' + APP.escapeHtml(l.log_id || '') + '</div>' +
          '<div class="mono">' + APP.escapeHtml(actor) + '</div>' +
          '<div class="action">' + APP.escapeHtml(l.action || '') + '</div>' +
          '<div class="target">' + APP.escapeHtml(l.target_type || '') + ' #' + APP.escapeHtml(l.target_id || '') + '</div>' +
          '<div class="result">' + APP.escapeHtml(l.result || '') + '</div>' +
          '<div class="time">' + APP.escapeHtml(l.timestamp || '') + '</div>' +
        '</div>';
      }).join('');
      els.list.innerHTML = html || '<div class="soft text-center">No activity recorded.</div>';
      if (logs.length) {
        els.more.classList.remove('hidden');
      } else {
        els.more.classList.add('hidden');
      }
      els.empty && (logs.length === 0 ? els.empty.classList.remove('hidden') : els.empty.classList.add('hidden'));
      APP.setupReveal && APP.setupReveal && APP.setupReveal('.log-row');
    }).catch(function (e) {
      els.loading && els.loading.classList.add('hidden');
      APP.showToast(e.message || 'Could not load logs.', 'error');
    });
  }

  function loadMore() {
    var page = Number(els.more.dataset.page) || 1;
    loadLogs(page + 1);
  }

  function init() {
    boot();
    loadLogs();
  }

  global.AdminLogs = { init: init };
})(window);

document.addEventListener('DOMContentLoaded', function () {
  AdminLogs.init();
});
