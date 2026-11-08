import React from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';

type AnimatedTaglineProps = {
  firstProgress: Animated.Value;
  secondProgress: Animated.Value;
};

function revealStyle(progress: Animated.Value) {
  return {
    opacity: progress,
    transform: [{translateY: progress.interpolate({inputRange: [0, 1], outputRange: [12, 0]})}],
  };
}

export function AnimatedTagline({firstProgress, secondProgress}: AnimatedTaglineProps) {
  return (
    <View style={styles.tagline}>
      <Animated.View style={revealStyle(firstProgress)} testID="splash-tagline-one">
        <Text style={styles.text}>Find the right job.</Text>
      </Animated.View>
      <Animated.View style={revealStyle(secondProgress)} testID="splash-tagline-two">
        <Text style={styles.text}>
          <Text style={styles.loop}>Loop</Text> into your future
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  tagline: {alignItems: 'center', gap: 12, marginTop: 76},
  text: {fontFamily: 'PlusJakartaSans_400Regular', color: '#FFFFFF', fontSize: 24, lineHeight: 34, textAlign: 'center'},
  loop: {fontFamily: 'PlusJakartaSans_600SemiBold', color: '#00A9F8'},
});
