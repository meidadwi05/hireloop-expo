import {router, useLocalSearchParams} from 'expo-router';
import React, {useState} from 'react';

import {toAppApiError} from '../../core/api/api-error';
import {goBackOrReplace} from '../../core/navigation/go-back-or-replace';
import {authApi} from '../../features/auth/api/auth.api';
import ForgotPasswordPage from '../../login_page/forgotpassword';
import {useActionFeedback} from '../../shared/components/ActionFeedbackProvider';

const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function ForgotPasswordRoute() {
  const feedback = useActionFeedback();
  const params = useLocalSearchParams<{email?: string}>();
  const [email, setEmail] = useState(params.email ?? '');
  const [error, setError] = useState<string>();
  const [successVisible, setSuccessVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!validEmail(email)) {
      setError('Masukkan alamat email yang valid.');
      return;
    }

    if (isSubmitting) return;

    setError(undefined);
    setIsSubmitting(true);
    const result = await feedback.runAction({
      loadingMessage: 'Mengirim tautan reset password...', successTitle: 'Email Reset Terkirim',
      successMessage: 'Periksa kotak masuk email Anda untuk melanjutkan reset password.', errorTitle: 'Gagal Mengirim Email',
      operation: () => authApi.forgotPassword(email),
      onSuccessExit: () => router.replace('/(public)/login'),
    });
    if (!result.ok) setError(toAppApiError(result.error).message);
    setIsSubmitting(false);
  };

  return (
    <ForgotPasswordPage
      email={email}
      error={error}
      isSubmitting={isSubmitting}
      successVisible={successVisible}
      onEmailChange={setEmail}
      onSubmit={() => void submit()}
      onBack={() => goBackOrReplace('/(public)/login')}
      onSuccessDismiss={() => {
        setSuccessVisible(false);
        router.replace('/(public)/login');
      }}
    />
  );
}
