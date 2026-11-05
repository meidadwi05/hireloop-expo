import {httpClient} from '../../../core/api/http-client';
import {mapApplications, mapRecruitmentProcess} from '../applications.mapper';
import {applicationsMeResponseSchema, recruitmentProcessResponseSchema} from '../applications.schemas';
import type {
  CancelApplicationInput,
  CandidateApplication,
  CompleteRequirementsInput,
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

  async completeRequirements(input: CompleteRequirementsInput): Promise<void> {
    const body = new FormData();
    input.documents.forEach((document, index) => {
      body.append(`documents[${index}][label]`, document.label);
      body.append(`documents[${index}][group]`, document.group);
      body.append(`documents[${index}][required]`, document.required ? '1' : '0');
      if (document.uri && document.name) {
        if (document.file) body.append(`documents[${index}][file]`, document.file, document.name);
        else body.append(`documents[${index}][file]`, {uri: document.uri, name: document.name, type: document.mimeType ?? 'application/octet-stream'} as unknown as Blob);
      }
    });
    if (input.familyDeclaration !== undefined) body.append('family_declaration', JSON.stringify(input.familyDeclaration));
    if (input.statements !== undefined) body.append('statements', JSON.stringify(input.statements));
    body.append('agreed', '1');
    await httpClient.post(`/applicant-data/${input.applicationId}/complete-requirements`, body, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
  },
};
