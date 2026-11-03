import { describe, expect, it } from 'bun:test';

import {
  SanmeigakuInputError,
  SanmeigakuRangeError,
  calculateDayPillar,
  calculateMeishiki,
  calculateMonthBranch,
  calculateYearPillar,
  getMajorStar,
  getTwelveLifeStage,
} from '../src/index';
import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from '../src/types';
import { MAJOR_STAR_MATRIX, TWELVE_LIFE_STAGE_MATRIX } from './star-matrix.fixtures';
import { TWELVE_LIFE_STAGE_BIRTHDATE_FIXTURES } from './twelveLifeStages.fixtures';

describe('pillars', () => {
  it('keeps the day-pillar reference and leap-day offset', () => {
    expect(calculateDayPillar('1900-01-01').label).toBe('甲戌');
    expect(calculateDayPillar('1900-01-02').label).toBe('乙亥');
    expect(calculateDayPillar('1899-12-31').label).toBe('癸酉');
    expect(calculateDayPillar('1900-03-02').label).toBe('甲戌');
    expect(calculateDayPillar('2024-03-01').label).not.toBe(calculateDayPillar('2024-02-28').label);
  });

  it('uses Risshun for the year pillar', () => {
    expect(calculateYearPillar('2025-02-03').label).toBe('甲辰');
    expect(calculateYearPillar('2025-02-04').label).toBe('乙巳');
    expect(calculateYearPillar('1984-02-06').label).toBe('甲子');
    expect(calculateYearPillar('2044-06-01').label).toBe('甲子');
  });

  it('uses the monthly Sekki boundaries', () => {
    expect(calculateMonthBranch('1900-02-05')).toBe('寅');
    expect(calculateMonthBranch('2025-02-02')).toBe('丑');
    expect(calculateMonthBranch('2025-02-04')).toBe('寅');
    expect(calculateMonthBranch('2025-03-04')).toBe('寅');
    expect(calculateMonthBranch('2025-03-06')).toBe('卯');
  });
});

describe('analysis', () => {
  it('returns the expected stars and chart positions', () => {
    const result = calculateMeishiki({ birthDate: '2004-09-12' });
    expect(result.majorStars).toEqual({
      head: '貫索星',
      rightHand: '調舒星',
      chest: '牽牛星',
      leftHand: '車騎星',
      belly: '玉堂星',
    });
    expect(result.humanStarChart.leftShoulder).toBe('天馳星');
    expect(result.humanStarChart.rightFoot).toBe('天極星');
    expect(result.humanStarChart.leftFoot).toBe('天報星');
  });

  it('keeps all migrated twelve-life-stage fixtures', () => {
    for (const fixture of TWELVE_LIFE_STAGE_BIRTHDATE_FIXTURES) {
      const stages = calculateMeishiki({ birthDate: fixture.birthDate }).twelveLifeStages;
      expect(stages.year).toBe(fixture.leftShoulder);
      expect(stages.day).toBe(fixture.rightFoot);
      expect(stages.month).toBe(fixture.leftFoot);
    }
  });

  it('keeps all 100 major-star mappings', () => {
    for (const [dayIndex, dayStem] of HEAVENLY_STEMS.entries()) {
      for (const [targetIndex, targetStem] of HEAVENLY_STEMS.entries()) {
        expect(getMajorStar(dayStem, targetStem)).toBe(MAJOR_STAR_MATRIX[dayIndex]![targetIndex]);
      }
    }
  });

  it('keeps all 120 twelve-life-stage mappings', () => {
    for (const [stemIndex, dayStem] of HEAVENLY_STEMS.entries()) {
      for (const [branchIndex, branch] of EARTHLY_BRANCHES.entries()) {
        expect(getTwelveLifeStage(dayStem, branch)).toBe(
          TWELVE_LIFE_STAGE_MATRIX[stemIndex]![branchIndex],
        );
      }
    }
  });
});

describe('validation', () => {
  it('rejects malformed and impossible dates', () => {
    expect(() => calculateMeishiki({ birthDate: '2025/02/04' })).toThrow(SanmeigakuInputError);
    expect(() => calculateMeishiki({ birthDate: '2025-02-30' })).toThrow(SanmeigakuInputError);
  });

  it('rejects dates outside the Sekki dataset', () => {
    expect(() => calculateMeishiki({ birthDate: '1900-02-04' })).toThrow(SanmeigakuRangeError);
    expect(() => calculateMeishiki({ birthDate: '1899-12-31' })).toThrow(SanmeigakuRangeError);
    expect(() => calculateMeishiki({ birthDate: '2101-01-01' })).toThrow(SanmeigakuRangeError);
  });
});
