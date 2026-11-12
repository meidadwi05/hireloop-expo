import {httpClient} from '../../../core/api/http-client';
import {mapCandidateJobsPage, mapJobDetail} from '../jobs.mapper';
import {candidateJobsResponseSchema} from '../jobs.schemas';
import type {
  ApplyCandidateJobPayload,
  CandidateJobDetail,
  CandidateJobQuery,
  CandidateJobSource,
  CandidateJobsPage,
  JobCardModel,
} from '../jobs.types';

export const jobsApi = {
  async listPage(params: CandidateJobQuery = {}): Promise<CandidateJobsPage> {
    const response = await httpClient.get('/candidate-job-listings', {params});
    const parsed = candidateJobsResponseSchema.parse(response.data);
    return mapCandidateJobsPage(parsed);
  },

  /** Keeps older dashboard consumers compatible while the jobs screen uses page metadata. */
  async list(params: CandidateJobQuery = {}): Promise<JobCardModel[]> {
    const page = await jobsApi.listPage(params);
    return page.items;
  },

  async publicList(params: CandidateJobQuery = {}): Promise<unknown> {
    const response = await httpClient.get('/job-postings', {params});
    return response.data;
  },

  async detail(source: CandidateJobSource, jobId: number | string): Promise<CandidateJobDetail> {
    const endpoint = source === 'project-lowongan'
      ? `/project-lowongan/${jobId}`
      : `/job-postings/${jobId}`;
    const response = await httpClient.get(endpoint);
    return mapJobDetail(response.data, source);
  },

  async apply(payload: ApplyCandidateJobPayload): Promise<unknown> {
    const formData = new FormData();
    formData.append('job_reference_type', payload.job_reference_type);
    formData.append('job_reference_id', String(payload.job_reference_id));
    formData.append('job_title', payload.job_title);
    formData.append('company_name', payload.company_name);
    formData.append('location', payload.location);
    formData.append('agreed', '1');
    if (payload.family_declaration) formData.append('family_declaration', JSON.stringify(payload.family_declaration));
    if (payload.statements) formData.append('statements', JSON.stringify(payload.statements));
    if (payload.referral?.trim()) formData.append('referral', payload.referral.trim());

    payload.documents.forEach((item, index) => {
      formData.append(`documents[${index}][label]`, item.label);
      formData.append(`documents[${index}][group]`, item.group);
      formData.append(`documents[${index}][required]`, item.required ? '1' : '0');
      if (item.file) {
        formData.append(`documents[${index}][file]`, item.file);
      } else if (item.uri) {
        formData.append(`documents[${index}][file]`, {
          uri: item.uri,
          name: item.name ?? `dokumen-${index + 1}`,
          type: item.mimeType ?? 'application/octet-stream',
        } as unknown as Blob);
      }
    });

    const response = await httpClient.post('/applicant-data', formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
    return response.data;
  },
};
