/**
 * InfoQuantity Academy - Interactive Information Theory Learning Tool
 * 情報量の基礎学習ツール
 *
 * 主要機能:
 * - 情報量 I(a) = -log₂ P(a) の計算とビジュアライゼーション
 * - タブベースのインターフェース (定義/計算例/加算性/性質/エントロピー)
 * - ライト/ダークモード切り替え
 * - Canvas 2D による数学的グラフ描画
 *
 * 技術スタック: Vanilla JavaScript, HTML5 Canvas, CSS Custom Properties
 */

/* ========= ユーティリティ関数 ========= */
// 値を指定範囲内にクランプ
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// 2を底とする対数計算 (情報量計算の基本)
const log2 = (x) => Math.log(x) / Math.log(2);

// 数値の表示用フォーマット (有限数のみ小数点表示)
const fmt = (x, d=4) => x === Infinity ? '∞' : Number.isFinite(x) ? x.toFixed(d) : '—';
const C = InfoCore;
const bit = x => fmt(x) + ' bit';
function errorText(error) { return t(error || 'invalid'); }

/* ========= テーマ切り替えシステム ========= */
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const html = document.documentElement;

// 初期化: ローカルストレージからテーマ設定を復元
const savedTheme = html.dataset.theme;
html.setAttribute('data-theme', savedTheme);
themeIcon.textContent = savedTheme === 'light' ? '🌙' : '☀️';

// テーマ切り替えイベント
themeToggle.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  // テーマ適用とアイコン更新
  html.setAttribute('data-theme', newTheme);
  InfoSettings.save('theme', newTheme);
  themeIcon.textContent = newTheme === 'light' ? '🌙' : '☀️';

  // Canvas描画はテーマ依存のため再描画が必要
  redrawGraphs();
});

/* ========= タブナビゲーション制御 ========= */
// 5つのタブ間での切り替え処理
document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    // 全タブのアクティブ状態をリセット
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));

    // 選択されたタブをアクティブ化
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');

    // 定義タブ: Canvas要素が含まれるため描画更新が必要
    if (btn.dataset.tab === 'tab-def') {
      drawILog();
      drawCompare();
    }
  });
});

/* ========= 1. 定義タブ: グラフ描画機能 ========= */

/**
 * 情報量グラフ I = -log₂ P の描画
 * 横軸: 確率P (0 < P ≤ 1)
 * 縦軸: 情報量I (0 ≤ I ≤ 8bit)
 */
function drawILog(){
  const canvas = document.getElementById('canvas-logI');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);

  // テーマ依存の色設定
  const isDark = html.getAttribute('data-theme') !== 'light';
  ctx.fillStyle = isDark ? '#dfe9ff' : '#495057';
  ctx.font = '12px ui-monospace, monospace';
  ctx.strokeStyle = isDark ? '#2a3b57' : '#6c757d';
  ctx.lineWidth = 1.2;

  // 描画エリアの境界線
  ctx.strokeRect(40, 20, W-60, H-60);

  // 軸ラベル
  ctx.fillText('P', W-18, H-36);
  ctx.fillText('I=-log₂P', 50, 18);

  // 情報量曲線の描画 P ∈ (0,1]
  const left = 40, top = 20, w = W-60, h = H-60;
  const Imax = 8; // 表示上限: P→0で情報量は無限大だが8bitでキャップ

  ctx.beginPath();
  for(let i=0;i<=w;i++){
    const P = clamp(i/w, 1e-6, 1); // P=0を避けるため最小値設定
    const I = -log2(P);
    const y = top + h - Math.min(I, Imax) / Imax * h;
    const x = left + i;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  // テーマ対応の曲線色
  ctx.strokeStyle = isDark ? '#5aa9ff' : '#0066cc';
  ctx.lineWidth = 2;
  ctx.stroke();

  // ticks for P
  ctx.fillStyle = isDark ? '#9fb0c3' : '#6c757d';
  const ticks = [0.0,0.25,0.5,0.75,1.0];
  ticks.forEach(t=>{
    const x = left + t*w;
    ctx.beginPath();
    ctx.moveTo(x, top+h);
    ctx.lineTo(x, top+h+5);
    ctx.strokeStyle = isDark ? '#344665' : '#6c757d';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillText(t.toFixed(2), x-10, top+h+18);
  });
  // ticks for I
  for(let k=0;k<=Imax;k+=2){
    const y = top + h - (k/Imax)*h;
    ctx.beginPath();
    ctx.moveTo(left-5, y);
    ctx.lineTo(left, y);
    ctx.strokeStyle = isDark ? '#344665' : '#6c757d';
    ctx.stroke();
    ctx.fillText(String(k), 8, y+4);
  }
}

