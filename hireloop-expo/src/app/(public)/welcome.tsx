import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {GradientIntroTitle} from '../../features/intro/components/GradientIntroTitle';
import {OnboardingSplash, ONBOARDING_SPLASH_DURATION_MS} from '../../features/intro/components/OnboardingSplash';
import type {IntroSlide, WelcomePhase} from '../../features/intro/intro.types';

const COLORS = {
  cyan: '#00CBEA',
  lightBackground: '#FFFFFF',
  lightBody: '#67748E',
  lightDot: '#D9E2F3',
  navy: '#050D49',
  navyText: '#00195E',
  darkBody: '#C3CCE7',
  darkDot: '#4C5A92',
  primary: '#0865FF',
  white: '#FFFFFF',
} as const;

const slides: IntroSlide[] = [
  {
    id: 'discover',
    image: require('../../assets/Onboarding1.png'),
    theme: 'light',
    titleVariant: 'gradient',
    title: 'Lamar kerja lebih\ncepat & tepat sasaran',
    body: 'Cari lowongan dari berbagai\nperusahaan terpercaya sesuai\ndengan minat dan keahlian.',
  },
  {
    id: 'tracking',
    image: require('../../assets/Onboarding2.png'),
    theme: 'dark',
    titleVariant: 'solid',
    title: 'Pantau Proses Lamaran\nSecara Real-Time',
    body: 'Dapatkan update setiap tahap seleksi\nlamaran pekerjaan langsung di genggaman.',
  },
  {
    id: 'multi-apply',
    image: require('../../assets/Onboarding3.png'),
    theme: 'light',
    titleVariant: 'gradient',
    title: 'Lamar ke Banyak\nPerusahaan Sekaligus',
    body: 'Cari lowongan dari berbagai\nperusahaan terpercaya sesuai\ndengan minat dan keahlian.',
  },
  {
    id: 'recommendation',
    image: require('../../assets/Onboarding4.png'),
    theme: 'dark',
    titleVariant: 'solid',
    title: 'Temukan Pekerjaan\nyang Tepat',
    body: 'Sistem kami akan merekomendasikan\npekerjaan terbaik berdasarkan profil\ndan aktivitasmu.',
  },
];

export default function WelcomeRoute() {
  const [phase, setPhase] = useState<WelcomePhase>('splash');
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLightSlide = slide.theme === 'light';

  useEffect(() => {
    if (phase !== 'splash') return;
    const timer = setTimeout(() => setPhase('slides'), ONBOARDING_SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === 'splash') return <OnboardingSplash />;

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={[styles.screen, {backgroundColor: isLightSlide ? COLORS.lightBackground : COLORS.navy}]}
    >
      <StatusBar animated style={isLightSlide ? 'dark' : 'light'} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Lewati onboarding"
        onPress={() => router.replace('/(public)/login')}
        style={styles.skip}
      >
        <Text style={[styles.skipText, {color: isLightSlide ? COLORS.navyText : COLORS.white}]}>Lewati</Text>
      </Pressable>
      <Image source={slide.image} style={styles.image} resizeMode="contain" />
      {slide.titleVariant === 'gradient'
        ? <GradientIntroTitle>{slide.title}</GradientIntroTitle>
        : <Text style={[styles.title, styles.darkTitle]}>{slide.title}</Text>}
      <Text style={[styles.body, {color: isLightSlide ? COLORS.lightBody : COLORS.darkBody}]}>{slide.body}</Text>
      <View style={styles.dots} accessibilityRole="tablist">
        {slides.map((_, itemIndex) => (
          <View
            key={itemIndex}
            accessibilityRole="tab"
            accessibilityLabel={`Halaman onboarding ${itemIndex + 1}`}
            accessibilityState={{selected: itemIndex === index}}
            style={[
              styles.dot,
              {backgroundColor: isLightSlide ? COLORS.lightDot : COLORS.darkDot},
              itemIndex === index && styles.dotActive,
            ]}
          />
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => index === slides.length - 1 ? router.replace('/(public)/login') : setIndex(index + 1)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{index === slides.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, alignItems: 'center', paddingHorizontal: 28, paddingVertical: 18},
  skip: {alignSelf: 'flex-end', minHeight: 44, minWidth: 44, padding: 10, alignItems: 'center', justifyContent: 'center'},
  skipText: {fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12},
  image: {width: '100%', height: '48%', marginTop: 12},
  title: {width: '100%', minHeight: 72, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 26, lineHeight: 34, textAlign: 'center', textAlignVertical: 'center', marginTop: 18},
  darkTitle: {color: COLORS.white},
  body: {fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 21, textAlign: 'center', marginTop: 12},
  dots: {flexDirection: 'row', gap: 7, marginTop: 24},
  dot: {width: 7, height: 7, borderRadius: 4},
  dotActive: {width: 24, backgroundColor: COLORS.cyan},
  button: {height: 52, width: '100%', borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginTop: 'auto'},
  buttonText: {fontFamily: 'PlusJakartaSans_700Bold', color: COLORS.white, fontSize: 14},
});
