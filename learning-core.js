/* Four-outcome learning models and bounded, versioned record interchange. */
(function (root) {
  'use strict';
  const C = typeof module === 'object' && module.exports ? require('./core.js') : root.InfoCore;
  const PRESETS = Object.freeze({
    uniform: Object.freeze([.25, .25, .25, .25]), biased: Object.freeze([.7, .2, .1, 0]),
    certain: Object.freeze([1, 0, 0, 0]), binary: Object.freeze([.5, .5, 0, 0])
  });
  // Individual teaching events, not mutually exclusive exhaustive distributions.
  const SCENARIOS = Object.freeze({
    coin: Object.freeze({ heads: .5, tails: .5, edge: .0001, broken: .00001 }),
    dice: Object.freeze({ one: 1 / 6, even: .5, seven: 0, sixOnes: 1 / 46656 }),
    lottery: Object.freeze({ lose: .999, smallWin: .0009, jackpot: 1e-8, rareWin: 1e-10 }),
    weather: Object.freeze({ sun: .4, rain: .3, snow: .0001, rareWeather: 1e-10 })
  });
  const EVENTS = Object.freeze(Object.assign({}, ...Object.values(SCENARIOS)));
  const MAX_RECORDS = 100, MAX_BYTES = 65536, FORMAT = 'infoquantity-academy-records';
  function summarize(values) {
    if (!Array.isArray(values) || values.length !== 4) return { error: 'distribution' };
    const result = C.distribution(Array.from(values));
    if (result.error) return result;
    return { ...result, information: result.ps.map(p => C.information(p)), maximum: 2 };
  }
  function compareDistributions(a, b) {
    const left = summarize(a), right = summarize(b);
    if (left.error || right.error) return { error: 'distribution' };
    return { left, right, difference: right.entropy - left.entropy };
  }
  function keysMatch(value, keys) {
    return value !== null && typeof value === 'object' && !Array.isArray(value) &&
      Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
  }
  function validateRecords(records) {
    if (!Array.isArray(records) || records.length > MAX_RECORDS) return { error: 'recordFormat' };
    const result = [];
    for (const record of records) {
      if (!keysMatch(record, ['event', 'surprise', 'predicted', 'probability']) ||
          typeof record.event !== 'string' || !Object.hasOwn(EVENTS, record.event) ||
          !Number.isInteger(record.surprise) || record.surprise < 1 || record.surprise > 10 ||
          typeof record.predicted !== 'number' || C.probability(record.predicted) === null ||
          record.probability !== EVENTS[record.event]) return { error: 'recordFormat' };
      result.push({ ...record, theoretical: C.information(record.probability) });
    }
    return { records: result };
  }
  function serializeRecords(records) {
    if (!Array.isArray(records)) return { error: 'recordFormat' };
    const plain = Array.from(records, record => record && ({ event: record.event, surprise: record.surprise,
      predicted: record.predicted, probability: record.probability }));
    const checked = validateRecords(plain);
    return checked.error ? checked : { text: JSON.stringify({ format: FORMAT, version: 1, records: plain }, null, 2) + '\n' };
  }
  function parseRecords(text) {
    if (typeof text !== 'string' || new TextEncoder().encode(text).length > MAX_BYTES) return { error: 'recordSize' };
    let data;
    try { data = JSON.parse(text); } catch { return { error: 'recordFormat' }; }
    if (!keysMatch(data, ['format', 'version', 'records']) || data.format !== FORMAT || data.version !== 1) {
      return { error: 'recordFormat' };
    }
    return validateRecords(data.records);
  }
  function csvRecords(records) {
    const saved = serializeRecords(records);
    if (saved.error) return saved;
    const checked = parseRecords(saved.text);
    // IDs come from the fixed allowlist; other cells are validated numbers or Infinity.
    const rows = [['event_id', 'surprise', 'predicted_probability', 'model_probability',
      'predicted_information_bits', 'model_information_bits'].join(',')];
    for (const r of checked.records) rows.push([r.event, r.surprise, r.predicted, r.probability,
      C.information(r.predicted), r.theoretical].join(','));
    return { text: rows.join('\r\n') + '\r\n' };
  }
  const api = Object.freeze({ PRESETS, SCENARIOS, MAX_RECORDS, MAX_BYTES, summarize, compareDistributions,
    validateRecords, serializeRecords, parseRecords, csvRecords });
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.InfoLearning = api;
})(globalThis);
