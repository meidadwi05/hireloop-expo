import {httpClient} from '../../../core/api/http-client';
import {mapCandidateProfile, mapProfileFiles, mapUploadedFile} from '../profile.mapper';
import type {
  CertificationInput,
  DocumentInput,
  EducationInput,
  UploadInput,
  WorkPreferenceInput,
} from '../profile.types';

function appendFile(body: FormData, input: UploadInput) {
  if (input.file) {
    body.append('file', input.file, input.name);
    return;
  }
  body.append('file', {uri: input.uri, name: input.name, type: input.mimeType} as unknown as Blob);
}

export const profileApi = {
  async get() {
    const response = await httpClient.get('/job-seeker/profile');
    return mapCandidateProfile(response.data);
  },

  async updatePersonalInfo(payload: Record<string, unknown>): Promise<unknown> {
    const response = await httpClient.put('/job-seeker/personal-info', payload);
    return response.data;
  },

  async updateDescription(selfDescription: string): Promise<void> {
    await httpClient.put('/job-seeker/self-description', {self_description: selfDescription});
  },

  async updateNik(nik: string): Promise<void> {
    await httpClient.post('/job-seeker/nik', {nik});
  },

  async updateWorkPreferences(payload: WorkPreferenceInput): Promise<void> {
    await httpClient.put('/job-seeker/work-preferences', payload);
  },

  async uploadAvatar(input: UploadInput): Promise<void> {
    const body = new FormData();
    appendFile(body, input);
    await httpClient.post('/job-seeker/avatar', body, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
  },

  async createEducation(payload: EducationInput): Promise<void> {
    await httpClient.post('/job-seeker/educations', payload);
  },

  async updateEducation(id: number, payload: EducationInput): Promise<void> {
    await httpClient.put(`/job-seeker/educations/${id}`, payload);
  },

  async deleteEducation(id: number): Promise<void> {
    await httpClient.delete(`/job-seeker/educations/${id}`);
  },

  async listFiles() {
    const response = await httpClient.get('/job-seeker/documents-and-certifications');
    return mapProfileFiles(response.data);
  },

  async uploadProfileFile(input: UploadInput) {
    const body = new FormData();
    appendFile(body, input);
    const response = await httpClient.post('/job-seeker/profile-files/media/upload', body, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
    return mapUploadedFile(response.data);
  },

  async deleteUploadedFile(path: string): Promise<void> {
    await httpClient.delete('/job-seeker/profile-files/media/delete', {data: {path}});
  },

  async createDocument(payload: DocumentInput): Promise<void> {
    await httpClient.post('/job-seeker/documents', payload);
  },

  async updateDocument(id: number, payload: DocumentInput): Promise<void> {
    await httpClient.put(`/job-seeker/documents/${id}`, payload);
  },

  async deleteDocument(id: number): Promise<void> {
    await httpClient.delete(`/job-seeker/documents/${id}`);
  },

  async createCertification(payload: CertificationInput): Promise<void> {
    await httpClient.post('/job-seeker/certifications', payload);
  },

  async updateCertification(id: number, payload: CertificationInput): Promise<void> {
    await httpClient.put(`/job-seeker/certifications/${id}`, payload);
  },

  async deleteCertification(id: number): Promise<void> {
    await httpClient.delete(`/job-seeker/certifications/${id}`);
  },

  async getCertificationMedia(id: number, mediaIndex: number): Promise<Blob> {
    const response = await httpClient.get(`/job-seeker/certifications/${id}/media/${mediaIndex}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
