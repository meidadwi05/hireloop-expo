import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

import type {IntroSlide} from '../intro.types';

export function SkipButton({fontSize, onPress, theme}: {fontSize: number; onPress: () => void; theme: IntroSlide['theme']}) {
  return (
    <Pressable
      accessibilityLabel="Lewati onboarding"
      accessibilityRole="button"
      onPress={onPress}
      style={styles.button}
    >
      <Text style={[styles.text, {color: theme === 'light' ? '#00195E' : '#FFFFFF', fontSize}]}>Lewati</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {alignSelf: 'flex-end', minHeight: 44, minWidth: 44, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center'},
  text: {fontFamily: 'PlusJakartaSans_500Medium'},
});
