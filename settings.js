/* Runs in the head so the first paint uses the selected theme. */
(function () {
  'use strict';
  function read(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function save(key, value) { try { localStorage.setItem(key, value); } catch { /* Optional storage. */ } }
  const query = new URLSearchParams(location.search).get('lang');
  const stored = read('language');
  const validLanguage = value => ['ja', 'en'].includes(value);
  const language = validLanguage(query) ? query : validLanguage(stored) ? stored :
    navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en';
  const savedTheme = read('theme');
  const theme = ['light', 'dark'].includes(savedTheme) ? savedTheme :
    matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.lang = language;
  document.documentElement.dataset.theme = theme;
  window.InfoSettings = { save };
})();
