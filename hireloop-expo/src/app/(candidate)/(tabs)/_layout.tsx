import {Ionicons} from '@expo/vector-icons';
import {Tabs} from 'expo-router';
import React from 'react';

export const unstable_settings = {initialRouteName: 'home'};

export default function CandidateTabsLayout() {
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
      <Tabs.Screen name="career" options={{title: 'Karir', tabBarIcon: ({color, size}) => <Ionicons name="trending-up-outline" color={color} size={size} />}} />
      <Tabs.Screen name="notifications" options={{title: 'Notifikasi', tabBarIcon: ({color, size}) => <Ionicons name="notifications-outline" color={color} size={size} />}} />
      <Tabs.Screen name="profile" options={{title: 'Profil', tabBarIcon: ({color, size}) => <Ionicons name="person-outline" color={color} size={size} />}} />
    </Tabs>
  );
}
