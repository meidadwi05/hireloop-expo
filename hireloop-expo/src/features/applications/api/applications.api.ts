import {httpClient} from '../../../core/api/http-client';
import {mapApplications, mapRecruitmentProcess} from '../applications.mapper';
import {applicationsMeResponseSchema, recruitmentProcessResponseSchema} from '../applications.schemas';
import type {
  CancelApplicationInput,
  CandidateApplication,
  RecruitmentProcess,
} from '../applications.types';

export const applicationsApi = {
  async list(): Promise<CandidateApplication[]> {
    const response = await httpClient.get('/auth/me');
    const parsed = applicationsMeResponseSchema.parse(response.data);
    return mapApplications(parsed.data.job_applications);
  },

  async create(payload: Record<string, unknown>): Promise<unknown> {
    const response = await httpClient.post('/applicant-data', payload);
    return response.data;
  },

  async cancel({applicationId, storageKind}: CancelApplicationInput): Promise<void> {
    const endpoint = storageKind === 'applicant-data'
      ? `/applicant-data/${applicationId}`
      : `/job-applications/${applicationId}`;
    await httpClient.delete(endpoint);
  },

  async recruitmentProcess(applicantDataId: number | string): Promise<RecruitmentProcess> {
    const response = await httpClient.get(`/applicant-data/${applicantDataId}/recruitment-process`);
    return mapRecruitmentProcess(recruitmentProcessResponseSchema.parse(response.data).data);
  },
};
