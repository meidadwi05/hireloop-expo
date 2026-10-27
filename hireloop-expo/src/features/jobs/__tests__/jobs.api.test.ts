import {httpClient} from '../../../core/api/http-client';
import {jobsApi} from '../api/jobs.api';

jest.mock('../../../core/api/http-client', () => ({
  httpClient: {get: jest.fn(), post: jest.fn()},
}));

describe('jobsApi', () => {
  const get = jest.mocked(httpClient.get);
  const post = jest.mocked(httpClient.post);

  beforeEach(() => jest.clearAllMocks());

  it('keeps pagination metadata from the unified candidate endpoint', async () => {
    get.mockResolvedValueOnce({
      data: {
        data: [{source: 'job-posting', job: {id: 2, title: 'Frontend Developer'}}],
        current_page: 1,
        last_page: 3,
        per_page: 12,
        total: 25,
        from: 1,
        to: 12,
      },
    });

    const page = await jobsApi.listPage({priority: 'all', page: 1, per_page: 12});

    expect(get).toHaveBeenCalledWith('/candidate-job-listings', {params: {priority: 'all', page: 1, per_page: 12}});
    expect(page.total).toBe(25);
    expect(page.lastPage).toBe(3);
    expect(page.items[0].key).toBe('job-posting:2');
  });

  it.each([
    ['job-posting', '/job-postings/7'],
    ['project-lowongan', '/project-lowongan/7'],
  ] as const)('selects the correct detail endpoint for %s', async (source, endpoint) => {
    get.mockResolvedValueOnce({data: {data: {id: 7, title: 'Detail'}}});

    await jobsApi.detail(source, 7);

    expect(get).toHaveBeenCalledWith(endpoint);
  });

  it('submits a unified applicant-data payload', async () => {
    post.mockResolvedValueOnce({data: {message: 'Lamaran berhasil dikirim'}});
    const payload = {
      job_reference_type: 'project-lowongan' as const,
      job_reference_id: 8,
      job_title: 'Operator',
      company_name: 'PT Contoh',
      location: 'Karawang',
      agreed: true as const,
    };

    await jobsApi.apply(payload);

    expect(post).toHaveBeenCalledWith('/applicant-data', payload);
  });
});