/**
 * 比較グラフの描画: y=a^x, y=x, y=log_a(x)
 * 指数関数・一次関数・対数関数の関係性を視覚化
 * 範囲: x∈[0,4], y∈[-4,16]
 */
function drawCompare(){
  const a = C.number(document.getElementById('cmp-base').value, 1 + Number.EPSILON, 100);
  const canvas = document.getElementById('canvas-compare');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);

  // テーマ判定
  const isDark = html.getAttribute('data-theme') !== 'light';

  const warning = document.getElementById('base-error');
  if (warning) warning.textContent = a === null ? t('base') : '';
  if (a === null) return;

  // coordinate box for x in [0,4], y in [-4,16] to show exponential growth and negative log values
  const left = 40, top = 20, w = W-60, h = H-60;
  const xmin=0, xmax=4, ymin=-4, ymax=16;
  const X = x => left + (x - xmin) / (xmax - xmin) * w;
  const Y = y => top + (ymax - y) / (ymax - ymin) * h;

  // axes
  ctx.strokeStyle = isDark ? '#2a3b57' : '#6c757d';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(left, top, w, h);

  // draw x-axis at y=0
  const y0 = Y(0);
  ctx.beginPath();
  ctx.moveTo(left, y0);
  ctx.lineTo(left + w, y0);
  ctx.strokeStyle = isDark ? '#344665' : '#adb5bd';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // draw y-axis at x=0
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, top + h);
  ctx.strokeStyle = isDark ? '#344665' : '#adb5bd';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  ctx.fillStyle = isDark ? '#9fb0c3' : '#6c757d';
  ctx.font = '12px ui-monospace, monospace';
  // x ticks
  for(let t=0;t<=4;t++){
    let x = X(t);
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0+5); ctx.strokeStyle='#344665'; ctx.stroke();
    ctx.fillText(String(t), x-4, y0+18);
  }
  // y ticks
  for(let t=-4;t<=16;t+=2){
    let y = Y(t);
    ctx.beginPath(); ctx.moveTo(left-5, y); ctx.lineTo(left, y); ctx.strokeStyle='#344665'; ctx.stroke();
    ctx.fillText(String(t), t >= 10 || t <= -2 ? 6 : 12, y+4);
  }
  ctx.fillStyle = isDark ? '#dfe9ff' : '#495057';
  ctx.fillText('x', X(4.2), y0);
  ctx.fillText('y', X(0), Y(16.5));

  // y = a^x
  ctx.beginPath();
  let expStarted = false;
  for(let i=0;i<=400;i++){
    const x = xmin + (i/400)*(xmax - xmin);
    let y = Math.pow(a,x);
    // Only draw the part that's within the visible range
    if(y > ymax) continue;
    if(y < ymin) continue;
    const px = X(x), py = Y(y);
    if(!expStarted){ ctx.moveTo(px,py); expStarted=true; } else ctx.lineTo(px,py);
  }
  ctx.strokeStyle = isDark ? '#7aa6ff' : '#4d7fff';
  ctx.lineWidth = 2; ctx.stroke();

  // y = x
  ctx.beginPath();
  ctx.moveTo(X(0), Y(0));
  ctx.lineTo(X(4), Y(4));
  ctx.strokeStyle = isDark ? '#ffd166' : '#ffc107'; ctx.lineWidth = 2; ctx.stroke();

  // y = log_a x
  ctx.beginPath();
  let started=false;
  for(let i=1;i<=400;i++){ // start from i=1 to avoid x=0
    const x = xmin + (i/400)*(xmax - xmin);
    if(x<=0) continue;
    let y = Math.log(x)/Math.log(a);
    // don't clamp to show full logarithm curve including negative values
    if(y < ymin || y > ymax) continue; // skip points outside view
    const px = X(x), py = Y(y);
    if(!started){ ctx.moveTo(px,py); started=true; } else ctx.lineTo(px,py);
  }
  ctx.strokeStyle = isDark ? '#4dd0e1' : '#17a2b8'; ctx.lineWidth = 2; ctx.stroke();
}

