import {httpClient} from '../../../core/api/http-client';
import {mapCandidateProfile, mapProfileFiles, mapUploadedFile} from '../profile.mapper';
import type {
  CertificationInput,
  DocumentInput,
  EducationInput,
  ExperienceInput,
  ProfileExperience,
  UploadInput,
  WorkPreferenceInput,
} from '../profile.types';

function appendFile(body: FormData, input: UploadInput, field = 'file') {
  if (input.file) {
    body.append(field, input.file, input.name);
    return;
  }
  body.append(field, {uri: input.uri, name: input.name, type: input.mimeType} as unknown as Blob);
}

function unwrapArray(payload: unknown): Record<string, unknown>[] {
  const root = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
  const value = Array.isArray(payload) ? payload : root.data;
  return Array.isArray(value) ? value.filter(item => item && typeof item === 'object') as Record<string, unknown>[] : [];
}

function mapExperiences(payload: unknown): ProfileExperience[] {
  return unwrapArray(payload).map(item => ({
    id: Number(item.id),
    experienceListId: item.experience_list_id === null || item.experience_list_id === undefined ? null : Number(item.experience_list_id),
    position: String(item.position ?? item.posisi ?? ''),
    companyName: String(item.company_name ?? ''),
    startDate: String(item.start_date ?? ''),
    endDate: item.end_date ? String(item.end_date) : null,
    isCurrent: item.is_current === true || item.is_current === 1 || item.is_current === '1',
    description: String(item.description ?? ''),
    workSetting: item.job_type_expected === 'remote' || item.job_type_expected === 'hybrid' ? item.job_type_expected as ProfileExperience['workSetting'] : 'on_site',
    workType: ['full_time', 'paruh_waktu', 'kontrak', 'freelance', 'internship', 'outsourcing', 'kasual'].includes(String(item.work_type))
      ? item.work_type as ProfileExperience['workType']
      : 'full_time',
  })).filter(item => item.id > 0);
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

  async uploadCover(input: UploadInput): Promise<void> {
    const body = new FormData();
    appendFile(body, input, 'cover');
    await httpClient.post('/job-seeker/cover', body, {headers: {'Content-Type': 'multipart/form-data'}});
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

  async listExperiences() {
    const response = await httpClient.get('/job-seeker/experiences');
    return mapExperiences(response.data);
  },

  async createExperience(payload: ExperienceInput): Promise<void> {
    await httpClient.post('/job-seeker/experiences', payload);
  },

  async updateExperience(id: number, payload: ExperienceInput): Promise<void> {
    await httpClient.put(`/job-seeker/experiences/${id}`, payload);
  },

  async deleteExperience(id: number): Promise<void> {
    await httpClient.delete(`/job-seeker/experiences/${id}`);
  },

  async listMasterSkills(search = ''): Promise<{id: number; name: string}[]> {
    const response = await httpClient.get('/skills', {params: search ? {search} : undefined});
    return unwrapArray(response.data).map(item => ({id: Number(item.id), name: String(item.name ?? '')})).filter(item => item.id > 0 && item.name);
  },

  async addSkill(payload: {skill_id: number} | {custom_name: string}): Promise<void> {
    await httpClient.post('/job-seeker/skills', payload);
  },

  async deleteSkillEntry(entryId: number): Promise<void> {
    await httpClient.delete(`/job-seeker/skills/entries/${entryId}`);
  },

  async listSkillTools(): Promise<{id: number; name: string}[]> {
    const response = await httpClient.get('/job-seeker/skill-tools');
    return unwrapArray(response.data).map(item => ({id: Number(item.id), name: String(item.tool_name ?? '')})).filter(item => item.id > 0 && item.name);
  },

  async createSkillTool(name: string): Promise<void> {
    await httpClient.post('/job-seeker/skill-tools', {tool_name: name});
  },

  async updateSkillTool(id: number, name: string): Promise<void> {
    await httpClient.put(`/job-seeker/skill-tools/${id}`, {tool_name: name});
  },

  async deleteSkillTool(id: number): Promise<void> {
    await httpClient.delete(`/job-seeker/skill-tools/${id}`);
  },

  async listLanguages(): Promise<{id: number; name: string}[]> {
    const response = await httpClient.get('/job-seeker/languages');
    return unwrapArray(response.data).map(item => ({id: Number(item.id), name: String(item.name ?? '')})).filter(item => item.id > 0 && item.name);
  },

  async listMasterLanguages(): Promise<{id: number; name: string}[]> {
    const response = await httpClient.get('/languages');
    return unwrapArray(response.data).map(item => ({id: Number(item.id), name: String(item.name ?? '')})).filter(item => item.id > 0 && item.name);
  },

  async addLanguage(languageId: number): Promise<void> {
    await httpClient.post('/job-seeker/languages', {language_id: languageId});
  },

  async deleteLanguage(languageId: number): Promise<void> {
    await httpClient.delete(`/job-seeker/languages/${languageId}`);
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

  async getCertificationMedia(id: number, mediaIndex: number): Promise<ArrayBuffer> {
    const response = await httpClient.get<ArrayBuffer>(`/job-seeker/certifications/${id}/media/${mediaIndex}/download`, {
      responseType: 'arraybuffer',
    });
    return response.data;
  },
};
