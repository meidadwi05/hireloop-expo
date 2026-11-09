import {router} from 'expo-router';
import React, {useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {env} from '../../core/config/env';
import {getGoogleLoginErrorMessage, getLoginErrorMessage} from '../../features/auth/auth.errors';
import {useAuth} from '../../features/auth/auth-provider';
import LoginPage from '../../login_page/login';
import {useActionFeedback} from '../../shared/components/ActionFeedbackProvider';

const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function LoginRoute() {
  const {login, loginWithGoogle} = useAuth();
  const feedback = useActionFeedback();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const submittingRef = useRef(false);
  const googleSubmittingRef = useRef(false);

  const submit = async () => {
    if (submittingRef.current) return;

    const nextErrors = {
      email: validEmail(email) ? undefined : 'Masukkan alamat email yang valid.',
      password: password ? undefined : 'Kata sandi wajib diisi.',
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    submittingRef.current = true;
    setLoading(true);
    setNotice('');
    const result = await feedback.runAction({
      loadingMessage: 'Memverifikasi akun dan menyiapkan halaman Anda...',
      successTitle: 'Login Berhasil',
      successMessage: 'Anda akan diarahkan ke halaman berikutnya.',
      errorTitle: 'Login Gagal',
      minimumLoadingDuration: 2000,
      skipSuccessStatus: true,
      operation: () => login({email, password, remember}),
      onSuccessExit: () => router.replace('/'),
    });
    if (!result.ok) setNotice(getLoginErrorMessage(result.error, {apiUrl: env.apiUrl, isDevelopment: __DEV__}));
    submittingRef.current = false;
    setLoading(false);
  };

  const submitGoogle = async () => {
    if (googleSubmittingRef.current || submittingRef.current) return;

    googleSubmittingRef.current = true;
    setGoogleLoading(true);
    setNotice('');
    const result = await feedback.runAction({
      loadingMessage: 'Menghubungkan akun Google dan menyiapkan halaman Anda...',
      successTitle: 'Login Berhasil',
      successMessage: 'Anda akan diarahkan ke halaman berikutnya.',
      errorTitle: 'Login Google Gagal',
      minimumLoadingDuration: 2000,
      skipSuccessStatus: true,
      operation: async () => {
        const completed = await loginWithGoogle();
        if (!completed) throw new Error('Login Google dibatalkan atau belum selesai.');
        return completed;
      },
      onSuccessExit: () => router.replace('/'),
    });
    if (!result.ok) setNotice(getGoogleLoginErrorMessage(result.error, {apiUrl: env.apiUrl, isDevelopment: __DEV__}));
    googleSubmittingRef.current = false;
    setGoogleLoading(false);
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
        googleLoading={googleLoading}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onRememberChange={setRemember}
        onLogin={() => void submit()}
        onGoogleLogin={() => void submitGoogle()}
        onForgotPassword={() => router.push({pathname: '/(public)/forgot-password', params: {email}})}
        onRegister={() => router.push('/(public)/register')}
      />
    </View>
  );
}

const styles = StyleSheet.create({screen: {flex: 1, backgroundColor: '#050D49'}});
