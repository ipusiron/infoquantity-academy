const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('learning scripts preserve CSP-safe rendering and avoid network or storage writes', () => {
  for (const file of ['learning-ui.js', 'records-ui.js', 'learning-core.js']) {
    const source = read(file);
    assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML|\beval\s*\(|\bfetch\s*\(|XMLHttpRequest|localStorage/.test(source), file);
  }
  const html = read('index.html');
  for (const file of ['learning-core.js', 'learning-ui.js', 'records-ui.js']) {
    assert.equal(html.split(`src="${file}"`).length - 1, 1);
  }
  assert.ok(html.indexOf('src="learning-core.js"') < html.indexOf('src="script.js"'));
});
test('import validates before replacing and stale asynchronous reads are invalidated', () => {
  const source = read('records-ui.js');
  assert.ok(source.includes('chosen.size > L.MAX_BYTES'));
  assert.ok(source.includes('ticket !== generation'));
  assert.ok(source.includes("document.addEventListener('recordschange', reset)"));
  const changeHandler = source.split("file.addEventListener('change'")[1].split("apply.addEventListener")[0];
  assert.ok(changeHandler.includes('L.parseRecords(text)'));
  assert.ok(!changeHandler.includes('intuitionData ='));
  assert.ok(source.includes('URL.revokeObjectURL(url)'));
  assert.ok(source.includes("document.addEventListener('languagechange', render)"));
  assert.ok(source.includes('file.hidden = true'));
  assert.ok(!read('style.css').includes('#record-tools input[type="file"]'));
});
test('table and progress semantics remain available without color alone', () => {
  const source = read('learning-ui.js');
  assert.ok(source.includes("node('caption', name)"));
  assert.ok(source.includes("cell.scope = 'col'"));
  assert.ok(source.includes("label.scope = 'row'"));
  assert.ok(source.includes("bar.setAttribute('aria-label'"));
  assert.ok(read('index.html').includes('class="records-scroll" tabindex="0" role="region"'));
  assert.ok(read('style.css').includes('.records-scroll:focus-visible'));
});
test('new modules and their tests remain readable without minification', () => {
  for (const file of ['learning-core.js', 'learning-ui.js', 'records-ui.js', 'test/learning.test.js', 'test/learning-ui.test.js']) {
    const lines = read(file).split('\n');
    assert.ok(lines.length > 35, file);
    lines.forEach((line, index) => assert.ok(line.length <= 160, `${file}:${index + 1}`));
  }
});

test('learning text and button colors meet 4.5:1 in both themes and hover backgrounds', () => {
  const css = read('style.css');
  const variables = selector => Object.fromEntries([...css.match(selector)[1].matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)]
    .map(match => [match[1], match[2]]));
  const dark = variables(/:root\s*\{([^}]+)\}/), light = { ...dark, ...variables(/\[data-theme="light"\]\s*\{([^}]+)\}/) };
  const luminance = hex => hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255)
    .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4)
    .reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
  for (const colors of [dark, light]) {
    for (const background of ['box', 'card', 'steps-bg']) {
      const a = luminance(colors.text), b = luminance(colors[background]);
      assert.ok((Math.max(a, b) + .05) / (Math.min(a, b) + .05) >= 4.5, background);
    }
  }
});
