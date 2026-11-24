import {
  BRANDED_HEADER_ARTWORK_ASPECT_RATIO,
  PERFORMANCE_HEADER_ARTWORK_ASPECT_RATIO,
  PERFORMANCE_HEADER_ARTWORK_SCALE,
  getBrandedHeaderLayout,
  type BrandedHeaderVariant,
} from '../BrandedHeaderBackground';

describe('getBrandedHeaderLayout', () => {
  it.each([
    ['notifications', 390, 24],
  ] satisfies [BrandedHeaderVariant, number, number][])('%s keeps the new artwork inside a %ipx header', (variant, width, inset) => {
    const layout = getBrandedHeaderLayout(variant, width, inset);
    const artwork = layout.artworkStyle;

    expect(artwork.left).toBeGreaterThanOrEqual(0);
    expect(artwork.top).toBeGreaterThanOrEqual(0);
    expect(artwork.width).toBeLessThanOrEqual(width);
    expect(artwork.width).toBeLessThanOrEqual(430);
    expect((artwork.left as number) + (artwork.width as number)).toBeCloseTo(width, 5);
    expect(artwork.height).toBeLessThanOrEqual(layout.height);
    expect((artwork.top as number) + (artwork.height as number)).toBeCloseTo(layout.height, 5);
    expect((artwork.width as number) / (artwork.height as number)).toBeCloseTo(BRANDED_HEADER_ARTWORK_ASPECT_RATIO, 5);
    expect(layout.resizeMode).toBe('contain');
  });

  it('keeps the artwork bottom-aligned when the safe area increases', () => {
    const withoutInset = getBrandedHeaderLayout('compact-detail', 390, 0);
    const withInset = getBrandedHeaderLayout('compact-detail', 390, 44);

    expect(withInset.artworkStyle.width).toBe(withoutInset.artworkStyle.width);
    expect(withInset.artworkStyle.height).toBe(withoutInset.artworkStyle.height);
    expect(withInset.artworkStyle.left).toBe(withoutInset.artworkStyle.left);
    expect(withInset.height).toBeGreaterThanOrEqual(withoutInset.height);
    expect((withInset.artworkStyle.top as number) + (withInset.artworkStyle.height as number)).toBeCloseTo(withInset.height, 5);
  });

  it.each([
    'account',
    'application-list',
    'compact-detail',
    'jobs-list',
    'performance',
    'saved-list',
  ] satisfies BrandedHeaderVariant[])('%s uses the Performance artwork safely at phone and PWA widths', variant => {
    for (const width of [320, 390, 430, 720]) {
      const layout = getBrandedHeaderLayout(variant, width, 24);

      expect(layout.artworkStyle.left).toBeCloseTo(width - (width * PERFORMANCE_HEADER_ARTWORK_SCALE), 5);
      expect(layout.artworkStyle.width).toBeCloseTo(width * PERFORMANCE_HEADER_ARTWORK_SCALE, 5);
      expect(layout.artworkStyle.height).toBeCloseTo(
        (width / PERFORMANCE_HEADER_ARTWORK_ASPECT_RATIO) * PERFORMANCE_HEADER_ARTWORK_SCALE,
        5,
      );
      expect(layout.artworkStyle.top).toBe(24);
      expect(layout.artworkAspectRatio).toBe(PERFORMANCE_HEADER_ARTWORK_ASPECT_RATIO);
      expect((layout.artworkStyle.width as number) / (layout.artworkStyle.height as number)).toBeCloseTo(
        PERFORMANCE_HEADER_ARTWORK_ASPECT_RATIO,
        5,
      );
      expect((layout.artworkStyle.left as number) + (layout.artworkStyle.width as number)).toBeCloseTo(width, 5);
      expect((layout.artworkStyle.top as number) + (layout.artworkStyle.height as number)).toBeLessThanOrEqual(layout.height);
      expect(layout.resizeMode).toBe('contain');
    }
  });
});
