/* global APP:true */

/**
 * main.js — landing page.
 * Fetches site config + songs, renders hero, featured, categories, recently
 * added, and the footer.
 */
(function (global) {
  'use strict';

  function renderFeatured(songs, featuredIds) {
    var container = document.getElementById('featured-grid');
    if (!container) return;
    // show featured first, then the rest
    var featured = (songs || []).filter(function (s) { return featuredIds.indexOf(s.id) !== -1; });
    var rest = (songs || []).filter(function (s) { return featuredIds.indexOf(s.id) === -1; });
    var list = featured.concat(rest).slice(0, 4);
    APP.renderSongGrid(list, container);
    APP.setupReveal('.song-card');
  }

  function renderRecent(songs) {
    var container = document.getElementById('recent-grid');
    if (!container) return;
    var list = (songs || []).slice(0, 6);
    APP.renderSongGrid(list, container);
    APP.setupReveal('.song-card');
  }

  function renderCategories() {
    var praise = document.getElementById('praise-cat');
    var worship = document.getElementById('worship-cat');
    if (praise) APP.renderCategoryCard('Praise', praise);
    if (worship) APP.renderCategoryCard('Worship', worship);
  }

  function renderFooter(cfg) {
    var site = cfg && cfg.site ? cfg.site : {};
    var c = site.contact || {};
    var contact = document.getElementById('contact-links');
    if (contact) {
      var html = '';
      if (c.phone) html += '<li><a href="tel:' + APP.escapeHtml(c.phone) + '"><span class="icon">📞</span> ' + APP.escapeHtml(c.phone) + '</a></li>';
      if (c.email) html += '<li><a href="mailto:' + APP.escapeHtml(c.email) + '"><span class="icon">✉</span> ' + APP.escapeHtml(c.email) + '</a></li>';
      if (c.address) html += '<li>📍 ' + APP.escapeHtml(c.address) + '</li>';
      if (html) contact.innerHTML = html;
    }
    var titleEl = document.getElementById('footer-title');
    if (titleEl) titleEl.textContent = site.title || '';
    var taglineEl = document.getElementById('footer-tagline');
    if (taglineEl) taglineEl.textContent = site.tagline || '';
    var copyright = document.getElementById('footer-copyright');
    if (copyright) copyright.textContent = new Date().getFullYear() + ' ' + (site.title || 'Christ the Rock Covenant Church Camarin');
    // social links
    var socialEl = document.getElementById('social-links');
    if (socialEl && site.social && site.social.length) {
      socialEl.innerHTML = site.social.map(function (s) {
        return '<li><a href="' + APP.escapeHtml(s.url) + '" target="_blank" rel="noopener"><span class="icon">●</span> ' + APP.escapeHtml(s.label || s.url) + '</a></li>';
      }).join('');
    }
  }

  function init() {
    // config first
    Api.Public.getConfig().then(function (cfg) {
      var site = cfg && cfg.site ? cfg.site : {};
      document.title = site.title || 'Christ the Rock Covenant Church Camarin';

      var badge = document.getElementById('hero-badge');
      if (badge) badge.textContent = site.tagline || '';
      var h1 = document.getElementById('hero-title');
      if (h1) h1.textContent = site.title || '';
      var sub = document.getElementById('hero-sub');
      if (sub) sub.textContent = site.tagline || '';
      var ann = document.getElementById('announcement');
      if (ann) {
        ann.textContent = site.announcement || '';
        if (site.announcement) ann.classList.add('show');
      }
      renderFooter(cfg);

      // featured songs
      var featuredIds = site.featured_ids || [];
      if (featuredIds.length) {
        Api.Public.listSongs(undefined, undefined, undefined, 1, 60).then(function (list) {
          renderFeatured(list.songs || [], featuredIds);
        }).catch(function (e) { APP.showToast(e.message || 'Could not load songs.', 'error'); });
      } else {
        Api.Public.listSongs().then(function (list) { renderFeatured(list.songs || [], []); });
      }

      renderCategories();
      Api.Public.listSongs(undefined, undefined, 'date', 1, 6).then(function (list) { renderRecent(list.songs || []); });

    }).catch(function (e) {
      APP.showToast(e.message || 'Could not load site configuration.', 'error');
    });
  }

  global.Landing = { init: init };
})(window);

document.addEventListener('DOMContentLoaded', function () {
  Landing.init();
});
