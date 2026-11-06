import {LinearGradient} from 'expo-linear-gradient';
import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useRef} from 'react';
import {AccessibilityInfo, Animated, Easing, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export const ONBOARDING_SPLASH_DURATION_MS = 3500;

export function OnboardingSplash() {
  const {width} = useWindowDimensions();
  const logoWidth = Math.min(Math.max(width - 64, 230), 360);
  const logoProgress = useRef(new Animated.Value(0)).current;
  const lineProgress = useRef(new Animated.Value(0)).current;
  const taglineOneProgress = useRef(new Animated.Value(0)).current;
  const taglineTwoProgress = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let active = true;
    let animation: Animated.CompositeAnimation | null = null;

    void AccessibilityInfo.isReduceMotionEnabled().then(reduceMotion => {
      if (!active) return;
      if (reduceMotion) {
        logoProgress.setValue(1);
        lineProgress.setValue(1);
        taglineOneProgress.setValue(1);
        taglineTwoProgress.setValue(1);
        return;
      }

      const reveal = (value: Animated.Value, duration: number) => Animated.timing(value, {
        duration,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      });

      animation = Animated.sequence([
        Animated.delay(150),
        reveal(logoProgress, 650),
        reveal(lineProgress, 500),
        Animated.stagger(140, [
          reveal(taglineOneProgress, 520),
          reveal(taglineTwoProgress, 520),
        ]),
        Animated.delay(900),
        Animated.timing(screenOpacity, {
          duration: 300,
          easing: Easing.inOut(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]);
      animation.start();
    });

    return () => {
      active = false;
      animation?.stop();
    };
  }, [lineProgress, logoProgress, screenOpacity, taglineOneProgress, taglineTwoProgress]);

  const rise = (progress: Animated.Value) => ({
    opacity: progress,
    transform: [{translateY: progress.interpolate({inputRange: [0, 1], outputRange: [8, 0]})}],
  });

  return (
    <Animated.View style={styles.animatedScreen}>
      <SafeAreaView
        accessibilityLabel="Splash onboarding HireLoop"
        edges={['top', 'right', 'bottom', 'left']}
        style={styles.screen}
        testID="onboarding-splash"
      >
        <StatusBar style="light" />
        <View pointerEvents="none" style={[styles.ring, styles.ringTop]} />
        <View pointerEvents="none" style={[styles.ring, styles.ringBottom]} />
        <View pointerEvents="none" style={[styles.glow, styles.glowOne]} />
        <View pointerEvents="none" style={[styles.glow, styles.glowTwo]} />

        <Animated.View style={[styles.content, {opacity: screenOpacity}]}>
          <Animated.Image
            accessibilityLabel="Logo HireLoop"
            resizeMode="contain"
            source={require('../../../assets/HireLoopLogo.png')}
            style={[
              styles.logo,
              {
                opacity: logoProgress,
                transform: [{scale: logoProgress.interpolate({inputRange: [0, 1], outputRange: [0.94, 1]})}],
                width: logoWidth,
              },
            ]}
            testID="splash-logo"
          />
          <Animated.View
            style={{
              opacity: lineProgress,
              transform: [{scaleX: lineProgress}],
            }}
            testID="splash-gradient-line"
          >
            <LinearGradient
              colors={['#0051FD', '#00DAFD']}
              end={{x: 1, y: 0.5}}
              start={{x: 0, y: 0.5}}
              style={styles.loadingLine}
            />
          </Animated.View>
          <View style={styles.tagline}>
            <Animated.View style={rise(taglineOneProgress)} testID="splash-tagline-one">
              <Text style={styles.taglineText}>Find the right job.</Text>
            </Animated.View>
            <Animated.View style={rise(taglineTwoProgress)} testID="splash-tagline-two">
              <Text style={styles.taglineText}>
                <Text style={styles.loopText}>Loop</Text> into your future
              </Text>
            </Animated.View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedScreen: {flex: 1, backgroundColor: '#001552'},
  screen: {flex: 1, overflow: 'hidden', backgroundColor: '#001552'},
  content: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32},
  logo: {height: 112, maxWidth: '100%'},
  loadingLine: {width: 138, height: 8, borderRadius: 5, marginTop: 76},
  tagline: {alignItems: 'center', gap: 12, marginTop: 76},
  taglineText: {fontFamily: 'PlusJakartaSans_400Regular', color: '#FFFFFF', fontSize: 24, lineHeight: 34, textAlign: 'center'},
  loopText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: '#00A9F8'},
  ring: {position: 'absolute', width: 330, height: 330, borderRadius: 165, borderWidth: 28, borderColor: 'rgba(13,79,211,0.26)'},
  ringTop: {top: -168, right: -190},
  ringBottom: {bottom: -170, left: -190},
  glow: {position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(6,75,201,0.10)'},
  glowOne: {width: 380, height: 380, top: '30%', left: -170},
  glowTwo: {width: 440, height: 440, bottom: -210, right: -210},
});
