export type IntroLayoutMetrics = {
  buttonHeight: number;
  buttonRadius: number;
  bodyFontSize: number;
  bodyLineHeight: number;
  contentMaxWidth: number;
  horizontalPadding: number;
  heroHeight: number;
  indicatorGap: number;
  sectionGap: number;
  titleFontSize: number;
  titleLineHeight: number;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function getIntroLayoutMetrics(width: number, height: number): IntroLayoutMetrics {
  const compact = height < 700;
  const short = height < 620;

  return {
    buttonHeight: compact ? 52 : 58,
    buttonRadius: compact ? 12 : 14,
    bodyFontSize: clamp(width * 0.043, compact ? 14 : 16, compact ? 16 : 19),
    bodyLineHeight: clamp(width * 0.064, compact ? 20 : 23, compact ? 23 : 28),
    contentMaxWidth: 480,
    horizontalPadding: clamp(width * 0.075, 22, 38),
    heroHeight: short
      ? clamp(height * 0.3, 166, 194)
      : compact
        ? clamp(height * 0.34, 194, 250)
        : clamp(height * 0.42, 280, 430),
    indicatorGap: compact ? 16 : 22,
    sectionGap: compact ? 10 : 16,
    titleFontSize: clamp(width * 0.076, compact ? 26 : 29, compact ? 30 : 36),
    titleLineHeight: clamp(width * 0.096, compact ? 32 : 36, compact ? 37 : 44),
  };
}
