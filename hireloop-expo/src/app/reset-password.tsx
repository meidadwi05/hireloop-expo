import {useLocalSearchParams} from 'expo-router';
import React from 'react';

import ResetPasswordScreen from '../features/auth/reset-password/ResetPasswordScreen';

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default function ResetPasswordRoute() {
  const params = useLocalSearchParams<{email?: string | string[]; token?: string | string[]}>();

  return (
    <ResetPasswordScreen
      email={firstParam(params.email)}
      token={firstParam(params.token)}
    />
  );
}
