/* global APP:true, Api:true */

/**
 * admin-settings.js — website content editor.
 * Edits Church name, hero, announcement, contact, social links,
 * featured songs, and logo. Changes persist to the WebsiteSettings sheet.
 */
(function (global) {
  'use strict';

  var state = { social: [], featured: [] };
  var els = {};

  function $(id) { return document.getElementById(id); }

  function boot() {
    els.saveBtn = $('save-settings');
    els.clearBtn = $('clear-settings');
    els.announcement = $('site-announcement');
    els.siteTitle = $('site-title');
    els.siteTagline = $('site-tagline');
    els.logoFile = $('logo-file');
    els.logoStatus = $('logo-status');
    els.phone = $('contact-phone');
    els.email = $('contact-email');
    els.address = $('contact-address');
    els.location = $('contact-location');
    els.featured = $('featured-ids');
    els.socialList = $('social-list');
    els.socialCount = $('social-count');
    els.toast = $('settings-toast');
    if (els.saveBtn) els.saveBtn.addEventListener('click', saveSettings);
    if (els.clearBtn) els.clearBtn.addEventListener('click', clearAllSettings);
    if (els.logoFile) els.logoFile.addEventListener('change', onLogoFile);
  }

  function fmtBytes(b) { return b < 1024 ? b + ' B' : (b / 1024).toFixed(1) + ' KB'; }

  function loadSettings() {
    Api.Public.getConfig().then(function (cfg) {
      var site = cfg && cfg.site ? cfg.site : {};
      els.siteTitle.value = site.title || '';
      els.siteTagline.value = site.tagline || '';
      els.announcement.value = site.announcement || '';
      els.phone.value = site.contact && site.contact.phone || '';
      els.email.value = site.contact && site.contact.email || '';
      els.address.value = site.contact && site.contact.address || '';
      els.location.value = site.contact && site.contact.location || '';
      els.featured.value = (site.featured_ids || site.featured_ids || '').join(', ');
      state.social = site.social || [];
      renderSocialRows();
      if (site.logo_file_id) {
        els.logoStatus.textContent = 'Logo: ' + site.logo_file_id;
        els.logoStatus.style.color = 'var(--emerald)';
      } else {
        els.logoStatus.textContent = 'No logo currently set.';
        els.logoStatus.style.color = 'var(--ink-faint)';
      }
    }).catch(function (e) { APP.showToast(e.message || 'Could not load settings.', 'error'); });
  }

  function renderSocialRows() {
    var list = els.socialList;
    list.innerHTML = '';
    state.social.forEach(function (s, i) {
      var row = APP.createEl('div', { class: 'social-row' });
      row.innerHTML =
        '<input class="social-label" placeholder="Label (e.g. Facebook)" value="' + APP.escapeHtml(s.label || '') + '">' +
        '<input class="social-url" placeholder="URL" value="' + APP.escapeHtml(s.url || '') + '">' +
        '<button class="btn btn-sm btn-ghost remove-social" type="button">Remove</button>';
      row.querySelector('.remove-social').addEventListener('click', function () {
        state.social.splice(i, 1);
        renderSocialRows();
      });
      list.appendChild(row);
    });
    // add button
    var add = APP.createEl('button', { class: 'btn btn-sm btn-ghost', style: 'margin-top:.3rem;', innerHTML: '+ Add link' });
    add.addEventListener('click', function () {
      state.social.push({ label: '', url: '' });
      renderSocialRows();
    });
    list.appendChild(add);
    els.socialCount.textContent = state.social.length;
  }

  function onLogoFile(e) {
    if (!e.target.files || !e.target.files[0]) return;
    var file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) { APP.showToast('Logo must be under 2 MB.', 'error'); return; }
    var reader = new FileReader();
    reader.onload = function () {
      var base64 = String(reader.result).split(',')[1];
      Api.Admin.uploadArtwork(file).then(function (res) {
        if (res && res.file_id) {
          state.logoUpload = { file_id: res.file_id, url: res.file_id };
          els.logoStatus.textContent = 'Uploading ' + file.name + '…';
          // replace via updateSettings once saved
        }
      }).catch(function (e) { APP.showToast(e.message || 'Upload failed.', 'error'); });
    };
    reader.readAsDataURL(file);
    els.logoStatus.textContent = 'Uploading…';
  }

  function saveSettings() {
    var changes = {};
    changes.site_title = els.siteTitle.value.trim();
    changes.site_tagline = els.siteTagline.value.trim();
    changes.site_announcement = els.announcement.value.trim();
    changes.contact_phone = els.phone.value.trim();
    changes.contact_email = els.email.value.trim();
    changes.contact_address = els.address.value.trim();
    changes.contact_location = els.location.value.trim();
    changes.featured_song_ids = els.featured.value.trim();
    changes.social_links = JSON.stringify(state.social);
    if (state.logoUpload && state.logoUpload.file_id) {
      changes.logo_file_id = state.logoUpload.file_id;
    }
    Api.Admin.updateSettings(changes).then(function (res) {
      if (res && res.saved) {
        APP.showToast('Website settings saved.', 'success');
        loadSettings();
      } else {
        APP.showToast('Save failed.', 'error');
      }
    }).catch(function (e) {
      APP.showToast(e.message || 'Save failed.', 'error');
    });
  }

  function clearAllSettings() {
    if (!window.confirm('Clear all website settings?')) return;
    Api.Admin.updateSettings({ site_title: '', site_tagline: '', site_announcement: '', contact_phone: '', contact_email: '', contact_address: '', contact_location: '', featured_song_ids: '', social_links: '[]', logo_file_id: '' }).then(function () {
      APP.showToast('Settings cleared.', 'success');
      loadSettings();
    }).catch(function (e) { APP.showToast(e.message || 'Clear failed.', 'error'); });
  }

  function init() {
    boot();
    loadSettings();
  }

  global.AdminSettings = { init: init };
})(window);

document.addEventListener('DOMContentLoaded', function () {
  AdminSettings.init();
});
