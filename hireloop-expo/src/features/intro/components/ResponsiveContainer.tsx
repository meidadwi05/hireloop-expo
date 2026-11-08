import React, {type ReactNode} from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import type {IntroSlide} from '../intro.types';

type ResponsiveContainerProps = {
  children: ReactNode;
  pageWidth: number;
  theme: IntroSlide['theme'];
  testID: string;
};

export function ResponsiveContainer({children, pageWidth, theme, testID}: ResponsiveContainerProps) {
  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={[styles.container, {backgroundColor: theme === 'light' ? '#FFFFFF' : '#050D49', width: pageWidth}]}
      testID={testID}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({container: {flex: 1, overflow: 'hidden'}});
