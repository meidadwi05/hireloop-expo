export function clampIntroIndex(index: number, slideCount: number): number {
  if (slideCount <= 0) return 0;
  if (!Number.isFinite(index)) return 0;

  return Math.min(Math.max(Math.round(index), 0), slideCount - 1);
}

export function getIntroIndexFromOffset(
  offsetX: number,
  viewportWidth: number,
  slideCount: number,
  fallbackIndex = 0,
): number {
  const fallback = clampIntroIndex(fallbackIndex, slideCount);

  if (!Number.isFinite(offsetX) || !Number.isFinite(viewportWidth) || viewportWidth <= 0) {
    return fallback;
  }

  return clampIntroIndex(offsetX / viewportWidth, slideCount);
}
