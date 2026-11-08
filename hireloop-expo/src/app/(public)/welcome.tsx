import {router} from 'expo-router';
import React, {useEffect, useState} from 'react';

import {OnboardingPager} from '../../features/intro/components/OnboardingPager';
import {OnboardingSplash, ONBOARDING_SPLASH_DURATION_MS} from '../../features/intro/components/OnboardingSplash';
import type {IntroSlide, WelcomePhase} from '../../features/intro/intro.types';

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

  useEffect(() => {
    if (phase !== 'splash') return;
    const timer = setTimeout(() => setPhase('slides'), ONBOARDING_SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === 'splash') return <OnboardingSplash />;

  return <OnboardingPager onFinish={() => router.replace('/(public)/login')} slides={slides} />;
}
