import {httpClient} from '../../../core/api/http-client';
import {applicationsApi} from '../api/applications.api';

jest.mock('../../../core/api/http-client', () => ({
  httpClient: {get: jest.fn(), post: jest.fn(), delete: jest.fn()},
}));

describe('applicationsApi', () => {
  const get = jest.mocked(httpClient.get);

  beforeEach(() => jest.clearAllMocks());

  it('merges the batched recruitment process into applicant-data cards', async () => {
    get
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            job_applications: [
              {
                id: 10,
                job_reference_type: 'project-lowongan',
                job_reference_id: 91,
                job_title: 'Operator Produksi',
                application_status: 'Interview',
                current_stage_index: 2,
                current_stage_value: 'interview-user',
              },
              {
                id: 11,
                job_posting_id: 92,
                job_title: 'Legacy Job',
                application_status: 'Applied',
              },
              {
                id: 12,
                job_reference_type: 'project-lowongan',
                job_reference_id: 93,
                application_status: 'Menunggu Kelengkapan Persyaratan',
                is_temporary: true,
              },
            ],
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: [{
            application_id: 10,
            current_stage: {index: 2, value: 'interview-user', label: 'Interview HR & User', status: 'In Progress'},
            final_decision: null,
            stages: [
              {index: 0, value: 'applied', label: 'Applied', status: 'Completed', is_completed: true},
              {index: 1, value: 'screening', label: 'Screening', status: 'Completed', is_completed: true},
              {index: 2, value: 'interview-user', label: 'Interview HR & User', status: 'In Progress', is_current: true},
              {index: 3, value: 'technical-test', label: 'Tes Teknis & Psikotes', status: 'Pending'},
              {index: 4, value: 'medical', label: 'Medical (MCU)', status: 'Pending'},
              {index: 5, value: 'offering', label: 'Offering', status: 'Pending'},
            ],
          }],
        },
      });

    const applications = await applicationsApi.list();

    expect(get).toHaveBeenNthCalledWith(1, '/auth/me');
    expect(get).toHaveBeenNthCalledWith(2, '/applicant-data/recruitment-processes', {params: {ids: [10]}});
    expect(applications[0].stages.map(stage => stage.label)).toEqual([
      'Applied',
      'Screening',
      'Interview HR & User',
      'Tes Teknis & Psikotes',
      'Medical (MCU)',
      'Offering',
    ]);
    expect(applications[0].currentStageLabel).toBe('Interview HR & User');
    expect(applications[1].storageKind).toBe('legacy-job-applicant');
    expect(applications[2].state).toBe('temporary');
  });

  it('mengirim berkas, deklarasi, dan jawaban ke lamaran tujuan lalu memetakan status aktif', async () => {
    const post = jest.mocked(httpClient.post);
    post.mockResolvedValueOnce({
      data: {data: {id: 12, job_reference_type: 'project-lowongan', job_reference_id: 93, application_status: 'Applied', is_temporary: false}},
    });
    const append = jest.spyOn(FormData.prototype, 'append');
    const family = {nama_ayah: 'Bapak Contoh', nama_ibu: 'Ibu Contoh'};
    const statements = {'policy-0': 'Tidak'} as const;
    try {
      const application = await applicationsApi.completeRequirements({
        applicationId: 12,
        documents: [{label: 'CV', group: 'dokumen', required: true, uri: 'file:///cv.pdf', name: 'cv.pdf', mimeType: 'application/pdf'}],
        familyDeclaration: family,
        statements,
        agreed: true,
      });
      expect(post).toHaveBeenCalledWith('/applicant-data/12/complete-requirements', expect.any(FormData));
      expect(append).toHaveBeenCalledWith('documents[0][file]', {uri: 'file:///cv.pdf', name: 'cv.pdf', type: 'application/pdf'});
      expect(append).toHaveBeenCalledWith('family_declaration', JSON.stringify(family));
      expect(append).toHaveBeenCalledWith('statements', JSON.stringify(statements));
      expect(append).toHaveBeenCalledWith('agreed', '1');
      expect(application).toMatchObject({applicationId: 12, state: 'applied', isTemporary: false});
    } finally {
      append.mockRestore();
    }
  });
});
