import React, {type PropsWithChildren} from 'react';
import {
  Image,
  type ImageResizeMode,
  type ImageStyle,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

const headerBackground = require('../../assets/up_background_new.jpg');
const performanceHeaderBackground = require('../../assets/up_backgorund_performance.jpg');

export const BRANDED_HEADER_ARTWORK_ASPECT_RATIO = 1983 / 515;
export const PERFORMANCE_HEADER_ARTWORK_ASPECT_RATIO = 1983 / 416;

export type BrandedHeaderVariant = 'account' | 'application-list' | 'compact-detail' | 'jobs-list' | 'notifications' | 'performance' | 'saved-list';

type BrandedHeaderPreset = {
  backgroundColor: string;
  minimumContentHeight: number;
  maximumArtworkWidth: number;
  offsetArtworkBySafeArea?: boolean;
  useContainerWidth?: boolean;
  resizeMode?: ImageResizeMode;
  artworkAspectRatio?: number;
  artworkSource?: number;
};

const PRESETS: Record<BrandedHeaderVariant, BrandedHeaderPreset> = {
  account: {
    backgroundColor: '#0044B9',
    minimumContentHeight: 72,
    maximumArtworkWidth: 720,
    offsetArtworkBySafeArea: true,
    useContainerWidth: true,
    resizeMode: 'contain',
    artworkAspectRatio: PERFORMANCE_HEADER_ARTWORK_ASPECT_RATIO,
    artworkSource: performanceHeaderBackground,
  },
  'application-list': {
    backgroundColor: '#0044B9',
    minimumContentHeight: 74,
    maximumArtworkWidth: 720,
    offsetArtworkBySafeArea: true,
    useContainerWidth: true,
    resizeMode: 'contain',
    artworkAspectRatio: PERFORMANCE_HEADER_ARTWORK_ASPECT_RATIO,
    artworkSource: performanceHeaderBackground,
  },
  'compact-detail': {
    backgroundColor: '#0044B9',
    minimumContentHeight: 64,
    maximumArtworkWidth: 720,
    offsetArtworkBySafeArea: true,
    useContainerWidth: true,
    resizeMode: 'contain',
    artworkAspectRatio: PERFORMANCE_HEADER_ARTWORK_ASPECT_RATIO,
    artworkSource: performanceHeaderBackground,
  },
  'jobs-list': {
    backgroundColor: '#0044B9',
    minimumContentHeight: 72,
    maximumArtworkWidth: 720,
    offsetArtworkBySafeArea: true,
    useContainerWidth: true,
    resizeMode: 'contain',
    artworkAspectRatio: PERFORMANCE_HEADER_ARTWORK_ASPECT_RATIO,
    artworkSource: performanceHeaderBackground,
  },
  notifications: {
    backgroundColor: '#003E9A',
    minimumContentHeight: 88,
    maximumArtworkWidth: 430,
    resizeMode: 'contain',
  },
  performance: {
    backgroundColor: '#0044B9',
    minimumContentHeight: 64,
    maximumArtworkWidth: 720,
    offsetArtworkBySafeArea: true,
    useContainerWidth: true,
    resizeMode: 'contain',
    artworkAspectRatio: PERFORMANCE_HEADER_ARTWORK_ASPECT_RATIO,
    artworkSource: performanceHeaderBackground,
  },
  'saved-list': {
    backgroundColor: '#0044B9',
    minimumContentHeight: 72,
    maximumArtworkWidth: 720,
    offsetArtworkBySafeArea: true,
    useContainerWidth: true,
    resizeMode: 'contain',
    artworkAspectRatio: PERFORMANCE_HEADER_ARTWORK_ASPECT_RATIO,
    artworkSource: performanceHeaderBackground,
  },
};

export type BrandedHeaderLayout = {
  height: number;
  backgroundColor: string;
  resizeMode: ImageResizeMode;
  artworkStyle: Pick<ImageStyle, 'height' | 'left' | 'top' | 'width'>;
  artworkAspectRatio: number;
};

export function getBrandedHeaderLayout(
  variant: BrandedHeaderVariant,
  containerWidth: number,
  topInset: number,
): BrandedHeaderLayout {
  const preset = PRESETS[variant];
  const safeWidth = Math.max(1, containerWidth);
  const safeInset = Math.max(0, topInset);
  const artworkWidth = preset.useContainerWidth
    ? safeWidth
    : Math.min(safeWidth, preset.maximumArtworkWidth);
  const artworkAspectRatio = preset.artworkAspectRatio ?? BRANDED_HEADER_ARTWORK_ASPECT_RATIO;
  const artworkHeight = artworkWidth / artworkAspectRatio;
  const minimumContentHeight = safeInset + preset.minimumContentHeight;
  const keepsArtworkBelowSafeArea = preset.offsetArtworkBySafeArea === true;
  const height = Math.max(
    minimumContentHeight,
    artworkHeight + (keepsArtworkBelowSafeArea ? safeInset : 0),
  );

  return {
    height,
    backgroundColor: preset.backgroundColor,
    resizeMode: preset.resizeMode ?? 'contain',
    artworkAspectRatio,
    artworkStyle: {
      width: artworkWidth,
      height: artworkHeight,
      top: keepsArtworkBelowSafeArea ? safeInset : height - artworkHeight,
      left: safeWidth - artworkWidth,
    },
  };
}

type BrandedHeaderBackgroundProps = PropsWithChildren<{
  artworkTestID?: string;
  containerWidth: number;
  contentStyle?: StyleProp<ViewStyle>;
  contentTestID?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  topInset: number;
  variant: BrandedHeaderVariant;
}>;

export function BrandedHeaderBackground({
  artworkTestID,
  children,
  containerWidth,
  contentStyle,
  contentTestID,
  style,
  testID,
  topInset,
  variant,
}: BrandedHeaderBackgroundProps) {
  const layout = getBrandedHeaderLayout(variant, containerWidth, topInset);
  const artworkSource = PRESETS[variant].artworkSource ?? headerBackground;

  return (
    <View
      style={[
        styles.container,
        {height: layout.height, backgroundColor: layout.backgroundColor},
        style,
      ]}
      testID={testID}
    >
      <View accessible={false} pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Image
          accessibilityIgnoresInvertColors
          accessible={false}
          resizeMode={layout.resizeMode}
          source={artworkSource}
          style={[styles.artwork, layout.artworkStyle]}
          testID={artworkTestID}
        />
      </View>
      <View style={[styles.content, contentStyle]} testID={contentTestID}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {position: 'relative', overflow: 'hidden'},
  artwork: {position: 'absolute', opacity: 1},
  content: {position: 'relative', zIndex: 1, width: '100%'},
});
