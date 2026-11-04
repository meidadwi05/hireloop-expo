import Ionicons from '@expo/vector-icons/Ionicons';
import {useQuery} from '@tanstack/react-query';
import {router, Tabs} from 'expo-router';
import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {notificationsApi} from '../../../features/notifications/api/notifications.api';
import {notificationsKeys} from '../../../features/notifications/notifications.keys';

export const unstable_settings = {initialRouteName: 'home'};

export default function CandidateTabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
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
      tabBarStyle: {height: 61 + bottomInset, paddingTop: 8, paddingBottom: bottomInset},
    }}>
      <Tabs.Screen name="home" options={{title: 'Beranda', tabBarIcon: ({color, size}) => <Ionicons name="home" color={color} size={size} />}} />
      <Tabs.Screen name="jobs" options={{title: 'Lowongan', tabBarIcon: ({color, size}) => <Ionicons name="briefcase-outline" color={color} size={size} />}} />
      <Tabs.Screen
        name="career"
        listeners={{
          tabPress: event => {
            event.preventDefault();
            router.push('/(candidate)/jobs/saved' as never);
          },
        }}
        options={{
          title: 'Disimpan',
          tabBarAccessibilityLabel: 'Buka Lowongan Tersimpan',
          tabBarIcon: ({color, focused, size}) => <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} color={color} size={size} />,
        }}
      />
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
