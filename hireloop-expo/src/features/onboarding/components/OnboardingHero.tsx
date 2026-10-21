import {Ionicons} from '@expo/vector-icons';
import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';

export function OnboardingHero({step, onBack}: {step: 1 | 2; onBack: () => void}) {
  const personal = step === 1;
  return (
    <View style={styles.hero}>
      <Image
        source={personal ? require('../../../assets/register_onboarding.png') : require('../../../assets/onboarding_experience.png')}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
        accessibilityIgnoresInvertColors
      />
      <Pressable accessibilityRole="button" accessibilityLabel="Kembali" onPress={onBack} style={styles.back}>
        <Ionicons name="arrow-back" size={25} color="white" />
      </Pressable>
      <View style={styles.copy}>
        <View style={styles.badge}><Text style={styles.badgeText}>Langkah {step} dari 2</Text></View>
        <Text style={styles.title}>{personal ? 'Lengkapi Data Diri' : 'Pengalaman Kerja'}</Text>
        <Text style={styles.description}>Lengkapi informasi berikut untuk{`\n`}memulai perjalanan karirmu</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {width: '100%', aspectRatio: 960 / 540, minHeight: 235, backgroundColor: '#010934', overflow: 'hidden'},
  back: {position: 'absolute', left: 22, top: 12, width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  copy: {position: 'absolute', left: 26, top: 73, maxWidth: '62%'},
  badge: {alignSelf: 'flex-start', borderRadius: 18, backgroundColor: 'rgba(24,83,140,0.82)', paddingHorizontal: 13, paddingVertical: 8, marginBottom: 22},
  badgeText: {fontFamily: 'PlusJakartaSans_400Regular', color: '#EAF5FF', fontSize: 12},
  title: {fontFamily: 'PlusJakartaSans_700Bold', color: 'white', fontSize: 25, lineHeight: 32},
  description: {fontFamily: 'PlusJakartaSans_400Regular', color: 'rgba(255,255,255,0.88)', fontSize: 12, lineHeight: 18, marginTop: 10},
});
