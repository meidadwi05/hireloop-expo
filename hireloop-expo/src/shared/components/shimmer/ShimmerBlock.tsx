import {LinearGradient} from 'expo-linear-gradient';
import React, {createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState} from 'react';
import {AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';

type ShimmerAnimation = {
  progress: Animated.Value;
  reduceMotion: boolean;
};

type ShimmerBlockProps = {
  borderRadius?: number;
  height: number | `${number}%`;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  width: number | `${number}%`;
};

const ShimmerContext = createContext<ShimmerAnimation | null>(null);

function useShimmerAnimation(active: boolean): ShimmerAnimation {
  const [progress] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (!active) return undefined;
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (mounted) setReduceMotion(value);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [active]);

  useEffect(() => {
    if (!active || reduceMotion) {
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
  }, [active, progress, reduceMotion]);

  return useMemo(() => ({progress, reduceMotion}), [progress, reduceMotion]);
}

export function ShimmerGroup({children}: PropsWithChildren) {
  const animation = useShimmerAnimation(true);
  return <ShimmerContext.Provider value={animation}>{children}</ShimmerContext.Provider>;
}

export function ShimmerBlock({borderRadius = 8, height, style, testID, width}: ShimmerBlockProps) {
  const groupAnimation = useContext(ShimmerContext);
  const standaloneAnimation = useShimmerAnimation(groupAnimation === null);
  const {progress, reduceMotion} = groupAnimation ?? standaloneAnimation;
  const [measuredWidth, setMeasuredWidth] = useState(0);
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
