import {getDashboardHeroLayout, getDashboardSummaryIconSize} from '../dashboard.layout';

describe('dashboard home responsive layout', () => {
  test('mengikuti rasio asset hero pada ukuran ponsel dan lebar referensi', () => {
    expect(getDashboardHeroLayout(320)).toMatchObject({
      compact: true,
      heroHeight: 223,
      horizontalPadding: 18,
      logoWidth: 120,
    });
    expect(getDashboardHeroLayout(390)).toMatchObject({
      compact: false,
      heroHeight: 271,
      horizontalPadding: 28,
      logoWidth: 120,
    });
    expect(getDashboardHeroLayout(640)).toMatchObject({
      compact: false,
      heroHeight: 445,
      horizontalPadding: 36,
      logoWidth: 186,
      wide: true,
    });
  });

  test('membatasi hero pada lebar dashboard maksimum 720px', () => {
    expect(getDashboardHeroLayout(1200)).toEqual(getDashboardHeroLayout(720));
    expect(getDashboardHeroLayout(720).heroHeight).toBe(501);
  });

  test('menskalakan ikon ringkasan tanpa terlalu kecil atau besar', () => {
    expect(getDashboardSummaryIconSize(320)).toBe(46);
    expect(getDashboardSummaryIconSize(390)).toBe(53);
    expect(getDashboardSummaryIconSize(550)).toBe(58);
    expect(getDashboardSummaryIconSize(1200)).toBe(58);
  });
});
