import {clampIntroIndex, getIntroIndexFromOffset} from '../intro-pager';

describe('intro pager', () => {
  it('menghitung halaman terdekat dari posisi swipe', () => {
    expect(getIntroIndexFromOffset(159, 320, 4)).toBe(0);
    expect(getIntroIndexFromOffset(160, 320, 4)).toBe(1);
    expect(getIntroIndexFromOffset(640, 320, 4)).toBe(2);
  });

  it('membatasi overscroll ke halaman yang tersedia', () => {
    expect(getIntroIndexFromOffset(-200, 320, 4)).toBe(0);
    expect(getIntroIndexFromOffset(1600, 320, 4)).toBe(3);
    expect(clampIntroIndex(8, 4)).toBe(3);
  });

  it('mempertahankan halaman aktif saat ukuran viewport tidak valid', () => {
    expect(getIntroIndexFromOffset(320, 0, 4, 2)).toBe(2);
    expect(getIntroIndexFromOffset(Number.NaN, 320, 4, 1)).toBe(1);
  });
});
