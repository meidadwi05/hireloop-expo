import {
  getDashboardHeroLayout,
  getDashboardSummaryGlyphSize,
  getDashboardSummaryIconRadius,
  getDashboardSummaryIconSize,
  getDashboardSummaryOverlap,
  getDashboardResponsiveLayout,
} from '../dashboard.layout';

describe('dashboard home responsive layout', () => {
  test('mengikuti rasio asset hero pada ukuran ponsel dan lebar referensi', () => {
    expect(getDashboardHeroLayout(320)).toMatchObject({
      compact: true,
      headerGreetingGap: 24,
      headerRowHeight: 44,
      headerTopPadding: 18,
      heroHeight: 223,
      horizontalPadding: 18,
      logoHeight: 36,
      logoWidth: 132,
    });
    expect(getDashboardHeroLayout(390)).toMatchObject({
      compact: false,
      headerGreetingGap: 32,
      headerRowHeight: 44,
      headerTopPadding: 22,
      heroHeight: 271,
      horizontalPadding: 28,
      logoHeight: 38,
      logoWidth: 140,
    });
    expect(getDashboardHeroLayout(640)).toMatchObject({
      compact: false,
      headerGreetingGap: 36,
      headerRowHeight: 58,
      headerTopPadding: 24,
      heroHeight: 445,
      horizontalPadding: 36,
      logoHeight: 58,
      logoWidth: 210,
      wide: true,
    });
  });

  test('memperbesar logo memakai rasio asset asli tanpa melewati batas responsif', () => {
    for (const width of [320, 390, 430, 640, 720]) {
      const layout = getDashboardHeroLayout(width);
      expect(layout.logoWidth).toBeGreaterThanOrEqual(132);
      expect(layout.logoWidth).toBeLessThanOrEqual(210);
      expect(layout.logoHeight).toBe(Math.round(layout.logoWidth * (274 / 1000)));
      expect(layout.headerRowHeight).toBeGreaterThanOrEqual(44);
    }
  });

  test('membatasi hero pada lebar dashboard maksimum 720px', () => {
    expect(getDashboardHeroLayout(1200)).toEqual(getDashboardHeroLayout(720));
    expect(getDashboardHeroLayout(720).heroHeight).toBe(501);
  });

  test('menskalakan ikon ringkasan tanpa terlalu kecil atau besar', () => {
    expect(getDashboardSummaryIconSize(320)).toBe(42);
    expect(getDashboardSummaryIconSize(390)).toBe(50);
    expect(getDashboardSummaryIconSize(430)).toBe(52);
    expect(getDashboardSummaryIconSize(550)).toBe(54);
    expect(getDashboardSummaryIconSize(1200)).toBe(56);
  });

  test('menjaga sudut ikon sebagai squircle yang mendekati lingkaran', () => {
    expect(getDashboardSummaryIconRadius(320)).toBe(18);
    expect(getDashboardSummaryIconRadius(390)).toBe(21);
    expect(getDashboardSummaryIconRadius(430)).toBe(22);
    expect(getDashboardSummaryIconRadius(1200)).toBe(24);
  });

  test('menskalakan glyph indikator berdasarkan lebar container aktual', () => {
    expect(getDashboardSummaryGlyphSize(320)).toBe(20);
    expect(getDashboardSummaryGlyphSize(390)).toBe(23);
    expect(getDashboardSummaryGlyphSize(430)).toBe(24);
    expect(getDashboardSummaryGlyphSize(720)).toBe(26);
  });

  test('menaikkan seluruh grid indikator secara responsif terhadap hero', () => {
    expect(getDashboardSummaryOverlap(280)).toBe(34);
    expect(getDashboardSummaryOverlap(320)).toBe(40);
    expect(getDashboardSummaryOverlap(390)).toBe(48);
    expect(getDashboardSummaryOverlap(430)).toBe(52);
    expect(getDashboardSummaryOverlap(720)).toBe(56);
    expect(getDashboardSummaryOverlap(1200)).toBe(56);
  });

  test('mengunci seluruh content dashboard di dalam lebar aman', () => {
    expect(getDashboardResponsiveLayout(280)).toMatchObject({
      compact: true,
      contentPadding: 14,
      contentWidth: 252,
      interviewDateWidth: 72,
      jobCardWidth: 248,
      pageWidth: 280,
      shortcutColumns: 2,
      summaryGap: 8,
      summaryItemMinHeight: 86,
    });
    expect(getDashboardResponsiveLayout(390)).toMatchObject({
      compact: false,
      contentPadding: 20,
      contentWidth: 350,
      interviewDateWidth: 82,
      jobCardWidth: 322,
      pageWidth: 390,
      shortcutColumns: 4,
    });
    expect(getDashboardResponsiveLayout(720)).toMatchObject({
      contentPadding: 24,
      contentWidth: 672,
      jobCardWidth: 370,
      pageWidth: 720,
      wide: true,
    });
  });

  test('menormalkan viewport invalid dan membatasi layout tablet maksimum 720px', () => {
    expect(getDashboardResponsiveLayout(Number.NaN)).toEqual(getDashboardResponsiveLayout(390));
    expect(getDashboardResponsiveLayout(1_200)).toEqual(getDashboardResponsiveLayout(720));

    for (const width of [280, 320, 359, 390, 430, 600, 720]) {
      const layout = getDashboardResponsiveLayout(width);
      expect(layout.contentWidth).toBeGreaterThan(0);
      expect(layout.jobCardWidth).toBeLessThanOrEqual(layout.contentWidth);
      expect(layout.contentPadding * 2 + layout.contentWidth).toBe(layout.pageWidth);
    }
  });
});
