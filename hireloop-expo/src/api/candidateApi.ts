import {candidateClient} from './candidateClient';
import {tokenStorage} from './tokenStorage';

export type CandidateUser = {
  id: number;
  full_name: string;
  email: string;
  avatar_url: string | null;
  cover_url: string | null;
  profile_completed_at: string | null;
  is_verified: boolean;
  prod_candidate: boolean;
  onboarding_finished: boolean;
  role: string | null;
  roles: string[];
  job_applications?: Array<Record<string, unknown>>;
};

type LoginResponse = {
  success: boolean;
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
};

type CurrentUserResponse = {
  success: boolean;
  data: CandidateUser;
};

export type CandidateJobQuery = {
  search?: string;
  priority?: 'all' | 'high';
  page?: number;
  per_page?: number;
};

export const candidateApi = {
  async login(email: string, password: string, remember = false) {
    const loginResponse = await candidateClient.post<LoginResponse>('/login', {
      email: email.trim().toLowerCase(),
      password,
    });

    await tokenStorage.set(loginResponse.data.token, remember);

    try {
      const candidate = await this.getCurrentUser();

      if (!candidate.roles.includes('user')) {
        throw new Error('Akun ini bukan akun kandidat.');
      }

      return candidate;
    } catch (error) {
      await tokenStorage.remove();
      throw error;
    }
  },

  async getCurrentUser() {
    const response = await candidateClient.get<CurrentUserResponse>('/auth/me');
    return response.data.data;
  },

  async getDashboard() {
    const response = await candidateClient.get('/user/dashboard');
    return response.data;
  },

  async getJobs(params: CandidateJobQuery = {}) {
    const response = await candidateClient.get('/candidate-job-listings', {params});
    return response.data;
  },

  async getApplications() {
    const response = await candidateClient.get('/job-applications');
    return response.data;
  },

  async createApplication(payload: Record<string, unknown>) {
    const response = await candidateClient.post('/job-applications', payload);
    return response.data;
  },

  async cancelApplication(applicationId: number) {
    const response = await candidateClient.delete(`/job-applications/${applicationId}`);
    return response.data;
  },

  async getProfile() {
    const response = await candidateClient.get('/job-seeker/profile');
    return response.data;
  },

  async getRecruitmentActivities() {
    const response = await candidateClient.get('/aktivitas-rekrutmen');
    return response.data;
  },

  async getNotifications() {
    const response = await candidateClient.get('/notifications');
    return response.data;
  },

  async getUnreadNotificationCount() {
    const response = await candidateClient.get('/notifications/unread-count');
    return response.data;
  },

  async logout() {
    try {
      await candidateClient.post('/logout');
    } finally {
      await tokenStorage.remove();
    }
  },
};
