/* global APP:true, Api:true, SongDetailView:true */

/**
 * admin-songs.js — song CRUD + two audio files + artwork.
 * Uploads are two-column (Reference Song | Backing Track) with clear
 * validation, progress, and replace-safe behaviour.
 */
(function (global) {
  'use strict';

  var state = {
    editingId: null,
    search: '',
    category: 'all',
    songs: [],
    files: { reference: null, backing: null, artwork: null }
  };

  var els = {};

  function $(id) { return document.getElementById(id); }

  function showToast(msg, type) { APP.showToast(msg, type); }

  function boot() {
    els.newBtn = $('new-song');
    els.search = $('song-search');
    els.cat = $('song-category');
    els.sort = $('song-sort');
    els.list = $('song-list');
    els.toolbar = $('song-toolbar');
    els.editor = $('song-editor');
    els.editorForm = $('song-editor-form');
    els.cancelEdit = $('cancel-edit');
    els.saveBtn = $('save-song');
    els.deleteBtn = $('delete-song');
    els.deleteConfirm = $('delete-confirm');
    els.referenceFile = $('ref-file');
    els.backingFile = $('bak-file');
    els.artworkFile = $('artwork-file');
    els.referencePreview = $('reference-preview');
    els.backingPreview = $('backing-preview');
    els.artworkPreview = $('artwork-preview');
    els.refFileStatus = $('ref-status');
    els.bakFileStatus = $('bak-status');
    els.artFileStatus = $('art-status');
    els.referenceTrack = $('reference-track');
    els.backingTrack = $('backing-track');
    els.sortOptions = $('song-sort');
    els.loading = $('songs-loading');
    els.empty = $('songs-empty');
    els.pageInfo = $('page-info');
    els.more = $('songs-more');
    if (els.newBtn) els.newBtn.addEventListener('click', openNew);
    if (els.cancelEdit) els.cancelEdit.addEventListener('click', cancelEdit);
    if (els.saveBtn) els.saveBtn.addEventListener('click', saveSong);
    if (els.deleteBtn) els.deleteBtn.addEventListener('click', askDelete);
    if (els.referenceFile) els.referenceFile.addEventListener('change', onReferenceFile);
    if (els.backingFile) els.backingFile.addEventListener('change', onBackingFile);
    if (els.artworkFile) els.artworkFile.addEventListener('change', onArtworkFile);
  }

  function openNew() {
    state.editingId = null;
    state.files = { reference: null, backing: null, artwork: null };
    els.editorForm.reset();
    els.referenceTrack.innerHTML = '<audio id="tmp-ref"></audio>';
    els.backingTrack.innerHTML = '<audio id="tmp-bak"></audio>';
    setStatus(null, null, null);
    showEditor(true, 'New song');
  }

  function openEdit(id) {
    state.editingId = id;
    Api.Admin.getSong(id).then(function (s) {
      if (!s) { showToast('Song not found.', 'error'); return; }
      state.song = s;
      els.editorForm.title.value = s.title || '';
      els.editorForm.artist.value = s.artist || '';
      els.editorForm.category.value = s.category || 'Praise';
      els.editorForm.album.value = s.album || '';
      els.editorForm.key.value = s.key_signature || '';
      els.editorForm.bpm.value = s.bpm || '';
      els.editorForm.time.value = s.time_signature || '';
      els.editorForm.duration.value = s.duration || '';
      els.editorForm.description.value = s.description || '';
      els.editorForm.published.checked = s.published === true;
      els.editingIdEmb = s.id;
      setFiles(s);
      showEditor(true, 'Edit song');
    }).catch(function (e) { showToast(e.message || 'Could not load song.', 'error'); });
  }

  function setFiles(s) {
    if (s.reference_file_id) {
      state.files.reference = { url: s.reference_file_id, filename: s.reference_filename };
      els.referencePreview.innerHTML = '<audio id="preview-ref" controls><source src="' + APP.escapeHtml(s.reference_file_id) + '" type="audio/mpeg"></audio><div class="file-info">Reference: ' + APP.escapeHtml(s.reference_filename || 'File ID') + '</div>';
    }
    if (s.backing_track_file_id) {
      state.files.backing = { url: s.backing_track_file_id, filename: s.backing_track_filename };
      els.backingPreview.innerHTML = '<audio id="preview-bak" controls><source src="' + APP.escapeHtml(s.backing_track_file_id) + '" type="audio/mpeg"></audio><div class="file-info">Backing track: ' + APP.escapeHtml(s.backing_track_filename || 'File ID') + '</div>';
    }
  }

  function showEditor(visible, title) {
    els.editor.style.display = visible ? 'block' : 'none';
    if (visible) els.editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function maskForm() {
    els.editorForm.title.disabled = true;
    els.editorForm.artist.disabled = true;
    els.editorForm.category.disabled = true;
    els.editorForm.album.disabled = true;
    els.editorForm.key.disabled = true;
    els.editorForm.bpm.disabled = true;
    els.editorForm.time.disabled = true;
    els.editorForm.duration.disabled = true;
    els.editorForm.description.disabled = true;
    els.editorForm.published.disabled = true;
    els.referenceFile.disabled = true;
    els.backingFile.disabled = true;
    els.artworkFile.disabled = true;
    els.saveBtn.disabled = true;
    els.cancelEdit.disabled = true;
    els.deleteBtn.disabled = true;
    els.deleteConfirm.disabled = true;
  }

  function unmaskForm() {
    els.editorForm.title.disabled = false;
    els.editorForm.artist.disabled = false;
    els.editorForm.category.disabled = false;
    els.editorForm.album.disabled = false;
    els.editorForm.key.disabled = false;
    els.editorForm.bpm.disabled = false;
    els.editorForm.time.disabled = false;
    els.editorForm.duration.disabled = false;
    els.editorForm.description.disabled = false;
    els.editorForm.published.disabled = false;
    els.referenceFile.disabled = false;
    els.backingFile.disabled = false;
    els.artworkFile.disabled = false;
    els.saveBtn.disabled = false;
    els.cancelEdit.disabled = false;
    els.deleteBtn.disabled = false;
    els.deleteConfirm.disabled = false;
  }

  function validate(data) {
    var errs = [];
    if (!data.title.trim()) errs.push('Title is required.');
    if (!data.artist.trim()) errs.push('Artist is required.');
    if (!data.category) errs.push('Category is required.');
    if (!data.reference_file_id) errs.push('Reference audio is required.');
    if (!data.backing_track_file_id) errs.push('Backing track audio is required.');
    return errs;
  }

  function saveSong() {
    var data = {
      title: els.editorForm.title.value.trim(),
      artist: els.editorForm.artist.value.trim(),
      category: els.editorForm.category.value,
      album: els.editorForm.album.value.trim(),
      key_signature: els.editorForm.key.value.trim(),
      bpm: els.editorForm.bpm.value.trim(),
      time_signature: els.editorForm.time.value.trim(),
      duration: els.editorForm.duration.value.trim(),
      description: els.editorForm.description.value.trim(),
      published: els.editorForm.published.checked
    };
    var errs = validate(data);
    if (errs.length) { showToast(errs.join(' '), 'error'); return; }
    var promise = state.editingId
      ? Api.Admin.updateSong(state.editingId, data)
      : Api.Admin.createSong(data);
    maskForm();
    promise.then(function (saved) {
      unmaskForm();
      showToast('Song saved.', 'success');
      // merge files from upload responses first
      if (state.files.reference && state.files.reference.file_id) saved.reference_file_id = state.files.reference.file_id;
      if (state.files.backing && state.files.backing.file_id) saved.backing_track_file_id = state.files.backing.file_id;
      if (state.files.artwork && state.files.artwork.file_id) saved.artwork_file_id = state.files.artwork.file_id;
      if (state.editingId) {
        loadSongs(true);
      } else {
        loadSongs(true);
        state.editingId = saved.id; // so cancel edits clean up
      }
      cancelEdit();
    }).catch(function (e) {
      unmaskForm();
      showToast(e.message || 'Save failed.', 'error');
    });
  }

  function cancelEdit() {
    state.editingId = null;
    state.files = { reference: null, backing: null, artwork: null };
    els.editorForm.reset();
    els.referencePreview.innerHTML = '';
    els.backingPreview.innerHTML = '';
    els.artworkPreview.innerHTML = '';
    setFiles(null);
    setStatus(null, null, null);
    showEditor(false, '');
    if (els.editor) els.editor.scrollTop = 0;
  }

  function onReferenceFile(e) {
    if (!e.target.files || !e.target.files[0]) return;
    uploadFile('reference', e.target.files[0]);
  }

  function onBackingFile(e) {
    if (!e.target.files || !e.target.files[0]) return;
    uploadFile('backing', e.target.files[0]);
  }

  function onArtworkFile(e) {
    if (!e.target.files || !e.target.files[0]) return;
    uploadFile('artwork', e.target.files[0]);
  }

  function uploadFile(kind, file) {
    var status = kind === 'reference' ? els.refFileStatus : kind === 'backing' ? els.bakFileStatus : els.artFileStatus;
    if (!file) return;
    status.textContent = 'Uploading…';
    var folder = (els.editorForm && els.editorForm.category) ? els.editorForm.category.value : 'uploads';
    var promise;
    if (kind === 'reference') promise = Api.Admin.uploadReferenceSong(file, folder);
    else if (kind === 'backing') promise = Api.Admin.uploadBackingTrack(file, folder);
    else promise = Api.Admin.uploadArtwork(file);
    promise.then(function (res) {
      if (res && res.file_id) {
        state.files[kind] = { file_id: res.file_id, filename: res.name, mime: res.mime_type, size: res.size, url: res.file_id };
        status.textContent = 'Uploaded ' + (res.name || file.name) + ' (' + fmtBytes(res.size) + ').';
        if (kind === 'reference') renderRefPreview();
        if (kind === 'backing') renderBakPreview();
        if (kind === 'artwork') renderArtPreview();
      } else {
        status.textContent = 'Upload failed (no file id returned).';
      }
    }).catch(function (e) {
      status.textContent = 'Upload error: ' + e.message;
    });
  }

  function fmtBytes(b) { return b < 1024 ? b + ' B' : (b / 1024).toFixed(1) + ' KB'; }

  function renderRefPreview() {
    var f = state.files.reference;
    if (f) {
      els.referenceTrack.innerHTML = '<audio id="preview-ref" controls><source src="' + APP.escapeHtml(f.url) + '" type="' + APP.escapeHtml(f.mime) + '"></audio><div class="file-info">Reference: ' + APP.escapeHtml(f.filename || f.file_id) + ' (' + fmtBytes(f.size) + ')</div>';
    } else {
      els.referenceTrack.innerHTML = '<audio id="preview-ref"></audio>';
    }
  }

  function renderBakPreview() {
    var f = state.files.backing;
    if (f) {
      els.backingTrack.innerHTML = '<audio id="preview-bak" controls><source src="' + APP.escapeHtml(f.url) + '" type="' + APP.escapeHtml(f.mime) + '"></audio><div class="file-info">Backing track: ' + APP.escapeHtml(f.filename || f.file_id) + ' (' + fmtBytes(f.size) + ')</div>';
    } else {
      els.backingTrack.innerHTML = '<audio id="preview-bak"></audio>';
    }
  }

  function renderArtPreview() {
    var f = state.files.artwork;
    if (f) {
      var img = APP.createEl('img', { src: f.url, alt: 'artwork' });
      els.artworkPreview.innerHTML = '';
      els.artworkPreview.appendChild(img);
      els.artworkPreview.appendChild(APP.createEl('div', { class: 'file-info', textContent: f.filename || f.file_id + ' (' + fmtBytes(f.size) + ')' }));
    } else {
      els.artworkPreview.innerHTML = '';
    }
  }

  function setStatus(ref, bak, art) {
    if (ref) els.refFileStatus.textContent = ref;
    if (bak) els.bakFileStatus.textContent = bak;
    if (art) els.artFileStatus.textContent = art;
  }

  function loadSongs(refresh) {
    if (refresh === undefined) refresh = false;
    if (refresh && state.editingId) return; // keep editor open while loading
    els.loading && els.loading.classList.remove('hidden');
    Api.Admin.listSongs(1, 50, true).then(function (data) {
      els.loading && els.loading.classList.add('hidden');
      state.songs = data.songs || [];
      renderList();
      updatePageInfo();
      if (els.more) els.more.classList.add('hidden');
    }).catch(function (e) {
      els.loading && els.loading.classList.add('hidden');
      showToast(e.message || 'Could not load songs.', 'error');
    });
  }

  function updatePageInfo() {
    if (els.pageInfo) els.pageInfo.textContent = state.songs.length + ' songs';
  }

  function renderList() {
    var rows = '';
    var songs = state.songs.slice().sort(function (a, b) {
      return String(b.created_at || '').localeCompare(String(a.created_at || ''));
    });
    songs.forEach(function (s) {
      var statusClass = s.published === true ? 'published' : 'draft';
      var statusLabel = s.published === true ? 'Published' : 'Draft';
      rows += '<tr>' +
        '<td class="mono">' + (s.id || '') + '</td>' +
        '<td><b>' + APP.escapeHtml(s.title || 'Untitled') + '</b>' + (s.artist ? '<br><span class="soft">' + APP.escapeHtml(s.artist) + '</span>' : '') + '</td>' +
        '<td><span class="tag ' + APP.escapeHtml(s.category).toLowerCase() + '">' + APP.escapeHtml(s.category) + '</span></td>' +
        '<td>' + (s.key_signature || '—') + ' / ' + (s.bpm || '—') + '</td>' +
        '<td>' + (s.duration || '—') + '</td>' +
        '<td><span class="status-' + statusClass + '">' + statusLabel + '</span></td>' +
        '<td class="row-actions">' +
          '<button class="btn btn-sm btn-ghost" onclick="window.AdminSongs.openEdit(\'' + APP.escapeHtml(s.id || '') + '\')">Edit</button>' +
          '<button class="btn btn-sm btn-ghost" style="color:var(--danger);" onclick="window.AdminSongs.deleteSong(\'' + APP.escapeHtml(s.id || '') + '\')">Delete</button>' +
        '</td>' +
      '</tr>';
    });
    els.list.innerHTML = rows || '<tr><td colspan="7" class="soft text-center">No songs yet.</td></tr>';
    APP.setupReveal && APP.setupReveal && APP.setupReveal('.song-card');
  }

  function deleteSong(id) {
    var s = state.songs.find(function (x) { return x.id === id; });
    if (!s) { showToast('Song not found.', 'error'); return; }
    if (!window.confirm('Delete "' + (s.title || 'Untitled') + '"? This removes the record and archives audio files.')) return;
    maskForm();
    Api.Admin.deleteSong(id).then(function () {
      unmaskForm();
      loadSongs(true);
      showToast('Deleted.', 'success');
    }).catch(function (e) {
      unmaskForm();
      showToast(e.message || 'Delete failed.', 'error');
    });
  }

  function init() {
    boot();
    loadSongs();
  }

  global.AdminSongs = { init: init, openEdit: openEdit, deleteSong: deleteSong };
})(window);

document.addEventListener('DOMContentLoaded', function () {
  AdminSongs.init();
});
