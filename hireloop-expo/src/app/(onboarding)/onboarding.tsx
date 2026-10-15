import {Redirect} from 'expo-router';
import React from 'react';

import {useAuth} from '../../features/auth/auth-provider';
import {FeaturePlaceholder} from '../../shared/components/FeaturePlaceholder';
import {FullScreenLoader} from '../../shared/components/FullScreenLoader';

export default function CandidateOnboardingRoute() {
  const {status, user} = useAuth();
  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'unauthenticated') return <Redirect href="/(public)/login" />;
  if (user?.onboarding_finished) return <Redirect href="/(candidate)/(tabs)/home" />;
  return <FeaturePlaceholder title="Lengkapi Onboarding" description="Data onboarding kandidat akan disimpan bertahap melalui modul onboarding yang sudah dipisahkan." />;
}
