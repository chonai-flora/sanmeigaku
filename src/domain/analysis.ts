import { BRANCH_ELEMENT, HIDDEN_STEMS, STEM_INFO } from '../data/constants.js';
import { FIVE_ELEMENT_INFO, MAJOR_STAR_INFO, TWELVE_LIFE_STAGE_INFO } from '../data/insights.js';
import {
  FIVE_ELEMENTS,
  type FiveElementBalance,
  type HumanStarChart,
  type MajorStars,
  type Pillars,
  type SanmeigakuAnalysis,
  type TwelveLifeStages,
} from '../types.js';
import { getMainHiddenStem, getMajorStar } from './stars.js';

const HIDDEN_STEM_SCORE = 0.5;

export const calculateFiveElementBalance = (pillars: Pillars): FiveElementBalance => {
  const balance: FiveElementBalance = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };
  for (const pillar of [pillars.year, pillars.month, pillars.day]) {
    balance[STEM_INFO[pillar.heavenlyStem].fiveElement] += 1;
    balance[BRANCH_ELEMENT[pillar.earthlyBranch]] += 1;
    for (const hiddenStem of HIDDEN_STEMS[pillar.earthlyBranch]) {
      balance[STEM_INFO[hiddenStem.stem].fiveElement] += HIDDEN_STEM_SCORE;
    }
  }
  return balance;
};

export const buildHumanStarChart = (
  majorStars: MajorStars,
  stages: TwelveLifeStages,
): HumanStarChart => ({
  head: majorStars.head,
  leftShoulder: stages.year,
  rightHand: majorStars.rightHand,
  chest: majorStars.chest,
  leftHand: majorStars.leftHand,
  rightFoot: stages.day,
  belly: majorStars.belly,
  leftFoot: stages.month,
});

export const buildSanmeigakuAnalysis = (
  pillars: Pillars,
  balance: FiveElementBalance,
  majorStars: MajorStars,
  stages: TwelveLifeStages,
): SanmeigakuAnalysis => {
  const sorted = FIVE_ELEMENTS.map((element) => ({
    element,
    ...FIVE_ELEMENT_INFO[element],
    count: balance[element],
  })).sort((left, right) => right.count - left.count);
  const strongestCount = sorted[0]?.count ?? 0;
  const weakestCount = sorted.at(-1)?.count ?? 0;
  const strongest = sorted
    .filter(({ count }) => count === strongestCount)
    .map(({ element }) => element);
  const weakest = sorted
    .filter(({ count }) => count === weakestCount)
    .map(({ element }) => element);
  const strongestLabels = strongest.map((element) => FIVE_ELEMENT_INFO[element].label).join('と');
  const weakestLabels = weakest.map((element) => FIVE_ELEMENT_INFO[element].label).join('と');

  const majorSources = {
    head: pillars.year.heavenlyStem,
    rightHand: getMainHiddenStem(pillars.day.earthlyBranch),
    chest: getMainHiddenStem(pillars.month.earthlyBranch),
    leftHand: getMainHiddenStem(pillars.year.earthlyBranch),
    belly: pillars.month.heavenlyStem,
  } as const;
  const majorTitles = {
    head: '頭',
    rightHand: '右手',
    chest: '胸',
    leftHand: '左手',
    belly: '腹',
  } as const;
  const buildMajorStarInsight = (position: keyof MajorStars) => {
    const sourceStem = majorSources[position];
    const star = getMajorStar(pillars.day.heavenlyStem, sourceStem);
    const [description, keywords] = MAJOR_STAR_INFO[star];
    return {
      key: majorStars[position],
      title: majorTitles[position],
      description,
      keywords,
      sourceStem,
    };
  };
  const majorStarInsights = {
    head: buildMajorStarInsight('head'),
    rightHand: buildMajorStarInsight('rightHand'),
    chest: buildMajorStarInsight('chest'),
    leftHand: buildMajorStarInsight('leftHand'),
    belly: buildMajorStarInsight('belly'),
  };
  const stageTitles = { year: '年柱', month: '月柱', day: '日柱' } as const;
  const buildStageInsight = (position: keyof TwelveLifeStages) => {
    const key = stages[position];
    const [description, keywords] = TWELVE_LIFE_STAGE_INFO[key];
    return { key, title: stageTitles[position], description, keywords };
  };
  const stageInsights = {
    year: buildStageInsight('year'),
    month: buildStageInsight('month'),
    day: buildStageInsight('day'),
  };

  return {
    fiveElementBalance: {
      counts: balance,
      sorted,
      strongest,
      weakest,
      description:
        strongestCount - weakestCount < 1
          ? '五行の大きな偏りは少なめで、全体は比較的バランスよくまとまっています。'
          : `${strongestLabels}がやや強めに現れています。一方で${weakestLabels}は控えめに見えます。`,
    },
    majorStars: majorStarInsights,
    twelveLifeStages: stageInsights,
    humanStarChart: {
      head: { ...majorStarInsights.head, kind: '十大主星' },
      leftShoulder: { ...stageInsights.year, kind: '十二大従星' },
      rightHand: { ...majorStarInsights.rightHand, kind: '十大主星' },
      chest: { ...majorStarInsights.chest, kind: '十大主星' },
      leftHand: { ...majorStarInsights.leftHand, kind: '十大主星' },
      rightFoot: { ...stageInsights.day, kind: '十二大従星' },
      belly: { ...majorStarInsights.belly, kind: '十大主星' },
      leftFoot: { ...stageInsights.month, kind: '十二大従星' },
    },
  };
};
