/* global APP:true, Api:true, CONFIG:true */

/**
 * audio.js — audio player controllers.
 *
 * The requirement is that visitors never conflate the Reference Song
 * with the Backing Track, and that only one track plays at a time.
 * A small singleton regulates playback across every player on the page:
 *  • playing an audio element pauses any other element that was playing;
 *  • each player exposes the standard controls (play/pause, seek, volume,
 *    current/total time, loading & error states).
 */
(function (global) {
  'use strict';

  var playing = null; // currently active <audio> element

  function getAudioEl(id) {
    return document.getElementById(id);
  }

  function AudioPlayer(config) {
    this.id = config.id;
    this.label = config.label || this.id;
    this.audio = getAudioEl(this.id);
    this.controls = config.controls; // optional DOM element holding UI controls
    this.badge = config.badge; // element to mark "playing"
    this.volumeEl = config.volumeEl;
    this.state = 'stopped'; // stopped | playing | loading | error
    this.volume = 1;
    this._bound = {};
    this._init();
  }

  AudioPlayer.prototype._bind = function (el, evt, fn) {
    if (!this._bound[el.id]) {
      this._bound[el.id] = {};
    }
    if (!this._bound[el.id][evt]) {
      this._bound[el.id][evt] = [];
      el.addEventListener(evt, fn.bind(this));
      this._bound[el.id][evt].push(fn);
    } else {
      this._bound[el.id][evt].push(fn);
    }
  };

  AudioPlayer.prototype._stop = function () {
    var a = this.audio;
    a.pause();
    a.currentTime = 0;
    if (playing === a) playing = null;
    this.setState('stopped');
  };

  AudioPlayer.prototype._play = function () {
    var a = this.audio;
    if (playing && playing !== a) {
      playing.pause(); // enforce single-track rule
    }
    a.volume = this.volume;
    a.play().catch(function () { /* user interaction block: ignored visually */ });
    this.setState('playing');
    playing = a;
  };

  AudioPlayer.prototype.setState = function (state) {
    this.state = state;
    if (this.badge) {
      this.badge.textContent = state === 'playing' ? '●' : (state === 'loading' ? '◐' : '—');
      this.badge.style.color = state === 'playing' ? '#fff' : 'var(--ink-soft)';
    }
  };

  AudioPlayer.prototype._updateTime = function () {
    var a = this.audio;
    var cur = this.controls && this.controls.querySelector('.cur-time');
    var tot = this.controls && this.controls.querySelector('.tot-time');
    if (cur) cur.textContent = APP.fmtTime(a.currentTime);
    if (tot) tot.textContent = APP.fmtTime(a.duration);
    var bar = this.controls && this.controls.querySelector('.seek-bar');
    if (bar) {
      var pct = a.duration ? (a.currentTime / a.duration) * 100 : 0;
      bar.style.background = 'conic-gradient(' + 'hsl(' + ((a.currentTime / a.duration) * 260 + 20) % 360 + ', 70%, 60%) ' + pct + '%, transparent ' + pct + '%)';
    }
  };

  AudioPlayer.prototype._onLoaded = function () {
    this.setState('loaded');
  };

  AudioPlayer.prototype._onError = function (e) {
    this.setState('error');
    APP.showToast('Could not load audio: ' + (e.target.error ? e.target.error.message : 'unknown'), 'error');
  };

  AudioPlayer.prototype._onPlay = function () {
    this._play();
  };

  AudioPlayer.prototype._onPause = function () {
    if (playing === this.audio) {
      playing = null;
      this.setState('stopped');
    }
  };

  AudioPlayer.prototype._init = function () {
    var a = this.audio;
    this._bind(a, 'loadstart', function () { this.setState('loading'); });
    this._bind(a, 'loadedmetadata', this._onLoaded.bind(this));
    this._bind(a, 'error', this._onError.bind(this));
    this._bind(a, 'play', this._onPlay.bind(this));
    this._bind(a, 'pause', this._onPause.bind(this));
    this._bind(a, 'timeupdate', this._updateTime.bind(this));
    this._bind(a, 'ended', function () { this.setState('stopped'); playing = null; }.bind(this));

    if (this.volumeEl) {
      this._bind(this.volumeEl, 'input', function () {
        this.volume = parseFloat(this.volumeEl.value);
        this.audio.volume = this.volume;
      }.bind(this));
    }

    // play/pause button
    if (this.controls) {
      var playBtn = this.controls.querySelector('.play-btn');
      if (playBtn) {
        this._bind(playBtn, 'click', function (e) {
          e.stopPropagation();
          if (this.state === 'playing' || this.state === 'loading') {
            this._stop();
          } else {
            this._play();
          }
        }.bind(this));
      }
      // seek
      var seek = this.controls && this.controls.querySelector('.seek-bar');
      if (seek) {
        this._bind(seek, 'input', function () {
          this.audio.currentTime = (this.audio.duration || 0) * (this.value / 100);
        }.bind(this));
      }
      // volume
      if (this.volumeEl) {
        this._bind(this.volumeEl, 'input', function () {
          this.volume = parseFloat(this.volumeEl.value);
          this.audio.volume = this.volume;
        }.bind(this));
      }
    }
  };

  /* ---------- factory ---------- */
  function createPlayer(cfg) {
    return new AudioPlayer(cfg);
  }

  global.AudioCore = {
    play: function (id) { var p = getAudioEl(id); if (p) { new AudioPlayer({ id: id }); p.play(); } },
    pauseAll: function () { if (playing) { playing.pause(); playing.currentTime = 0; playing = null; } },
    list: function () { return $$('audio'); }
  };

  // expose prototype for page scripts
  global.AudioPlayer = AudioPlayer;
})(window);
