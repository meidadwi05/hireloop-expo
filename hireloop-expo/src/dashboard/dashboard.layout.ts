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
  return Math.round(clamp(safeWidth * 0.135, 46, 58));
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
