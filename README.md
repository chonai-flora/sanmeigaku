# sanmeigaku

日本の算命学に特化した、TypeScript 製の命式計算パッケージです。Node.js で動作し、ランタイム依存はありません。

> [!IMPORTANT]
> 現在は experimental 版です。0.x の間は、検証結果に基づいて計算仕様や結果が変更される可能性があります。

## インストール

公開後は次のコマンドでインストールできます。

```sh
npm install sanmeigaku@experimental
```

```sh
pnpm add sanmeigaku@experimental
```

```sh
yarn add sanmeigaku@experimental
```

```sh
bun add sanmeigaku@experimental
```

## 使用例

```ts
import { calculateMeishiki } from 'sanmeigaku';

const result = calculateMeishiki({ birthDate: '2000-01-01' });

console.log(result.pillars);
console.log(result.fiveElementBalance);
console.log(result.majorStars);
console.log(result.twelveLifeStages);
console.log(result.humanStarChart);
console.log(result.analysis);
```

`birthDate` は `YYYY-MM-DD` 形式です。時刻は受け取らず、JSTの午前0時として節入り境界と比較します。

## 公開 API

- `calculateMeishiki({ birthDate })`: 三柱と全分析結果を一括計算
- `calculateYearPillar(birthDate)`: 年柱
- `calculateMonthPillar(birthDate, yearStem?)`: 月柱
- `calculateMonthBranch(birthDate)`: 月支
- `calculateDayPillar(birthDate)`: 日柱
- `calculateFiveElementBalance(pillars)`: 五行バランス
- `calculateMajorStars(pillars)`, `getMajorStar(dayStem, targetStem)`, `getMainHiddenStem(branch)`: 十大主星
- `calculateTwelveLifeStages(pillars)`, `getTwelveLifeStage(dayStem, branch)`: 十二大従星
- `MIN_SUPPORTED_DATE`, `MAX_SUPPORTED_DATE`: 対応範囲

すべての公開型はパッケージのルートからエクスポートされます。節入りデータや蔵干表などの内部データは公開 API に含めません。不正な日付は `SanmeigakuInputError`、命式計算の対応範囲外は `SanmeigakuRangeError` を送出します。日柱単独の計算は節入りデータを使わないため、対応範囲外でも計算できます。

## 対応範囲と制約

- 命式計算: 1900-02-05〜2100-12-31
- 節入りデータ: 1900年の立春〜2100年
- 年柱: 立春境界を使用
- 月柱: 12の節入り境界を使用
- 日柱: 1900-01-01を甲戌とする基準を使用
- 五行バランス: 各柱の干・支を各1点、各蔵干を0.5点として集計
- 人体星図の地支由来の十大主星: 各地支の本元を使用
- 出生時刻は未対応。境界日の時刻前後を区別できません
- 1900年1月の小寒が未検証のため、命式計算の対応開始日は最初の収録済み立春後である1900-02-05です
- 計算結果は採用した規則に基づくもので、算命学としての正確性を保証しません
- ブラウザ向け bundler での利用は想定していますが、現時点では CI で検証していません

## 検証状況

- 暦計算: 2004〜2026年の国立天文台由来の fixture 276件と照合し、時刻の差が60秒未満であることを自動テスト
- 三柱: 固定 fixture による回帰テストと、各月の節入り日の前日・当日・翌日の境界テスト
- 十大主星: 日干と対象の干の全100組を固定対応表と照合
- 十二大従星: 日干と地支の全120組を固定対応表と照合
- 人体星図: 固定 fixture で十大主星と十二大従星の配置を検証

算命学固有のテストは実装の回帰を検出するためのものです。外部資料による独立検証が完了したことを意味しません。暦データも、1900〜2003年と2027〜2100年、および秒値の天文学的正確性は未検証です。

CI では、生成した tarball を別の npm プロジェクトへインストールし、Node.js からの import、命式計算、TypeScript の型解決を検証します。

## 開発

```sh
bun install
bun run generate:sekki-boundaries
bun run check
npm pack --dry-run
```

節入りの元データは `src/calendar/sekki-boundaries.source.json` です。生成スクリプトはこのファイルから TypeScript モジュールを再生成し、テストでは両者が一致することを検証します。命式の回帰 fixture は `tests/fixtures/pillars.ts`、外部資料との照合に使う fixture は `tests/nao-sekki-2004-plus.json` に分けて配置しています。

## 設計方針

- `calculateMeishiki({ birthDate })` を主要なエントリーポイントとして提供
- 入力形式と対応範囲を明示的に検証
- ランタイム依存をゼロにし、生成済み節入りデータだけを同梱
- 内部データ表を公開 API に含めず、互換性を保証する範囲を限定

## 参考資料

算命学の体系と実装結果の確認に、次の公開資料を参照しています。各サイトの文章、画像、教材、プログラムは本パッケージに収録していません。また、本パッケージは朱学院および国立天文台の公式・提携・監修製品ではありません。

- [朱学院 無料で算命学入門](https://www.shugakuin.co.jp/fate_calculation)
- [朱学院 十二支性情](https://www.shugakuin.co.jp/basics/jyunishi-seijou)
- [朱学院 十干性情](https://www.shugakuin.co.jp/basics/jyukkan-seijou)
- [国立天文台 暦計算室](https://eco.mtk.nao.ac.jp/koyomi/)

暦要項との照合に使う fixture には国立天文台の公開情報を利用しています。クレジット: 国立天文台。

## ライセンス

MIT License です。詳細は `LICENSE` を参照してください。
