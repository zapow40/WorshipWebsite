/* global APP:true, SongDetailView:true */

/**
 * library.js — public song library.
 * - search by title / artist
 * - filter by Praise / Worship
 * - sort by title or date
 * - view (modal detail with both players) + download backing track
 */
(function (global) {
  'use strict';

  var state = {
    q: '',
    category: 'all',
    sortBy: 'date',
    page: 1,
    pageSize: APP ? (CONFIG ? CONFIG.defaultPageSize : 12) : 12
  };

  var els = {
    search: document.getElementById('lib-search'),
    category: document.getElementById('lib-category'),
    sort: document.getElementById('lib-sort'),
    count: document.getElementById('lib-count'),
    grid: document.getElementById('lib-grid'),
    more: document.getElementById('lib-more'),
    loading: document.getElementById('lib-loading'),
    empty: document.getElementById('lib-empty')
  };

  function onView(songId) {
    SongDetailView.fromId(songId, null, true);
  }

  function onDownload(songId) {
    Api.Public.downloadBackingTrack(songId).then(function (d) {
      openDownload(d.url, d.filename);
    }).catch(function (e) {
      APP.showToast('Could not prepare download: ' + e.message, 'error');
    });
  }

  function openDownload(url, filename) {
    // Local mock: force a real download via dl=1 so the <a> behaves like a
    // download link. On Google Apps Script the returned Drive URL is used as
    // a direct media link; adjust per your deployment.
    var downloadUrl = url + (url.indexOf('?') === -1 ? '?dl=1' : '&dl=1');
    window.open(downloadUrl, '_blank', 'noopener');
    APP.showToast('Downloading ' + filename + ' — opened in a new tab.', 'info');
  }

  function debouncedSearch() {
    state.q = els.search ? els.search.value : '';
    if (state.q.trim()) {
      state.category = 'all';
      state.sortBy = 'date';
      els.category.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
      update();
    } else {
      els.category.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
      els.category.querySelector('[data-cat="all"]').classList.add('active');
      state.page = 1;
      update();
    }
  }

  function setCategory(cat) {
    state.category = cat;
    state.page = 1;
    els.category.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
    if (cat !== 'all') els.category.querySelector('[data-cat="' + cat + '"]').classList.add('active');
    update();
  }

  function setSort(sortBy) {
    state.sortBy = sortBy;
    state.page = 1;
    els.sort.value = sortBy;
    update();
  }

  function buildFilters() {
    var html = '<button class="chip active" data-cat="all">All <span class="count">' + (state.pageSize) + '</span></button>';
    [['Praise', 'praise'], ['Worship', 'worship']].forEach(function (c) {
      html += '<button class="chip" data-cat="' + c[1] + '">' + c[0] + '</button>';
    });
    els.category.innerHTML = html;
    els.category.querySelectorAll('.chip').forEach(function (c) {
      c.addEventListener('click', function () { setCategory(c.dataset.cat); });
    });
  }

  function buildSort() {
    els.sort.innerHTML = '<option value="date">Newest first</option><option value="title">Title A–Z</option>';
  }

  function showLoading() {
    els.grid && (els.grid.innerHTML = APP.renderSkeleton(els.grid, 6));
    els.loading && (els.loading.classList.remove('hidden'));
    els.empty && (els.empty.classList.add('hidden'));
  }

  function showEmpty() {
    els.loading && (els.loading.classList.add('hidden'));
    els.empty && els.empty.classList.remove('hidden');
  }

  function update() {
    showLoading();
    Api.Public.listSongs(state.q, state.category === 'all' ? '' : state.category, state.sortBy, state.page, state.pageSize).then(function (data) {
      els.loading && els.loading.classList.add('hidden');
      if (!data || !data.songs || !data.songs.length) {
        showEmpty();
        return;
      }
      var grid = APP.renderSongGrid(data.songs, els.grid, { onView: onView, onDownload: onDownload });
      els.grid.replaceChild(grid, els.grid.firstChild);
      APP.setupReveal('.song-card');
      els.count && (els.count.textContent = data.songs.length + (data.pagination && data.pagination.total > data.songs.length ? ' · ' + data.pagination.total + ' total' : ''));
      if (data.pagination && data.pagination.page < data.pagination.totalPages) {
        els.more && els.more.classList.remove('hidden');
        els.more.onclick = function () { state.page++; update(); };
      } else if (els.more) {
        els.more.classList.add('hidden');
      }
    }).catch(function (e) {
      els.loading && els.loading.classList.add('hidden');
      APP.showToast(e.message || 'Something went wrong.', 'error');
      showEmpty();
    });
  }

  function init() {
    buildFilters();
    buildSort();
    if (els.search) els.search.addEventListener('input', APP.debounce(debouncedSearch, 250));
    if (els.category) {
      els.category.querySelector('[data-cat="all"]').classList.add('active');
    }
    if (els.sort) els.sort.addEventListener('change', function () { setSort(els.sort.value); });
    if (els.more) els.more.addEventListener('click', function () { state.page++; update(); });
    update();
  }

  global.Library = { init: init };
})(window);

document.addEventListener('DOMContentLoaded', function () {
  Library.init();
});
