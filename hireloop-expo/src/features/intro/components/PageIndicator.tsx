import React from 'react';
import {StyleSheet, View} from 'react-native';

import type {IntroSlide} from '../intro.types';

type PageIndicatorProps = {
  activeIndex: number;
  count: number;
  dotGap: number;
  dotSize: number;
  theme: IntroSlide['theme'];
};

export function PageIndicator({activeIndex, count, dotGap, dotSize, theme}: PageIndicatorProps) {
  return (
    <View accessibilityRole="tablist" style={[styles.row, {gap: dotGap}]} testID="intro-dots">
      {Array.from({length: count}, (_, index) => (
        <View
          accessibilityLabel={`Halaman onboarding ${index + 1}`}
          accessibilityRole="tab"
          accessibilityState={{selected: activeIndex === index}}
          key={index}
          style={[
            styles.dot,
            {borderRadius: dotSize / 2, height: dotSize, width: dotSize},
            {backgroundColor: theme === 'light' ? '#D9DEE8' : '#D8DEEB'},
            activeIndex === index && styles.active,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {alignSelf: 'flex-start', flexDirection: 'row'},
  dot: {},
  active: {backgroundColor: '#00BDF3'},
});
