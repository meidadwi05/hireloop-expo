export type JobsHeaderIconLayout = {
  navigationButtonSize: number;
  navigationIconSize: number;
  searchIconSize: number;
  controlIconSize: number;
  chevronIconSize: number;
};

export function getJobsHeaderIconLayout(viewportWidth: number): JobsHeaderIconLayout {
  const width = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 390;

  if (width <= 350) {
    return {
      navigationButtonSize: 32,
      navigationIconSize: 22,
      searchIconSize: 21,
      controlIconSize: 19,
      chevronIconSize: 17,
    };
  }

  if (width <= 430) {
    return {
      navigationButtonSize: 32,
      navigationIconSize: 24,
      searchIconSize: 22,
      controlIconSize: 20,
      chevronIconSize: 18,
    };
  }

  return {
    navigationButtonSize: 34,
    navigationIconSize: 26,
    searchIconSize: 24,
    controlIconSize: 22,
    chevronIconSize: 19,
  };
}
