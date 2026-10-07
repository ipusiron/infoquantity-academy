/* Dynamic UI messages. Static lesson translations are in lesson-en.js. */
(function (root) {
  'use strict';
  const ja = {
    probability: '確率を0以上1以下の数値で入力してください。空欄は0ではありません。',
    sum: '確率の合計を1にしてください（許容誤差0.000001）。自動補正はしません。',
    rooms: '階数と部屋数を1～1000の整数で入力してください。',
    password: '文字数は1～100、文字種類数は1～95の整数で入力してください。',
    base: '底aを1より大きく100以下の数値で入力してください。',
    zero: 'P=0：log₂0は実数では未定義です。P→0⁺の極限として∞を表示します。',
    zeroTerm: 'P=0の項は、極限により0として扱います。',
    independent: '独立を仮定：P(A∧B)=P(A)×P(B)',
    extended: '確率0を含むため∞です。∞どうしの差や一致率は計算しません。',
    underflow: '確率の積が数値表現の下限未満です。情報量は対数の和で計算しています。',
    verified: '有限値で加算性を確認できます（表示は丸めています）。',
    roomSteps: '全室を等確率と仮定。{f}階×各階{r}室＝{n}室\nI(階)={a} bit\nI(号室)={b} bit\nI(部屋)={c} bit',
    continuity: '0<P≤1で連続です。0に近いほど同じ確率差でも情報量の変化が大きくなります。2点の比較だけで連続性を判定しません。',
    continuityZero: 'P=0では有限の情報量を定義できません。∞どうしの差は表示しません。',
    correct: '正解', incorrect: '不正解', quizTotal: '正解数: {n}/3',
    q1: 'log₂8=3（2³=8）', q2: 'log₂(1/4)=−2（2⁻²=1/4）', q3: '2⁴=16なのでx=4',
    reveal: '④設定値と比較する', revealed: '比較を表示中',
    guessError: '予想確率を0～100%の数値で入力してください。',
    comparison: '予想の情報量：{guess} bit。設定値の情報量：{actual} bit。差：{difference} bit。驚き度には正解も不正解もありません。',
    model: '独立で一様な選択を仮定したモデルです。実際の安全性は判定しません。',
    attempts: '{n} 回', subject: '驚き度（主観）', information: '設定値の情報量 [bit]',
    countLimit: '記録は100点までです。追加する場合はデータをクリアしてください。',
    graphNote: '有限値だけを点で表示します。∞の記録は一覧で確認できます。',
    event: '出来事', surprise: '驚き度', guess: '予想確率', setting: '設定確率',
    coin: 'コイン投げ', dice: 'サイコロ', lottery: 'くじ', weather: '天気',
    coinDesc: '教材で設定した、個別の出来事の確率です。',
    diceDesc: '公正な6面サイコロを使うモデルです。',
    lotteryDesc: '教材用のくじの設定です。実在する宝くじの当選確率ではありません。',
    weatherDesc: '教材用の天気の設定です。観測値や予報値ではありません。',
    heads: '表が出た', tails: '裏が出た', edge: '立った', broken: '割れた',
    one: '1が出た', even: '偶数が出た', seven: '7が出た', sixOnes: '6回とも1が出た',
    lose: 'はずれ', smallWin: '小当たり', jackpot: '特賞', rareWin: '特にまれな当たり',
    sun: '晴れ', rain: '雨', snow: '雪（夏）', rareWeather: 'まれな天気',
    theme: 'ライト／ダークを切り替える', tabs: '学習タブ', invalid: '入力を確認してください。'
  };
  const en = {
    probability: 'Enter a probability from 0 to 1. An empty field is not zero.',
    sum: 'Probabilities must sum to 1 (tolerance 0.000001). Values are not adjusted automatically.',
    rooms: 'Enter integers from 1 to 1000 for floors and rooms per floor.',
    password: 'Enter an integer length from 1 to 100 and alphabet size from 1 to 95.',
    base: 'Enter a base greater than 1 and no greater than 100.',
    zero: 'P=0: log₂0 is undefined over the reals. ∞ denotes the limit as P approaches zero from above.',
    zeroTerm: 'A term with P=0 contributes zero, by its limit.',
    independent: 'Assuming independence: P(A∩B)=P(A)×P(B)',
    extended: 'A zero probability gives ∞. Differences or agreement percentages between infinities are not computed.',
    underflow: 'The product underflows the numeric range. Information is calculated by adding logarithms.',
    verified: 'Additivity holds for these finite values (displayed values are rounded).',
    roomSteps: 'Assuming equally likely rooms: {f} floors × {r} rooms = {n} rooms\nI(floor)={a} bit\nI(room on floor)={b} bit\nI(room)={c} bit',
    continuity: 'Continuous for 0<P≤1. Near zero, the same probability difference can cause a larger information difference. Two points do not test continuity.',
    continuityZero: 'At P=0 there is no finite information value. A difference between two infinities is not displayed.',
    correct: 'Correct', incorrect: 'Incorrect', quizTotal: 'Correct answers: {n}/3',
    q1: 'log₂8=3 (2³=8)', q2: 'log₂(1/4)=−2 (2⁻²=1/4)', q3: '2⁴=16, so x=4',
    reveal: '④ Compare with the model', revealed: 'Comparison shown',
    guessError: 'Enter a predicted probability from 0 to 100%.',
    comparison: 'Predicted information: {guess} bit. Model information: {actual} bit. Difference: {difference} bit. Subjective surprise is not right or wrong.',
    model: 'Assumes independent uniform choices. This is not an assessment of actual security.',
    attempts: '{n} guesses', subject: 'Subjective surprise', information: 'Model information [bit]',
    countLimit: 'Up to 100 records. Clear the data before adding more.',
    graphNote: 'Only finite values are plotted. Infinite values remain in the record list.',
    event: 'Event', surprise: 'Surprise', guess: 'Predicted probability', setting: 'Model probability',
    coin: 'Coin', dice: 'Die', lottery: 'Lottery', weather: 'Weather',
    coinDesc: 'Probabilities assigned to individual events for this lesson.',
    diceDesc: 'A model using a fair six-sided die.',
    lotteryDesc: 'A teaching model, not the odds of a real lottery.',
    weatherDesc: 'A teaching model, not observations or a forecast.',
    heads: 'Heads', tails: 'Tails', edge: 'Lands on its edge', broken: 'Breaks',
    one: 'Rolls a 1', even: 'Rolls an even number', seven: 'Rolls a 7', sixOnes: 'Rolls a 1 six times',
    lose: 'No prize', smallWin: 'Small prize', jackpot: 'Top prize', rareWin: 'An especially rare prize',
    sun: 'Sunny', rain: 'Rain', snow: 'Snow in summer', rareWeather: 'Rare weather',
    theme: 'Switch light/dark theme', tabs: 'Learning tabs', invalid: 'Check the input.'
  };
  const api = { ja, en };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    root.InfoMessages = api;
    root.t = (key, args = {}) => {
      const value = api[document.documentElement.lang === 'en' ? 'en' : 'ja'][key];
      if (value === undefined) throw new Error('Missing message: ' + key);
      return value.replace(/\{(\w+)\}/g, (_, k) => String(args[k] ?? ''));
    };
  }
})(globalThis);
