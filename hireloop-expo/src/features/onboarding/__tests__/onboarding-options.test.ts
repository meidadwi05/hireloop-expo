import {isNoFormalEducation, normalizeAvailability, normalizeEmploymentStatus, normalizeWorkSystem} from '../onboarding.options';

describe('onboarding option adapters', () => {
  it.each([
    ['onsite', 'on_site'],
    ['on_site', 'on_site'],
    ['Remote', 'remote'],
    ['hybrid', 'hybrid'],
  ])('normalizes legacy work system %s', (input, output) => {
    expect(normalizeWorkSystem(input)).toBe(output);
  });

  it.each([
    ['part_time', 'paruh_waktu'],
    ['contract', 'kontrak'],
    ['Penuh Waktu', 'full_time'],
    ['Magang', 'internship'],
    ['casual', 'kasual'],
  ])('normalizes legacy employment status %s', (input, output) => {
    expect(normalizeEmploymentStatus(input)).toBe(output);
  });

  it('normalizes availability labels and recognizes non-formal education', () => {
    expect(normalizeAvailability('Siap Bekerja')).toBe('available');
    expect(normalizeAvailability('Terbuka Untuk Peluang')).toBe('actively_looking');
    expect(isNoFormalEducation('Kurang dari SD')).toBe(true);
  });
});
