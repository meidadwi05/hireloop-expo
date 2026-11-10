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

    expect(metrics.horizontalPadding).toBeGreaterThanOrEqual(20);
    expect(metrics.horizontalPadding).toBeLessThanOrEqual(38);
    expect(metrics.heroHeight).toBeGreaterThanOrEqual(220);
    expect(metrics.heroHeight).toBeLessThanOrEqual(520);
    expect(metrics.heroWidth).toBeGreaterThanOrEqual(300);
    expect(metrics.heroWidth).toBeLessThanOrEqual(Math.min(width * 1.1, 570));
    expect(metrics.heroCopyGap).toBeGreaterThanOrEqual(24);
    expect(metrics.heroCopyGap).toBeLessThanOrEqual(42);
    expect(metrics.heroTopOffset).toBeGreaterThanOrEqual(4);
    expect(metrics.heroTopOffset).toBeLessThanOrEqual(12);
    expect(metrics.titleFontSize).toBeGreaterThanOrEqual(26);
    expect(metrics.titleFontSize).toBeLessThanOrEqual(36);
    expect(metrics.bodyFontSize).toBeGreaterThanOrEqual(14);
    expect(metrics.buttonHeight).toBeGreaterThanOrEqual(52);
  });

  it('memperkecil hero lebih dahulu pada layar pendek', () => {
    const short = getIntroLayoutMetrics(360, 568);
    const tall = getIntroLayoutMetrics(360, 844);

    expect(short.heroHeight).toBeLessThan(tall.heroHeight);
    expect(short.heroCopyGap).toBeLessThan(tall.heroCopyGap);
    expect(short.heroTopOffset).toBeLessThan(tall.heroTopOffset);
    expect(short.titleFontSize).toBeGreaterThanOrEqual(26);
  });
});
