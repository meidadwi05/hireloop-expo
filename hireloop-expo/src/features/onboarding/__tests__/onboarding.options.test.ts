import {supportsEducationMajor} from '../onboarding.options';

describe('opsi tingkat pendidikan', () => {
  it('menonaktifkan jurusan untuk pendidikan di bawah SMA', () => {
    expect(supportsEducationMajor('Kurang dari SD')).toBe(false);
    expect(supportsEducationMajor('SD')).toBe(false);
    expect(supportsEducationMajor('SMP')).toBe(false);
  });

  it('mengizinkan jurusan mulai SMA/SMK', () => {
    expect(supportsEducationMajor('SMA/SMK')).toBe(true);
    expect(supportsEducationMajor('D3')).toBe(true);
    expect(supportsEducationMajor('S1')).toBe(true);
  });
});
