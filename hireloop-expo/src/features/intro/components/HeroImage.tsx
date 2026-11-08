import React from 'react';
import {Animated, type ImageSourcePropType, StyleSheet} from 'react-native';

export function HeroImage({height, source}: {height: number; source: ImageSourcePropType}) {
  return (
    <Animated.Image
      resizeMode="contain"
      source={source}
      style={[styles.image, {height}]}
      testID="intro-hero-image"
    />
  );
}

const styles = StyleSheet.create({image: {width: '100%'}});
