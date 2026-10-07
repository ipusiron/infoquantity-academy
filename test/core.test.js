const { test } = require('node:test');
const assert = require('node:assert/strict');
const C = require('../core.js');
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-12, `${a} != ${b}`);

// Reference values independently evaluated with Python math.log2.
for (const [p, expected] of [[1, 0], [.5, 1], [.25, 2], [.125, 3],
  [.6, .7369655941662062], [.4, 1.3219280948873622], [.0001, 13.287712379549449]]) {
  test(`information at ${p}`, () => close(C.information(p), expected));
}
for (const invalid of ['', ' ', 'NaN', 'Infinity', '1x', '0x1', -1, 1.1, NaN, Infinity, null, true, [], {}]) {
  test(`reject probability ${String(invalid)} (${typeof invalid})`, () => {
    assert.equal(C.probability(invalid), null);
    assert.equal(C.information(invalid), null);
    assert.equal(C.independent(invalid, .5).error, 'probability');
  });
}
test('zero information extends to infinity, but contributes zero to entropy', () => {
  assert.equal(C.information(0), Infinity);
  assert.equal(C.distribution([1, 0, 0, 0]).entropy, 0);
  assert.ok(!Object.is(C.information(1), -0));
});
test('known entropy distributions', () => {
  close(C.distribution([.25, .25, .25, .25]).entropy, 2);
  close(C.distribution([.7, .2, .1, 0]).entropy, 1.1567796494470395);
});
test('sum cannot hide invalid individual probabilities', () => {
  assert.equal(C.distribution([-.5, 1.5, 0, 0]).error, 'probability');
  assert.equal(C.distribution(['', .5, .5, 0]).error, 'probability');
  assert.equal(C.distribution([0, 0, 0, 0]).error, 'sum');
  assert.equal(C.distribution([.2, .2, .2, .2]).error, 'sum');
  assert.equal(C.distribution([]).error, 'distribution');
});
test('sum tolerance is explicit and values are not silently normalized', () => {
  assert.ok(!C.distribution([.5, .5000005]).error);
  assert.equal(C.distribution([.5, .500002]).error, 'sum');
  assert.deepEqual(C.distribution(['0.5', '.5']).ps, [.5, .5]);
});
test('independent events and underflow', () => {
  close(C.independent(.3, .4).combined, 3.0588936890535683);
  assert.equal(C.independent(0, .4).combined, Infinity);
  const tiny = C.independent(1e-200, 1e-200);
  assert.equal(tiny.underflow, true);
  assert.ok(Number.isFinite(tiny.combined));
});
test('comparison uses both probabilities and never subtracts two infinities', () => {
  assert.notEqual(C.compare(.01, .5).ia, C.compare(.99, .5).ia);
  assert.equal(C.compare(0, 0).informationDifference, null);
  assert.equal(C.compare(0, .5).informationDifference, Infinity);
});
test('unit normalization', () => {
  close(C.information(.5, Math.E), Math.LN2);
  close(C.information(.1, 10), 1);
  assert.equal(C.information(.5, 1), null);
});
test('room counts require bounded integers', () => {
  assert.deepEqual(C.rooms(16, 8), { floors: 16, perFloor: 8, total: 128,
    floorBits: 4, roomBits: 3, totalBits: 7 });
  for (const n of ['', 0, 1.5, 1001]) assert.equal(C.rooms(n, 8).error, 'rooms');
});
test('uniform password model includes the successful guess', () => {
  const p = C.password(8, 62);
  close(p.bits, 47.633570483095);
  assert.equal(p.count, '218340105584896');
  assert.equal(p.average, 109170052792448.5);
  assert.equal(C.password(1, 1).average, 1);
  for (const pair of [[0, 62], [101, 62], [8, 96], [1.5, 62], ['', 62]]) {
    assert.equal(C.password(...pair).error, 'password');
  }
});
test('all valid four-event tenths distributions have entropy between zero and two', () => {
  for (let a = 0; a <= 10; a++) for (let b = 0; b <= 10 - a; b++) {
    for (let c = 0; c <= 10 - a - b; c++) {
      const h = C.distribution([a, b, c, 10 - a - b - c].map(n => n / 10));
      assert.ok(!h.error && h.entropy >= 0 && h.entropy <= 2);
    }
  }
});
