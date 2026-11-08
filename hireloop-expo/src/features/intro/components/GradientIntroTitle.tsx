import MaskedView from '@react-native-masked-view/masked-view';
import {LinearGradient} from 'expo-linear-gradient';
import React from 'react';
import {StyleSheet, Text} from 'react-native';

export function GradientIntroTitle({children, compact = false}: {children: string; compact?: boolean}) {
  return (
    <MaskedView
      style={[styles.mask, compact && styles.maskCompact]}
      maskElement={<Text style={[styles.title, compact && styles.titleCompact]}>{children}</Text>}
      testID="gradient-intro-title"
    >
      <LinearGradient
        colors={['#0051FD', '#00DAFD']}
        end={{x: 1, y: 0.5}}
        start={{x: 0, y: 0.5}}
        style={[styles.gradient, compact && styles.gradientCompact]}
      >
        <Text style={[styles.title, compact && styles.titleCompact, styles.transparent]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  mask: {width: '100%', minHeight: 76, marginTop: 18},
  maskCompact: {minHeight: 64, marginTop: 10},
  gradient: {width: '100%', minHeight: 76},
  gradientCompact: {minHeight: 64},
  title: {
    width: '100%',
    minHeight: 76,
    color: '#0051FD',
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  titleCompact: {minHeight: 64, fontSize: 24, lineHeight: 31},
  transparent: {opacity: 0},
});
