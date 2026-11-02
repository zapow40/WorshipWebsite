/* global CONFIG:false */

/**
 * config.js — site / backend configuration.
 *
 * Set apiBase to your backend. Two modes:
 *   • Local development (mock):  apiBase: 'http://127.0.0.1:4848'
 *   • Production (Google Apps Script web app): the deployment URL, e.g.
 *     'https://script.google.com/macros/s/ABCDEF1234567890/exec'
 *
 * Frontend host (GitHub Pages) is independent of the API host:
 *   • apiBase = your GAS Web App URL (production backend)
 *   • siteUrl = your GitHub Pages URL (static frontend)
 * Switching between mock and GAS is a one-line change in apiBase.
 */
window.CONFIG = {
  // Production (Google Apps Script web app — user's deployed Web App)
  apiBase: 'https://script.google.com/macros/s/AKfycbwDklDO61028dXhXlhi3--CYEP6GgvQv2wh3geb_2RnwV3ElCe2RzHo6gPjhPrmZItE/exec',
  siteName: 'Christ the Rock Covenant Church Camarin',
  siteTitle: 'Christ the Rock Covenant Church Camarin',
  siteTagline: 'Worship songs for our community — Praise & Worship',
  /** GitHub Pages static hosting URL */
  siteUrl: 'https://<your-github-username>.github.io/worship-library/',
  defaultPageSize: 12
};
