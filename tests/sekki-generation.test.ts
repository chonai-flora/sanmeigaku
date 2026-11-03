import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

import {
  buildGeneratedContent,
  calculateSekkiBoundaries,
  loadSource,
  OUTPUT_PATH,
  SOURCE_PATH,
} from '../scripts/generate-sekki-boundaries';
import naoGolden from './nao-sekki-2004-plus.json';

describe('sekki dataset', () => {
  it('reproduces the committed source with astronomia', () => {
    expect(loadSource()).toEqual(calculateSekkiBoundaries());
  }, 15_000);

  it('keeps the source and generated module in sync', () => {
    expect(readFileSync(OUTPUT_PATH, 'utf8')).toBe(buildGeneratedContent(loadSource(SOURCE_PATH)));
  });

  it('verifies all available boundary times against the minute-level NAO fixture', () => {
    const source = loadSource();
    for (const [year, golden] of Object.entries(naoGolden)) {
      const actual = source[year];
      expect(actual).toBeDefined();
      expect(actual?.map(({ name }) => name)).toEqual(golden.map(({ name }) => name));
      for (const [index, boundary] of actual?.entries() ?? []) {
        const expected = golden[index];
        expect(expected).toBeDefined();
        expect(
          Math.abs(Date.parse(boundary.startsAtJst) - Date.parse(expected!.startsAtJst)),
        ).toBeLessThan(60_000);
      }
    }
  });
});
