import React from 'react';
import {StyleSheet, View} from 'react-native';

import type {IntroSlide} from '../intro.types';

type PageIndicatorProps = {
  activeIndex: number;
  count: number;
  theme: IntroSlide['theme'];
};

export function PageIndicator({activeIndex, count, theme}: PageIndicatorProps) {
  return (
    <View accessibilityRole="tablist" style={styles.row} testID="intro-dots">
      {Array.from({length: count}, (_, index) => (
        <View
          accessibilityLabel={`Halaman onboarding ${index + 1}`}
          accessibilityRole="tab"
          accessibilityState={{selected: activeIndex === index}}
          key={index}
          style={[
            styles.dot,
            {backgroundColor: theme === 'light' ? '#D9DEE8' : '#D8DEEB'},
            activeIndex === index && styles.active,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {alignSelf: 'flex-start', flexDirection: 'row', gap: 9},
  dot: {width: 9, height: 9, borderRadius: 5},
  active: {backgroundColor: '#00BDF3'},
});
