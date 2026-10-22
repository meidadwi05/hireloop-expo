import {Redirect} from 'expo-router';
import React from 'react';

import {useAuth} from '../features/auth/auth-provider';
import {FullScreenLoader} from '../shared/components/FullScreenLoader';

export default function IndexRoute() {
  const {status, user} = useAuth();

  if (status === 'loading' || status === 'authenticating') {
    return <FullScreenLoader label={status === 'loading' ? 'Memulihkan sesi...' : 'Memverifikasi akun...'} />;
  }
  if (status === 'unauthenticated') return <Redirect href="/(public)/welcome" />;
  if (user && !user.onboarding_finished) return <Redirect href="/(onboarding)/onboarding" />;
  return <Redirect href="/(candidate)/(tabs)/home" />;
}
