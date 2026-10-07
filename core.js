/* Pure calculations, shared by classic browser scripts and Node tests. */
(function (root) {
  'use strict';
  const SUM_TOLERANCE = 1e-6;
  function number(value, min, max, integer = false) {
    if (typeof value !== 'number' && typeof value !== 'string') return null;
    if (typeof value === 'string' && !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())) return null;
    const n = Number(value);
    return Number.isFinite(n) && n >= min && n <= max && (!integer || Number.isInteger(n)) ? n : null;
  }
  function probability(value) { return number(value, 0, 1); }
  function information(value, base = 2) {
    const p = probability(value);
    if (p === null || ![2, Math.E, 10].includes(base)) return null;
    if (p === 0) return Infinity;
    return p === 1 ? 0 : -Math.log(p) / Math.log(base);
  }
  function distribution(values) {
    if (!Array.isArray(values) || !values.length) return { error: 'distribution' };
    const ps = values.map(probability);
    if (ps.includes(null)) return { error: 'probability' };
    const sum = ps.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1) > SUM_TOLERANCE) return { error: 'sum', sum, ps };
    const terms = ps.map(p => p === 0 ? 0 : p * information(p));
    return { ps, sum, terms, entropy: terms.reduce((a, b) => a + b, 0) };
  }
  function independent(a, b) {
    const pa = probability(a), pb = probability(b);
    if (pa === null || pb === null) return { error: 'probability' };
    const ia = information(pa), ib = information(pb);
    // Summing logarithms avoids underflow when two positive probabilities are tiny.
    return { pa, pb, product: pa * pb, ia, ib, combined: ia + ib,
      underflow: pa > 0 && pb > 0 && pa * pb === 0 };
  }
  function compare(a, b) {
    const pa = probability(a), pb = probability(b);
    if (pa === null || pb === null) return { error: 'probability' };
    const ia = information(pa), ib = information(pb);
    return { pa, pb, ia, ib, probabilityDifference: Math.abs(pa - pb),
      informationDifference: ia === Infinity && ib === Infinity ? null : Math.abs(ia - ib) };
  }
  function rooms(floors, perFloor) {
    const f = number(floors, 1, 1000, true), r = number(perFloor, 1, 1000, true);
    if (f === null || r === null) return { error: 'rooms' };
    return { floors: f, perFloor: r, total: f * r, floorBits: Math.log2(f),
      roomBits: Math.log2(r), totalBits: Math.log2(f * r) };
  }
  function password(length, alphabet) {
    const l = number(length, 1, 100, true), n = number(alphabet, 1, 95, true);
    if (l === null || n === null) return { error: 'password' };
    const count = BigInt(n) ** BigInt(l);
    return { length: l, alphabet: n, bits: l * Math.log2(n), count: count.toString(),
      average: Number(count + 1n) / 2 };
  }
  const api = Object.freeze({ number, probability, information, distribution, independent,
    compare, rooms, password, SUM_TOLERANCE });
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.InfoCore = api;
})(globalThis);
