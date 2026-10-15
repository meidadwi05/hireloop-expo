import {Redirect, Stack} from 'expo-router';
import React from 'react';

import {useAuth} from '../../features/auth/auth-provider';
import {FullScreenLoader} from '../../shared/components/FullScreenLoader';

export default function PublicLayout() {
  const {status, user} = useAuth();
  if (status === 'loading') return <FullScreenLoader label="Memulihkan sesi..." />;
  if (status === 'authenticated') {
    return <Redirect href={user?.onboarding_finished ? '/(candidate)/(tabs)/home' : '/(onboarding)/onboarding'} />;
  }

  return <Stack screenOptions={{headerShown: false}} />;
}
