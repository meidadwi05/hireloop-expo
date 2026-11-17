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

export function PerformanceHeader({containerWidth, detail = false}: {containerWidth: number; detail?: boolean}) {
  const insets = useSafeAreaInsets();
  return (
    <BrandedHeaderBackground
      containerWidth={containerWidth}
      contentStyle={[styles.content, {paddingTop: insets.top + 8}]}
      topInset={insets.top}
      variant="performance"
    >
      <Pressable
        accessibilityLabel="Kembali"
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => goBackOrReplace('/(candidate)/(tabs)/home')}
        style={styles.back}
      >
        <Ionicons name="chevron-back" color="#FFFFFF" size={27} />
      </Pressable>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>{detail ? 'Detail Performance' : 'Performance'}</Text>
        <Text numberOfLines={2} style={styles.subtitle}>
          {detail ? 'Detail penilaian KPI dan evaluasi kinerja Anda' : 'Ringkasan penilaian KPI dan evaluasi kinerja Anda'}
        </Text>
      </View>
    </BrandedHeaderBackground>
  );
}

const styles = StyleSheet.create({
  content: {alignItems: 'center', flexDirection: 'row', minHeight: 82, paddingHorizontal: 20, paddingBottom: 12},
  back: {alignItems: 'center', height: 44, justifyContent: 'center', width: 44, marginLeft: -8},
  copy: {flex: 1, minWidth: 0, paddingRight: 8},
  title: {color: '#FFFFFF', fontFamily: F.bold, fontSize: 23, lineHeight: 29},
  subtitle: {color: 'rgba(255,255,255,0.92)', fontFamily: F.regular, fontSize: 13, lineHeight: 18, marginTop: 1},
});

