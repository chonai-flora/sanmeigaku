import { HIDDEN_STEMS, STEM_INFO } from '../data/constants.js';
import {
  type EarthlyBranch,
  type HeavenlyStem,
  type MajorStarKey,
  type MajorStars,
  type Pillar,
  type TwelveLifeStageKey,
  type TwelveLifeStages,
} from '../types.js';

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

export const getMajorStar = (dayStem: HeavenlyStem, targetStem: HeavenlyStem) => {
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

export const getTwelveLifeStage = (dayStem: HeavenlyStem, branch: EarthlyBranch) => {
  const stemIndex = DAY_STEM_ORDER.indexOf(dayStem);
  const branchIndex = BRANCH_ORDER.indexOf(branch);
  const stageNumber = LIFE_STAGE_MATRIX[branchIndex]![stemIndex]!;
  return LIFE_STAGE_ORDER[stageNumber - 1]!;
};

export const getMainHiddenStem = (branch: EarthlyBranch): HeavenlyStem =>
  HIDDEN_STEMS[branch][0].stem;

export const calculateMajorStars = (pillars: {
  year: Pillar;
  month: Pillar;
  day: Pillar;
}): MajorStars => {
  const dayStem = pillars.day.heavenlyStem;
  return {
    head: getMajorStar(dayStem, pillars.year.heavenlyStem),
    rightHand: getMajorStar(dayStem, getMainHiddenStem(pillars.day.earthlyBranch)),
    chest: getMajorStar(dayStem, getMainHiddenStem(pillars.month.earthlyBranch)),
    leftHand: getMajorStar(dayStem, getMainHiddenStem(pillars.year.earthlyBranch)),
    belly: getMajorStar(dayStem, pillars.month.heavenlyStem),
  };
};

export const calculateTwelveLifeStages = (pillars: {
  year: Pillar;
  month: Pillar;
  day: Pillar;
}): TwelveLifeStages => ({
  year: getTwelveLifeStage(pillars.day.heavenlyStem, pillars.year.earthlyBranch),
  month: getTwelveLifeStage(pillars.day.heavenlyStem, pillars.month.earthlyBranch),
  day: getTwelveLifeStage(pillars.day.heavenlyStem, pillars.day.earthlyBranch),
});
