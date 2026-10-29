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
  ] satisfies [BrandedHeaderVariant, number, number][])('%s keeps the full artwork inside a %ipx header', (variant, width, inset) => {
    const layout = getBrandedHeaderLayout(variant, width, inset);
    const artwork = layout.artworkStyle;

    expect(artwork.top).toBe(0);
    expect(artwork.right).toBe(0);
    expect(artwork.width).toBeLessThanOrEqual(width);
    expect(artwork.height).toBeLessThanOrEqual(layout.height);
    expect((artwork.width as number) / (artwork.height as number)).toBeCloseTo(BRANDED_HEADER_ARTWORK_ASPECT_RATIO, 5);
  });

  it('keeps safe-area growth separate from the artwork position', () => {
    const withoutInset = getBrandedHeaderLayout('compact-detail', 390, 0);
    const withInset = getBrandedHeaderLayout('compact-detail', 390, 44);

    expect(withInset.height - withoutInset.height).toBe(44);
    expect(withInset.artworkStyle.top).toBe(withoutInset.artworkStyle.top);
    expect(withInset.artworkStyle.right).toBe(withoutInset.artworkStyle.right);
  });
});
