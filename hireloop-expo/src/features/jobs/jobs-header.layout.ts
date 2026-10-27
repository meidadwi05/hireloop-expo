export type JobsIconLayout = {
  navigationButtonSize: number;
  navigationIconSize: number;
  searchIconSize: number;
  controlIconSize: number;
  chevronIconSize: number;
  iconSlotSize: number;
  searchFieldHeight: number;
  controlHeight: number;
  companyContainerSize: number;
  companyIconSize: number;
  cardActionIconSize: number;
  cardMetaIconSize: number;
  cardStatIconSize: number;
  cardChevronIconSize: number;
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function interpolate(value: number, from: number, to: number, start: number, end: number): number {
  if (from === to) return end;
  const progress = clamp((value - from) / (to - from), 0, 1);
  return start + ((end - start) * progress);
}

function responsiveValue(width: number, compact: number, phone: number, wide: number): number {
  if (width <= 390) return Math.round(interpolate(width, 320, 390, compact, phone));
  if (width <= 430) return phone;
  return Math.round(interpolate(width, 430, 720, phone, wide));
}

export function getJobsIconLayout(containerWidth: number): JobsIconLayout {
  const safeWidth = Number.isFinite(containerWidth) && containerWidth > 0 ? containerWidth : 390;
  const width = clamp(safeWidth, 320, 720);

  return {
    navigationButtonSize: responsiveValue(width, 32, 32, 34),
    navigationIconSize: responsiveValue(width, 20, 22, 24),
    searchIconSize: responsiveValue(width, 19, 20, 22),
    controlIconSize: responsiveValue(width, 18, 19, 21),
    chevronIconSize: responsiveValue(width, 16, 17, 18),
    iconSlotSize: responsiveValue(width, 22, 24, 26),
    searchFieldHeight: responsiveValue(width, 52, 54, 58),
    controlHeight: responsiveValue(width, 50, 52, 56),
    companyContainerSize: responsiveValue(width, 44, 48, 54),
    companyIconSize: responsiveValue(width, 22, 24, 27),
    cardActionIconSize: responsiveValue(width, 18, 19, 21),
    cardMetaIconSize: responsiveValue(width, 14, 15, 16),
    cardStatIconSize: responsiveValue(width, 17, 18, 20),
    cardChevronIconSize: responsiveValue(width, 17, 18, 19),
  };
}
