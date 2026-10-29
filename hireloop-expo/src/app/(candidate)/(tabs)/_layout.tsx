import Ionicons from '@expo/vector-icons/Ionicons';
import {useQuery} from '@tanstack/react-query';
import {Tabs} from 'expo-router';
import React from 'react';

import {notificationsApi} from '../../../features/notifications/api/notifications.api';
import {notificationsKeys} from '../../../features/notifications/notifications.keys';

export const unstable_settings = {initialRouteName: 'home'};

export default function CandidateTabsLayout() {
  const {data: unreadCount = 0} = useQuery({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: notificationsApi.unreadCount,
    staleTime: 30_000,
  });

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#0865FF',
      tabBarInactiveTintColor: '#A1A7B2',
      tabBarLabelStyle: {fontFamily: 'PlusJakartaSans_500Medium', fontSize: 9},
      tabBarStyle: {height: 69, paddingTop: 8, paddingBottom: 8},
    }}>
      <Tabs.Screen name="home" options={{title: 'Beranda', tabBarIcon: ({color, size}) => <Ionicons name="home" color={color} size={size} />}} />
      <Tabs.Screen name="jobs" options={{title: 'Lowongan', tabBarIcon: ({color, size}) => <Ionicons name="briefcase-outline" color={color} size={size} />}} />
      <Tabs.Screen name="career" options={{title: 'Lamaran', tabBarIcon: ({color, size}) => <Ionicons name="document-text-outline" color={color} size={size} />}} />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifikasi',
          tabBarAccessibilityLabel: unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : 'Notifikasi',
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
          tabBarBadgeStyle: {backgroundColor: '#F20D2F', color: 'white', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 8},
          tabBarIcon: ({color, focused, size}) => <Ionicons name={focused ? 'notifications' : 'notifications-outline'} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Akun',
          tabBarAccessibilityLabel: 'Buka Pengaturan Akun',
          tabBarIcon: ({color, focused, size}) => <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
