import React from 'react';
import {Animated, type ImageSourcePropType, StyleSheet} from 'react-native';

export function HeroImage({height, source, width}: {height: number; source: ImageSourcePropType; width: number}) {
  return (
    <Animated.Image
      resizeMode="contain"
      source={source}
      style={[styles.image, {height, width}]}
      testID="intro-hero-image"
    />
  );
}

const styles = StyleSheet.create({image: {maxWidth: '100%'}});
