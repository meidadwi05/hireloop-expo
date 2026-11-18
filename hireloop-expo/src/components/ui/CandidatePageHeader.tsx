import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {BrandedHeaderBackground, type BrandedHeaderVariant} from './BrandedHeaderBackground';

type CandidatePageHeaderProps = {
  artworkTestID?: string;
  backLabel?: string;
  containerWidth: number;
  contentTestID?: string;
  onBack: () => void;
  subtitle: string;
  testID?: string;
  title: string;
  variant: BrandedHeaderVariant;
};

export function CandidatePageHeader({
  artworkTestID,
  backLabel = 'Kembali',
  containerWidth,
  contentTestID,
  onBack,
  subtitle,
  testID,
  title,
  variant,
}: CandidatePageHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <BrandedHeaderBackground
      artworkTestID={artworkTestID}
      containerWidth={containerWidth}
      contentStyle={[styles.content, {paddingTop: insets.top + 4}]}
      contentTestID={contentTestID}
      testID={testID}
      topInset={insets.top}
      variant={variant}
    >
      <Pressable
        accessibilityLabel={backLabel}
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBack}
        style={({pressed}) => [styles.back, pressed && styles.backPressed]}
      >
        <Ionicons name="chevron-back" color="#FFFFFF" size={22} />
      </Pressable>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>{title}</Text>
        <Text numberOfLines={2} style={styles.subtitle}>{subtitle}</Text>
      </View>
    </BrandedHeaderBackground>
  );
}

const styles = StyleSheet.create({
  content: {alignItems: 'center', flexDirection: 'row', height: '100%', paddingHorizontal: 16, paddingBottom: 6},
  back: {
    alignItems: 'center',
    borderRadius: 22,
    flexShrink: 0,
    height: 44,
    justifyContent: 'center',
    marginLeft: -4,
    overflow: 'visible',
    width: 44,
  },
  backPressed: {backgroundColor: 'rgba(255,255,255,0.12)'},
  copy: {flex: 1, minWidth: 0, paddingLeft: 2, paddingRight: 12},
  title: {color: '#FFFFFF', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, lineHeight: 22},
  subtitle: {color: 'rgba(255,255,255,0.92)', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, lineHeight: 15, marginTop: 1},
});
