/* global APP:true, SongDetailView:true */

/**
 * song.js — dedicated song detail page.
 * Reads song_id from the URL query string and renders the detail view
 * (meta, description, and both audio players) into #detail.
 */
(function (global) {
  'use strict';

  function getParam(name) {
    var match = new RegExp('[?&]' + name + '=([^&]*)').exec(location.search);
    return match ? decodeURIComponent(match[1]) : null;
  }

  function init() {
    var id = getParam('song_id');
    if (!id) {
      APP.showToast('No song selected. Use a link from the library.', 'info');
      return;
    }
    document.title = 'View · ' + id;
    SongDetailView.fromId(id, null, false);
  }

  global.SongPage = { init: init };
})(window);

document.addEventListener('DOMContentLoaded', function () {
  SongPage.init();
});
