import {LinearGradient} from 'expo-linear-gradient';
import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useState} from 'react';
import {AccessibilityInfo, Animated, Easing, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export const ONBOARDING_SPLASH_DURATION_MS = 3500;
export const ONBOARDING_SPLASH_LINE_DURATION_MS = ONBOARDING_SPLASH_DURATION_MS;

export function OnboardingSplash() {
  const {width} = useWindowDimensions();
  const logoWidth = Math.min(Math.max(width - 64, 230), 360);
  const [logoProgress] = useState(() => new Animated.Value(0));
  const [lineProgress] = useState(() => new Animated.Value(0));
  const [taglineOneProgress] = useState(() => new Animated.Value(0));
  const [taglineTwoProgress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let active = true;
    let revealAnimation: Animated.CompositeAnimation | null = null;

    const lineAnimation = Animated.timing(lineProgress, {
      duration: ONBOARDING_SPLASH_LINE_DURATION_MS,
      easing: Easing.linear,
      toValue: 1,
      useNativeDriver: true,
    });

    lineAnimation.start();

    void AccessibilityInfo.isReduceMotionEnabled().then(reduceMotion => {
      if (!active) return;
      if (reduceMotion) {
        logoProgress.setValue(1);
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

      revealAnimation = Animated.parallel([
        Animated.sequence([
          Animated.delay(150),
          reveal(logoProgress, 650),
        ]),
        Animated.sequence([
          Animated.delay(850),
          Animated.stagger(140, [
            reveal(taglineOneProgress, 520),
            reveal(taglineTwoProgress, 520),
          ]),
        ]),
      ]);
      revealAnimation.start();
    });

    return () => {
      active = false;
      lineAnimation.stop();
      revealAnimation?.stop();
    };
  }, [lineProgress, logoProgress, taglineOneProgress, taglineTwoProgress]);

  const rise = (progress: Animated.Value) => ({
    opacity: progress,
    transform: [{translateY: progress.interpolate({inputRange: [0, 1], outputRange: [8, 0]})}],
  });

  return (
    <View style={styles.animatedScreen}>
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

        <View style={styles.content}>
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
          <View style={styles.loadingLineTrack}>
            <Animated.View
              style={[
                styles.loadingLineProgress,
                {
                  transform: [{scaleX: lineProgress}],
                  transformOrigin: 'left center',
                },
              ]}
              testID="splash-gradient-line"
            >
              <LinearGradient
                colors={['#0051FD', '#00DAFD']}
                end={{x: 1, y: 0.5}}
                start={{x: 0, y: 0.5}}
                style={styles.loadingLine}
              />
            </Animated.View>
          </View>
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
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  animatedScreen: {flex: 1, backgroundColor: '#001552'},
  screen: {flex: 1, overflow: 'hidden', backgroundColor: '#001552'},
  content: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32},
  logo: {height: 112, maxWidth: '100%'},
  loadingLineTrack: {width: 138, height: 8, borderRadius: 5, marginTop: 76, overflow: 'hidden'},
  loadingLineProgress: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0},
  loadingLine: {flex: 1, borderRadius: 5},
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
