import {formatRupiahInput, isWorkPreferenceSelectionValid, parseRupiahInput, sanitizeRupiahInput} from '../work-preference.utils';

describe('work preference rupiah helpers', () => {
  it.each([
    ['', ''],
    ['9', 'Rp 9'],
    ['9000', 'Rp 9.000'],
    ['9000000', 'Rp 9.000.000'],
    ['Rp 9.000.000', 'Rp 9.000.000'],
  ])('formats %s as %s', (input, expected) => {
    expect(formatRupiahInput(input)).toBe(expected);
  });

  it('keeps only digits and removes redundant leading zeroes', () => {
    expect(sanitizeRupiahInput('Rp 0009.500.000,-')).toBe('9500000');
  });

  it('returns numeric API values and null for an empty value', () => {
    expect(parseRupiahInput('Rp 9.000.000')).toBe(9000000);
    expect(parseRupiahInput('')).toBeNull();
  });

  it('requires at least one desired role before preferences can be saved', () => {
    expect(isWorkPreferenceSelectionValid(0, 1, 1)).toBe(false);
    expect(isWorkPreferenceSelectionValid(1, 1, 1)).toBe(true);
  });
});
