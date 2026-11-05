import {httpClient} from '../../../core/api/http-client';

export type ChangePasswordInput = {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
};

export const accountApi = {
  async changePassword(payload: ChangePasswordInput): Promise<void> {
    await httpClient.post('/account/change-password', payload);
  },

  async requestDeleteAccount(): Promise<void> {
    await httpClient.post('/account/delete/request');
  },

  async confirmDeleteAccount(confirmationText: string): Promise<void> {
    await httpClient.post('/account/delete/confirm', {confirmation_text: confirmationText});
  },
};
