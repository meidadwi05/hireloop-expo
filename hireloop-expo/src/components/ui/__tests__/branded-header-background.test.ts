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

  it.each([320, 360, 390, 412, 430])('keeps the complete artwork visible on phone width %ipx', width => {
    const layout = getBrandedHeaderLayout('application-list', width, 24);
    const artwork = layout.artworkStyle;

    expect(artwork.left).toBe(0);
    expect(artwork.width).toBe(width);
    expect(artwork.height).toBeCloseTo(width / BRANDED_HEADER_ARTWORK_ASPECT_RATIO, 5);
    expect((artwork.top as number) + (artwork.height as number)).toBeLessThanOrEqual(layout.height);
    expect((artwork.top as number) + (artwork.height as number)).toBeCloseTo(layout.height, 5);
    expect(layout.resizeMode).toBe('contain');
  });

  it('caps and right-aligns the application artwork on a wide viewport', () => {
    const phone = getBrandedHeaderLayout('application-list', 430, 24);
    const wide = getBrandedHeaderLayout('application-list', 720, 24);

    expect(wide.height).toBe(phone.height);
    expect(wide.artworkStyle.width).toBe(430);
    expect(wide.artworkStyle.height).toBe(phone.artworkStyle.height);
    expect(wide.artworkStyle.left).toBe(290);
    expect(wide.resizeMode).toBe('contain');
  });

  it('caps the detail artwork on a wide viewport without cropping it', () => {
    const phone = getBrandedHeaderLayout('compact-detail', 430, 24);
    const wide = getBrandedHeaderLayout('compact-detail', 720, 24);

    expect(wide.height).toBe(phone.height);
    expect(wide.artworkStyle.left).toBe(290);
    expect(wide.artworkStyle.top).toBe(0);
    expect(wide.artworkStyle.width).toBe(430);
    expect(wide.artworkStyle.height).toBe(phone.artworkStyle.height);
    expect(wide.resizeMode).toBe('contain');
  });

  it.each(['account', 'jobs-list', 'saved-list'] satisfies BrandedHeaderVariant[])(
    '%s uses the new compact artwork ratio',
    variant => {
      const layout = getBrandedHeaderLayout(variant, 390, 24);

      expect(layout.height).toBeCloseTo(390 / BRANDED_HEADER_ARTWORK_ASPECT_RATIO, 5);
      expect(layout.artworkStyle.left).toBe(0);
      expect(layout.artworkStyle.top).toBe(0);
      expect(layout.artworkStyle.width).toBe(390);
      expect(layout.artworkStyle.height).toBeCloseTo(390 / BRANDED_HEADER_ARTWORK_ASPECT_RATIO, 5);
      expect(layout.resizeMode).toBe('contain');
    },
  );

  it('keeps enough content height on a compact 320px detail header', () => {
    const layout = getBrandedHeaderLayout('compact-detail', 320, 24);

    expect(layout.height).toBe(88);
    expect(layout.artworkStyle.height).toBeLessThan(layout.height);
    expect((layout.artworkStyle.top as number) + (layout.artworkStyle.height as number)).toBeCloseTo(layout.height, 5);
  });

  it('keeps enough room for the application title and subtitle at 320px', () => {
    const layout = getBrandedHeaderLayout('application-list', 320, 24);

    expect(layout.height).toBe(98);
    expect(layout.artworkStyle.height).toBeLessThan(layout.height);
  });
});