document.getElementById('cmp-base')?.addEventListener('input', drawCompare);
window.addEventListener('load', ()=>{ drawILog(); drawCompare(); });

/* ========= 2. 計算例タブ: コイン投げ情報量計算 ========= */
// DOM要素の取得
const pEls = ['p0','p1','p2','p3'].map(id=>document.getElementById(id)); // 確率入力欄
const sumEl = document.getElementById('psum');    // 確率合計表示
const errEl = document.getElementById('perror');  // エラーメッセージ
const iEls = ['i0','i1','i2','i3'].map(id=>document.getElementById(id)); // 情報量結果表示
const sEls = ['s0','s1','s2','s3'].map(id=>document.getElementById(id)); // 計算過程表示

/**
 * 単一事象の情報量計算 I(a) = -log₂ P(a)
 * @param {number} p - 事象の生起確率 (0 ≤ p ≤ 1)
 * @returns {Object} - {val: 情報量, steps: 計算過程}
 */
function calcI(p){
  const val = C.information(p);
  if (val === null) return { val, steps: t('probability') };
  return { val, steps: p === 0 ? t('zero') : 'I = −log₂(' + p + ') = ' + fmt(val, 6) + ' bit' };
}
function updateCalc(){
  const result = C.distribution(pEls.map(el => el.value));
  sumEl.textContent = fmt(result.sum, 5);
  errEl.classList.toggle('hidden', !result.error);
  errEl.textContent = result.error ? errorText(result.error) : '';
  pEls.forEach((el, idx) => {
    el.setAttribute('aria-invalid', String(C.probability(el.value) === null));
    const value = result.error ? { val: null, steps: errorText(result.error) } : calcI(result.ps[idx]);
    iEls[idx].textContent = bit(value.val);
    sEls[idx].textContent = value.steps;
  });
}
pEls.forEach(el=>el.addEventListener('input', updateCalc));
updateCalc();

// シナリオ
document.querySelectorAll('.scenario').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const scn = btn.dataset.scn;
    if(scn==='fair'){ pEls[0].value=0.5; pEls[1].value=0.5; pEls[2].value=0; pEls[3].value=0; }
    if(scn==='biased'){ pEls[0].value=0.6; pEls[1].value=0.4; pEls[2].value=0; pEls[3].value=0; }
    if(scn==='trick'){ pEls[0].value=1.0; pEls[1].value=0; pEls[2].value=0; pEls[3].value=0; }
    if(scn==='stand'){ pEls[0].value=0.49995; pEls[1].value=0.49995; pEls[2].value=0.0001; pEls[3].value=0; }
    updateCalc();
  });
});

/* ========= 3. 加算性 ========= */
// 一般 A, B
const paEl = document.getElementById('pa');
const pbEl = document.getElementById('pb');
const IAEl = document.getElementById('IA');
const IBEl = document.getElementById('IB');
const IABEl = document.getElementById('IAB');
const addStepsEl = document.getElementById('add-steps');

function updateAdd(){
  const result = C.independent(paEl.value, pbEl.value);
  IAEl.textContent = bit(result.ia);
  IBEl.textContent = bit(result.ib);
  IABEl.textContent = bit(result.combined);
  addStepsEl.textContent = result.error ? errorText(result.error) :
    t('independent') + '\n' + result.pa + ' × ' + result.pb + ' = ' + result.product +
    '\nI(A) + I(B) = ' + fmt(result.ia, 6) + ' + ' + fmt(result.ib, 6) +
    ' = ' + fmt(result.combined, 6) + ' bit\n' +
    t(result.underflow ? 'underflow' : result.combined === Infinity ? 'extended' : 'verified');
}
[paEl, pbEl].forEach(el=>el.addEventListener('input', updateAdd));
updateAdd();

// マンション例
const floorsEl = document.getElementById('floors');
const perfloorEl = document.getElementById('perfloor');
const IfloorEl = document.getElementById('Ifloor');
const IroomEl = document.getElementById('Iroom');
const ItotalEl = document.getElementById('Itotal');
const aptStepsEl = document.getElementById('apt-steps');

