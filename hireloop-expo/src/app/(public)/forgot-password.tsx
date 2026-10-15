import {router, useLocalSearchParams} from 'expo-router';
import React, {useState} from 'react';

import {toAppApiError} from '../../core/api/api-error';
import {authApi} from '../../features/auth/api/auth.api';
import ForgotPasswordPage from '../../login_page/forgotpassword';

const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function ForgotPasswordRoute() {
  const params = useLocalSearchParams<{email?: string}>();
  const [email, setEmail] = useState(params.email ?? '');
  const [error, setError] = useState<string>();
  const [successVisible, setSuccessVisible] = useState(false);

  const submit = async () => {
    if (!validEmail(email)) {
      setError('Masukkan alamat email yang valid.');
      return;
    }

    setError(undefined);
    try {
      await authApi.forgotPassword(email);
      setSuccessVisible(true);
    } catch (submitError) {
      setError(toAppApiError(submitError).message);
    }
  };

  return (
    <ForgotPasswordPage
      email={email}
      error={error}
      successVisible={successVisible}
      onEmailChange={setEmail}
      onSubmit={() => void submit()}
      onBack={() => router.back()}
      onSuccessDismiss={() => {
        setSuccessVisible(false);
        router.replace('/(public)/login');
      }}
    />
  );
}
