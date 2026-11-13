import {getIntroLayoutMetrics} from '../intro-layout';

describe('responsive metrics onboarding', () => {
  it.each([
    [320, 568],
    [360, 640],
    [390, 844],
    [412, 915],
    [430, 932],
    [440, 956],
  ])('menjaga ukuran dalam batas aman pada viewport %ix%i', (width, height) => {
    const metrics = getIntroLayoutMetrics(width, height);

    expect(metrics.horizontalPadding).toBeGreaterThanOrEqual(18);
    expect(metrics.horizontalPadding).toBeLessThanOrEqual(38);
    expect(metrics.heroHeight).toBeGreaterThanOrEqual(168);
    expect(metrics.heroHeight).toBeLessThanOrEqual(440);
    expect(metrics.heroWidth).toBeGreaterThanOrEqual(300);
    expect(metrics.heroWidth).toBeLessThanOrEqual(Math.min(width, 480));
    expect(metrics.heroCopyGap).toBeGreaterThanOrEqual(18);
    expect(metrics.heroCopyGap).toBeLessThanOrEqual(36);
    expect(metrics.heroTopOffset).toBeGreaterThanOrEqual(0);
    expect(metrics.heroTopOffset).toBeLessThanOrEqual(4);
    expect(metrics.titleFontSize).toBeGreaterThanOrEqual(24);
    expect(metrics.titleFontSize).toBeLessThanOrEqual(36);
    expect(metrics.bodyFontSize).toBeGreaterThanOrEqual(13);
    expect(metrics.buttonHeight).toBeGreaterThanOrEqual(48);
    expect(metrics.buttonTopGap).toBeLessThanOrEqual(16);
    expect(metrics.indicatorDotSize).toBeGreaterThanOrEqual(7);
  });

  it('memperkecil hero lebih dahulu pada layar pendek', () => {
    const short = getIntroLayoutMetrics(360, 568);
    const tall = getIntroLayoutMetrics(360, 844);

    expect(short.heroHeight).toBeLessThan(tall.heroHeight);
    expect(short.heroCopyGap).toBeLessThan(tall.heroCopyGap);
    expect(short.heroTopOffset).toBeLessThan(tall.heroTopOffset);
    expect(short.titleFontSize).toBeGreaterThanOrEqual(24);
    expect(short.buttonHeight).toBeLessThan(tall.buttonHeight);
  });

  it('membatasi lebar konten pada tablet tanpa membesarkan ilustrasi berlebihan', () => {
    const tablet = getIntroLayoutMetrics(834, 1194);

    expect(tablet.contentMaxWidth).toBe(480);
    expect(tablet.heroWidth).toBe(480);
    expect(tablet.heroHeight).toBeLessThanOrEqual(440);
  });
});
