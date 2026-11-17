import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {BrandedHeaderBackground} from '../../../components/ui/BrandedHeaderBackground';
import {goBackOrReplace} from '../../../core/navigation/go-back-or-replace';

const F = {
  regular: 'PlusJakartaSans_400Regular',
  bold: 'PlusJakartaSans_700Bold',
} as const;

type PerformanceHeaderProps = {
  containerWidth: number;
  detail?: boolean;
  subtitle?: string;
  title?: string;
};

export function PerformanceHeader({containerWidth, detail = false, subtitle, title}: PerformanceHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <BrandedHeaderBackground
      containerWidth={containerWidth}
      contentStyle={[styles.content, {paddingTop: insets.top + 4}]}
      topInset={insets.top}
      variant="performance"
    >
      <Pressable
        accessibilityLabel="Kembali"
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => goBackOrReplace(detail ? '/(candidate)/performance' : '/(candidate)/(tabs)/home')}
        style={styles.back}
      >
        <Ionicons name="chevron-back" color="#FFFFFF" size={21} />
      </Pressable>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>{title ?? (detail ? 'Hasil Penilaian Performance' : 'Performance')}</Text>
        <Text numberOfLines={2} style={styles.subtitle}>
          {subtitle ?? (detail ? 'Detail penilaian KPI dan evaluasi kinerja Anda' : 'Ringkasan penilaian KPI dan evaluasi kinerja Anda')}
        </Text>
      </View>
    </BrandedHeaderBackground>
  );
}

const styles = StyleSheet.create({
  content: {alignItems: 'center', flexDirection: 'row', height: '100%', paddingHorizontal: 16, paddingBottom: 6},
  back: {alignItems: 'center', height: 36, justifyContent: 'center', width: 36, marginLeft: -4},
  copy: {flex: 1, minWidth: 0, paddingRight: 8},
  title: {color: '#FFFFFF', fontFamily: F.bold, fontSize: 17, lineHeight: 22},
  subtitle: {color: 'rgba(255,255,255,0.92)', fontFamily: F.regular, fontSize: 11, lineHeight: 15, marginTop: 1},
});

