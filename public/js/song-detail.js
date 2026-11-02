/* global APP:true, AudioPlayer:true, Api:true */

/**
 * song-detail.js — renders a song detail view with two separate,
 * regulated audio players, a backing-track download, and share.
 * Can render into a modal (library card "View") or a dedicated page.
 */
(function (global) {
  'use strict';

  var SINGLE_PLAY = true; // enforce single-track

  function fmtSize(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function openDownload(url, filename) {
    window.open(url, '_blank', 'noopener');
  }

  function renderAudioPlayer(id, label, file) {
    var block = APP.createEl('div', { class: 'audio-block' });
    var head = APP.createEl('div', { class: 'head' });
    var h5 = APP.createEl('h5');
    h5.textContent = label;
    head.appendChild(h5);

    var info = APP.createEl('div', { class: 'audio-file-info' });
    var badge = APP.createEl('span', { class: 'badge' });
    badge.textContent = file.filename || 'no file';
    info.appendChild(badge);
    if (file.size) {
      var size = APP.createEl('span');
      size.textContent = '· ' + fmtSize(file.size);
      info.appendChild(size);
    }
    head.appendChild(info);

    var controls = APP.createEl('div', { class: 'audio-controls' });

    var playBtn = APP.createEl('button', { class: 'btn-icon play-btn', 'aria-label': 'Play' });
    playBtn.textContent = '▶';
    controls.appendChild(playBtn);

    var prog = APP.createEl('div', { class: 'play-progress' });
    var seek = APP.createEl('input', { type: 'range', class: 'seek-bar', min: 0, max: 100, value: 0, 'aria-label': 'Seek' });
    var cur = APP.createEl('span', { class: 'time cur-time' });
    var tot = APP.createEl('span', { class: 'time tot-time' });
    prog.appendChild(seek); prog.appendChild(cur); prog.appendChild(tot);
    controls.appendChild(prog);

    var volRow = APP.createEl('div', { class: 'play-progress' });
    var vol = APP.createEl('input', { type: 'range', class: 'seek-bar', min: 0, max: 100, value: 100, 'aria-label': 'Volume' });
    volRow.appendChild(vol);
    controls.appendChild(volRow);

    var actions = APP.createEl('div', { class: 'actions-tooltip' });
    actions.appendChild(APP.createEl('button', {
      class: 'btn btn-sm btn-ghost', onclick: function () { openDownload(file.url, file.filename); },
      'aria-label': 'Download backing track'
    }).textContent = 'Download');
    controls.appendChild(actions);

    block.appendChild(head);
    block.appendChild(controls);
    block.appendChild(APP.createEl('audio', { id: id, src: file.url, preload: 'metadata' }));
    block.dataset.player = id;

    var player = new AudioPlayer({
      id: id,
      label: label,
      controls: controls,
      badge: badge,
      volumeEl: vol
    });

    // keep a reference so the controller can query it later
    player.audioEl = audio;
    player.playerEl = controls;
    return block;
  }

  function renderDetail(song, audio, container) {
    var div = APP.createEl('div');
    div.innerHTML =
      '<button class="modal-close" aria-label="Close">&times;</button>' +
      '<div class="song-detail">' +
        '<div class="art" style="aspect-ratio:16/10; background:var(--bg-alt);">' +
          (song.artwork_file_id
            ? '<img src="' + APP.escapeHtml(song.artwork_file_id) + '" alt="' + APP.escapeHtml(song.title) + '">'
            : '<div class="placeholder">🎵</div>') +
        '</div>' +
        '<div class="body">' +
          '<span class="tag ' + APP.escapeHtml(song.category).toLowerCase() + '">' + APP.escapeHtml(song.category) + '</span>' +
          '<h2 class="song-title">' + APP.escapeHtml(song.title) + '</h2>' +
          '<div class="artist">' + APP.escapeHtml(song.artist) + '</div>' +
          '<div class="meta">' +
            '<span><b>' + (song.bpm || '—') + '</b> BPM</span>' +
            '<span><b>' + (song.key_signature || '—') + '</b> key</span>' +
            '<span><b>' + (song.time_signature || '—') + '</b> · ' + (song.duration || '—') + '</span>' +
          '</div>' +
          (song.album ? '<div class="album">Album: ' + APP.escapeHtml(song.album) + '</div>' : '') +
          (song.description ? '<p class="description">' + APP.escapeHtml(song.description) + '</p>' : '') +
          '<div class="actions">' +
            '<a class="btn btn-soft" href="' + APP.escapeHtml(audio.backing_track.url) + '" target="_blank" rel="noopener">' +
              '<span class="icon">↓</span> Download Backing Track' +
            '</a>' +
            '<button class="btn btn-sm btn-ghost" onclick="APP.copyText(this)">Copy link</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    // note: modal close + copy-text are bound below

    // bind players
    var refPlayer = renderAudioPlayer('audio-ref-' + song.id, 'Reference Song', audio.reference);
    var bakPlayer = renderAudioPlayer('audio-bak-' + song.id, 'Backing Track', audio.backing_track);

    div.querySelector('.song-detail').appendChild(refPlayer);
    div.querySelector('.song-detail').appendChild(bakPlayer);

    // copy text helper (injected as inline onclick; attached below)
    var copyBtn = div.querySelector('button[onclick="APP.copyText(this)"]');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        APP.copyText(copyBtn);
      });
    }

    container.appendChild(div);
    return div;
  }

  function openDetail(song, audio, showInModal) {
    var container = APP.createEl('div');
    var el = renderDetail(song, audio, container);
    if (showInModal) {
      APP.openModal(container.innerHTML);
      // firstChild of overlay is .modal; we put the detail inside
      var overlay = APP.$('.modal-overlay');
      if (overlay) {
        var modal = overlay.querySelector('.modal');
        modal.innerHTML = '';
        modal.appendChild(container);
      }
    } else {
      // dedicated page: append to #detail
      var root = document.getElementById('detail');
      if (root) root.appendChild(container);
    }
    return container;
  }

  function fromId(id, container, showInModal) {
    return Api.Public.getSong(id).then(function (data) {
      if (!data) return;
      return Api.Public.getSongAudio(id).then(function (audio) {
        if (showInModal) APP.$('.modal-overlay') && APP.$('.modal-overlay').classList.add('open');
        renderDetail(data, audio.audio, container || APP.createEl('div'));
      });
    }).catch(function (e) {
      APP.showToast(e.message || 'Could not load song details.', 'error');
    });
  }

  global.SongDetailView = {
    openDetail: openDetail,
    fromId: fromId
  };
})(window);