function updateApt(){
  const r = C.rooms(floorsEl.value, perfloorEl.value);
  IfloorEl.textContent = bit(r.floorBits);
  IroomEl.textContent = bit(r.roomBits);
  ItotalEl.textContent = bit(r.totalBits);
  aptStepsEl.textContent = r.error ? errorText(r.error) : t('roomSteps', {
    f: r.floors, r: r.perFloor, n: r.total, a: fmt(r.floorBits), b: fmt(r.roomBits), c: fmt(r.totalBits)
  });
}
[floorsEl, perfloorEl].forEach(el=>el.addEventListener('input', updateApt));
updateApt();

/* ========= 4. 性質：スライダー ========= */
const propP = document.getElementById('propP');
const propPval = document.getElementById('propPval');
const propIval = document.getElementById('propIval');
function updateProp(){
  const p = Number(propP.value);
  propPval.textContent = p.toFixed(4);
  const I = (p>0 && p<=1)? -log2(p) : NaN;
  propIval.textContent = Number.isFinite(I)? I.toFixed(4) : '—';
}
propP?.addEventListener('input', updateProp);
updateProp();

/* ========= 5. エントロピー ========= */
const hxEls = Array.from(document.querySelectorAll('.hx'));
const hsumEl = document.getElementById('hsum');
const herrEl = document.getElementById('herr');
const hvalEl = document.getElementById('hval');
const hstepsEl = document.getElementById('hsteps');

function entropy(ps){
  return C.distribution(ps);
}

function updateH(){
  const r = entropy(hxEls.map(el => el.value));
  hsumEl.textContent = fmt(r.sum, 6);
  herrEl.classList.toggle('hidden', !r.error);
  herrEl.textContent = r.error ? errorText(r.error) : '';
  hxEls.forEach(el => el.setAttribute('aria-invalid', String(C.probability(el.value) === null)));
  hvalEl.textContent = bit(r.entropy);
  hstepsEl.textContent = r.error ? errorText(r.error) :
    'H = −Σ p log₂p\n' + r.ps.map((p, i) => p === 0 ? t('zeroTerm') :
      '− ' + p + ' × log₂(' + p + ') = ' + fmt(r.terms[i], 6)).join('\n') +
    '\nH = ' + fmt(r.entropy, 6) + ' bit';
}
hxEls.forEach(el=>el.addEventListener('input', updateH));
updateH();

/* ========= 新機能: 基礎知識タブのクイズシステム ========= */

// Answers are stable IDs; explanations are localized separately.
const quizAnswers = { q1: 'b', q2: 'a', q3: 'b' };
function updateQuizScore() {
  let count = 0;
  for (const [name, correct] of Object.entries(quizAnswers)) {
    const selected = document.querySelector('input[name="' + name + '"]:checked');
    const result = document.getElementById(name + '-result');
    const ok = selected?.value === correct;
    result.textContent = selected ? (ok ? '✓ ' + t('correct') : '✗ ' + t('incorrect')) + ': ' + t(name) : '';
    result.closest('.quiz-question').classList.toggle('correct', Boolean(ok));
    if (ok) count++;
  }
  document.getElementById('quiz-total').textContent = t('quizTotal', { n: count });
}
document.querySelectorAll('.quiz-options input').forEach(el => el.addEventListener('change', updateQuizScore));
document.getElementById('quiz-reset').addEventListener('click', () => {
  document.querySelectorAll('.quiz-options input').forEach(el => { el.checked = false; });
  updateQuizScore();
});

/* ========= 新機能: 体感タブの驚き度システム ========= */

