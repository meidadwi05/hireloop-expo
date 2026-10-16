import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import {Platform} from 'react-native';

import {authApi} from './api/auth.api';
import {googleAuthApi} from './api/google-auth.api';
import {AuthFlowError} from './auth.errors';
import type {CandidateUser} from './auth.types';

void WebBrowser.maybeCompleteAuthSession();

type GoogleLoginResult =
  | {status: 'cancelled'}
  | {status: 'success'; code: string};

let activeCompletion: {code: string; promise: Promise<CandidateUser>} | null = null;

function getReturnUrl(): string {
  if (Platform.OS === 'web' && typeof globalThis.location !== 'undefined') {
    return `${globalThis.location.origin}/auth/google/callback`;
  }

  return Linking.createURL('auth/google/callback', {scheme: 'hireloop'});
}

export function parseGoogleCallbackUrl(url: string): string {
  const callback = new URL(url);
  const error = callback.searchParams.get('error');
  if (error) throw new AuthFlowError('google-callback', new Error(error));

  const code = callback.searchParams.get('code');
  if (!code) throw new AuthFlowError('google-callback', new Error('missing_code'));
  return code;
}

export async function startGoogleLogin(): Promise<GoogleLoginResult> {
  if (Platform.OS !== 'web' && Constants.appOwnership === 'expo') {
    throw new AuthFlowError('google-browser', new Error('expo-go-unsupported'));
  }

  const returnUrl = getReturnUrl();
  let authorizationUrl: string;

  try {
    authorizationUrl = await googleAuthApi.getAuthorizationUrl(returnUrl);
  } catch (error) {
    throw new AuthFlowError('google-start', error);
  }

  let result: WebBrowser.WebBrowserAuthSessionResult;
  try {
    result = await WebBrowser.openAuthSessionAsync(authorizationUrl, returnUrl);
  } catch (error) {
    throw new AuthFlowError('google-browser', error);
  }

  if (result.type !== 'success') return {status: 'cancelled'};

  return {status: 'success', code: parseGoogleCallbackUrl(result.url)};
}

export function completeGoogleLogin(code: string): Promise<CandidateUser> {
  if (activeCompletion?.code === code) return activeCompletion.promise;

  const promise = (async () => {
    let token: string;
    try {
      token = await googleAuthApi.exchangeCode(code);
    } catch (error) {
      throw new AuthFlowError('google-exchange', error);
    }

    return authApi.establishCandidateSession(token, true);
  })();

  activeCompletion = {code, promise};
  return promise;
}
