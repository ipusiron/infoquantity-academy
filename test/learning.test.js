const { test } = require('node:test');
const assert = require('node:assert/strict');
const L = require('../learning-core.js');
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} != ${expected}`);
const record = () => ({ event: 'seven', surprise: 10, predicted: 0, probability: 0 });
const envelope = records => JSON.stringify({ format: 'infoquantity-academy-records', version: 1, records });

test('four-outcome presets match independent Python entropy fixtures', () => {
  const expectations = { uniform: 2, biased: 1.1567796494470395, certain: 0, binary: 1 };
  for (const [id, expected] of Object.entries(expectations)) {
    const r = L.summarize(L.PRESETS[id]);
    near(r.entropy, expected);
    assert.equal(r.maximum, 2);
  }
  const r = L.summarize(L.PRESETS.biased);
  [0.3602012209808308, 0.46438561897747244, 0.33219280948873625, 0].forEach((v, i) => near(r.terms[i], v));
  assert.equal(r.information[3], Infinity);
  assert.equal(r.terms[3], 0);
  assert.ok(Object.isFrozen(L.PRESETS.biased));
});
test('invalid or sparse distributions never leave a computed comparison', () => {
  for (const values of [[], [1], Array(4), ['', 1, 0, 0], [-1, 2, 0, 0], [.2, .2, .2, .2]]) {
    assert.ok(L.summarize(values).error);
    assert.deepEqual(L.compareDistributions(values, L.PRESETS.uniform), { error: 'distribution' });
  }
  const r = L.summarize([.2500001, .25, .25, .25]);
  assert.equal(r.ps[0], .2500001); // tolerance is not silent normalization
});
test('entropy difference is signed and does not identify distinct distributions', () => {
  near(L.compareDistributions(L.PRESETS.biased, L.PRESETS.uniform).difference, .8432203505529605);
  near(L.compareDistributions(L.PRESETS.uniform, L.PRESETS.biased).difference, -.8432203505529605);
  assert.equal(L.compareDistributions([1, 0, 0, 0], [0, 1, 0, 0]).difference, 0);
});
test('JSON round trip recomputes infinite information and preserves all 100 records', () => {
  const source = Array.from({ length: 100 }, record);
  const saved = L.serializeRecords(source);
  assert.ok(!saved.text.includes('Infinity'));
  const parsed = L.parseRecords(saved.text);
  assert.equal(parsed.records.length, 100);
  assert.equal(parsed.records[99].theoretical, Infinity);
  assert.deepEqual(source[0], record());
  assert.ok(L.parseRecords(envelope([...source, record()])).error);
  assert.deepEqual(L.parseRecords(envelope([])), { records: [] });
});
test('JSON rejects malformed, oversized, wrong-version and unexpected fields', () => {
  for (const input of ['', '{', 'null', '[]', '{}', envelope([record()]).replace('"version":1', '"version":2'),
    envelope([record()]).replace('"version":1', '"version":1,"__proto__":{}')]) {
    assert.equal(L.parseRecords(input).error, 'recordFormat');
  }
  const valid = envelope([]);
  assert.ok(L.parseRecords(valid + ' '.repeat(L.MAX_BYTES - valid.length)).records);
  assert.equal(L.parseRecords(valid + ' '.repeat(L.MAX_BYTES - valid.length + 1)).error, 'recordSize');
  assert.equal(L.parseRecords('あ'.repeat(22000)).error, 'recordSize');
});
test('records reject foreign event IDs, injected text, wrong types and forged model probabilities', () => {
  const invalid = [{ event: '=1+1' }, { event: '<img>' }, { event: '__proto__' }, { event: 'toString' },
    { surprise: 0 }, { surprise: 11 }, { surprise: 1.5 }, { surprise: '5' },
    { predicted: '0' }, { predicted: null }, { predicted: -1 }, { predicted: 1.1 },
    { probability: .5 }, { probability: '0' }, { theoretical: 99 }];
  for (const patch of invalid) assert.equal(L.parseRecords(envelope([{ ...record(), ...patch }])).error, 'recordFormat');
  assert.ok(L.validateRecords(Array(2)).error);
  assert.ok(L.serializeRecords(null).error);
});
test('CSV has fixed safe IDs and explicit Infinity; values match independently known results', () => {
  const data = [record(), { event: 'heads', surprise: 1, predicted: .25, probability: .5 }];
  assert.equal(L.csvRecords(data).text,
    'event_id,surprise,predicted_probability,model_probability,predicted_information_bits,model_information_bits\r\n' +
    'seven,10,0,0,Infinity,Infinity\r\nheads,1,0.25,0.5,2,1\r\n');
  assert.ok(L.csvRecords([{ ...record(), event: '=1+1' }]).error);
});
