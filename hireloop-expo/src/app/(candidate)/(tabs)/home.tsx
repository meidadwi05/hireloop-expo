import React from 'react';
import {router} from 'expo-router';

import DashboardHome from '../../../dashboard/DashboardHome';
import {useAuth} from '../../../features/auth/auth-provider';
import {FullScreenLoader} from '../../../shared/components/FullScreenLoader';

export default function DashboardRoute() {
  const {user, logout} = useAuth();
  if (!user) return <FullScreenLoader />;
  return <DashboardHome initialUser={user} onLogout={logout} onNavigate={route => router.push(route)} />;
}
