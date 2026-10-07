const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const ja = read('README.md');
const en = read('README.en.md');
const dictionary = require('../lesson-en.js');
const normalize = s => s.replace(/\s+/g, ' ').trim();
const decode = s => s.replace(/&(?:amp|lt|gt|quot|apos|nbsp);/g,
  v => ({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&nbsp;':' '})[v]);
const japanese = /[ぁ-んァ-ヶ一-龯]/;

test('README translations have identical metadata, heading hierarchy and table numbers', () => {
  assert.equal(ja.match(/<!--[\s\S]*?-->/)[0], en.match(/<!--[\s\S]*?-->/)[0]);
  const headings = text => [...text.matchAll(/^(#{1,6}) /gm)].map(m => m[1].length);
  assert.deepEqual(headings(ja), headings(en));
  assert.ok(headings(ja).length > 20);
  const rows = text => text.split('\n').filter(l => l.startsWith('|'));
  assert.equal(rows(ja).length, rows(en).length);
  assert.deepEqual(rows(ja).map(l => l.match(/\d+(?:\.\d+)?/g)),
    rows(en).map(l => l.match(/\d+(?:\.\d+)?/g)));
});

test('README relative links and bilingual screenshots exist and PNGs are bounded', () => {
  for (const [name, source] of [['README.md', ja], ['README.en.md', en]]) {
    const links = [...source.matchAll(/\]\(([^)]+)\)/g)].map(m => m[1]);
    for (const href of links.filter(h => !/^https?:/.test(h))) {
      assert.ok(fs.existsSync(path.join(root, href)), name + ': ' + href);
    }
    const shots = links.filter(h => h.endsWith('.png'));
    assert.equal(shots.length, 3);
    for (const shot of shots) {
      const data = fs.readFileSync(path.join(root, shot));
      assert.ok(data.length < 300000, shot);
      assert.equal(data.readUInt32BE(16), 1280);
      assert.equal(data.readUInt32BE(20), 900);
    }
  }
  assert.ok(ja.includes('[English](README.en.md)'));
  assert.ok(en.includes('[日本語](README.md)'));
});

test('README numeric examples agree with independent expected values', () => {
  const core = require('../core.js');
  assert.equal(core.information(.125), 3);
  assert.ok(Math.abs(core.information(.0001) - 13.287712379549449) < 1e-12);
  assert.equal(core.distribution([.25,.25,.25,.25]).entropy, 2);
  assert.equal(core.distribution([1,0,0,0]).entropy, 0);
  assert.equal(core.password(1,26).average, 13.5);
  for (const source of [ja, en]) {
    for (const value of ['13.287712', '13.5', '0.000001', '1/46656', '(N+1)/2', '112 bit']) {
      assert.ok(source.includes(value), value);
    }
    assert.ok(!/\b(previously|used to|earlier version|formerly)\b/i.test(source));
    for (const section of source.split(/^#{1,3} /m)) {
      assert.ok((section.match(/\*\*/g) || []).length <= 4);
    }
  }
});

test('all Japanese lesson text and accessible attributes have English translations', () => {
  const html = read('index.html').replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|noscript|style)\b[^>]*>[\s\S]*?<\/\1>/g, '');
  const strings = [
    ...html.split(/<[^>]+>/),
    ...[...html.matchAll(/(?:aria-label|title|placeholder|content)="([^"]*)"/g)].map(m => m[1])
  ].map(s => normalize(decode(s))).filter(s => japanese.test(s));
  assert.ok(strings.length > 400);
  for (const key of strings) {
    assert.ok(Object.hasOwn(dictionary, key), 'Missing: ' + key);
    assert.ok(dictionary[key].trim().length > 0, key);
    assert.ok(!japanese.test(dictionary[key]), key);
  }
  const sourceSet = new Set(strings);
  for (const key of Object.keys(dictionary)) assert.ok(sourceSet.has(key), 'Stale: ' + key);
});

test('language changes rerender all derived output without HTML interpolation', () => {
  const js = read('script.js').split("document.addEventListener('languagechange'")[1];
  for (const functionName of ['updateCalc', 'updateAdd', 'updateApt', 'updateProp', 'updateH',
    'updatePasswordEntropy', 'updatePropertiesDisplay', 'refreshScenario', 'renderRecords',
    'updateQuizScore', 'redrawGraphs']) assert.ok(js.includes(functionName + '()'));
  assert.ok(!read('i18n.js').includes('innerHTML'));
  assert.ok(read('i18n.js').includes("history.replaceState"));
});
