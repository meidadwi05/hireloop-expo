import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import React from 'react';
import {Image, Pressable, StyleSheet, Text, View, useWindowDimensions} from 'react-native';

export const ONBOARDING_HERO_COPY = {
  1: {
    title: 'Lengkapi Data Diri',
    description: 'Lengkapi informasi berikut untuk memulai perjalanan karirmu',
  },
  2: {
    title: 'Pengalaman Kerja',
    description: 'Lengkapi informasi berikut untuk melanjutkan perjalanan karirmu',
  },
} as const;

export function getOnboardingHeroLayout(viewportWidth: number) {
  const pageWidth = Math.min(viewportWidth, 720);
  const narrow = pageWidth < 390;
  const heroHeight = Math.round(Math.max(200, Math.min(380, pageWidth * 0.625)));

  return {
    heroHeight,
    narrow,
    copyTop: Math.round(Math.max(60, Math.min(88, heroHeight * 0.3))),
  };
}

export function OnboardingHero({step, onBack}: {step: 1 | 2; onBack: () => void}) {
  const personal = step === 1;
  const {width} = useWindowDimensions();
  const copy = ONBOARDING_HERO_COPY[step];
  const {heroHeight, narrow, copyTop} = getOnboardingHeroLayout(width);

  return (
    <View testID="onboarding-hero" style={[styles.hero, {height: heroHeight}]}>
      <Image
        source={personal ? require('../../../assets/register_onboarding.png') : require('../../../assets/onboarding_experience.png')}
        resizeMode="cover"
        style={styles.heroImage}
        accessibilityIgnoresInvertColors
        testID="onboarding-hero-image"
      />
      <LinearGradient colors={['rgba(1,9,52,0.82)', 'rgba(1,9,52,0.22)', 'rgba(1,9,52,0)']} locations={[0, 0.58, 1]} start={{x: 0, y: 0.5}} end={{x: 1, y: 0.5}} style={StyleSheet.absoluteFill} pointerEvents="none" />
      <Pressable accessibilityRole="button" accessibilityLabel="Kembali" onPress={onBack} style={[styles.back, narrow && styles.backNarrow]}>
        <Ionicons name="arrow-back" size={25} color="white" />
      </Pressable>
      <View testID="onboarding-hero-copy" style={[styles.copy, {top: copyTop}, narrow && styles.copyNarrow]}>
        <View style={[styles.badge, narrow && styles.badgeNarrow]}><Text style={styles.badgeText}>Langkah {step} dari 2</Text></View>
        <View style={styles.textGroup}>
          <Text testID="onboarding-hero-title" style={[styles.title, narrow && styles.titleNarrow]}>{copy.title}</Text>
          <Text testID="onboarding-hero-description" style={[styles.description, narrow && styles.descriptionNarrow]}>{copy.description}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {width: '100%', backgroundColor: '#010934', overflow: 'hidden'},
  heroImage: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, width: '100%', height: '100%'},
  back: {position: 'absolute', left: 22, top: 12, width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  backNarrow: {left: 12},
  copy: {position: 'absolute', left: 26, width: '55%', maxWidth: 360, alignItems: 'flex-start'},
  copyNarrow: {left: 18, width: '58%'},
  badge: {alignSelf: 'flex-start', borderRadius: 18, backgroundColor: 'rgba(24,83,140,0.82)', paddingHorizontal: 13, paddingVertical: 7, marginBottom: 12},
  badgeNarrow: {paddingHorizontal: 10, paddingVertical: 6, marginBottom: 10},
  badgeText: {fontFamily: 'PlusJakartaSans_400Regular', color: '#EAF5FF', fontSize: 10, lineHeight: 14},
  textGroup: {width: '100%', minHeight: 60, justifyContent: 'center', alignItems: 'flex-start'},
  title: {fontFamily: 'PlusJakartaSans_700Bold', color: 'white', fontSize: 25, lineHeight: 32},
  titleNarrow: {fontSize: 18, lineHeight: 24},
  description: {fontFamily: 'PlusJakartaSans_400Regular', color: 'rgba(255,255,255,0.88)', fontSize: 12, lineHeight: 17, marginTop: 5, textAlign: 'left'},
  descriptionNarrow: {fontSize: 10, lineHeight: 14, marginTop: 4},
});
