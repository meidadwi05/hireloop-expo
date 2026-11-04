import {LinearGradient} from 'expo-linear-gradient';
import React, {useEffect, useState} from 'react';
import {AccessibilityInfo, Animated, Easing, Platform, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';

type ShimmerBlockProps = {
  borderRadius?: number;
  height: number | `${number}%`;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  width: number | `${number}%`;
};

export function ShimmerBlock({borderRadius = 8, height, style, testID, width}: ShimmerBlockProps) {
  const [progress] = useState(() => new Animated.Value(0));
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (mounted) setReduceMotion(value);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion || measuredWidth <= 0) {
      progress.stopAnimation();
      progress.setValue(0);
      return undefined;
    }

    const animation = Animated.loop(Animated.timing(progress, {
      duration: 1_250,
      easing: Easing.linear,
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
    }));
    animation.start();
    return () => animation.stop();
  }, [measuredWidth, progress, reduceMotion]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-measuredWidth, measuredWidth],
  });

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={event => setMeasuredWidth(Math.round(event.nativeEvent.layout.width))}
      style={[styles.base, {borderRadius, height, width}, style]}
      testID={testID}
    >
      {!reduceMotion && measuredWidth > 0 ? (
        <Animated.View pointerEvents="none" style={[styles.highlight, {transform: [{translateX}]}]}>
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.78)', 'rgba(255,255,255,0)']}
            end={{x: 1, y: 0}}
            start={{x: 0, y: 0}}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {backgroundColor: '#E8EDF5', overflow: 'hidden'},
  highlight: {position: 'absolute', top: 0, bottom: 0, left: 0, width: '65%'},
});
