const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

test('dynamic message keys and placeholders correspond in Japanese and English', () => {
  const { ja, en } = require('../messages.js');
  assert.deepEqual(Object.keys(ja), Object.keys(en));
  for (const key of Object.keys(ja)) {
    assert.deepEqual(ja[key].match(/\{\w+\}/g), en[key].match(/\{\w+\}/g), key);
  }
});
test('subjective surprise is recorded without scores or an ideal line', () => {
  const js = read('script.js');
  assert.ok(!/matchScore|surpriseInfo|generateIntuitionExplanation/.test(js));
  assert.ok(js.includes('finitePoints'));
  assert.ok(js.includes('predicted: percent / 100'));
  assert.ok(!js.includes('innerHTML'));
});
test('calculators share the core and do not silently clamp input', () => {
  const js = read('script.js');
  for (const name of ['distribution', 'independent', 'rooms', 'password', 'compare']) {
    assert.ok(js.includes('C.' + name));
  }
  assert.ok(!js.includes('val = Math.max(0'));
  assert.ok(!js.includes('F = Math.max(1'));
});

test('strict CSP and local scripts without inline code or handlers', () => {
  const html = read('index.html');
  assert.ok(!/unsafe-inline|unsafe-eval|style=|\son\w+=/.test(html));
  assert.ok(html.includes("connect-src 'none'"));
  assert.ok(html.includes('rel="noopener noreferrer"'));
  for (const match of html.matchAll(/<script src="([^"]+)"/g)) {
    assert.ok(fs.existsSync(path.join(__dirname, '..', match[1])));
  }
});
test('theme initializes before styles and chart drawing adapts to the available width', () => {
  const html = read('index.html');
  assert.ok(html.indexOf('settings.js') < html.indexOf('style.css'));
  const css = read('style.css');
  assert.ok(css.includes('prefers-reduced-motion'));
  assert.ok(css.includes('minmax(0,1fr)'));
  assert.ok(read('script.js').includes('fitCanvas(canvas)'));
});