// Each entry is an individual event, not necessarily a disjoint exhaustive distribution.
const scenarios = {
  coin: { heads: .5, tails: .5, edge: .0001, broken: .00001 },
  dice: { one: 1/6, even: .5, seven: 0, sixOnes: 1/46656 },
  lottery: { lose: .999, smallWin: .0009, jackpot: .00000001, rareWin: .0000000001 },
  weather: { sun: .4, rain: .3, snow: .0001, rareWeather: .0000000001 }
};
let currentEvent = { probability: .5, name: 'heads' };
let intuitionData = [];
function refreshScenario(reset = false) {
  const key = document.getElementById('scenario-select').value;
  const events = scenarios[key];
  const eventSelect = document.getElementById('event-select');
  const previous = eventSelect.value;
  eventSelect.replaceChildren();
  Object.keys(events).forEach(id => {
    const option = document.createElement('option');
    option.value = id; option.textContent = t(id);
    eventSelect.appendChild(option);
  });
  if (!reset && Object.hasOwn(events, previous)) eventSelect.value = previous;
  currentEvent = { probability: events[eventSelect.value], name: eventSelect.value };
  document.getElementById('scenario-title').textContent = t(key);
  document.getElementById('scenario-desc').textContent = t(key + 'Desc');
  updateEventDisplay();
  updateIntuitionDisplay();
}
document.getElementById('scenario-select').addEventListener('change', () => {
  refreshScenario(true); hideResult();
});
document.getElementById('event-select').addEventListener('change', function () {
  const events = scenarios[document.getElementById('scenario-select').value];
  currentEvent = { name: this.value, probability: events[this.value] };
  updateEventDisplay(); updateIntuitionDisplay(); hideResult();
});

// 結果表示/非表示の制御
function hideResult() {
  const resultEl = document.querySelector('.comparison-result');
  const buttonEl = document.getElementById('reveal-answer');
  if (resultEl) {
    resultEl.classList.remove('visible');
  }
  if (buttonEl) {
    buttonEl.textContent = t('reveal');
    buttonEl.disabled = false;
  }
}

// 出来事表示更新
function updateEventDisplay() {
  document.getElementById('selected-event').textContent = t(currentEvent.name);
}

// The latest valid inputs are used; no delayed callbacks mutate a newer selection.
document.getElementById('reveal-answer').addEventListener('click', function () {
  updateIntuitionDisplay();
  document.querySelector('.comparison-result').classList.add('visible');
  this.textContent = t('revealed');
});

// 驚き度スライダー
document.getElementById('surprise-level')?.addEventListener('input', function() {
  document.getElementById('surprise-display').textContent = this.value;
  updateIntuitionDisplay();
});

// 確率推測
document.getElementById('prob-guess')?.addEventListener('input', updateIntuitionDisplay);

// 直感表示更新
function updateIntuitionDisplay() {
  const percent = C.number(document.getElementById('prob-guess').value, 0, 100);
  const r = percent === null ? { error: 'guessError' } : C.compare(percent / 100, currentEvent.probability);
  document.getElementById('actual-prob').textContent = (currentEvent.probability * 100).toPrecision(6) + '%';
  document.getElementById('theoretical-info').textContent = bit(C.information(currentEvent.probability));
  document.getElementById('guess-info').textContent = bit(r.ia);
  document.getElementById('intuition-explanation').textContent = r.error ? t('guessError') : t('comparison', {
    guess: fmt(r.ia), actual: fmt(r.ib), difference: fmt(r.informationDifference)
  });
  document.getElementById('prob-guess').setAttribute('aria-invalid', String(Boolean(r.error)));
  document.getElementById('add-data-point').disabled = Boolean(r.error) || intuitionData.length >= 100;
  document.getElementById('record-note').textContent = t(intuitionData.length >= 100 ? 'countLimit' : 'graphNote');
}

// Record both the predicted and model probability, keeping zero-probability events explicit.
document.getElementById('add-data-point').addEventListener('click', function () {
  const percent = C.number(document.getElementById('prob-guess').value, 0, 100);
  if (percent === null || intuitionData.length >= 100) return;
  intuitionData.push({ surprise: Number(document.getElementById('surprise-level').value),
    theoretical: C.information(currentEvent.probability), event: currentEvent.name,
    predicted: percent / 100, probability: currentEvent.probability });
  renderRecords(); updateIntuitionDisplay(); drawIntuitionGraph();
});
document.getElementById('clear-data').addEventListener('click', () => {
  intuitionData = [];
  renderRecords(); updateIntuitionDisplay(); drawIntuitionGraph();
});
function renderRecords() {
  document.getElementById('point-count').textContent = intuitionData.length;
  const list = document.getElementById('record-list');
  list.replaceChildren();
  intuitionData.forEach(point => {
    const item = document.createElement('li');
    item.textContent = t(point.event) + ' / ' + t('surprise') + ': ' + point.surprise +
      ' / ' + t('guess') + ': ' + (point.predicted * 100).toPrecision(6) + '%' +
      ' / ' + t('setting') + ': ' + (point.probability * 100).toPrecision(6) + '%' +
      ' / I: ' + bit(point.theoretical);
    list.appendChild(item);
  });
}

