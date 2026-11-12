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

const headerBackground = require('../../assets/up_background_new.png');

export const BRANDED_HEADER_ARTWORK_ASPECT_RATIO = 1983 / 515;

export type BrandedHeaderVariant = 'account' | 'application-list' | 'compact-detail' | 'jobs-list' | 'notifications' | 'saved-list';

type BrandedHeaderPreset = {
  backgroundColor: string;
  minimumContentHeight: number;
  maximumArtworkWidth: number;
  useContainerWidth?: boolean;
  resizeMode?: ImageResizeMode;
};

const PRESETS: Record<BrandedHeaderVariant, BrandedHeaderPreset> = {
  account: {
    backgroundColor: '#003E9A',
    minimumContentHeight: 72,
    maximumArtworkWidth: 430,
    resizeMode: 'contain',
  },
  'application-list': {
    backgroundColor: '#003E9A',
    minimumContentHeight: 74,
    maximumArtworkWidth: 430,
    resizeMode: 'contain',
  },
  'compact-detail': {
    backgroundColor: '#003E9A',
    minimumContentHeight: 64,
    maximumArtworkWidth: 430,
    resizeMode: 'contain',
  },
  'jobs-list': {
    backgroundColor: '#00419E',
    minimumContentHeight: 72,
    maximumArtworkWidth: 430,
    useContainerWidth: true,
    resizeMode: 'contain',
  },
  notifications: {
    backgroundColor: '#003E9A',
    minimumContentHeight: 88,
    maximumArtworkWidth: 430,
    resizeMode: 'contain',
  },
  'saved-list': {
    backgroundColor: '#003E9A',
    minimumContentHeight: 72,
    maximumArtworkWidth: 430,
    resizeMode: 'contain',
  },
};

export type BrandedHeaderLayout = {
  height: number;
  backgroundColor: string;
  resizeMode: ImageResizeMode;
  artworkStyle: Pick<ImageStyle, 'height' | 'left' | 'top' | 'width'>;
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
  const artworkHeight = artworkWidth / BRANDED_HEADER_ARTWORK_ASPECT_RATIO;
  const minimumContentHeight = safeInset + preset.minimumContentHeight;
  const height = Math.max(minimumContentHeight, artworkHeight);

  return {
    height,
    backgroundColor: preset.backgroundColor,
    resizeMode: preset.resizeMode ?? 'contain',
    artworkStyle: {
      width: artworkWidth,
      height: artworkHeight,
      top: height - artworkHeight,
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
          source={headerBackground}
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
