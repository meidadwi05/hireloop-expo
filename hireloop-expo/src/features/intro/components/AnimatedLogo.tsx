import React from 'react';
import {Animated, StyleSheet, View} from 'react-native';

type AnimatedLogoProps = {
  progress: Animated.Value;
  width: number;
};

export function AnimatedLogo({progress, width}: AnimatedLogoProps) {
  return (
    <View style={[styles.reveal, {width}]}>
      <Animated.Image
        accessibilityLabel="Logo HireLoop"
        resizeMode="contain"
        source={require('../../../assets/HireLoopLogo.png')}
        style={[
          styles.logo,
          {
            opacity: progress,
            transform: [{translateX: progress.interpolate({inputRange: [0, 1], outputRange: [-width, 0]})}],
            width,
          },
        ]}
        testID="splash-logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  reveal: {height: 112, maxWidth: '100%', overflow: 'hidden'},
  logo: {height: 112, maxWidth: '100%'},
});
