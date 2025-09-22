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
const fmt = (x, d=4) => (Number.isFinite(x) ? x.toFixed(d) : "—");

/* ========= テーマ切り替えシステム ========= */
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const html = document.documentElement;

// 初期化: ローカルストレージからテーマ設定を復元
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
themeIcon.textContent = savedTheme === 'light' ? '🌙' : '☀️';

// テーマ切り替えイベント
themeToggle.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  // テーマ適用とアイコン更新
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeIcon.textContent = newTheme === 'light' ? '🌙' : '☀️';

  // Canvas描画はテーマ依存のため再描画が必要
  if (document.querySelector('.panel.active').id === 'tab-def') {
    drawILog();
    drawCompare();
  }
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
  const a = Number(document.getElementById('cmp-base')?.value || 2);
  const canvas = document.getElementById('canvas-compare');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);

  // テーマ判定
  const isDark = html.getAttribute('data-theme') !== 'light';

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
  // 入力値の検証とサニタイズ
  if (!Number.isFinite(p)) return { val: NaN, steps: '無効な入力値' };
  p = Math.max(0, Math.min(1, p)); // [0,1]区間にクランプ

  // 特殊ケースの処理
  if(p === 0) return { val: NaN, steps: 'P=0 のとき log₂0 は未定義 → 計算不能' };
  if(p < 0) return { val: NaN, steps: 'P<0 は不正' };
  if(p > 1) return { val: NaN, steps: 'P>1 は不正' };

  // 情報量計算
  const I = -log2(p);
  const steps =
