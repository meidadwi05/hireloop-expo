export type IntroLayoutMetrics = {
  buttonArrowFontSize: number;
  buttonFontSize: number;
  buttonHeight: number;
  buttonRadius: number;
  buttonTopGap: number;
  bodyFontSize: number;
  bodyLineHeight: number;
  contentBottomPadding: number;
  contentMaxWidth: number;
  headerHeight: number;
  horizontalPadding: number;
  heroCopyGap: number;
  heroHeight: number;
  heroTopOffset: number;
  heroWidth: number;
  indicatorDotGap: number;
  indicatorDotSize: number;
  indicatorGap: number;
  sectionGap: number;
  skipFontSize: number;
  titleFontSize: number;
  titleLineHeight: number;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function getIntroLayoutMetrics(width: number, height: number): IntroLayoutMetrics {
  const safeWidth = Math.max(width, 280);
  const safeHeight = Math.max(height, 480);
  const narrow = safeWidth < 360;
  const compact = safeHeight < 760;
  const short = safeHeight < 640;

  const horizontalPadding = clamp(safeWidth * 0.068, narrow ? 18 : 22, 38);
  const contentWidth = Math.min(safeWidth - (horizontalPadding * 2), 480);
  const titleFontSize = clamp(safeWidth * 0.078, short ? 24 : compact ? 26 : 29, compact ? 31 : 36);
  const titleLineHeight = Math.round(titleFontSize * 1.22);
  const bodyFontSize = clamp(safeWidth * 0.043, short ? 13 : compact ? 14 : 16, compact ? 17 : 19);
  const bodyLineHeight = Math.round(bodyFontSize * 1.45);
  const headerHeight = short ? 38 : compact ? 42 : 46;
  const heroCopyGap = short ? 8 : compact ? 14 : 20;
  const sectionGap = short ? 7 : compact ? 10 : 14;
  const indicatorGap = short ? 8 : compact ? 12 : 16;
  const buttonTopGap = short ? 8 : compact ? 12 : 16;
  const buttonHeight = short ? 48 : compact ? 52 : 56;
  const indicatorDotSize = short ? 7 : 9;
  const contentBottomPadding = short ? 4 : compact ? 6 : 8;
  // Sisakan ruang konservatif untuk safe area atas/bawah agar seluruh copy dan CTA
  // tetap muat. Jika font aksesibilitas membuat konten lebih tinggi, container
  // vertikal tetap dapat di-scroll tanpa menabrakkan komponen.
  const safeAreaReserve = short ? 42 : compact ? 52 : 64;
  const fixedContentHeight = safeAreaReserve
    + headerHeight
    + (titleLineHeight * 2)
    + (bodyLineHeight * 3)
    + heroCopyGap
    + sectionGap
    + indicatorGap
    + indicatorDotSize
    + buttonTopGap
    + buttonHeight
    + contentBottomPadding;
  const heroBudget = Math.max(safeHeight - fixedContentHeight, 168);
  const heroHeight = Math.min(
    heroBudget,
    contentWidth * (short ? 0.78 : compact ? 0.88 : 0.98),
    420,
  );

  return {
    buttonArrowFontSize: short ? 24 : 28,
    buttonFontSize: short ? 14 : compact ? 15 : 16,
    buttonHeight,
    buttonRadius: short ? 10 : compact ? 12 : 14,
    buttonTopGap,
    bodyFontSize,
    bodyLineHeight,
    contentBottomPadding,
    contentMaxWidth: 480,
    headerHeight,
    horizontalPadding,
    heroCopyGap,
    heroHeight,
    heroTopOffset: short ? 0 : compact ? 2 : 4,
    heroWidth: contentWidth,
    indicatorDotGap: short ? 7 : 9,
    indicatorDotSize,
    indicatorGap,
    sectionGap,
    skipFontSize: short ? 14 : 15,
    titleFontSize,
    titleLineHeight,
  };
}
