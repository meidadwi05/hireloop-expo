import {useQueryClient} from '@tanstack/react-query';
import React, {createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState} from 'react';

import {tokenStorage} from '../../api/tokenStorage';
import {subscribeUnauthorized} from '../../core/api/http-client';
import {authApi} from './api/auth.api';
import {completeGoogleLogin as completeGoogleSession, startGoogleLogin} from './google-auth.service';
import type {CandidateUser, LoginInput} from './auth.types';

export type AuthStatus = 'loading' | 'authenticating' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  user: CandidateUser | null;
  login: (input: LoginInput) => Promise<void>;
  loginWithGoogle: () => Promise<boolean>;
  completeGoogleLogin: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<CandidateUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<CandidateUser | null>(null);

  const clearSession = useCallback(() => {
    setUser(null);
    setStatus('unauthenticated');
    queryClient.clear();
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    const token = await tokenStorage.get();
    if (!token) {
      clearSession();
      return null;
    }

    try {
      const nextUser = await authApi.getCurrentUser();
      if (!nextUser.roles.includes('user')) throw new Error('Akun ini bukan akun kandidat.');
      setUser(nextUser);
      setStatus('authenticated');
      return nextUser;
    } catch {
      await tokenStorage.remove();
      clearSession();
      return null;
    }
  }, [clearSession]);

  useEffect(() => {
    void Promise.resolve().then(refreshUser);
    return subscribeUnauthorized(clearSession);
  }, [clearSession, refreshUser]);

  const login = useCallback(async (input: LoginInput) => {
    setStatus('authenticating');
    try {
      const nextUser = await authApi.login(input);
      setUser(nextUser);
      setStatus('authenticated');
    } catch (error) {
      setUser(null);
      setStatus('unauthenticated');
      throw error;
    }
  }, []);

  const completeGoogleLogin = useCallback(async (code: string) => {
    setStatus('authenticating');
    try {
      const nextUser = await completeGoogleSession(code);
      setUser(nextUser);
      setStatus('authenticated');
    } catch (error) {
      setUser(null);
      setStatus('unauthenticated');
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setStatus('authenticating');
    try {
      const result = await startGoogleLogin();
      if (result.status === 'cancelled') {
        setStatus('unauthenticated');
        return false;
      }

      const nextUser = await completeGoogleSession(result.code);
      setUser(nextUser);
      setStatus('authenticated');
      return true;
    } catch (error) {
      setUser(null);
      setStatus('unauthenticated');
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => tokenStorage.remove());
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({status, user, login, loginWithGoogle, completeGoogleLogin, logout, refreshUser}),
    [status, user, login, loginWithGoogle, completeGoogleLogin, logout, refreshUser],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  return context;
}
