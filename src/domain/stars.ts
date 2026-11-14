import { HIDDEN_STEMS, STEM_INFO } from '../data/constants.js';
import {
  type EarthlyBranch,
  type HeavenlyStem,
  type MajorStarKey,
  type MajorStars,
  type Pillars,
  type TwelveLifeStageKey,
  type TwelveLifeStages,
} from '../types.js';
import { calculateSekkiDay } from './pillars.js';

const ELEMENT_PRODUCES = {
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
  metal: 'water',
  water: 'wood',
} as const;

const RELATION_TO_STAR = {
  self: { same: '貫索星', opposite: '石門星' },
  output: { same: '鳳閣星', opposite: '調舒星' },
  wealth: { same: '禄存星', opposite: '司禄星' },
  power: { same: '車騎星', opposite: '牽牛星' },
  resource: { same: '龍高星', opposite: '玉堂星' },
} as const satisfies Record<string, Record<'same' | 'opposite', MajorStarKey>>;

const DAY_STEM_ORDER = ['癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬'] as const;
const BRANCH_ORDER = [
  '亥',
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
] as const;
const LIFE_STAGE_ORDER = [
  '天報星',
  '天印星',
  '天貴星',
  '天恍星',
  '天南星',
  '天禄星',
  '天将星',
  '天堂星',
  '天胡星',
  '天極星',
  '天庫星',
  '天馳星',
] as const satisfies readonly TwelveLifeStageKey[];
const LIFE_STAGE_MATRIX = [
  [7, 3, 10, 12, 1, 12, 1, 9, 4, 6],
  [6, 4, 9, 1, 12, 1, 12, 10, 3, 7],
  [5, 5, 8, 2, 11, 2, 11, 11, 2, 8],
  [4, 6, 7, 3, 10, 3, 10, 12, 1, 9],
  [3, 7, 6, 4, 9, 4, 9, 1, 12, 10],
  [2, 8, 5, 5, 8, 5, 8, 2, 11, 11],
  [1, 9, 4, 6, 7, 6, 7, 3, 10, 12],
  [12, 10, 3, 7, 6, 7, 6, 4, 9, 1],
  [11, 11, 2, 8, 5, 8, 5, 5, 8, 2],
  [10, 12, 1, 9, 4, 9, 4, 6, 7, 3],
  [9, 1, 12, 10, 3, 10, 3, 7, 6, 4],
  [8, 2, 11, 11, 2, 11, 2, 8, 5, 5],
] as const;

const HIDDEN_STEMS_BY_SEKKI_DAY = {
  子: [{ through: Infinity, stem: '癸' }],
  丑: [
    { through: 9, stem: '癸' },
    { through: 12, stem: '辛' },
    { through: Infinity, stem: '己' },
  ],
  寅: [
    { through: 7, stem: '戊' },
    { through: 14, stem: '丙' },
    { through: Infinity, stem: '甲' },
  ],
  卯: [{ through: Infinity, stem: '乙' }],
  辰: [
    { through: 9, stem: '乙' },
    { through: 12, stem: '癸' },
    { through: Infinity, stem: '戊' },
  ],
  巳: [
    { through: 5, stem: '戊' },
    { through: 14, stem: '庚' },
    { through: Infinity, stem: '丙' },
  ],
  午: [
    { through: 19, stem: '己' },
    { through: Infinity, stem: '丁' },
  ],
  未: [
    { through: 9, stem: '丁' },
    { through: 12, stem: '乙' },
    { through: Infinity, stem: '己' },
  ],
  申: [
    { through: 10, stem: '戊' },
    { through: 13, stem: '壬' },
    { through: Infinity, stem: '庚' },
  ],
  酉: [{ through: Infinity, stem: '辛' }],
  戌: [
    { through: 9, stem: '辛' },
    { through: 12, stem: '丁' },
    { through: Infinity, stem: '戊' },
  ],
  亥: [
    { through: 12, stem: '甲' },
    { through: Infinity, stem: '壬' },
  ],
} as const satisfies Record<EarthlyBranch, readonly { through: number; stem: HeavenlyStem }[]>;

export const getMajorStar = (dayStem: HeavenlyStem, targetStem: HeavenlyStem): MajorStarKey => {
  const day = STEM_INFO[dayStem];
  const target = STEM_INFO[targetStem];
  const relation =
    day.fiveElement === target.fiveElement
      ? 'self'
      : ELEMENT_PRODUCES[day.fiveElement] === target.fiveElement
        ? 'output'
        : ELEMENT_PRODUCES[target.fiveElement] === day.fiveElement
          ? 'resource'
          : ELEMENT_PRODUCES[ELEMENT_PRODUCES[day.fiveElement]] === target.fiveElement
            ? 'wealth'
            : 'power';
  const polarity = day.polarity === target.polarity ? 'same' : 'opposite';
  return RELATION_TO_STAR[relation][polarity];
};

export const getTwelveLifeStage = (
  dayStem: HeavenlyStem,
  branch: EarthlyBranch,
): TwelveLifeStageKey => {
  const stemIndex = DAY_STEM_ORDER.indexOf(dayStem);
  const branchIndex = BRANCH_ORDER.indexOf(branch);
  const stageNumber = LIFE_STAGE_MATRIX[branchIndex]![stemIndex]!;
  return LIFE_STAGE_ORDER[stageNumber - 1]!;
};

export const getMainHiddenStem = (branch: EarthlyBranch): HeavenlyStem =>
  HIDDEN_STEMS[branch][0].stem;

export const getHiddenStemBySekkiDay = (branch: EarthlyBranch, sekkiDay: number): HeavenlyStem =>
  HIDDEN_STEMS_BY_SEKKI_DAY[branch].find(({ through }) => sekkiDay <= through)!.stem;

export const calculateMajorStarSources = (
  pillars: Pillars,
  birthDate: string,
): Record<keyof MajorStars, HeavenlyStem> => {
  const sekkiDay = calculateSekkiDay(birthDate);
  return {
    head: pillars.year.heavenlyStem,
    rightHand: getHiddenStemBySekkiDay(pillars.day.earthlyBranch, sekkiDay),
    chest: getHiddenStemBySekkiDay(pillars.month.earthlyBranch, sekkiDay),
    leftHand: getHiddenStemBySekkiDay(pillars.year.earthlyBranch, sekkiDay),
    belly: pillars.month.heavenlyStem,
  };
};

export const calculateMajorStars = (pillars: Pillars, birthDate: string): MajorStars => {
  const dayStem = pillars.day.heavenlyStem;
  const sources = calculateMajorStarSources(pillars, birthDate);
  return {
    head: getMajorStar(dayStem, sources.head),
    rightHand: getMajorStar(dayStem, sources.rightHand),
    chest: getMajorStar(dayStem, sources.chest),
    leftHand: getMajorStar(dayStem, sources.leftHand),
    belly: getMajorStar(dayStem, sources.belly),
  };
};

export const calculateTwelveLifeStages = (pillars: Pillars): TwelveLifeStages => ({
  year: getTwelveLifeStage(pillars.day.heavenlyStem, pillars.year.earthlyBranch),
  month: getTwelveLifeStage(pillars.day.heavenlyStem, pillars.month.earthlyBranch),
  day: getTwelveLifeStage(pillars.day.heavenlyStem, pillars.day.earthlyBranch),
});
