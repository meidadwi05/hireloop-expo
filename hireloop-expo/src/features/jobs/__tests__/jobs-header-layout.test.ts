import {getJobsHeaderIconLayout} from '../jobs-header.layout';

describe('jobs header responsive icon layout', () => {
  it('uses compact icon sizes without reducing the navigation touch target', () => {
    expect(getJobsHeaderIconLayout(320)).toEqual({
      navigationButtonSize: 32,
      navigationIconSize: 22,
      searchIconSize: 21,
      controlIconSize: 19,
      chevronIconSize: 17,
    });
  });

  it('matches the reference proportions on common phone widths', () => {
    expect(getJobsHeaderIconLayout(390)).toEqual({
      navigationButtonSize: 32,
      navigationIconSize: 24,
      searchIconSize: 22,
      controlIconSize: 20,
      chevronIconSize: 18,
    });
    expect(getJobsHeaderIconLayout(430)).toEqual(getJobsHeaderIconLayout(390));
  });

  it('caps icon growth on PWA and tablet widths', () => {
    expect(getJobsHeaderIconLayout(720)).toEqual({
      navigationButtonSize: 34,
      navigationIconSize: 26,
      searchIconSize: 24,
      controlIconSize: 22,
      chevronIconSize: 19,
    });
    expect(getJobsHeaderIconLayout(1200)).toEqual(getJobsHeaderIconLayout(720));
  });
});
