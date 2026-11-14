import { describe, expect, it } from 'bun:test';

import { getHiddenStemBySekkiDay } from '../src/domain/stars';
import { calculateMeishiki } from '../src/index';
import type { EarthlyBranch, HeavenlyStem } from '../src/types';

const BOUNDARIES = [
  ['丑', 9, '癸', '辛'],
  ['丑', 12, '辛', '己'],
  ['寅', 7, '戊', '丙'],
  ['寅', 14, '丙', '甲'],
  ['辰', 9, '乙', '癸'],
  ['辰', 12, '癸', '戊'],
  ['巳', 5, '戊', '庚'],
  ['巳', 14, '庚', '丙'],
  ['午', 19, '己', '丁'],
  ['未', 9, '丁', '乙'],
  ['未', 12, '乙', '己'],
  ['申', 10, '戊', '壬'],
  ['申', 13, '壬', '庚'],
  ['戌', 9, '辛', '丁'],
  ['戌', 12, '丁', '戊'],
  ['亥', 12, '甲', '壬'],
] as const satisfies readonly (readonly [EarthlyBranch, number, HeavenlyStem, HeavenlyStem])[];

describe('getHiddenStemBySekkiDay', () => {
  describe.each(BOUNDARIES)('%sの%d日目が境界の場合', (branch, lastDay, before, after) => {
    it('境界の前日と当日は切り替わらず、翌日に切り替わること', () => {
      expect(getHiddenStemBySekkiDay(branch, lastDay - 1)).toBe(before);
      expect(getHiddenStemBySekkiDay(branch, lastDay)).toBe(before);
      expect(getHiddenStemBySekkiDay(branch, lastDay + 1)).toBe(after);
    });
  });

  describe.each(['子', '卯', '酉'] as const)('%sが蔵干を1つだけ持つ場合', (branch) => {
    it('日数によらず同じ蔵干を返すこと', () => {
      expect(getHiddenStemBySekkiDay(branch, 1)).toBe(getHiddenStemBySekkiDay(branch, 30));
    });
  });
});

describe('calculateMeishiki', () => {
  describe('2004-09-12の場合', () => {
    const result = calculateMeishiki({ birthDate: '2004-09-12' });

    it('節入り日数で右手と左手の星を選ぶこと', () => {
      expect(result.majorStars.rightHand).toBe('司禄星');
      expect(result.majorStars.leftHand).toBe('禄存星');
    });

    it('星と分析の元になる蔵干が一致すること', () => {
      expect(result.analysis.majorStars.rightHand.sourceStem).toBe('己');
      expect(result.analysis.majorStars.chest.sourceStem).toBe('辛');
      expect(result.analysis.majorStars.leftHand.sourceStem).toBe('戊');
      expect(result.analysis.majorStars.rightHand.key).toBe(result.majorStars.rightHand);
      expect(result.analysis.majorStars.chest.key).toBe(result.majorStars.chest);
      expect(result.analysis.majorStars.leftHand.key).toBe(result.majorStars.leftHand);
    });
  });
});
