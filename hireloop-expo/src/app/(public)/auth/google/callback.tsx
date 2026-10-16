import {router, useLocalSearchParams} from 'expo-router';
import React, {useEffect, useRef, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {env} from '../../../../core/config/env';
import {AuthFlowError, getGoogleLoginErrorMessage} from '../../../../features/auth/auth.errors';
import {useAuth} from '../../../../features/auth/auth-provider';
import {FullScreenLoader} from '../../../../shared/components/FullScreenLoader';

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function GoogleCallbackRoute() {
  const params = useLocalSearchParams<{code?: string | string[]; error?: string | string[]}>();
  const {completeGoogleLogin} = useAuth();
  const startedRef = useRef(false);
  const [completionMessage, setCompletionMessage] = useState('');
  const error = firstParam(params.error);
  const code = firstParam(params.code);
  const immediateMessage = error
    ? getGoogleLoginErrorMessage(new AuthFlowError('google-callback', new Error(error)))
    : !code
      ? 'Kode Google Login tidak ditemukan. Silakan mulai kembali dari halaman masuk.'
      : '';

  useEffect(() => {
    if (startedRef.current) return;
    if (!code || error) return;
    startedRef.current = true;

    void completeGoogleLogin(code)
      .then(() => router.replace('/'))
      .catch(loginError => {
        setCompletionMessage(getGoogleLoginErrorMessage(loginError, {
          apiUrl: env.apiUrl,
          isDevelopment: __DEV__,
        }));
      });
  }, [code, completeGoogleLogin, error]);

  const message = immediateMessage || completionMessage;

  if (!message) return <FullScreenLoader label="Menyelesaikan Google Login..." />;

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Google Login gagal</Text>
        <Text style={styles.message}>{message}</Text>
        <Pressable
          accessibilityRole="button"
          style={styles.button}
          onPress={() => router.replace('/(public)/login')}
        >
          <Text style={styles.buttonText}>Kembali ke halaman masuk</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#050D49',
  },
  card: {backgroundColor: '#FFFFFF', borderRadius: 22, padding: 24, gap: 16},
  title: {fontSize: 20, fontWeight: '700', color: '#12224B'},
  message: {fontSize: 14, lineHeight: 21, color: '#59657B'},
  button: {borderRadius: 10, backgroundColor: '#0865FF', padding: 15, alignItems: 'center'},
  buttonText: {fontSize: 14, fontWeight: '700', color: '#FFFFFF'},
});
