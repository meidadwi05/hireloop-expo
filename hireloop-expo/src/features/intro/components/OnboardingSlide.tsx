import React from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';

import type {IntroLayoutMetrics} from '../intro-layout';
import type {IntroSlide} from '../intro.types';
import {GradientNextButton} from './GradientNextButton';
import {GradientTitle} from './GradientTitle';
import {HeroImage} from './HeroImage';
import {PageIndicator} from './PageIndicator';
import {ResponsiveContainer} from './ResponsiveContainer';
import {SkipButton} from './SkipButton';

type OnboardingSlideProps = {
  activeIndex: number;
  index: number;
  metrics: IntroLayoutMetrics;
  onFinish: () => void;
  onNext: () => void;
  pageWidth: number;
  reduceMotion: boolean;
  scrollX: Animated.Value;
  slide: IntroSlide;
  slideCount: number;
};

export function OnboardingSlide({
  activeIndex,
  index,
  metrics,
  onFinish,
  onNext,
  pageWidth,
  reduceMotion,
  scrollX,
  slide,
  slideCount,
}: OnboardingSlideProps) {
  const inputRange = [(index - 1) * pageWidth, index * pageWidth, (index + 1) * pageWidth];
  const reveal = (distance: number, minimumOpacity: number) => reduceMotion
    ? undefined
    : {
        opacity: scrollX.interpolate({inputRange, outputRange: [minimumOpacity, 1, minimumOpacity], extrapolate: 'clamp'}),
        transform: [{translateY: scrollX.interpolate({inputRange, outputRange: [distance, 0, distance], extrapolate: 'clamp'})}],
      };
  const heroMotion = reduceMotion
    ? undefined
    : {
        opacity: scrollX.interpolate({inputRange, outputRange: [0.55, 1, 0.55], extrapolate: 'clamp'}),
        transform: [
          {scale: scrollX.interpolate({inputRange, outputRange: [0.94, 1, 0.94], extrapolate: 'clamp'})},
        ],
      };
  const isLast = index === slideCount - 1;
  const titleScale = slide.titleScale ?? 1;
  const titleFontSize = Math.round(metrics.titleFontSize * titleScale);
  const titleLineHeight = Math.round(metrics.titleLineHeight * titleScale);

  return (
    <ResponsiveContainer pageWidth={pageWidth} testID={`intro-slide-${slide.id}`} theme={slide.theme}>
      <View
        accessibilityElementsHidden={activeIndex !== index}
        importantForAccessibility={activeIndex === index ? 'yes' : 'no-hide-descendants'}
        style={[
          styles.content,
          {
            maxWidth: metrics.contentMaxWidth,
            paddingBottom: metrics.contentBottomPadding,
            paddingHorizontal: metrics.horizontalPadding,
          },
        ]}
      >
        <View style={[styles.header, {height: metrics.headerHeight}]}>
          <SkipButton fontSize={metrics.skipFontSize} onPress={onFinish} theme={slide.theme} />
        </View>

        <Animated.View
          style={[
            styles.hero,
            {
              marginBottom: metrics.heroCopyGap,
              marginTop: metrics.heroTopOffset,
              width: metrics.heroWidth,
            },
            heroMotion,
          ]}
        >
          <HeroImage height={metrics.heroHeight} source={slide.image} width={metrics.heroWidth} />
        </Animated.View>

        <View style={[styles.copy, {gap: metrics.sectionGap}]}>
          <Animated.View style={reveal(16, 0.2)}>
            {slide.titleVariant === 'gradient' ? (
              <GradientTitle fontSize={titleFontSize} lineHeight={titleLineHeight}>
                {slide.title}
              </GradientTitle>
            ) : (
              <Text
                style={[
                  styles.title,
                  {
                    color: '#FFFFFF',
                    fontSize: titleFontSize,
                    lineHeight: titleLineHeight,
                  },
                ]}
              >
                {slide.title}
              </Text>
            )}
          </Animated.View>
          <Animated.Text
            style={[
              styles.body,
              {
                color: slide.theme === 'light' ? '#20242D' : '#E0E6F5',
                fontSize: metrics.bodyFontSize,
                lineHeight: metrics.bodyLineHeight,
              },
              reveal(20, 0.12),
            ]}
          >
            {slide.body}
          </Animated.Text>
        </View>

        <Animated.View style={[styles.indicator, {marginTop: metrics.indicatorGap}, reveal(12, 0.25)]}>
          <PageIndicator
            activeIndex={index}
            count={slideCount}
            dotGap={metrics.indicatorDotGap}
            dotSize={metrics.indicatorDotSize}
            theme={slide.theme}
          />
        </Animated.View>

        <Animated.View style={[styles.cta, {paddingTop: metrics.buttonTopGap}, reveal(10, 0.35)]}>
          <GradientNextButton
            arrowFontSize={metrics.buttonArrowFontSize}
            fontSize={metrics.buttonFontSize}
            height={metrics.buttonHeight}
            isLast={isLast}
            onPress={isLast ? onFinish : onNext}
            radius={metrics.buttonRadius}
          />
        </Animated.View>
      </View>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  content: {alignSelf: 'center', flex: 1, minHeight: '100%', width: '100%'},
  header: {alignItems: 'flex-end', justifyContent: 'center'},
  hero: {alignItems: 'center', alignSelf: 'center', justifyContent: 'center'},
  copy: {width: '100%'},
  title: {fontFamily: 'PlusJakartaSans_700Bold', textAlign: 'left'},
  body: {fontFamily: 'PlusJakartaSans_400Regular', textAlign: 'left'},
  indicator: {width: '100%'},
  cta: {marginTop: 'auto', width: '100%'},
});
