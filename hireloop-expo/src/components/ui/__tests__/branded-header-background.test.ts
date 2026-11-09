import {
  BRANDED_HEADER_ARTWORK_ASPECT_RATIO,
  getBrandedHeaderLayout,
  type BrandedHeaderVariant,
} from '../BrandedHeaderBackground';

describe('getBrandedHeaderLayout', () => {
  it.each([
    ['account', 390, 24],
    ['application-list', 320, 24],
    ['application-list', 390, 24],
    ['compact-detail', 430, 44],
    ['jobs-list', 390, 24],
    ['jobs-list', 720, 24],
    ['notifications', 390, 24],
    ['saved-list', 390, 24],
  ] satisfies [BrandedHeaderVariant, number, number][])('%s keeps the full artwork inside a %ipx header', (variant, width, inset) => {
    const layout = getBrandedHeaderLayout(variant, width, inset);
    const artwork = layout.artworkStyle;

    expect(artwork.top).toBe(0);
    expect(artwork.left).toBeGreaterThanOrEqual(0);
    expect(artwork.width).toBeLessThanOrEqual(width);
    expect((artwork.left as number) + (artwork.width as number)).toBeLessThanOrEqual(width);
    expect(artwork.height).toBeLessThanOrEqual(layout.height);
    expect((artwork.width as number) / (artwork.height as number)).toBeCloseTo(BRANDED_HEADER_ARTWORK_ASPECT_RATIO, 5);
  });

  it('keeps safe-area growth separate from the artwork position', () => {
    const withoutInset = getBrandedHeaderLayout('compact-detail', 390, 0);
    const withInset = getBrandedHeaderLayout('compact-detail', 390, 44);

    expect(withInset.artworkStyle.width).toBe(withoutInset.artworkStyle.width);
    expect(withInset.artworkStyle.height).toBe(withoutInset.artworkStyle.height);
    expect(withInset.artworkStyle.top).toBe(withoutInset.artworkStyle.top);
    expect(withInset.artworkStyle.left).toBe(withoutInset.artworkStyle.left);
    expect(withInset.height).toBeGreaterThanOrEqual(withoutInset.height);
  });

  it.each([320, 360, 390, 412, 430])('keeps the complete artwork visible on phone width %ipx', width => {
    const layout = getBrandedHeaderLayout('application-list', width, 24);
    const artwork = layout.artworkStyle;

    expect(artwork.left).toBe(0);
    expect(artwork.top).toBe(0);
    expect(artwork.width).toBe(width);
    expect(artwork.height).toBeCloseTo(width / BRANDED_HEADER_ARTWORK_ASPECT_RATIO, 5);
    expect((artwork.top as number) + (artwork.height as number)).toBeLessThanOrEqual(layout.height);
    expect(layout.resizeMode).toBe('cover');
  });

  it('caps the application header height on a wide PWA viewport', () => {
    const phone = getBrandedHeaderLayout('application-list', 430, 24);
    const wide = getBrandedHeaderLayout('application-list', 720, 24);

    expect(wide.height).toBe(phone.height);
    expect(wide.artworkStyle.width).toBe(720);
    expect(wide.artworkStyle.height).toBe(phone.artworkStyle.height);
    expect(wide.resizeMode).toBe('cover');
  });

  it.each(['jobs-list', 'saved-list'] satisfies BrandedHeaderVariant[])(
    '%s restores the full-width artwork to its original left position',
    variant => {
      const layout = getBrandedHeaderLayout(variant, 390, 24);

      expect(layout.height).toBeCloseTo(390 / BRANDED_HEADER_ARTWORK_ASPECT_RATIO, 5);
      expect(layout.artworkStyle.left).toBe(0);
      expect(layout.artworkStyle.width).toBe(390);
      expect(layout.artworkStyle.height).toBeCloseTo(390 / BRANDED_HEADER_ARTWORK_ASPECT_RATIO, 5);
      expect(layout.resizeMode).toBe('contain');
    },
  );
});
