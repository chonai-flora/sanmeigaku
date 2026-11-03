import { describe, expect, it } from 'bun:test';

import { SEKKI_BOUNDARIES_JST } from '../src/calendar/sekki-boundaries';
import { calculateMeishiki, calculateMonthBranch } from '../src/index';
import { PILLAR_FIXTURES } from './fixtures/pillars';

describe('pillar regression fixtures', () => {
  for (const [birthDate, year, month, day] of PILLAR_FIXTURES) {
    it(birthDate, () => {
      const result = calculateMeishiki({ birthDate });
      expect([
        result.pillars.year.label,
        result.pillars.month.label,
        result.pillars.day.label,
      ]).toEqual([year, month, day]);
    });
  }

  it('covers every monthly sekki before/on/after its calendar date', () => {
    const branches = [
      '寅',
      '卯',
      '辰',
      '巳',
      '午',
      '未',
      '申',
      '酉',
      '戌',
      '亥',
      '子',
      '丑',
    ] as const;
    const boundaries = SEKKI_BOUNDARIES_JST[2025];
    for (const [index, boundary] of boundaries.entries()) {
      const date = boundary.startsAtJst.slice(0, 10);
      const at = new Date(`${date}T00:00:00Z`);
      const previous = new Date(at.getTime() - 86_400_000).toISOString().slice(0, 10);
      const next = new Date(at.getTime() + 86_400_000).toISOString().slice(0, 10);
      const previousBranch = branches[(index + branches.length - 1) % branches.length];
      expect(calculateMonthBranch(previous)).toBe(previousBranch);
      expect(calculateMonthBranch(date)).toBe(previousBranch);
      expect(calculateMonthBranch(next)).toBe(branches[index]);
    }
  });
});
