function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function getResetPasswordLayout(viewportWidth: number, viewportHeight: number) {
  const safeWidth = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 390;
  const safeHeight = Number.isFinite(viewportHeight) && viewportHeight > 0 ? viewportHeight : 844;
  const compact = safeWidth < 360 || safeHeight < 700;
  const logoWidth = compact ? 170 : 200;

  return {
    compact,
    contentHorizontalPadding: safeWidth < 360 ? 18 : 24,
    logoBottomMargin: compact ? 40 : 72,
    logoHeight: Math.round(logoWidth * (281 / 1000)),
    logoWidth,
    successCountdownGap: compact ? 42 : 72,
    successImageSize: Math.round(clamp(safeWidth * 0.68, 240, 300)),
  };
}
