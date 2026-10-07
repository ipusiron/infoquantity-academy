/* Translate text nodes only; lesson markup and input state are never replaced. */
(function () {
  'use strict';
  const normalize = value => value.replace(/\s+/g, ' ').trim();
  const entries = [];
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script, noscript, style')) continue;
    const key = normalize(node.data);
    if (Object.hasOwn(InfoLessonEnglish, key)) entries.push({ node, original: node.data, key });
  }
  const attributes = [];
  document.querySelectorAll('*').forEach(node => {
    for (const name of ['aria-label', 'title', 'placeholder', 'content']) {
      const original = node.getAttribute(name);
      if (original && Object.hasOwn(InfoLessonEnglish, normalize(original))) {
        attributes.push({ node, name, original, key: normalize(original) });
      }
    }
  });
  const accessible = {
    '.tabs': ['学習タブ', 'Learning tabs'],
    '#canvas-logI': ['確率と情報量のグラフ', 'Probability and information'],
    '#canvas-compare': ['指数・直線・対数の比較', 'Exponential, linear and logarithmic functions'],
    '#intuition-graph': ['主観の驚き度と設定情報量の記録', 'Recorded subjective surprise and model information'],
    '#monotonic-canvas': ['情報量の単調減少性', 'Monotonic decrease of information'],
    '.char-frequency': ['文字頻度の表', 'Character frequency table']
  };
  function apply() {
    const english = document.documentElement.lang === 'en';
    for (const { node, original, key } of entries) {
      if (node.isConnected) node.data = english ? ' ' + InfoLessonEnglish[key] + ' ' : original;
    }
    for (const { node, name, original, key } of attributes) {
      node.setAttribute(name, english ? InfoLessonEnglish[key] : original);
    }
    for (const [selector, values] of Object.entries(accessible)) {
      document.querySelectorAll(selector).forEach(node => node.setAttribute('aria-label', values[english ? 1 : 0]));
    }
    const button = document.getElementById('language-toggle');
    button.textContent = english ? '日本語' : 'English';
    button.lang = english ? 'ja' : 'en';
    document.getElementById('theme-toggle').setAttribute('aria-label', t('theme'));
  }
  document.getElementById('language-toggle').addEventListener('click', () => {
    const language = document.documentElement.lang === 'en' ? 'ja' : 'en';
    document.documentElement.lang = language;
    InfoSettings.save('language', language);
    try {
      const url = new URL(location.href);
      url.searchParams.set('lang', language);
      history.replaceState(null, '', url);
    } catch { /* Local files or restricted history must still work. */ }
    apply();
    document.dispatchEvent(new Event('languagechange'));
  });
  apply();
})();