// 直感グラフ描画
function drawIntuitionGraph() {
  const canvas = document.getElementById('intuition-graph');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // テーマ対応色
  const isDark = html.getAttribute('data-theme') !== 'light';
  ctx.fillStyle = isDark ? '#dfe9ff' : '#495057';
  ctx.strokeStyle = isDark ? '#344665' : '#6c757d';
  ctx.font = '12px ui-sans-serif';

  // 軸描画
  const margin = 60;
  const graphW = W - 2 * margin;
  const graphH = H - 2 * margin;

  ctx.strokeRect(margin, margin, graphW, graphH);
  ctx.fillText(t('subject'), W/2 - 50, H - 20);
  ctx.save();
  ctx.translate(20, H/2);
  ctx.rotate(-Math.PI/2);
  ctx.fillText(t('information'), -70, 0);
  ctx.restore();

  const finitePoints = intuitionData.filter(point => Number.isFinite(point.theoretical));
  const maxBits = Math.max(4, ...finitePoints.map(point => Math.ceil(point.theoretical / 4) * 4));

  // データポイント描画
  ctx.fillStyle = isDark ? '#49d492' : '#28a745';
  finitePoints.forEach(point => {
    const x = margin + (point.surprise - 1) / 9 * graphW;
    const y = margin + graphH - point.theoretical / maxBits * graphH;

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
  });

  // 軸ラベル
  ctx.fillStyle = isDark ? '#9fb0c3' : '#6c757d';
  for (let i = 1; i <= 10; i += 2) {
    const x = margin + (i - 1) / 9 * graphW;
    ctx.fillText(i.toString(), x - 3, H - margin + 15);
  }
  for (let i = 0; i <= maxBits; i += maxBits / 4) {
    const y = margin + graphH - i / maxBits * graphH;
    ctx.fillText(i.toString(), margin - 20, y + 4);
  }
}

/* ========= 新機能: 応用タブの計算機能 ========= */

// パスワード強度計算
function updatePasswordEntropy() {
  const r = C.password(document.getElementById('pwd-length').value, document.getElementById('char-types').value);
  document.getElementById('pwd-entropy').textContent = bit(r.bits);
  document.getElementById('guess-count').textContent = r.error ? '—' : t('attempts', { n: r.average.toExponential(6) });
  document.getElementById('security-level').textContent = r.error ? errorText(r.error) : t('model');
}

document.getElementById('pwd-length')?.addEventListener('input', updatePasswordEntropy);
document.getElementById('char-types')?.addEventListener('input', updatePasswordEntropy);

// 初期化
updatePasswordEntropy();

// タブ切り替え時の描画更新
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    if (tabId === 'tab-intuition') {
      // 体感タブ初期化
      updateIntuitionDisplay();
      drawIntuitionGraph();
    } else if (tabId === 'tab-prop') {
      // 性質タブ初期化
      updatePropertiesDisplay();
      drawMonotonicGraph();
    }
  });
});

/* ========= 新機能: 性質タブのインタラクティブ機能 ========= */

