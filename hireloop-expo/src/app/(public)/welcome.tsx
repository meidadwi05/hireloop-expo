import {router} from 'expo-router';
import React, {useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';

const slides = [
  {image: require('../../assets/Onboarding1.png'), title: 'Temukan pekerjaan terbaik', body: 'Cari peluang yang sesuai dengan kemampuan dan tujuan kariermu.'},
  {image: require('../../assets/Onboarding2.png'), title: 'Pantau proses lamaran', body: 'Semua progres rekrutmen tersimpan dan mudah dipantau.'},
  {image: require('../../assets/Onboarding3.png'), title: 'Lamar dengan lebih mudah', body: 'Profil yang lengkap membuat proses lamaran lebih cepat.'},
  {image: require('../../assets/Onboarding4.png'), title: 'Rekomendasi personal', body: 'Dapatkan lowongan yang relevan untuk perjalanan kariermu.'},
];

export default function WelcomeRoute() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  return (
    <View style={styles.screen}>
      <Pressable onPress={() => router.replace('/(public)/login')} style={styles.skip}><Text style={styles.skipText}>Lewati</Text></Pressable>
      <Image source={slide.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.body}>{slide.body}</Text>
      <View style={styles.dots}>{slides.map((_, itemIndex) => <View key={itemIndex} style={[styles.dot, itemIndex === index && styles.dotActive]} />)}</View>
      <Pressable onPress={() => index === slides.length - 1 ? router.replace('/(public)/login') : setIndex(index + 1)} style={styles.button}>
        <Text style={styles.buttonText}>{index === slides.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#050D49', alignItems: 'center', paddingHorizontal: 28, paddingVertical: 34},
  skip: {alignSelf: 'flex-end', padding: 10}, skipText: {fontFamily: 'PlusJakartaSans_500Medium', color: '#C7D5FF', fontSize: 12},
  image: {width: '100%', height: '48%', marginTop: 12}, title: {fontFamily: 'PlusJakartaSans_700Bold', fontSize: 26, color: 'white', textAlign: 'center', marginTop: 18},
  body: {fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 21, color: '#CCD7F3', textAlign: 'center', marginTop: 12},
  dots: {flexDirection: 'row', gap: 7, marginTop: 24}, dot: {width: 7, height: 7, borderRadius: 4, backgroundColor: '#40527F'}, dotActive: {width: 24, backgroundColor: '#00CBEA'},
  button: {height: 52, width: '100%', borderRadius: 12, backgroundColor: '#0865FF', alignItems: 'center', justifyContent: 'center', marginTop: 'auto'},
  buttonText: {fontFamily: 'PlusJakartaSans_700Bold', color: 'white', fontSize: 14},
});
