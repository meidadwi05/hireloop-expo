import {router} from 'expo-router';
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {toAppApiError} from '../../core/api/api-error';
import {useAuth} from '../../features/auth/auth-provider';
import LoginPage from '../../login_page/login';

const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function LoginRoute() {
  const {login} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});

  const submit = async () => {
    const nextErrors = {
      email: validEmail(email) ? undefined : 'Masukkan alamat email yang valid.',
      password: password ? undefined : 'Kata sandi wajib diisi.',
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setLoading(true);
    setNotice('');
    try {
      await login({email, password, remember});
      router.replace('/');
    } catch (error) {
      const apiError = toAppApiError(error);
      if (apiError.status === 401) {
        setNotice('Email atau kata sandi salah.');
      } else if (apiError.status === 403) {
        setNotice('Akun belum diverifikasi atau tidak memiliki akses kandidat.');
      } else {
        setNotice(apiError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <LoginPage
        email={email}
        password={password}
        errors={errors}
        remember={remember}
        notice={notice}
        loading={loading}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onRememberChange={setRemember}
        onNoticeChange={setNotice}
        onLogin={() => void submit()}
        onForgotPassword={() => router.push({pathname: '/(public)/forgot-password', params: {email}})}
        onRegister={() => router.push('/(public)/register')}
        onShowOnboarding={() => router.push('/(public)/welcome')}
      />
    </View>
  );
}

const styles = StyleSheet.create({screen: {flex: 1, backgroundColor: '#050D49'}});
