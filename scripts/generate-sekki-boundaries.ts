import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import earthData from 'astronomia/data/vsop87Bearth';
import julian from 'astronomia/julian';
import planetposition from 'astronomia/planetposition';
import solstice from 'astronomia/solstice';

export type SekkiName =
  | 'risshun'
  | 'keichitsu'
  | 'seimei'
  | 'rikka'
  | 'boushu'
  | 'shousho'
  | 'risshuu'
  | 'hakuro'
  | 'kanro'
  | 'rittou'
  | 'taisetsu'
  | 'shoukan';

export type SekkiBoundary = {
  name: SekkiName;
  startsAtJst: string;
};

export type SekkiBoundariesByYear = Record<string, SekkiBoundary[]>;

type SekkiDefinition = {
  name: SekkiName;
  longitudeDegrees: number;
  calculationYearOffset: number;
};

export const START_YEAR = 1900;
export const END_YEAR = 2100;
export const ASTRONOMIA_VERSION = '4.2.0';

const DEGREES_TO_RADIANS = Math.PI / 180;
const JST_OFFSET_MILLISECONDS = 9 * 60 * 60 * 1000;
const EARTH = new planetposition.Planet(earthData);

const SEKKI_DEFINITIONS: readonly SekkiDefinition[] = [
  { name: 'risshun', longitudeDegrees: 315, calculationYearOffset: -1 },
  { name: 'keichitsu', longitudeDegrees: 345, calculationYearOffset: -1 },
  { name: 'seimei', longitudeDegrees: 15, calculationYearOffset: 0 },
  { name: 'rikka', longitudeDegrees: 45, calculationYearOffset: 0 },
  { name: 'boushu', longitudeDegrees: 75, calculationYearOffset: 0 },
  { name: 'shousho', longitudeDegrees: 105, calculationYearOffset: 0 },
  { name: 'risshuu', longitudeDegrees: 135, calculationYearOffset: 0 },
  { name: 'hakuro', longitudeDegrees: 165, calculationYearOffset: 0 },
  { name: 'kanro', longitudeDegrees: 195, calculationYearOffset: 0 },
  { name: 'rittou', longitudeDegrees: 225, calculationYearOffset: 0 },
  { name: 'taisetsu', longitudeDegrees: 255, calculationYearOffset: 0 },
  { name: 'shoukan', longitudeDegrees: 285, calculationYearOffset: 0 },
];

export const SOURCE_PATH = resolve(process.cwd(), 'src/calendar/sekki-boundaries.source.json');
export const OUTPUT_PATH = resolve(process.cwd(), 'src/calendar/sekki-boundaries.ts');

export const loadSource = (sourcePath = SOURCE_PATH): SekkiBoundariesByYear =>
  JSON.parse(readFileSync(sourcePath, 'utf8')) as SekkiBoundariesByYear;

const formatJst = (date: Date): string => {
  const roundedUtcMilliseconds = Math.round(date.getTime() / 1000) * 1000;
  const jstClock = new Date(roundedUtcMilliseconds + JST_OFFSET_MILLISECONDS);
  return `${jstClock.toISOString().slice(0, 19)}+09:00`;
};

export const calculateSekkiBoundaries = (
  startYear = START_YEAR,
  endYear = END_YEAR,
): SekkiBoundariesByYear => {
  const boundaries: SekkiBoundariesByYear = {};

  for (let year = startYear; year <= endYear; year += 1) {
    boundaries[String(year)] = SEKKI_DEFINITIONS.map(
      ({ name, longitudeDegrees, calculationYearOffset }) => {
        const jde = solstice.longitude(
          year + calculationYearOffset,
          EARTH,
          longitudeDegrees * DEGREES_TO_RADIANS,
        );
        return { name, startsAtJst: formatJst(julian.JDEToDate(jde)) };
      },
    );
  }

  return boundaries;
};

export const buildSourceContent = (source: SekkiBoundariesByYear): string =>
  `${JSON.stringify(source, null, 2)}\n`;

export const buildGeneratedContent = (source: SekkiBoundariesByYear): string =>
  [
    `// astronomia ${ASTRONOMIA_VERSION} (MIT) のMeeus/VSOP87実装で生成した二十四節気データ。`,
    '// 視黄経の通過時刻をJDEからUTCへ変換し、固定JST(+09:00)の秒単位へ丸める。',
    '// 月柱算出の節入り境界として使用する。',
    '// 手編集禁止。更新時は generate:sekki-boundaries を実行する。',
    '',
    'export type SekkiName =',
    "  | 'risshun'",
    "  | 'keichitsu'",
    "  | 'seimei'",
    "  | 'rikka'",
    "  | 'boushu'",
    "  | 'shousho'",
    "  | 'risshuu'",
    "  | 'hakuro'",
    "  | 'kanro'",
    "  | 'rittou'",
    "  | 'taisetsu'",
    "  | 'shoukan';",
    '',
    'export type SekkiBoundary = {',
    '  name: SekkiName;',
    '  startsAtJst: string;',
    '};',
    '',
    'export const SEKKI_BOUNDARIES_JST: Readonly<',
    '  Partial<Record<number, readonly SekkiBoundary[]>>',
    `> = ${JSON.stringify(source, null, 2)};`,
    '',
  ].join('\n');

export const generateSekkiBoundaries = (
  sourcePath = SOURCE_PATH,
  outputPath = OUTPUT_PATH,
): readonly [string, string] => {
  const source = calculateSekkiBoundaries();
  writeFileSync(sourcePath, buildSourceContent(source), 'utf8');
  writeFileSync(outputPath, buildGeneratedContent(source), 'utf8');
  return [sourcePath, outputPath];
};

if (import.meta.main) {
  console.log(`Generated: ${generateSekkiBoundaries().join(', ')}`);
}