`I = -log₂(P)
  = -log₂(${p})
  = ${(-1).toString()} × ${fmt(log2(p),6)}
  = ${fmt(I,6)} bit`;
  return { val: I, steps };
}
function updateCalc(){
  const ps = pEls.map(el=>{
    let val = Number(el.value);
    // Sanitize input
    if (!Number.isFinite(val)) val = 0;
    val = Math.max(0, Math.min(1, val));
    return val;
  });
  const s = ps.reduce((a,b)=>a+b,0);
  sumEl.textContent = s.toFixed(5);
  if(Math.abs(s-1) > 1e-6){
    errEl.classList.remove('hidden');
  } else {
    errEl.classList.add('hidden');
  }
  ps.forEach((p,idx)=>{
    const {val, steps} = calcI(p);
    iEls[idx].textContent = Number.isFinite(val) ? fmt(val,4) + ' bit' : '計算不能';
    sEls[idx].textContent = steps;
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
  let pa = Number(paEl.value);
  let pb = Number(pbEl.value);
  // Sanitize inputs
  if (!Number.isFinite(pa)) pa = 0;
  if (!Number.isFinite(pb)) pb = 0;
  pa = Math.max(0, Math.min(1, pa));
  pb = Math.max(0, Math.min(1, pb));
  const IA = (pa>0 && pa<=1) ? -log2(pa) : NaN;
  const IB = (pb>0 && pb<=1) ? -log2(pb) : NaN;
  const pab = pa*pb;
  const IAB = (pab>0 && pab<=1) ? -log2(pab) : NaN;

  IAEl.textContent = Number.isFinite(IA) ? fmt(IA,4)+' bit' : '計算不能';
  IBEl.textContent = Number.isFinite(IB) ? fmt(IB,4)+' bit' : '計算不能';
  IABEl.textContent = Number.isFinite(IAB) ? fmt(IAB,4)+' bit' : '計算不能';

  addStepsEl.textContent =
`独立事象:  P(A∧B) = P(A) × P(B) = ${fmt(pa)} × ${fmt(pb)} = ${fmt(pab)}
I(A)   = -log₂ P(A) = ${Number.isFinite(IA)?fmt(IA,6):'—'}
I(B)   = -log₂ P(B) = ${Number.isFinite(IB)?fmt(IB,6):'—'}
I(A∧B) = -log₂ P(A∧B) = -log₂(${fmt(pab)}) = ${Number.isFinite(IAB)?fmt(IAB,6):'—'}

確認:  I(A∧B)  = I(A) + I(B)  ≈  ${Number.isFinite(IA)&&Number.isFinite(IB)?fmt(IA+IB,6):'—'}`;
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
  let F = Number(floorsEl.value);
  let R = Number(perfloorEl.value);
  // Sanitize inputs
  if (!Number.isFinite(F) || F < 1) F = 1;
  if (!Number.isFinite(R) || R < 1) R = 1;
  F = Math.max(1, Math.min(1000, Math.floor(F))); // Cap at reasonable values
  R = Math.max(1, Math.min(1000, Math.floor(R)));
  const total = F*R;
  // I(階特定) = -log2(1/F), I(号室特定) = -log2(1/R), I(部屋特定) = -log2(1/(F*R))
  const If = -log2(1/F);
  const Ir = -log2(1/R);
  const It = -log2(1/total);

  IfloorEl.textContent = fmt(If,4)+' bit';
  IroomEl.textContent = fmt(Ir,4)+' bit';
  ItotalEl.textContent = fmt(It,4)+' bit';

  aptStepsEl.textContent =
`総部屋数 = 階数 × 各階の部屋数 = ${F} × ${R} = ${total}
I(階の特定)     = -log₂(1/${F})   = ${fmt(If,6)} bit
I(号室の特定)   = -log₂(1/${R})   = ${fmt(Ir,6)} bit
I(部屋番号の特定) = -log₂(1/${total}) = ${fmt(It,6)} bit

確認: I(階) + I(号室) = ${fmt(If+Ir,6)} ≟ I(部屋) = ${fmt(It,6)}`;
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
  // H = - Σ p log2 p ; 0 log 0 は 0 とみなす（極限）
  let H = 0;
  let terms = [];
  for(const p of ps){
    if(p > 0){
      const t = -p * log2(p);
      H += t;
      terms.push(`- ${p.toFixed(6)} × log₂(${p.toFixed(6)}) = ${t.toFixed(6)}`);
    } else if (p===0){
      terms.push(`- 0 × log₂(0) → 0（極限的に 0 と扱う）`);
    }
  }
  return {H, terms};
}

function updateH(){
  const ps = hxEls.map(el=>Number(el.value));
  const s = ps.reduce((a,b)=>a+b,0);
  hsumEl.textContent = s.toFixed(4);
  if(Math.abs(s-1)>1e-6){ herrEl.classList.remove('hidden'); } else { herrEl.classList.add('hidden'); }
  const {H, terms} = entropy(ps);
  hvalEl.textContent = fmt(H,6) + ' bit';
  hstepsEl.textContent = `H = - Σ p log₂ p
  = ${terms.length? terms.join('  +\n    ') : '—'}
  = ${fmt(H,6)} bit`;
}
hxEls.forEach(el=>el.addEventListener('input', updateH));
updateH();

/* ========= 新機能: 基礎知識タブのクイズシステム ========= */

// クイズの正解と解説
const quizAnswers = {
  q1: { correct: 'b', explanation: 'log₂ 8 = 3 (2³ = 8 なので)' },
  q2: { correct: 'a', explanation: 'log₂ (1/4) = log₂ (2⁻²) = -2' },
  q3: { correct: 'b', explanation: '2ˣ = 16 = 2⁴ なので x = 4' }
};

let quizScore = 0;

// クイズ回答処理
document.querySelectorAll('input[type="radio"]').forEach(input => {
  input.addEventListener('change', function() {
    const questionName = this.name;
    const resultEl = document.getElementById(`${questionName}-result`);
    const answer = quizAnswers[questionName];

    if (this.value === answer.correct) {
      resultEl.innerHTML = `<span style="color: var(--accent2)">✓ 正解！</span> ${answer.explanation}`;
      this.closest('.quiz-question').classList.add('correct');
    } else {
      resultEl.innerHTML = `<span style="color: var(--warn)">✗ 不正解</span> ${answer.explanation}`;
      this.closest('.quiz-question').classList.remove('correct');
    }

    updateQuizScore();
  });
});

// クイズスコア更新
function updateQuizScore() {
  const correctCount = document.querySelectorAll('.quiz-question.correct').length;
  const totalEl = document.getElementById('quiz-total');
  if (totalEl) {
    totalEl.textContent = `正解数: ${correctCount}/3`;
    if (correctCount >= 2) {
      totalEl.style.color = 'var(--accent2)';
      totalEl.innerHTML += ' <span style="font-size: 12px">合格レベル！</span>';
    }
  }
}

// クイズリセット
document.getElementById('quiz-reset')?.addEventListener('click', function() {
  document.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);
  document.querySelectorAll('.quiz-result').forEach(el => el.innerHTML = '');
  document.querySelectorAll('.quiz-question').forEach(el => el.classList.remove('correct'));
  updateQuizScore();
});

/* ========= 新機能: 体感タブの驚き度システム ========= */

// シナリオデータ
const scenarios = {
  coin: {
    title: 'コイン投げ',
    description: '普通のコインを投げたとき...',
    events: {
      '表が出た': 0.5,
      '裏が出た': 0.5,
      '立った': 0.0001,
      '割れた': 0.00001
    }
  },
  dice: {
    title: 'サイコロ',
    description: '標準的な6面サイコロを振ったとき...',
    events: {
      '1が出た': 1/6,
      '偶数が出た': 0.5,
      '7が出た': 0,
      '全面同じ数': 0.000001
    }
  },
  lottery: {
    title: '宝くじ',
    description: '年末ジャンボ宝くじで...',
    events: {
      'はずれ': 0.999,
      '末等当選': 0.0009,
      '1等当選': 0.00000001,
      '隕石に当たる': 0.0000000001
    }
  },
  weather: {
    title: '天気予報',
    description: '明日の天気として...',
    events: {
      '晴れ': 0.4,
      '雨': 0.3,
      '雪（夏）': 0.0001,
      '隕石雨': 0.0000000001
    }
  }
};

let currentEvent = { probability: 0.5, name: '表が出た' };
let intuitionData = [];

// シナリオ選択
document.getElementById('scenario-select')?.addEventListener('change', function() {
  const scenario = scenarios[this.value];
  if (scenario) {
    document.getElementById('scenario-title').textContent = scenario.title;
    document.getElementById('scenario-desc').textContent = scenario.description;

    // イベント選択肢を更新
    const eventSelect = document.getElementById('event-select');
    if (eventSelect) {
      eventSelect.innerHTML = '';
      Object.keys(scenario.events).forEach(eventName => {
        const option = document.createElement('option');
        option.value = eventName;
        option.textContent = eventName;
        eventSelect.appendChild(option);
      });
    }

    // デフォルトイベントを設定
    const firstEvent = Object.keys(scenario.events)[0];
    currentEvent = {
      name: firstEvent,
      probability: scenario.events[firstEvent]
    };

    updateEventDisplay();
    updateIntuitionDisplay();
    hideResult(); // 結果を隠す
  }
});

// 出来事選択
document.getElementById('event-select')?.addEventListener('change', function() {
  const selectedScenario = scenarios[document.getElementById('scenario-select').value];
  if (selectedScenario && selectedScenario.events[this.value] !== undefined) {
    currentEvent = {
      name: this.value,
      probability: selectedScenario.events[this.value]
    };
    updateEventDisplay();
    updateIntuitionDisplay();
    hideResult(); // 結果を隠す
  }
});

// 結果表示/非表示の制御
function hideResult() {
  const resultEl = document.querySelector('.comparison-result');
  const buttonEl = document.getElementById('reveal-answer');
  if (resultEl) {
    resultEl.classList.remove('visible');
  }
  if (buttonEl) {
    buttonEl.textContent = '④答えを見る';
    buttonEl.disabled = false;
  }
}

// 出来事表示更新
function updateEventDisplay() {
  const selectedEventEl = document.getElementById('selected-event');
  if (selectedEventEl) {
    selectedEventEl.textContent = `「${currentEvent.name}」`;
  }
}

// 答えを見るボタン
document.getElementById('reveal-answer')?.addEventListener('click', function() {
  const resultEl = document.querySelector('.comparison-result');
  if (resultEl) {
    resultEl.classList.add('visible');
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // ボタンテキストを変更
    this.textContent = '結果表示中';
    this.disabled = true;

    // 3秒後にボタンを再有効化
    setTimeout(() => {
      this.textContent = '④答えを見る';
      this.disabled = false;
    }, 3000);
  }
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
  const surpriseLevel = parseInt(document.getElementById('surprise-level')?.value || 5);
  const probGuess = parseFloat(document.getElementById('prob-guess')?.value || 50) / 100;

  // 理論的情報量
  const theoreticalInfo = currentEvent.probability > 0 ? -log2(currentEvent.probability) : Infinity;

  // 体感との一致度（驚き度を情報量に変換して比較）
  // 改善: より適切なスケーリングと高情報量への対応
  let surpriseInfo;
  if (surpriseLevel <= 5) {
    surpriseInfo = (surpriseLevel - 1) * 0.5; // 1-5 → 0-2 bit (低確率域)
  } else {
    surpriseInfo = 2 + (surpriseLevel - 5) * 4; // 6-10 → 2-22 bit (高確率域)
  }

  // 一致度計算の改善: 極端な情報量でも適切に評価
  let matchScore;
  if (theoreticalInfo > 20) {
    // 極高情報量 (宝くじ級): 驚き8以上なら高評価
    matchScore = surpriseLevel >= 8 ? 90 : Math.max(10, 50 - (8 - surpriseLevel) * 10);
  } else if (theoreticalInfo > 10) {
    // 高情報量: 驚き7以上で高評価
    matchScore = surpriseLevel >= 7 ? 85 : Math.max(20, 70 - Math.abs(theoreticalInfo - surpriseInfo) * 5);
  } else {
    // 通常範囲: 従来の計算
    matchScore = Math.max(0, 100 - Math.abs(theoreticalInfo - surpriseInfo) * 15);
  }

  // UI更新
  document.getElementById('actual-prob').textContent = (currentEvent.probability * 100).toFixed(4) + '%';
  document.getElementById('theoretical-info').textContent = fmt(theoreticalInfo, 2) + ' bit';
  document.getElementById('match-score').textContent = Math.round(matchScore) + '%';

  // 説明文生成
  const explanation = generateIntuitionExplanation(surpriseLevel, theoreticalInfo, matchScore);
  document.getElementById('intuition-explanation').textContent = explanation;
}

function generateIntuitionExplanation(surprise, theoretical, match) {
  if (theoretical > 20) {
    // 宝くじレベルの極低確率
    if (surprise >= 9) return `驚き度${surprise}は宝くじ級(${fmt(theoretical,1)} bit)に適切です。完璧な直感！`;
    if (surprise >= 7) return `驚き度${surprise}は宝くじ級(${fmt(theoretical,1)} bit)の出来事への反応として妥当です。`;
    return `宝くじ級(${fmt(theoretical,1)} bit)の出来事なら、もっと驚いても良いかも！`;
  } else if (theoretical > 10) {
    // 非常に稀な出来事
    if (surprise >= 7) return `驚き度${surprise}は非常に稀な出来事(${fmt(theoretical,1)} bit)への適切な反応です。`;
    return `${fmt(theoretical,1)} bitの稀な出来事です。もう少し驚いてもよいでしょう。`;
  } else {
    // 通常範囲
    if (match > 80) return `驚き度${surprise}は情報量${fmt(theoretical,1)} bitによく対応しています。優秀な直感です！`;
    if (match > 60) return `驚き度${surprise}は情報量${fmt(theoretical,1)} bitにまあまあ対応しています。`;
    if (match > 40) return `驚き度${surprise}と情報量${fmt(theoretical,1)} bitに少しズレがあります。`;
    return `驚き度${surprise}と情報量${fmt(theoretical,1)} bitのズレが大きいです。対数的感覚を養いましょう。`;
  }
}

// データポイント記録
document.getElementById('add-data-point')?.addEventListener('click', function() {
  const surprise = parseInt(document.getElementById('surprise-level').value);
  const theoretical = currentEvent.probability > 0 ? -log2(currentEvent.probability) : 16;

  intuitionData.push({ surprise, theoretical, event: currentEvent.name });
  document.getElementById('point-count').textContent = intuitionData.length;

  drawIntuitionGraph();
});

// データクリア
document.getElementById('clear-data')?.addEventListener('click', function() {
  intuitionData = [];
  document.getElementById('point-count').textContent = '0';
  drawIntuitionGraph();
});

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
  ctx.fillText('驚き度 (主観)', W/2 - 30, H - 20);
  ctx.save();
  ctx.translate(20, H/2);
  ctx.rotate(-Math.PI/2);
  ctx.fillText('情報量 (理論) [bit]', -40, 0);
  ctx.restore();

  // 理想線（y=x的な関係）描画
  ctx.strokeStyle = isDark ? '#5aa9ff' : '#0066cc';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(margin, margin + graphH);
  ctx.lineTo(margin + graphW, margin);
  ctx.stroke();
  ctx.setLineDash([]);

  // データポイント描画
  ctx.fillStyle = isDark ? '#49d492' : '#28a745';
  intuitionData.forEach(point => {
    const x = margin + (point.surprise - 1) / 9 * graphW;
    const y = margin + graphH - Math.min(point.theoretical, 16) / 16 * graphH;

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
  for (let i = 0; i <= 16; i += 4) {
    const y = margin + graphH - i / 16 * graphH;
    ctx.fillText(i.toString(), margin - 20, y + 4);
  }
}

/* ========= 新機能: 応用タブの計算機能 ========= */

// パスワード強度計算
function updatePasswordEntropy() {
  const length = parseInt(document.getElementById('pwd-length')?.value || 8);
  const charTypes = parseInt(document.getElementById('char-types')?.value || 62);

  const entropy = length * log2(charTypes);
  const guessCount = Math.pow(2, entropy - 1); // 平均試行回数

  let security = '弱い';
  if (entropy > 80) security = '非常に強い';
  else if (entropy > 60) security = '強い';
  else if (entropy > 40) security = '中程度';

  document.getElementById('pwd-entropy').textContent = fmt(entropy, 1) + ' bit';
  document.getElementById('guess-count').textContent = guessCount.toExponential(1) + ' 回';
  document.getElementById('security-level').textContent = security;
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
  const p1 = parseFloat(document.getElementById('p1-input')?.value || 0.5);
  const p2 = parseFloat(document.getElementById('p2-input')?.value || 0.51);

  const i1 = -log2(p1);
  const i2 = -log2(p2);

  document.getElementById('i1-result').textContent = fmt(i1, 4);
  document.getElementById('i2-result').textContent = fmt(i2, 4);
  document.getElementById('p-diff').textContent = Math.abs(p2 - p1).toFixed(4);
  document.getElementById('i-diff').textContent = Math.abs(i2 - i1).toFixed(4);

  // 連続性判定
  const pDiff = Math.abs(p2 - p1);
  const iDiff = Math.abs(i2 - i1);
  const verdict = document.getElementById('continuity-verdict');

  if (pDiff < 0.1 && iDiff < 1.0) {
    verdict.textContent = '✅ 連続性が保たれています';
    verdict.style.color = 'var(--accent2)';
  } else if (pDiff < 0.2) {
    verdict.textContent = '⚠️ やや連続的です';
    verdict.style.color = 'var(--warn)';
  } else {
    verdict.textContent = '❌ 大きな変化です';
    verdict.style.color = 'var(--warn)';
  }
}

// 加法性の計算
function updateAdditivityDemo() {
  const pa = parseFloat(document.getElementById('custom-pa')?.value || 0.3);
  const pb = parseFloat(document.getElementById('custom-pb')?.value || 0.4);

  const ia = -log2(pa);
  const ib = -log2(pb);
  const pab = pa * pb;
  const iab = -log2(pab);
  const sum = ia + ib;

  document.getElementById('custom-ia').textContent = fmt(ia, 2);
  document.getElementById('custom-ib').textContent = fmt(ib, 2);
  document.getElementById('custom-pab').textContent = fmt(pab, 4);
  document.getElementById('custom-iab').textContent = fmt(iab, 2);
  document.getElementById('custom-sum').textContent = fmt(sum, 2);

  const match = Math.abs(iab - sum) < 0.001 ? 100 : Math.max(0, 100 - Math.abs(iab - sum) * 100);
  document.getElementById('additivity-check').textContent = Math.round(match) + '%';
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
