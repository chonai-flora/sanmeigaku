import { SEKKI_BOUNDARIES_JST, type SekkiBoundary } from '../calendar/sekki-boundaries.js';
import { SIXTY_KANSHI } from '../data/constants.js';
import { HEAVENLY_STEMS, type EarthlyBranch, type HeavenlyStem } from '../types.js';
import { validateBirthDate, validateSupportedBirthDate } from './date.js';

const DAY_MILLISECONDS = 86_400_000;
const REFERENCE_DATE_UTC_MS = Date.UTC(1900, 0, 1);
const REFERENCE_DAY_KANSHI_INDEX = 10;
const REFERENCE_YEAR = 1984;

const MONTH_BRANCH_BY_SEKKI = {
  risshun: '寅',
  keichitsu: '卯',
  seimei: '辰',
  rikka: '巳',
  boushu: '午',
  shousho: '未',
  risshuu: '申',
  hakuro: '酉',
  kanro: '戌',
  rittou: '亥',
  taisetsu: '子',
  shoukan: '丑',
} as const satisfies Record<SekkiBoundary['name'], EarthlyBranch>;

const START_STEM_BY_YEAR_STEM = {
  甲: '丙',
  己: '丙',
  乙: '戊',
  庚: '戊',
  丙: '庚',
  辛: '庚',
  丁: '壬',
  壬: '壬',
  戊: '甲',
  癸: '甲',
} as const satisfies Record<HeavenlyStem, HeavenlyStem>;

const MONTH_BRANCH_OFFSET = {
  寅: 0,
  卯: 1,
  辰: 2,
  巳: 3,
  午: 4,
  未: 5,
  申: 6,
  酉: 7,
  戌: 8,
  亥: 9,
  子: 10,
  丑: 11,
} as const satisfies Record<EarthlyBranch, number>;

const cycleAt = (index: number) =>
  SIXTY_KANSHI[((index % SIXTY_KANSHI.length) + SIXTY_KANSHI.length) % SIXTY_KANSHI.length]!;

export const calculateDayPillar = (birthDate: string) => {
  const { utcMilliseconds } = validateBirthDate(birthDate);
  const differenceInDays = Math.floor((utcMilliseconds - REFERENCE_DATE_UTC_MS) / DAY_MILLISECONDS);
  return cycleAt(REFERENCE_DAY_KANSHI_INDEX + differenceInDays);
};

const yearBoundaries = (year: number) =>
  (SEKKI_BOUNDARIES_JST[String(year) as keyof typeof SEKKI_BOUNDARIES_JST] ??
    []) as readonly SekkiBoundary[];

export const calculateYearPillar = (birthDate: string) => {
  const { year } = validateSupportedBirthDate(birthDate);
  const risshun = yearBoundaries(year).find((boundary) => boundary.name === 'risshun');
  if (!risshun) {
    throw new RangeError(`Risshun boundary is unavailable for ${year}.`);
  }
  const birthAtJst = new Date(`${birthDate}T00:00:00+09:00`);
  const effectiveYear = birthAtJst < new Date(risshun.startsAtJst) ? year - 1 : year;
  return cycleAt(effectiveYear - REFERENCE_YEAR);
};

export const calculateMonthBranch = (birthDate: string) => {
  const { year } = validateSupportedBirthDate(birthDate);
  const birthAtJst = new Date(`${birthDate}T00:00:00+09:00`);
  const boundaries = [...yearBoundaries(year - 1), ...yearBoundaries(year)].sort(
    (left, right) => Date.parse(left.startsAtJst) - Date.parse(right.startsAtJst),
  );
  let branch: EarthlyBranch = '子';
  for (const boundary of boundaries) {
    if (birthAtJst >= new Date(boundary.startsAtJst)) {
      branch = MONTH_BRANCH_BY_SEKKI[boundary.name];
    }
  }
  return branch;
};

export const calculateMonthPillar = (
  birthDate: string,
  yearStem = calculateYearPillar(birthDate).heavenlyStem,
) => {
  validateSupportedBirthDate(birthDate);
  const earthlyBranch = calculateMonthBranch(birthDate);
  const startIndex = HEAVENLY_STEMS.indexOf(START_STEM_BY_YEAR_STEM[yearStem]);
  const heavenlyStem =
    HEAVENLY_STEMS[(startIndex + MONTH_BRANCH_OFFSET[earthlyBranch]) % HEAVENLY_STEMS.length]!;
  return { heavenlyStem, earthlyBranch, label: `${heavenlyStem}${earthlyBranch}` };
};
