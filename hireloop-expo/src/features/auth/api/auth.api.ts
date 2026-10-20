import {httpClient} from '../../../core/api/http-client';
import {tokenStorage} from '../../../api/tokenStorage';
import {
  authMessageResponseSchema,
  currentUserResponseSchema,
  loginResponseSchema,
  verifyOtpResponseSchema,
} from '../auth.schemas';
import {AuthFlowError} from '../auth.errors';
import type {CandidateUser, LoginInput, RegisterInput} from '../auth.types';

export const AUTH_CLIENT_TYPE = 'mobile' as const;

async function getCurrentUser(): Promise<CandidateUser> {
  const response = await httpClient.get('/auth/me');
  return currentUserResponseSchema.parse(response.data).data;
}

async function clearTokenSafely(): Promise<void> {
  await tokenStorage.remove().catch(() => undefined);
}

async function establishCandidateSession(token: string, persistent: boolean): Promise<CandidateUser> {
  try {
    await tokenStorage.set(token, persistent);
  } catch (error) {
    await clearTokenSafely();
    throw new AuthFlowError('token-storage', error);
  }

  try {
    const user = await getCurrentUser();
    if (!user.roles.includes('user')) {
      throw new AuthFlowError('candidate-role', new Error('Candidate role is missing.'));
    }
    return user;
  } catch (error) {
    await clearTokenSafely();
    throw error instanceof AuthFlowError ? error : new AuthFlowError('current-user', error);
  }
}

export const authApi = {
  async login(input: LoginInput): Promise<CandidateUser> {
    let token: string;

    try {
      const response = await httpClient.post('/login', {
        email: input.email.trim().toLowerCase(),
        password: input.password,
        client_type: AUTH_CLIENT_TYPE,
      });
      token = loginResponseSchema.parse(response.data).token;
    } catch (error) {
      throw new AuthFlowError('login', error);
    }

    return establishCandidateSession(token, input.remember);
  },

  establishCandidateSession,

  getCurrentUser,

  async forgotPassword(email: string): Promise<void> {
    await httpClient.post('/forgot-password', {email: email.trim().toLowerCase()});
  },

  async register(input: RegisterInput): Promise<string | undefined> {
    const response = await httpClient.post('/register', {
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      password_confirmation: input.passwordConfirmation,
    });
    return authMessageResponseSchema.parse(response.data).message;
  },

  async verifyRegistrationOtp(email: string, code: string): Promise<void> {
    const response = await httpClient.post('/verify-otp', {
      email: email.trim().toLowerCase(),
      code: code.trim(),
      client_type: AUTH_CLIENT_TYPE,
    });
    const result = verifyOtpResponseSchema.parse(response.data);
    await tokenStorage.set(result.token, true);
  },

  async resendRegistrationOtp(email: string): Promise<string | undefined> {
    const response = await httpClient.post('/resend-otp', {email: email.trim().toLowerCase()});
    return authMessageResponseSchema.parse(response.data).message;
  },

  async logout(): Promise<void> {
    try {
      await httpClient.post('/logout');
    } finally {
      await tokenStorage.remove();
    }
  },
};
