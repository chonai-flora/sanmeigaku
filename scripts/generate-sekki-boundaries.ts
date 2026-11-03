import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type SekkiName =
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

type SekkiBoundary = {
  name: SekkiName;
  startsAtJst: string;
};

type SekkiBoundariesByYear = Record<string, SekkiBoundary[]>;

export const SOURCE_PATH = resolve(process.cwd(), 'src/calendar/sekki-boundaries.source.json');
export const OUTPUT_PATH = resolve(process.cwd(), 'src/calendar/sekki-boundaries.ts');

export const loadSource = (sourcePath = SOURCE_PATH): SekkiBoundariesByYear =>
  JSON.parse(readFileSync(sourcePath, 'utf8')) as SekkiBoundariesByYear;

export const buildGeneratedContent = (source: SekkiBoundariesByYear): string =>
  [
    '// 国立天文台 暦要項などの暦データを参照して生成した二十四節気データ。',
    '// 月柱算出の節入り境界として使用する。',
    '// 手編集禁止。更新時は generate-sekki-boundaries を実行する。',
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
    `export const SEKKI_BOUNDARIES_JST = ${JSON.stringify(source, null, 2)} as const satisfies Record<number, SekkiBoundary[]>;`,
    '',
  ].join('\n');

export const generateSekkiBoundaries = (
  sourcePath = SOURCE_PATH,
  outputPath = OUTPUT_PATH,
): string => {
  writeFileSync(outputPath, buildGeneratedContent(loadSource(sourcePath)), 'utf8');
  return outputPath;
};

if (import.meta.main) {
  console.log(`Generated: ${generateSekkiBoundaries()}`);
}