// 単調減少性の可視化
function drawMonotonicGraph() {
  const canvas = document.getElementById('monotonic-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // テーマ対応色
  const isDark = html.getAttribute('data-theme') !== 'light';
  ctx.fillStyle = isDark ? '#dfe9ff' : '#495057';
  ctx.strokeStyle = isDark ? '#344665' : '#6c757d';
  ctx.font = '12px ui-sans-serif';

  // 軸描画
  const margin = 40;
  const graphW = W - 2 * margin;
  const graphH = H - 2 * margin;

  ctx.strokeRect(margin, margin, graphW, graphH);
  ctx.fillText('P', W - 30, H - 20);
  ctx.fillText('I(bit)', 10, 30);

  // 情報量曲線
  ctx.strokeStyle = isDark ? '#5aa9ff' : '#0066cc';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= graphW; i++) {
    const P = Math.max(0.001, i / graphW);
    const I = -log2(P);
    const x = margin + i;
    const y = margin + graphH - Math.min(I, 8) / 8 * graphH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 現在の点
  const currentP = parseFloat(document.getElementById('propP')?.value || 0.5);
  const currentI = -log2(currentP);
  const currentX = margin + currentP * graphW;
  const currentY = margin + graphH - Math.min(currentI, 8) / 8 * graphH;

  ctx.fillStyle = isDark ? '#ff6b6b' : '#dc3545';
  ctx.beginPath();
  ctx.arc(currentX, currentY, 6, 0, 2 * Math.PI);
  ctx.fill();

  // 軸ラベル
  ctx.fillStyle = isDark ? '#9fb0c3' : '#6c757d';
  for (let i = 0; i <= 4; i++) {
    const p = i / 4;
    const x = margin + p * graphW;
    ctx.fillText(p.toFixed(1), x - 10, H - margin + 15);
  }
  for (let i = 0; i <= 8; i += 2) {
    const y = margin + graphH - i / 8 * graphH;
    ctx.fillText(i.toString(), margin - 20, y + 4);
  }
}

// 連続性計算
function updateContinuityDemo() {
  const r = C.compare(document.getElementById('p1-input').value, document.getElementById('p2-input').value);
  document.getElementById('i1-result').textContent = fmt(r.ia);
  document.getElementById('i2-result').textContent = fmt(r.ib);
  document.getElementById('p-diff').textContent = fmt(r.probabilityDifference);
  document.getElementById('i-diff').textContent = fmt(r.informationDifference);
  document.getElementById('continuity-verdict').textContent = r.error ? errorText(r.error) :
    t(r.pa === 0 || r.pb === 0 ? 'continuityZero' : 'continuity');
}

// 加法性の計算
function updateAdditivityDemo() {
  const r = C.independent(document.getElementById('custom-pa').value, document.getElementById('custom-pb').value);
  for (const [id, value] of Object.entries({
    'custom-ia': r.ia, 'custom-ib': r.ib, 'custom-pab': r.product,
    'custom-iab': r.combined, 'custom-sum': r.combined
  })) document.getElementById(id).textContent = fmt(value);
  document.getElementById('additivity-check').textContent = r.error ? errorText(r.error) :
    t(r.underflow ? 'underflow' : r.combined === Infinity ? 'extended' : 'verified');
}

// 規格化の計算
function updateNormalizationDemo() {
  const base = document.getElementById('norm-base')?.value || '2';
  let logFunc, unit;

  switch(base) {
    case 'e':
      logFunc = Math.log;
      unit = 'nat';
      break;
    case '10':
      logFunc = (x) => Math.log(x) / Math.log(10);
      unit = 'dit';
      break;
    default:
      logFunc = log2;
      unit = 'bit';
  }

  const half = -logFunc(0.5);
  const quarter = -logFunc(0.25);
  const tenth = -logFunc(0.1);

  document.getElementById('half-norm').textContent = fmt(half, 3) + ' ' + unit;
  document.getElementById('quarter-norm').textContent = fmt(quarter, 3) + ' ' + unit;
  document.getElementById('tenth-norm').textContent = fmt(tenth, 3) + ' ' + unit;
}

// 性質タブの全体更新
function updatePropertiesDisplay() {
  updateContinuityDemo();
  updateAdditivityDemo();
  updateNormalizationDemo();
}

// イベントリスナー
document.getElementById('propP')?.addEventListener('input', function() {
  document.getElementById('propPval').textContent = parseFloat(this.value).toFixed(4);
  document.getElementById('propIval').textContent = fmt(-log2(parseFloat(this.value)), 4);
  drawMonotonicGraph();
});

document.getElementById('p1-input')?.addEventListener('input', updateContinuityDemo);
document.getElementById('p2-input')?.addEventListener('input', updateContinuityDemo);
document.getElementById('custom-pa')?.addEventListener('input', updateAdditivityDemo);
document.getElementById('custom-pb')?.addEventListener('input', updateAdditivityDemo);
document.getElementById('norm-base')?.addEventListener('change', updateNormalizationDemo);

// 初期化
updatePropertiesDisplay();

function redrawGraphs() {
  drawILog(); drawCompare(); drawIntuitionGraph(); drawMonotonicGraph();
}
refreshScenario(true);
renderRecords();
updateQuizScore();
