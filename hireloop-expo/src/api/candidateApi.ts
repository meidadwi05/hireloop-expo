/**
 * Compatibility facade for screens that have not been migrated yet.
 * New code should import the API service from its feature folder.
 */
import {applicationsApi} from '../features/applications/api/applications.api';
import {authApi} from '../features/auth/api/auth.api';
import type {CandidateUser, LoginInput} from '../features/auth/auth.types';
import {dashboardApi} from '../features/dashboard/api/dashboard.api';
import {jobsApi} from '../features/jobs/api/jobs.api';
import type {CandidateJobQuery} from '../features/jobs/jobs.types';
import {notificationsApi} from '../features/notifications/api/notifications.api';
import {profileApi} from '../features/profile/api/profile.api';

export type {CandidateUser, CandidateJobQuery};

export const candidateApi = {
  login(email: string, password: string, remember = false): Promise<CandidateUser> {
    const input: LoginInput = {email, password, remember};
    return authApi.login(input);
  },
  getCurrentUser: authApi.getCurrentUser,
  getDashboard: dashboardApi.get,
  getJobs: jobsApi.list,
  getApplications: applicationsApi.list,
  createApplication: applicationsApi.create,
  cancelApplication: applicationsApi.cancel,
  getProfile: profileApi.get,
  getRecruitmentActivities: dashboardApi.getRecruitmentActivities,
  getNotifications: notificationsApi.list,
  getUnreadNotificationCount: notificationsApi.unreadCount,
  logout: authApi.logout,
};
