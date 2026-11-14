import { expect, it } from 'bun:test';

import { calculateMeishiki, getMajorStar } from '../src/index';
import * as publicApi from '../src/index';

const INTERNAL_EXPORTS = [
  'BRANCH_ELEMENT',
  'EARTHLY_BRANCHES',
  'FIVE_ELEMENTS',
  'FIVE_ELEMENT_INFO',
  'HEAVENLY_STEMS',
  'HIDDEN_STEMS',
  'MAJOR_STAR_INFO',
  'POLARITIES',
  'SEKKI_BOUNDARIES_JST',
  'SIXTY_KANSHI',
  'STEM_INFO',
  'TWELVE_LIFE_STAGE_INFO',
  'buildSanmeigakuAnalysis',
] as const;

it('provides the documented public result shape', () => {
  const result = calculateMeishiki({ birthDate: '2000-01-01' });
  expect(result.pillars.year.label).toBeString();
  expect(result.pillars.month.label).toBeString();
  expect(result.pillars.day.label).toBeString();
  expect(Object.keys(result.fiveElementBalance)).toEqual([
    'wood',
    'fire',
    'earth',
    'metal',
    'water',
  ]);
  expect(result.majorStars.chest).toBeString();
  expect(result.twelveLifeStages.day).toBeString();
  expect(result.humanStarChart.head).toBe(result.majorStars.head);
  expect(result.analysis.majorStars.chest.key).toBe(result.majorStars.chest);
  expect(result.analysis.fiveElementBalance.counts).toEqual(result.fiveElementBalance);
  expect(
    getMajorStar(result.dayMaster.heavenlyStem, result.analysis.majorStars.rightHand.sourceStem),
  ).toBe(result.majorStars.rightHand);
  expect(
    getMajorStar(result.dayMaster.heavenlyStem, result.analysis.majorStars.chest.sourceStem),
  ).toBe(result.majorStars.chest);
  expect(
    getMajorStar(result.dayMaster.heavenlyStem, result.analysis.majorStars.leftHand.sourceStem),
  ).toBe(result.majorStars.leftHand);
});

it('does not expose internal calculation tables from the package root', () => {
  for (const name of INTERNAL_EXPORTS) {
    expect(name in publicApi).toBeFalse();
  }
});
