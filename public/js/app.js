/* global CONFIG:true */

/**
 * app.js — shared DOM/toast/modal/song-rendering helpers and application
 * bootstrap. Vanilla, dependency-free. Loaded before page-specific scripts.
 */

(function (global) {
  'use strict';

  /* ---------- tiny DOM helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$ (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function createEl(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (k === 'class') el.className = v;
        else if (k === 'dataset') Object.keys(v).forEach(function (d) { el.dataset[d] = v[d]; });
        else if (k === 'html') { el.innerHTML = v; }
        else if (k === 'on') { Object.keys(v).forEach(function (ev) { el.addEventListener(ev, v[ev]); }); }
        else if (v === true) el.setAttribute(k, '');
        else if (v !== false && v !== null && v !== undefined) el.setAttribute(k, v);
      });
    }
    if (children) {
      [].concat(children).forEach(function (c) {
        el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return el;
  }

  /* ---------- toasts ---------- */
  var toastStack = global.__toastStack || document.createElement('div');
  toastStack.className = 'toast-stack';
  document.body.appendChild(toastStack);

  var TOAST_TYPES = { success: 'success', error: 'error', info: 'info' };

  function showToast(message, type) {
    type = type in TOAST_TYPES ? type : 'info';
    var t = createEl('div', { class: 'toast ' + type + ' hidden' });
    t.innerHTML = '<span class="icon">' + (type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ') + '</span><span>' + escapeHtml(message) + '</span>';
    toastStack.appendChild(t);
    setTimeout(function () { t.classList.remove('hidden'); }, 10);
    var hide = function () {
      t.classList.add('hidden');
      setTimeout(function () { t.parentNode && t.parentNode.removeChild(t); }, 320);
    };
    setTimeout(hide, 4600);
    return t;
  }

  /* ---------- modal ---------- */
  var modalStack = [];

  function openModal(html) {
    var overlay = createEl('div', { class: 'modal-overlay' });
    overlay.innerHTML = '<div class="modal">' + html + '</div>';
    var close = createEl('button', { class: 'modal-close', onclick: function () { closeModal(); } });
    overlay.querySelector('.modal').appendChild(close);
    document.body.appendChild(overlay);
    modalStack.push(overlay);
    return overlay;
  }

  function closeModal() {
    if (modalStack.length) {
      var o = modalStack.pop();
      if (o.parentNode) o.parentNode.removeChild(o);
      if (!modalStack.length) document.body.classList.remove('modal-open');
    }
  }

  /* ---------- skeletons ---------- */
  function renderSkeleton(wrapper, count) {
    count = count || 1;
    var html = '';
    for (var i = 0; i < count; i++) {
      html +=
        '<div class="song-card">' +
          '<div class="sk sk-art"></div>' +
          '<div class="body">' +
            '<div class="sk-title"></div><div class="sk-sub"></div>' +
            '<div class="meta"><span class="sk" style="width:50%;"></span></div>' +
          '</div>' +
          '<div class="actions"><div class="btn btn-sm btn-ghost">View</div><div class="btn btn-sm btn-ghost">Download</div></div>' +
        '</div>';
    }
    if (wrapper) { wrapper.innerHTML = html; }
    return html;
  }

  /* ---------- helpers ---------- */
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function fmtTime(sec) {
    if (!sec || isNaN(sec)) return '—';
    var m = Math.floor(sec / 60) % 60;
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  function setupReveal(selector) {
    var els = $$ (selector);
    var io = null;
    function check() {
      var el = document.querySelector(selector);
      if (el) {
        var rect = el.getBoundingClientRect();
        if (rect && rect.top < window.innerHeight - 60) {
          if (io) { clearInterval(io); io = null; }
        }
      }
    }
    check();
    io = setInterval(check, 200);
  }

  /* ---------- shared song rendering ---------- */
  function renderSongCard(song, container) {
    var card = createEl('div', { class: 'song-card' });
    card.innerHTML =
      '<div class="art">' +
        (song.artwork_file_id
          ? '<img src="' + escapeHtml(song.artwork_file_id) + '" alt="' + escapeHtml(song.title) + '">'
          : '<div class="placeholder">🎵</div>') +
      '</div>' +
      '<div class="body">' +
        '<span class="tag ' + escapeHtml(song.category).toLowerCase() + '">' + escapeHtml(song.category) + '</span>' +
        '<h4>' + escapeHtml(song.title) + '</h4>' +
        '<div class="artist">' + escapeHtml(song.artist) + '</div>' +
        '<div class="meta">' +
          '<span><b>' + (song.bpm || '—') + '</b> BPM</span>' +
          '<span><b>' + (song.key_signature || '—') + '</b> key</span>' +
          '<span>' + (song.duration || '—') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="actions">' +
        '<button class="btn btn-sm btn-ghost" data-view="' + escapeHtml(song.id) + '">View</button>' +
        '<button class="btn btn-sm btn-soft" data-download="' + escapeHtml(song.id) + '">Download</button>' +
      '</div>';
    if (container) container.appendChild(card);
    return card;
  }

  function renderSongGrid(songs, container, state) {
    var grid = container || createEl('div', { class: 'song-grid' });
    grid.innerHTML = '';
    if (!songs || !songs.length) {
      grid.appendChild(createEl('div', { class: 'section-sub' }).appendChild(document.createTextNode('No songs yet.')));
      return grid;
    }
    songs.forEach(function (s) { renderSongCard(s, grid); });
    grid.querySelectorAll('[data-view]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (state && state.onView) state.onView(btn.dataset.view);
      });
    });
    grid.querySelectorAll('[data-download]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (state && state.onDownload) state.onDownload(btn.dataset.download);
      });
    });
    return grid;
  }

  function renderCategoryCard(category, container) {
    container.appendChild(createEl('div', {
      class: 'cat-card cat-' + category.toLowerCase(),
      innerHTML: '<span class="cat-icon">🎵</span><h3>' + category + '</h3>' +
        '<p>' + (category === 'Praise'
          ? 'Upbeat, energetic songs for high-energy moments.'
          : 'Slow, reflective songs for still and thoughtful moments.') + '</p>' +
        '<div class="cat-cta"><button class="btn btn-sm btn-soft" data-cat="' + category.toLowerCase() + '">Browse</button></div>'
    }));
    container.querySelector('[data-cat]').addEventListener('click', function () {
      window.location.href = 'library.html' + (window.location.search || '?') + '&cat=' + category.toLowerCase();
    });
    return container;
  }

  /* ---------- bootstrap ---------- */
  document.body.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal-overlay') && !e.target.querySelector('.modal')) {
      closeModal();
    }
  });

  global.APP = {
    $: $,
    $$: $$,
    createEl: createEl,
    showToast: showToast,
    openModal: openModal,
    closeModal: closeModal,
    renderSkeleton: renderSkeleton,
    escapeHtml: escapeHtml,
    fmtTime: fmtTime,
    sleep: sleep,
    debounce: debounce,
    setupReveal: setupReveal,
    renderSongCard: renderSongCard,
    renderSongGrid: renderSongGrid,
    renderCategoryCard: renderCategoryCard,
    copyText: copyText
  };

  function copyText(btn) {
    var text = btn.dataset.copy || (btn.closest('[data-copy]') ? btn.closest('[data-copy]').dataset.copy : null);
    if (!text && btn.querySelector) {
      text = btn.querySelector('input') ? btn.querySelector('input').value : btn.textContent;
    }
    var toCopy = text || btn.parentElement.dataset.copy;
    if (!toCopy) { APP.showToast('Nothing to copy.', 'info'); return; }
    function done() { APP.showToast('Link copied to clipboard.', 'success'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(toCopy).then(done, function () { fallbackCopy(toCopy, done); });
    } else {
      fallbackCopy(toCopy, done);
    }
  }

  function fallbackCopy(text, done) {
    var ta = APP.createEl('textarea', { class: 'visually-hidden', rows: 2 });
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
    done();
  }

  return APP;
})(window);
