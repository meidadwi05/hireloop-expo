import {Redirect} from 'expo-router';
import React from 'react';

import {useAuth} from '../features/auth/auth-provider';
import {FullScreenLoader} from '../shared/components/FullScreenLoader';

export default function IndexRoute() {
  const {status, user} = useAuth();

  if (status === 'loading') return <FullScreenLoader label="Memulihkan sesi..." />;
  if (status === 'unauthenticated') return <Redirect href="/(public)/login" />;
  if (user && !user.onboarding_finished) return <Redirect href="/(onboarding)/onboarding" />;
  return <Redirect href="/(candidate)/(tabs)/home" />;
}
