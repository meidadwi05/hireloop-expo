import {getJobsIconLayout} from '../jobs-header.layout';

describe('jobs header responsive icon layout', () => {
  it('uses compact icon sizes without reducing the navigation touch target', () => {
    expect(getJobsIconLayout(320)).toMatchObject({
      navigationButtonSize: 32,
      navigationIconSize: 20,
      searchIconSize: 19,
      controlIconSize: 18,
      chevronIconSize: 16,
      searchFieldHeight: 52,
      controlHeight: 50,
    });
  });

  it('matches the reference proportions on common phone widths', () => {
    expect(getJobsIconLayout(390)).toMatchObject({
      navigationButtonSize: 32,
      navigationIconSize: 22,
      searchIconSize: 20,
      controlIconSize: 19,
      chevronIconSize: 17,
      searchFieldHeight: 54,
      controlHeight: 52,
    });
    expect(getJobsIconLayout(430)).toEqual(getJobsIconLayout(390));
  });

  it('scales card and header icons together, then caps them at the page maximum', () => {
    expect(getJobsIconLayout(720)).toEqual({
      navigationButtonSize: 34,
      navigationIconSize: 24,
      searchIconSize: 22,
      controlIconSize: 21,
      chevronIconSize: 18,
      iconSlotSize: 26,
      searchFieldHeight: 58,
      controlHeight: 56,
      companyContainerSize: 54,
      companyIconSize: 27,
      cardActionIconSize: 21,
      cardMetaIconSize: 16,
      cardStatIconSize: 20,
      cardChevronIconSize: 19,
    });
    expect(getJobsIconLayout(1200)).toEqual(getJobsIconLayout(720));
  });

  it('does not jump in size around the old 430px breakpoint', () => {
    const before = getJobsIconLayout(430);
    const after = getJobsIconLayout(431);

    expect(Math.abs(after.navigationIconSize - before.navigationIconSize)).toBeLessThanOrEqual(1);
    expect(Math.abs(after.searchFieldHeight - before.searchFieldHeight)).toBeLessThanOrEqual(1);
  });
});
