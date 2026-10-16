import {Redirect, Stack} from 'expo-router';
import React from 'react';

import {useAuth} from '../../features/auth/auth-provider';
import {FullScreenLoader} from '../../shared/components/FullScreenLoader';

export default function CandidateLayout() {
  const {status, user} = useAuth();
  if (status === 'loading' || status === 'authenticating') {
    return <FullScreenLoader label="Memuat akun kandidat..." />;
  }
  if (status === 'unauthenticated') return <Redirect href="/(public)/login" />;
  if (user && !user.onboarding_finished) return <Redirect href="/(onboarding)/onboarding" />;
  return <Stack screenOptions={{headerShown: false}} />;
}
