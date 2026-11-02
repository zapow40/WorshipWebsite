/* global APP:true, Api:true */

/**
 * admin-dashboard.js — overview cards + recently added songs.
 */
(function (global) {
  'use strict';

  function renderOverview(container, data) {
    var bands = [
      { label: 'Total songs', key: 'total', className: 'band-total' },
      { label: 'Praise', key: 'praise', className: 'band-praise' },
      { label: 'Worship', key: 'worship', className: 'band-worship' },
      { label: 'Registered accounts', key: 'accounts', className: 'band-accounts' }
    ];
    var grid = APP.createEl('div', { class: 'overview-grid' });
    bands.forEach(function (b) {
      var card = APP.createEl('div', { class: 'stat-card ' + b.className });
      card.innerHTML =
        '<div class="stat-value">—</div>' +
        '<div class="stat-label">' + b.label + '</div>';
      grid.appendChild(card);
    });
    container.appendChild(grid);

    Promise.all([Api.Admin.listSongs(), Api.Admin.listUsers()]).then(function (results) {
      var songs = results[0] && results[0].songs || [];
      var users = results[1] && results[1].users || [];
      var stats = {
        total: songs.length,
        praise: songs.filter(function (s) { return s.category === 'Praise'; }).length,
        worship: songs.filter(function (s) { return s.category === 'Worship'; }).length,
        accounts: users.length
      };
      var items = grid.querySelectorAll('.stat-value');
      items.forEach(function (el, i) { el.textContent = stats[bands[i].key] || '—'; });
      return results;
    }).then(function (results) {
      // recently added
      var songs = results[0] && results[0].songs || [];
      songs.sort(function (a, b) { return String(b.created_at || '').localeCompare(String(a.created_at || '')); });
      var recent = songs.slice(0, 5);
      var rc = APP.createEl('div', { class: 'recent-grid' });
      if (!recent.length) {
        rc.appendChild(APP.createEl('div', { class: 'section-sub' }, ['No songs yet.']));
      } else {
        recent.forEach(function (s) {
          var card = APP.createEl('div', { class: 'song-card' });
          card.innerHTML =
            '<div class="art"><img src="' + APP.escapeHtml(s.artwork_file_id || '/placeholder-art.png') + '" alt=""></div>' +
            '<div class="body">' +
              '<span class="tag ' + APP.escapeHtml(s.category).toLowerCase() + '">' + APP.escapeHtml(s.category) + '</span>' +
              '<h4>' + APP.escapeHtml(s.title) + '</h4>' +
              '<div class="artist">' + APP.escapeHtml(s.artist) + '</div>' +
              '<div class="meta"><span><b>' + (s.bpm || '—') + '</b> BPM</span><span>' + (s.duration || '—') + '</span></div>' +
            '</div>';
          rc.appendChild(card);
        });
      }
      var top = APP.createEl('div', { class: 'admin-section' });
      var h = APP.createEl('h3', { class: 'admin-section-title' }, ['Recently added']);
      top.appendChild(h);
      top.appendChild(rc);
      var app = document.getElementById('app');
      if (app) app.appendChild(top);
    }).catch(function (e) {
      APP.showToast(e.message || 'Could not load dashboard.', 'error');
    });
  }

  function render(container) {
    renderOverview(container, null);
    return container;
  }

  global.AdminDashboard = { render: render };
})(window);
