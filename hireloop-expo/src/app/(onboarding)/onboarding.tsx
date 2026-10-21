import {Redirect} from 'expo-router';
import React from 'react';

import {useAuth} from '../../features/auth/auth-provider';
import {OnboardingScreen} from '../../features/onboarding/OnboardingScreen';
import {FullScreenLoader} from '../../shared/components/FullScreenLoader';

export default function CandidateOnboardingRoute() {
  const {status, user} = useAuth();
  if (status === 'loading' || status === 'authenticating') return <FullScreenLoader />;
  if (status === 'unauthenticated') return <Redirect href="/(public)/login" />;
  if (user?.onboarding_finished) return <Redirect href="/(candidate)/(tabs)/home" />;
  return <OnboardingScreen />;
}
