<!--
---
id: day073
slug: infoquantity-academy

title: "InfoQuantity Academy"

subtitle_ja: "情報量の基礎学習ツール"
subtitle_en: "Interactive Information Theory Learning Tool"

description_ja: "コンピューターサイエンスや数学に不慣れでも、情報量 I(a)=-log₂P(a) の直感と定義・性質を対話的に学べる入門ツール。対数クイズ、驚き度体感スライダー、計算例、加算性、エントロピーまで段階的に学習。"
description_en: "A beginner-friendly interactive web tool to grasp information quantity with definitions, worked examples, additivity, properties, and entropy. Learn Shannon's information theory through quizzes, intuition sliders, and interactive calculators."

category_ja:
  - 情報理論
category_en:
  - Information Theory

difficulty: 3

tags:
  - information-theory
  - information-quantity
  - shannon
  - entropy
  - education
  - visualization
  - javascript

repo_url: "https://github.com/ipusiron/infoquantity-academy"
demo_url: "https://ipusiron.github.io/infoquantity-academy/"

hub: true
---
-->

[English](README.en.md) · 日本語

# InfoQuantity Academy - 情報量の基礎学習ツール

![GitHub Repo stars](https://img.shields.io/github/stars/ipusiron/infoquantity-academy?style=social)
![GitHub forks](https://img.shields.io/github/forks/ipusiron/infoquantity-academy?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/ipusiron/infoquantity-academy)
![GitHub license](https://img.shields.io/github/license/ipusiron/infoquantity-academy)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue?logo=github)](https://ipusiron.github.io/infoquantity-academy/)

**Day073 - 生成AIで作るセキュリティツール100**

InfoQuantity Academyは、確率から情報量を計算し、対数・加算性・エントロピーを7つのタブで学ぶ入門ツールです。情報量は、設定した確率モデルでの「まれさ」の尺度であり、内容の重要性や人が感じる驚きとは区別します。

## 🌐 デモページ

[日本語で開く](https://ipusiron.github.io/infoquantity-academy/?lang=ja) · [Open in English](https://ipusiron.github.io/infoquantity-academy/?lang=en)

ブラウザーで利用できます。ダウンロードしたフォルダーのindex.htmlを直接開くこともできます。

## 📸 スクリーンショット

![コイン投げの情報量を計算する画面](assets/screenshot.png)

表と裏がそれぞれ0.5のモデルでは、どちらも1 bitです。

![予想確率と設定確率を比較する画面](assets/screenshot2.png)

予想確率25%と設定確率50%の情報量を比較します。主観の驚き度は採点しません。

![ダークテーマの情報量の定義とグラフ](assets/screenshot3.png)

確率と情報量の関係を確認できます。画像は1280×900pxです。

## 🎯 ねらい・できること

- 対数クイズとグラフで、I(a) = −log₂P(a)の定義を学習
- 予想確率と設定確率、およびそれぞれの情報量を比較
- 主観の驚き度を1～10で記録（最大100点、採点なし）
- 独立事象の加算性、単調性、連続性、規格化を確認
- 最大4事象の分布から平均情報量H(X)を計算
- 一様ランダムな文字列の候補数と平均推測回数を計算
- 日本語・英語、ライト・ダークテーマを切り替え

## 📖 使い方

まず「計算例」で「通常のコイン」を押してください。P(a₀)=P(a₁)=0.5で、それぞれの情報量が1 bitになることを確認できます。残りの事象は確率0なので情報量は∞と表示しますが、その事象が実際に起きるという意味ではありません。

### 推奨学習フロー

1. 「基礎知識」で3問の対数クイズに回答する。
2. 「情報量の定義」で確率と情報量の関係を確認する。
3. 「体感」で出来事を選び、驚き度と予想確率を入力して設定値と比較する。
4. 「計算例」「加算性」「性質」で値を変え、計算過程を確認する。
5. 「エントロピー・応用」で分布の偏りと平均情報量を比較する。

### 言語・テーマ・記録

言語の初期値はURLのlang=ja/en、保存設定、ブラウザーの言語の順に決まります。テーマは保存設定、OS設定の順です。保存できない環境でも利用できます。

言語を切り替えても入力・記録・クイズの回答は保持します。テーマと言語だけをlocalStorageに保存し、入力値や学習記録は保存しません。再読み込みすると記録は消えます。「データクリア」は体感タブの記録、「リセット」はクイズの回答を消します。

タブはTabキーで移動し、フォーカスがあるときに左右矢印・Home・Endでも切り替えられます。

## 👥 想定ユーザー

- 確率・対数・情報理論を学ぶ学生
- 授業で例題を示す教員
- 圧縮・異常度・予測モデルの前提を確認したい開発者
- 鍵の不確実性と暗号の安全強度を区別したい学習者

## 📋 タブ構成

| タブ | 内容 |
|---|---|
| 1. 基礎知識 | 対数の3問クイズと段階的な説明 |
| 2. 情報量の定義 | I(a)=−log₂P(a)、対数・指数・直線の比較 |
| 3. 体感 | 予想と設定の比較、主観の驚き度と情報量の記録 |
| 4. 計算例 | コインの4事象、プリセット、計算過程 |
| 5. 加算性 | 独立事象と等確率の部屋の特定 |
| 6. 性質 | 単調性・連続性・加法性・規格化 |
| 7. エントロピー・応用 | 平均情報量、圧縮、暗号、物理、機械学習 |

体感タブの出来事は個別の教材用設定です。同じシナリオ内でも、排反で全体を尽くす事象の一覧ではありません。天気やくじの確率は実測値・予報・実在する商品の当選確率ではありません。公正なサイコロで「6回とも1」は1/46656です。

## 🧮 情報量とエントロピー

### 定義と加算性

情報量はI(a)=−log₂P(a)です。独立なA、BではP(A∧B)=P(A)P(B)なので、I(A∧B)=I(A)+I(B)となります。独立でなければ、条件付き確率が必要です。

正の確率での加算性と単調性を仮定すると、対数の形が定まります。P=1/2の情報量を1と規格化すると単位はbitです。自然対数ではnat、底10ではditになります。

1/Pだけでは確率の積が情報量の和になりません。対数を取ることで、独立な情報を足し算で扱えます。

### 確率0と連続性

log₂0は実数では未定義です。本ツールはP→0⁺の極限を∞と表示します。離散モデルで確率0の事象が観測された場合は、モデルの前提を見直す必要があります。

エントロピーH(X)=−ΣP(x)log₂P(x)では、確率0の項の寄与を極限により0とします。∞どうしの差は計算せず、記録の∞も有限値へ置き換えません。グラフには有限値だけを描きます。

−log₂Pは0<P≤1で連続ですが、同じ確率差でも0に近いほど情報量の差が大きくなります。2点だけを比べて連続かどうかを判定するものではありません。

### 計算の確認値

| 条件 | 結果 |
|---|---|
| P=1 | 0 bit |
| P=0.5 | 1 bit |
| P=0.125 | 3 bit |
| P=0.0001 | 約13.287712 bit |
| P=0 | ∞ bit（極限の表示） |
| 分布(0.25, 0.25, 0.25, 0.25) | H=2 bit |
| 分布(1, 0, 0, 0) | H=0 bit |
| 16階×各階8室、全室等確率 | 4+3=7 bit |
| 等確率の26候補、重複なしの推測 | 平均13.5回 |

## ⚙️ 入力と表示の仕様

| 入力 | 範囲・条件 |
|---|---|
| 確率 | 0～1。空欄・負数・範囲外・非数値はエラー |
| 分布 | 合計1、許容誤差0.000001 |
| 予想確率 | 0～100% |
| 階数・各階の部屋数 | 1～1000の整数 |
| 文字数・文字種類数 | 1～100、1～95の整数 |
| 比較グラフの底a | 1より大きく100以下 |
| 単調性スライダー | 0.0001～1 |
| 体感の記録 | 最大100点 |

不正な入力を丸めたり、自動で範囲内に戻したり、分布を正規化したりしません。無効な計算結果は「—」とエラー文で示します。表示値は丸められるため、画面上の足し算に丸め差が出る場合があります。

独立確率の積が浮動小数点で表現できないほど小さくなっても、情報量は対数の和で計算します。指数関数などの比較グラフは表示範囲内を描く教材であり、任意精度の計算器ではありません。

## 💡 具体的な活用シナリオ

### 授業での確率比較

公正なコインの表は1 bit、公正なサイコロの1は約2.58 bitです。確率を先に予想してから設定値と比べることで、確率と感情の違いを話し合えます。

### 異常度の考え方

仮のモデルでP=0.001なら約9.97 bitです。ただし、まれな出来事が攻撃とは限らず、モデルやしきい値だけで誤検知や見逃しが解消するわけではありません。本ツールはログの収集・学習・侵入検知を行いません。

### ログや文章の圧縮

出現確率から平均情報量を求め、平均符号長との関係を学べます。離散情報源の一意復号可能な符号では、平均符号長はエントロピー以上です。画面の文字頻度表は1000文字の教材例の一部であり、完全な分布やHuffman符号表ではありません。⌈情報量⌉も実際の符号割り当てではありません。

### 予測モデルの理解

言語モデルは正解トークンの予測確率に基づくクロスエントロピー損失を利用します。決定木の情報利得では、分割後の各群のエントロピーを群の大きさで重み付けします。本ツールはモデルの学習や評価を実行しません。

## 🔐 暗号での前提と限界

### 鍵の不確実性と推測回数

N個の候補が等確率で、重複なく順に試し、正解を判別できる場合、H=log₂N、平均推測回数=(N+1)/2です。正解を試す1回も含みます。一般の偏った分布の平均推測回数は、Shannonエントロピーだけでは決まりません。

文字種類数S、長さLのモデルでは、各文字を独立に等確率で選ぶと仮定し、N=S^L、H=L log₂Sと計算します。95文字は空白を含む印字可能ASCII文字です。人が選んだ単語や再利用は評価せず、実際のパスワードも入力しません。

### 古典暗号と現代暗号

26シフトを一様に選ぶシーザー暗号の鍵エントロピーはlog₂26≈4.700440 bitです。正解を判別できる全候補探索の平均は13.5回ですが、鍵を固定した場合や言語の偏りを利用する場合とは前提が異なります。エニグマの候補数も、機種・設定・攻撃者が知っている情報に依存します。

AESの鍵エントロピーと、既知平文などを使った攻撃の計算量は同じではありません。RSAの2048 bitという鍵長を、そのまま2048 bitの安全強度や鍵エントロピーと解釈できません。

| 方式 | 鍵長 | 古典計算での安全強度の目安 |
|---|---|---|
| AES-128 | 128 bit | 128 bit |
| AES-256 | 256 bit | 256 bit |
| RSA-2048 | 2048 bit | 112 bit |

[NIST SP 800-57 Part 1 Rev.5、Table 2](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-57pt1r5.pdf)の比較値です。実装、鍵管理、利用モード、攻撃手法を含む安全性の保証ではなく、量子計算への耐性を示すものでもありません。攻撃時間には試行速度などの条件が必要です。

### 完全秘匿性と量子鍵配送

完全秘匿性はH(平文|暗号文)=H(平文)、すなわち暗号文の観測で平文の不確実性が減らない性質です。ワンタイムパッドでは、平文と独立な一様乱数の鍵を平文と同じ長さだけ用意し、再利用しません。改ざん検知や安全な鍵配送は別途必要です。

量子鍵配送も装置・実装・認証などの前提を必要とし、通信全体が無条件に安全になるという意味ではありません。本ツールは暗号方式の安全性を認定しません。

## 🔗 関連ツール・参考資料

### Token Entropy Estimator

[Day048のツール](https://ipusiron.github.io/token-entropy-estimator/)では、文字種・長さ・形式から、仮定に基づくランダム部分や推測時間を検討できます。文字列だけから生成過程のランダムさを確定できるわけではありません。

### MorseTree Visualizer

[Day025のツール](https://ipusiron.github.io/morse-tree-visualizer/)では、モールス符号の木・チャート・変換を学べます。点と線の所要時間や文字間隔が異なるため、符号の要素数をそのままbit数とみなしたり、Huffman符号と同一視したりしません。

### 理論の参考資料

- [Gray, Entropy and Information Theory](https://ee.stanford.edu/~gray/it.pdf)：情報量・エントロピー・条件付きエントロピー
- [Bennett, Notes on Landauer's principle](https://www.cs.princeton.edu/courses/archive/fall04/cos576/papers/bennett03.pdf)：測定と記憶の消去の区別

情報エントロピーが時間とともに必ず増える法則はありません。標準的な熱浴モデルで、0と1が等確率の未知の1 bitを論理的に不可逆に消去するときの散逸の下限はkBT ln2です。測定そのものに同じ下限を一律に適用しません。

## 🧪 テスト・セキュリティ

Node.js 22以上で、依存パッケージをインストールせずに実行できます。

```sh
npm test
```

計算の既知値、境界値、入力検証、日英辞書、文書の対応、UIの安全性を検査します。GitHub Actionsでもpushとpull_request時にNode.js 22で実行します。

アプリは入力を外部へ送信せず、外部スクリプトやCDNを読み込みません。CSPでインラインスクリプト・動的評価・通信を制限し、動的な表示にはtextContentを使います。外部リンクを開いた場合はリンク先へアクセスします。

## 📁 ディレクトリー構造

```text
infoquantity-academy/
├── .github/
│   └── workflows/
│       └── test.yml          # Node.js 22のテスト
├── assets/
│   ├── en/
│   │   ├── screenshot.png    # 英語・計算例
│   │   ├── screenshot2.png   # 英語・体感
│   │   └── screenshot3.png   # 英語・ダークテーマ
│   ├── screenshot.png        # 日本語・計算例
│   ├── screenshot2.png       # 日本語・体感
│   └── screenshot3.png       # 日本語・ダークテーマ
├── test/
│   ├── core.test.js          # 計算と境界値
│   ├── readme.test.js        # 日英文書と静的翻訳
│   └── ui-contract.test.js   # UI・辞書・CSP
├── .gitignore                # Git除外設定
├── .nojekyll                 # Jekyll処理の無効化
├── CLAUDE.md                 # 開発時の規則
├── LICENSE                   # MITライセンス
├── README.md                 # 日本語の説明
├── README.en.md              # 英語の説明
├── core.js                   # DOMに依存しない計算
├── i18n.js                   # 静的翻訳と言語切り替え
├── index.html                # 7タブの画面と教材
├── lesson-en.js              # 教材の英訳
├── messages.js               # 動的表示の日英辞書
├── package.json              # 依存なしのテスト設定
├── script.js                 # UI更新とグラフ
├── settings.js               # 初期言語・テーマ
└── style.css                 # レスポンシブ表示
```

## 💻 動作環境

JavaScript、Canvas、BigIntに対応するモダンブラウザーを使用してください。ビルドは不要で、HTTP(S)とfile://で動作します。モバイル幅では1列、広い画面では複数列になります。ブラウザーが動きを減らす設定の場合はアニメーションを抑制します。

## 📄 ライセンス

MIT License。詳細は[LICENSE](LICENSE)を参照してください。

## 🛠️ このツールについて

本ツールは、「生成AIで作るセキュリティツール100」プロジェクトの一環として開発されました。
このプロジェクトでは、AIの支援を活用しながら、セキュリティに関連するさまざまなツールを100日間にわたり制作・公開していく取り組みを行っています。

[プロジェクトの詳細とほかのツール](https://akademeia.info/?page_id=42163)
