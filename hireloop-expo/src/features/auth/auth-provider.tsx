import {useQueryClient} from '@tanstack/react-query';
import React, {createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState} from 'react';

import {tokenStorage} from '../../api/tokenStorage';
import {subscribeUnauthorized} from '../../core/api/http-client';
import {authApi} from './api/auth.api';
import type {CandidateUser, LoginInput} from './auth.types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  user: CandidateUser | null;
  login: (input: LoginInput) => Promise<void>;
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
    const nextUser = await authApi.login(input);
    setUser(nextUser);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => tokenStorage.remove());
    clearSession();
  }, [clearSession]);

  const value = useMemo(() => ({status, user, login, logout, refreshUser}), [status, user, login, logout, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  return context;
}
