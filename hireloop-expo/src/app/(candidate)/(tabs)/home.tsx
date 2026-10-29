import React from 'react';
import {router, useLocalSearchParams} from 'expo-router';

import DashboardHome from '../../../dashboard/DashboardHome';
import {useAuth} from '../../../features/auth/auth-provider';
import {FullScreenLoader} from '../../../shared/components/FullScreenLoader';

export default function DashboardRoute() {
  const {openEvaluation} = useLocalSearchParams<{openEvaluation?: string}>();
  const {user, logout} = useAuth();
  if (!user) return <FullScreenLoader />;
  return (
    <DashboardHome
      initialUser={user}
      onLogout={logout}
      onEvaluationClose={() => router.setParams({openEvaluation: ''})}
      onNavigate={route => router.push(route as never)}
      openEvaluation={openEvaluation === '1'}
    />
  );
}
