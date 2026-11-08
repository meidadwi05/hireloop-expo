import {router} from 'expo-router';
import {LinearGradient} from 'expo-linear-gradient';
import {StatusBar} from 'expo-status-bar';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Image,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {GradientIntroTitle} from '../../features/intro/components/GradientIntroTitle';
import {OnboardingSplash, ONBOARDING_SPLASH_DURATION_MS} from '../../features/intro/components/OnboardingSplash';
import {clampIntroIndex, getIntroIndexFromOffset} from '../../features/intro/intro-pager';
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
  const {height, width} = useWindowDimensions();
  const [phase, setPhase] = useState<WelcomePhase>('splash');
  const [index, setIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(width - 56);
  const slidesRef = useRef<ScrollView>(null);
  const [scrollX] = useState(() => new Animated.Value(0));
  const pendingResizeRef = useRef(false);
  const programmaticTargetRef = useRef<number | null>(null);
  const slide = slides[index];
  const isLightSlide = slide.theme === 'light';
  const compactHeight = height < 700;

  const commitActiveSlide = useCallback((targetIndex: number) => {
    const nextIndex = clampIntroIndex(targetIndex, slides.length);
    setIndex(currentIndex => currentIndex === nextIndex ? currentIndex : nextIndex);

    return nextIndex;
  }, []);

  const scrollToSlide = useCallback((targetIndex: number, animated = true) => {
    const nextIndex = clampIntroIndex(targetIndex, slides.length);
    programmaticTargetRef.current = nextIndex;
    slidesRef.current?.scrollTo({
      x: pageWidth * nextIndex,
      animated,
    });

    return nextIndex;
  }, [pageWidth]);

  const syncSlideFromScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const viewportWidth = event.nativeEvent.layoutMeasurement.width || pageWidth;
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.setValue(offsetX);
    const nextIndex = getIntroIndexFromOffset(
      offsetX,
      viewportWidth,
      slides.length,
      index,
    );

    const programmaticTarget = programmaticTargetRef.current;
    if (programmaticTarget !== null) {
      const pagePosition = offsetX / viewportWidth;
      if (Math.abs(pagePosition - programmaticTarget) <= 0.02) {
        programmaticTargetRef.current = null;
      }
    }

    commitActiveSlide(nextIndex);
  }, [commitActiveSlide, index, pageWidth, scrollX]);

  const handleSwipeStart = useCallback(() => {
    programmaticTargetRef.current = null;
  }, []);

  const handleSlidesLayout = useCallback((event: LayoutChangeEvent) => {
    const nextPageWidth = event.nativeEvent.layout.width;
    if (nextPageWidth <= 0 || nextPageWidth === pageWidth) return;

    pendingResizeRef.current = true;
    setPageWidth(nextPageWidth);
  }, [pageWidth]);

  useEffect(() => {
    if (phase !== 'splash') return;
    const timer = setTimeout(() => setPhase('slides'), ONBOARDING_SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (!pendingResizeRef.current || phase !== 'slides') return;

    pendingResizeRef.current = false;
    slidesRef.current?.scrollTo({x: pageWidth * index, animated: false});
    scrollX.setValue(pageWidth * index);
  }, [index, pageWidth, phase, scrollX]);

  if (phase === 'splash') return <OnboardingSplash />;

  return (
    <SafeAreaView
      testID="intro-screen"
      edges={['top', 'right', 'bottom', 'left']}
      style={[
        styles.screen,
        compactHeight && styles.screenCompact,
        {backgroundColor: isLightSlide ? COLORS.lightBackground : COLORS.navy},
      ]}
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
      <Animated.ScrollView
        ref={slidesRef}
        testID="intro-slides"
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        scrollEventThrottle={16}
        style={styles.slides}
        onLayout={handleSlidesLayout}
        onScrollBeginDrag={handleSwipeStart}
        onScroll={syncSlideFromScroll}
        onScrollEndDrag={syncSlideFromScroll}
        onMomentumScrollEnd={syncSlideFromScroll}
      >
        {slides.map(item => (
          <View key={item.id} testID={`intro-slide-${item.id}`} style={[styles.slide, {width: pageWidth}]}>
            <Image source={item.image} style={[styles.image, compactHeight && styles.imageCompact]} resizeMode="contain" />
            {item.titleVariant === 'gradient'
              ? <GradientIntroTitle compact={compactHeight}>{item.title}</GradientIntroTitle>
              : <Text style={[styles.title, compactHeight && styles.titleCompact, styles.darkTitle]}>{item.title}</Text>}
            <Text style={[styles.body, compactHeight && styles.bodyCompact, {color: item.theme === 'light' ? COLORS.lightBody : COLORS.darkBody}]}>{item.body}</Text>
          </View>
        ))}
      </Animated.ScrollView>
      <View style={[styles.footerControls, compactHeight && styles.footerControlsCompact]} testID="intro-footer-controls">
        <View style={styles.dots} accessibilityRole="tablist" testID="intro-dots">
          {slides.map((_, itemIndex) => (
            <Animated.View
              key={itemIndex}
              accessibilityRole="tab"
              accessibilityLabel={`Halaman onboarding ${itemIndex + 1}`}
              accessibilityState={{selected: itemIndex === index}}
              style={[
                styles.dot,
                {backgroundColor: isLightSlide ? COLORS.lightDot : COLORS.darkDot},
                itemIndex === index && styles.dotActive,
                {
                  width: scrollX.interpolate({
                    inputRange: slides.map((_, slideIndex) => slideIndex * pageWidth),
                    outputRange: slides.map((_, slideIndex) => slideIndex === itemIndex ? 24 : 7),
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (index === slides.length - 1) {
              router.replace('/(public)/login');
              return;
            }
            scrollToSlide(index + 1);
          }}
          style={styles.button}
        >
          <LinearGradient
            colors={['#0051FD', '#00DAFD']}
            end={{x: 1, y: 0.5}}
            start={{x: 0, y: 0.5}}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>{index === slides.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, alignItems: 'center', paddingHorizontal: 28, paddingVertical: 18},
  screenCompact: {paddingHorizontal: 20, paddingVertical: 10},
  slides: {flex: 1, width: '100%'},
  slide: {flex: 1},
  skip: {alignSelf: 'flex-end', minHeight: 44, minWidth: 44, padding: 10, alignItems: 'center', justifyContent: 'center'},
  skipText: {fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12},
  image: {width: '100%', height: '50%', marginTop: 12},
  imageCompact: {height: '44%', marginTop: 2},
  title: {width: '100%', minHeight: 76, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 28, lineHeight: 36, textAlign: 'center', textAlignVertical: 'center', marginTop: 18},
  titleCompact: {minHeight: 64, fontSize: 24, lineHeight: 31, marginTop: 10},
  darkTitle: {color: COLORS.white},
  body: {fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 12},
  bodyCompact: {fontSize: 13, lineHeight: 20, marginTop: 8},
  footerControls: {width: '100%', flexShrink: 0, gap: 24, paddingTop: 18},
  footerControlsCompact: {gap: 20, paddingTop: 10},
  dots: {alignSelf: 'flex-start', flexDirection: 'row', gap: 7, marginLeft: 14},
  dot: {width: 7, height: 7, borderRadius: 4},
  dotActive: {backgroundColor: COLORS.cyan},
  button: {height: 52, width: '100%', borderRadius: 12, overflow: 'hidden'},
  buttonGradient: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  buttonText: {fontFamily: 'PlusJakartaSans_700Bold', color: COLORS.white, fontSize: 14},
});
