import {httpClient} from '../../../core/api/http-client';
import {tokenStorage} from '../../../api/tokenStorage';
import {
  authMessageResponseSchema,
  currentUserResponseSchema,
  loginResponseSchema,
  verifyOtpResponseSchema,
} from '../auth.schemas';
import type {CandidateUser, LoginInput, RegisterInput} from '../auth.types';

export const authApi = {
  async login(input: LoginInput): Promise<CandidateUser> {
    const response = await httpClient.post('/login', {
      email: input.email.trim().toLowerCase(),
      password: input.password,
    });
    const login = loginResponseSchema.parse(response.data);
    await tokenStorage.set(login.token, input.remember);

    try {
      const user = await this.getCurrentUser();
      if (!user.roles.includes('user')) throw new Error('Akun ini bukan akun kandidat.');
      return user;
    } catch (error) {
      await tokenStorage.remove();
      throw error;
    }
  },

  async getCurrentUser(): Promise<CandidateUser> {
    const response = await httpClient.get('/auth/me');
    return currentUserResponseSchema.parse(response.data).data;
  },

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
