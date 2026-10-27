import {
  getDashboardHeroLayout,
  getDashboardSummaryIconRadius,
  getDashboardSummaryIconSize,
  getDashboardSummaryOverlap,
} from '../dashboard.layout';

describe('dashboard home responsive layout', () => {
  test('mengikuti rasio asset hero pada ukuran ponsel dan lebar referensi', () => {
    expect(getDashboardHeroLayout(320)).toMatchObject({
      actionsTop: 57,
      compact: true,
      heroHeight: 223,
      horizontalPadding: 18,
      logoWidth: 120,
    });
    expect(getDashboardHeroLayout(390)).toMatchObject({
      actionsTop: 69,
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
    expect(getDashboardSummaryIconSize(320)).toBe(42);
    expect(getDashboardSummaryIconSize(390)).toBe(47);
    expect(getDashboardSummaryIconSize(550)).toBe(48);
    expect(getDashboardSummaryIconSize(1200)).toBe(48);
  });

  test('menjaga sudut ikon sebagai rounded-square secara proporsional', () => {
    expect(getDashboardSummaryIconRadius(320)).toBe(10);
    expect(getDashboardSummaryIconRadius(390)).toBe(11);
    expect(getDashboardSummaryIconRadius(550)).toBe(11);
    expect(getDashboardSummaryIconRadius(1200)).toBe(11);
  });

  test('menaikkan seluruh grid indikator secara responsif terhadap hero', () => {
    expect(getDashboardSummaryOverlap(280)).toBe(34);
    expect(getDashboardSummaryOverlap(320)).toBe(40);
    expect(getDashboardSummaryOverlap(390)).toBe(48);
    expect(getDashboardSummaryOverlap(430)).toBe(52);
    expect(getDashboardSummaryOverlap(720)).toBe(56);
    expect(getDashboardSummaryOverlap(1200)).toBe(56);
  });
});
