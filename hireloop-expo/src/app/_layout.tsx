import {PlusJakartaSans_400Regular} from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import {PlusJakartaSans_500Medium} from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import {PlusJakartaSans_600SemiBold} from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import {PlusJakartaSans_700Bold} from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import {PlusJakartaSans_800ExtraBold} from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import {QueryClientProvider} from '@tanstack/react-query';
import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {queryClient} from '../core/query/query-client';
import {AuthProvider} from '../features/auth/auth-provider';
import {FullScreenLoader} from '../shared/components/FullScreenLoader';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) return <FullScreenLoader />;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <View style={styles.desktop}>
            <View style={styles.app}>
              <StatusBar style="auto" />
              <Stack screenOptions={{headerShown: false, animation: 'fade'}} />
            </View>
          </View>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  desktop: {flex: 1, backgroundColor: '#EAF0F9', alignItems: 'center'},
  app: {flex: 1, width: '100%', maxWidth: 440, overflow: 'hidden', backgroundColor: '#F7F8FC'},
});
