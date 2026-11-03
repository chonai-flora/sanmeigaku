import { STEM_INFO } from './data/constants.js';
import {
  buildHumanStarChart,
  buildSanmeigakuAnalysis,
  calculateFiveElementBalance,
} from './domain/analysis.js';
import {
  calculateDayPillar,
  calculateMonthBranch,
  calculateMonthPillar,
  calculateYearPillar,
} from './domain/pillars.js';
import {
  calculateMajorStars,
  calculateTwelveLifeStages,
  getMainHiddenStem,
  getMajorStar,
  getTwelveLifeStage,
} from './domain/stars.js';
import type { CalculateMeishikiInput, MeishikiResult } from './types.js';

export const calculateMeishiki = (input: CalculateMeishikiInput): MeishikiResult => {
  const year = calculateYearPillar(input.birthDate);
  const month = calculateMonthPillar(input.birthDate, year.heavenlyStem);
  const day = calculateDayPillar(input.birthDate);
  const pillars = { year, month, day };
  const majorStars = calculateMajorStars(pillars);
  const twelveLifeStages = calculateTwelveLifeStages(pillars);
  const fiveElementBalance = calculateFiveElementBalance(pillars);
  return {
    birthDate: input.birthDate,
    pillars,
    dayMaster: {
      heavenlyStem: day.heavenlyStem,
      earthlyBranch: day.earthlyBranch,
      ...STEM_INFO[day.heavenlyStem],
    },
    fiveElementBalance,
    majorStars,
    twelveLifeStages,
    humanStarChart: buildHumanStarChart(majorStars, twelveLifeStages),
    analysis: buildSanmeigakuAnalysis(pillars, fiveElementBalance, majorStars, twelveLifeStages),
  };
};

export {
  calculateDayPillar,
  calculateFiveElementBalance,
  calculateMajorStars,
  calculateMonthBranch,
  calculateMonthPillar,
  calculateTwelveLifeStages,
  calculateYearPillar,
  getMainHiddenStem,
  getMajorStar,
  getTwelveLifeStage,
};
export { MAX_SUPPORTED_DATE, MIN_SUPPORTED_DATE } from './domain/date.js';
export { SanmeigakuInputError, SanmeigakuRangeError } from './types.js';
export type * from './types.js';
