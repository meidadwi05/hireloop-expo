import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AccessibilityInfo,
  Animated,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import {getIntroLayoutMetrics} from '../intro-layout';
import {clampIntroIndex, getIntroIndexFromOffset} from '../intro-pager';
import type {IntroSlide} from '../intro.types';
import {DynamicStatusBar} from './DynamicStatusBar';
import {OnboardingSlide} from './OnboardingSlide';

type OnboardingPagerProps = {
  onFinish: () => void;
  slides: IntroSlide[];
};

export function OnboardingPager({onFinish, slides}: OnboardingPagerProps) {
  const window = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(window.width);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [scrollX] = useState(() => new Animated.Value(0));
  const scrollRef = useRef<ScrollView>(null);
  const activeIndexRef = useRef(0);
  const resizePendingRef = useRef(false);
  const metrics = getIntroLayoutMetrics(pageWidth, window.height);
  const activeSlide = slides[activeIndex] ?? slides[0];

  const commitIndex = useCallback((nextIndex: number) => {
    const normalized = clampIntroIndex(nextIndex, slides.length);
    activeIndexRef.current = normalized;
    setActiveIndex(current => current === normalized ? current : normalized);
    return normalized;
  }, [slides.length]);

  const scrollTo = useCallback((targetIndex: number) => {
    const normalized = clampIntroIndex(targetIndex, slides.length);
    scrollRef.current?.scrollTo({animated: !reduceMotion, x: normalized * pageWidth});
  }, [pageWidth, reduceMotion, slides.length]);

  const syncFromScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const viewportWidth = event.nativeEvent.layoutMeasurement.width || pageWidth;
    const offset = event.nativeEvent.contentOffset.x;
    scrollX.setValue(offset);
    commitIndex(getIntroIndexFromOffset(offset, viewportWidth, slides.length, activeIndexRef.current));
  }, [commitIndex, pageWidth, scrollX, slides.length]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const measuredWidth = event.nativeEvent.layout.width;
    if (measuredWidth <= 0 || Math.abs(measuredWidth - pageWidth) < 1) return;
    resizePendingRef.current = true;
    setPageWidth(measuredWidth);
  }, [pageWidth]);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (mounted) setReduceMotion(value);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!resizePendingRef.current) return;
    resizePendingRef.current = false;
    const offset = activeIndexRef.current * pageWidth;
    scrollRef.current?.scrollTo({animated: false, x: offset});
    scrollX.setValue(offset);
  }, [pageWidth, scrollX]);

  if (!activeSlide) return null;

  return (
    <View
      onLayout={handleLayout}
      style={[styles.screen, {backgroundColor: activeSlide.theme === 'light' ? '#FFFFFF' : '#050D49'}]}
      testID="intro-screen"
    >
      <DynamicStatusBar theme={activeSlide.theme} />
      <Animated.ScrollView
        contentContainerStyle={styles.pages}
        decelerationRate="fast"
        horizontal
        onMomentumScrollEnd={syncFromScroll}
        onScroll={syncFromScroll}
        pagingEnabled
        ref={scrollRef}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        style={styles.pager}
        testID="intro-slides"
      >
        {slides.map((slide, index) => (
          <OnboardingSlide
            activeIndex={activeIndex}
            index={index}
            key={slide.id}
            metrics={metrics}
            onFinish={onFinish}
            onNext={() => scrollTo(index + 1)}
            pageWidth={pageWidth}
            reduceMotion={reduceMotion}
            scrollX={scrollX}
            slide={slide}
            slideCount={slides.length}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, overflow: 'hidden'},
  pager: {flex: 1},
  pages: {alignItems: 'stretch'},
});
