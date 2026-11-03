import { SanmeigakuInputError, SanmeigakuRangeError } from '../types.js';

export const MIN_SUPPORTED_DATE = '1900-02-05';
export const MAX_SUPPORTED_DATE = '2100-12-31';

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const validateBirthDate = (birthDate: string) => {
  const match = DATE_PATTERN.exec(birthDate);
  if (!match) {
    throw new SanmeigakuInputError('birthDate must use the YYYY-MM-DD format.');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const normalized = new Date(Date.UTC(year, month - 1, day));
  if (
    normalized.getUTCFullYear() !== year ||
    normalized.getUTCMonth() !== month - 1 ||
    normalized.getUTCDate() !== day
  ) {
    throw new SanmeigakuInputError('birthDate must be a valid calendar date.');
  }

  return { birthDate, year, month, day, utcMilliseconds: normalized.getTime() };
};

export const validateSupportedBirthDate = (birthDate: string) => {
  const parsed = validateBirthDate(birthDate);
  if (birthDate < MIN_SUPPORTED_DATE || birthDate > MAX_SUPPORTED_DATE) {
    throw new SanmeigakuRangeError(
      `birthDate must be between ${MIN_SUPPORTED_DATE} and ${MAX_SUPPORTED_DATE}.`,
    );
  }
  return parsed;
};
