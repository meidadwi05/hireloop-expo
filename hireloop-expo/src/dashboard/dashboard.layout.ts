const DASHBOARD_IMAGE_WIDTH = 1200;
const DASHBOARD_IMAGE_HEIGHT = 835;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function getDashboardHeroLayout(viewportWidth: number) {
  const safeWidth = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 390;
  const pageWidth = clamp(safeWidth, 280, 720);
  const compact = pageWidth < 390;
  const wide = pageWidth >= 600;
  const heroHeight = Math.round(clamp(
    pageWidth * (DASHBOARD_IMAGE_HEIGHT / DASHBOARD_IMAGE_WIDTH),
    220,
    501,
  ));
  const logoWidth = Math.round(clamp(pageWidth * 0.29, 120, 190));

  return {
    actionsTop: Math.round(Math.max(48, Math.round(clamp(heroHeight * 0.29, 64, 145)) - clamp(pageWidth * 0.025, 8, 12))),
    compact,
    contentTop: Math.round(clamp(heroHeight * 0.29, 64, 145)),
    heroHeight,
    horizontalPadding: compact ? 18 : pageWidth < 600 ? 28 : 36,
    logoHeight: Math.round(logoWidth * (281 / 1000)),
    logoWidth,
    wide,
  };
}

export function getDashboardSummaryIconSize(viewportWidth: number) {
  const safeWidth = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 390;
  const pageWidth = clamp(safeWidth, 320, 720);

  if (pageWidth <= 390) {
    return Math.round(42 + ((pageWidth - 320) / 70) * 8);
  }

  if (pageWidth <= 430) {
    return Math.round(50 + ((pageWidth - 390) / 40) * 2);
  }

  return Math.round(52 + ((pageWidth - 430) / 290) * 4);
}

export function getDashboardSummaryIconRadius(viewportWidth: number) {
  return Math.round(getDashboardSummaryIconSize(viewportWidth) * 0.42);
}

export function getDashboardSummaryGlyphSize(viewportWidth: number) {
  const safeWidth = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 390;
  const pageWidth = clamp(safeWidth, 320, 720);

  if (pageWidth <= 390) {
    return Math.round(20 + ((pageWidth - 320) / 70) * 3);
  }

  if (pageWidth <= 430) {
    return Math.round(23 + ((pageWidth - 390) / 40));
  }

  return Math.round(24 + ((pageWidth - 430) / 290) * 2);
}

export function getDashboardSummaryOverlap(viewportWidth: number) {
  const safeWidth = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 390;
  const pageWidth = clamp(safeWidth, 280, 720);

  if (pageWidth <= 320) {
    return Math.round(34 + ((pageWidth - 280) / 40) * 6);
  }

  if (pageWidth <= 430) {
    return Math.round(40 + ((pageWidth - 320) / 110) * 12);
  }

  return Math.round(52 + ((pageWidth - 430) / 290) * 4);
}
