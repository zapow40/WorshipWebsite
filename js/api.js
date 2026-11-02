/* global CONFIG:true, window:true */

/**
 * api.js — REST client for the worship library backend.
 *
 * All requests are POST with a JSON body { action, token?, data?, files? }.
 * The envelope is standard:
 *   { success: bool, data: any, error: string|null }
 * Public actions need no token; administrative actions send the session
 * token returned at login. Tokens live in memory only (never in
 * localStorage) to reduce the blast radius of XSS.
 */
(function (global) {
  'use strict';

  var base = (CONFIG && CONFIG.apiBase) || '/api';
  var token = null;

  function serialize(val) {
    return val == null ? null : JSON.stringify(val);
  }

  function request(action, opts) {
    var body = { action: action, token: token };
    if (opts) {
      if (opts.token) token = opts.token;
      if (opts.data) body.data = opts.data;
      if (opts.files) body.files = opts.files;
    }
    return fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: serialize(body)
    })
      .then(function (r) {
        return r.json().then(function (j) {
          if (!j || typeof j !== 'object') throw new Error('Invalid JSON from server.');
          if (j.success === false) {
            var err = new Error(j.error || 'Request failed.');
            err.http = r.status;
            throw err;
          }
          return j.data;
        });
      })
      .catch(function (e) {
        var transportError = new Error('Unable to reach the server. Please check your connection.');
        if (e && e.http) transportError.http = e.http;
        if (e && e.message) transportError.message = e.message;
        return Promise.reject(transportError);
      });
  }

  function get(action, data) { return request(action, { data: data }); }
  function post(action, data) { return request(action, { data: data }); }

  /* ---------- public (no token) ---------- */
  var Public = {
    getConfig: function () {
      return request('getConfig', {});
    },
    listSongs: function (q, category, sortBy, page, pageSize) {
      return request('listPublishedSongs', {
        data: {
          q: q || '',
          category: category || '',
          sortBy: sortBy || 'date',
          page: page || 1,
          pageSize: pageSize || CONFIG.defaultPageSize
        }
      });
    },
    getSong: function (id) {
      return request('getSong', { data: { song_id: id } });
    },
    getSongAudio: function (id) {
      return request('getSongAudio', { data: { song_id: id } });
    },
    downloadBackingTrack: function (id) {
      return request('downloadBackingTrack', { data: { song_id: id } });
    }
  };

  /* ---------- admin (token required) ---------- */
  var Admin = {
    login: function (email, password) {
      return request('login', { data: { email: email, password: password } });
    },
    logout: function () {
      return request('logout', { token: token });
    },
    listSongs: function (page, pageSize, includeUnpublished) {
      return request('listSongs', {
        data: {
          page: page || 1,
          pageSize: pageSize || CONFIG.defaultPageSize,
          includeUnpublished: includeUnpublished || false
        }
      });
    },
    getSong: function (id) {
      return request('getSongDetail', { data: { song_id: id } });
    },
    createSong: function (data) {
      return request('createSong', { data: data });
    },
    updateSong: function (id, data) {
      return request('updateSong', { data: Object.assign({ song_id: id }, data) });
    },
    deleteSong: function (id) {
      return request('deleteSong', { data: { song_id: id } });
    },
    uploadReferenceSong: function (file, folder) {
      return upload(file, 'reference', folder);
    },
    uploadBackingTrack: function (file, folder) {
      return upload(file, 'backing_track', folder);
    },
    uploadArtwork: function (file) {
      return upload(file, 'artwork');
    },
    listUsers: function () {
      return request('listUsers', {});
    },
    createUser: function (data) {
      return request('createUser', { data: data });
    },
    updateUser: function (id, data) {
      return request('updateUser', { data: Object.assign({ user_id: id }, data) });
    },
    changeUserRole: function (id, role) {
      return request('changeUserRole', { data: { user_id: id, role: role } });
    },
    updateUserStatus: function (id, status) {
      return request('updateUserStatus', { data: { user_id: id, status: status } });
    },
    resetUserPassword: function (token, password) {
      return request('resetUserPassword', { data: { token: token, password: password } });
    },
    updateSettings: function (data) {
      return request('updateSettings', { data: data });
    },
    listActivityLogs: function () {
      return request('listActivityLogs', {});
    }
  };

  /* ---------- file upload (base64-in-JSON) ---------- */
  function upload(kind, file, folder) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('Could not read the selected file.')); };
      reader.onload = function () {
        var base64 = String(reader.result).split(',')[1];
        var payload = {
          action: 'upload' + kind.charAt(0).toUpperCase() + kind.slice(1),
          token: token,
          data: { kind: kind, folder: folder },
          files: [{ name: file.name, mime: file.type || 'application/octet-stream', data: base64 }]
        };
        request(payload.action, payload).then(resolve, reject);
      };
    });
  }

  /* ---------- session helpers ---------- */
  function setToken(t) { token = t; }
  function getToken() { return token; }
  function clearToken() { token = null; }

  var currentUser = null;
  function setUser(u) { currentUser = u; }
  function getUser() { return currentUser; }
  function clearUser() { currentUser = null; }

  global.Api = {
    Public: Public,
    Admin: Admin,
    session: { setToken: setToken, getToken: getToken, clearToken: clearToken, setUser: setUser, getUser: getUser, clearUser: clearUser }
  };
})(window);
