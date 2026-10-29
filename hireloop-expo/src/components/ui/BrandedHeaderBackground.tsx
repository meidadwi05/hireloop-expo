import React, {type PropsWithChildren} from 'react';
import {
  Image,
  type ImageStyle,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

const headerBackground = require('../../assets/up_background.png');

export const BRANDED_HEADER_ARTWORK_ASPECT_RATIO = 1983 / 793;

export type BrandedHeaderVariant = 'account' | 'application-list' | 'compact-detail' | 'jobs-list' | 'notifications';

type BrandedHeaderPreset = {
  backgroundColor: string;
  bodyHeight: number;
  artworkTop: number;
  artworkRight: number;
};

const PRESETS: Record<BrandedHeaderVariant, BrandedHeaderPreset> = {
  account: {
    backgroundColor: '#003E9A',
    bodyHeight: 88,
    artworkTop: 0,
    artworkRight: 0,
  },
  'application-list': {
    backgroundColor: '#003E9A',
    bodyHeight: 88,
    artworkTop: 0,
    artworkRight: 0,
  },
  'compact-detail': {
    backgroundColor: '#003E9A',
    bodyHeight: 72,
    artworkTop: 0,
    artworkRight: 0,
  },
  'jobs-list': {
    backgroundColor: '#00419E',
    bodyHeight: 133,
    artworkTop: 0,
    artworkRight: 0,
  },
  notifications: {
    backgroundColor: '#003E9A',
    bodyHeight: 112,
    artworkTop: 0,
    artworkRight: 0,
  },
};

export type BrandedHeaderLayout = {
  height: number;
  backgroundColor: string;
  artworkStyle: Pick<ImageStyle, 'height' | 'right' | 'top' | 'width'>;
};

export function getBrandedHeaderLayout(
  variant: BrandedHeaderVariant,
  containerWidth: number,
  topInset: number,
): BrandedHeaderLayout {
  const preset = PRESETS[variant];
  const safeWidth = Math.max(1, containerWidth);
  const safeInset = Math.max(0, topInset);
  const height = safeInset + preset.bodyHeight;
  const availableWidth = Math.max(1, safeWidth - preset.artworkRight);
  const availableHeight = Math.max(1, height - preset.artworkTop);
  const limitedByWidth = availableWidth / BRANDED_HEADER_ARTWORK_ASPECT_RATIO <= availableHeight;
  const artworkWidth = limitedByWidth
    ? availableWidth
    : availableHeight * BRANDED_HEADER_ARTWORK_ASPECT_RATIO;
  const artworkHeight = artworkWidth / BRANDED_HEADER_ARTWORK_ASPECT_RATIO;

  return {
    height,
    backgroundColor: preset.backgroundColor,
    artworkStyle: {
      width: artworkWidth,
      height: artworkHeight,
      top: preset.artworkTop,
      right: preset.artworkRight,
    },
  };
}

type BrandedHeaderBackgroundProps = PropsWithChildren<{
  artworkTestID?: string;
  containerWidth: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  topInset: number;
  variant: BrandedHeaderVariant;
}>;

export function BrandedHeaderBackground({
  artworkTestID,
  children,
  containerWidth,
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
          resizeMode="contain"
          source={headerBackground}
          style={[styles.artwork, layout.artworkStyle]}
          testID={artworkTestID}
        />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {position: 'relative', overflow: 'hidden'},
  artwork: {position: 'absolute', opacity: 1},
});
