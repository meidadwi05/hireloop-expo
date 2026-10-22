import {LinearGradient} from 'expo-linear-gradient';
import {StatusBar} from 'expo-status-bar';
import React from 'react';
import {Image, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export const ONBOARDING_SPLASH_DURATION_MS = 3500;

export function OnboardingSplash() {
  const {width} = useWindowDimensions();
  const logoWidth = Math.min(Math.max(width - 64, 230), 360);

  return (
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
        <Image
          accessibilityLabel="Logo HireLoop"
          resizeMode="contain"
          source={require('../../../assets/HireLoopLogo.png')}
          style={[styles.logo, {width: logoWidth}]}
        />
        <LinearGradient
          colors={['#0051FD', '#00DAFD']}
          end={{x: 1, y: 0.5}}
          start={{x: 0, y: 0.5}}
          style={styles.loadingLine}
        />
        <View style={styles.tagline}>
          <Text style={styles.taglineText}>Find the right job.</Text>
          <Text style={styles.taglineText}>
            <Text style={styles.loopText}>Loop</Text> into your future
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
