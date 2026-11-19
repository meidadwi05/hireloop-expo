import {httpClient} from '../../../core/api/http-client';
import {profileApi} from '../api/profile.api';

jest.mock('../../../core/api/http-client', () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('profileApi certification media', () => {
  const get = jest.mocked(httpClient.get);
  const post = jest.mocked(httpClient.post);

  function formDataValue(body: FormData, field: string): unknown {
    const readable = body as FormData & {
      get?: (name: string) => unknown;
      _parts?: [string, unknown][];
    };
    return readable.get?.(field) ?? readable._parts?.find(([name]) => name === field)?.[1];
  }

  beforeEach(() => jest.clearAllMocks());

  it('downloads the selected certification media as authenticated binary data', async () => {
    const bytes = new Uint8Array([37, 80, 68, 70]).buffer;
    get.mockResolvedValueOnce({data: bytes});

    await expect(profileApi.getCertificationMedia(27, 2)).resolves.toBe(bytes);
    expect(get).toHaveBeenCalledWith(
      '/job-seeker/certifications/27/media/2/download',
      {responseType: 'arraybuffer'},
    );
  });

  it('uploads an avatar using the field required by the backend', async () => {
    post.mockResolvedValueOnce({data: {success: true}});

    await profileApi.uploadAvatar({
      uri: 'blob:avatar',
      name: 'avatar.jpg',
      mimeType: 'image/jpeg',
      file: new Blob(['avatar'], {type: 'image/jpeg'}),
    });

    expect(post).toHaveBeenCalledWith('/job-seeker/avatar', expect.any(FormData));
    const body = post.mock.calls[0][1] as FormData;
    expect(formDataValue(body, 'avatar')).toBeTruthy();
    expect(formDataValue(body, 'file')).toBeUndefined();
  });

  it('builds the ATS profile from fresh profile, experience, and file endpoints', async () => {
    get
      .mockResolvedValueOnce({data: {data: {job_seeker: {id: 4, full_name: 'Oke Jaya', skills: [{id: 1, name: 'React'}]}}}})
      .mockResolvedValueOnce({data: {data: [{id: 7, position: 'Operator', company_name: 'HireLoop', skills: []}]}})
      .mockResolvedValueOnce({data: {data: [{id: 8, type: 'document', name: 'CV Lama', file_path: 'cv.pdf'}]}});

    const profile = await profileApi.getAtsProfile();

    expect(profile.experiences).toHaveLength(1);
    expect(profile.profileFiles).toHaveLength(1);
    expect(get.mock.calls.map(call => call[0])).toEqual([
      '/job-seeker/profile',
      '/job-seeker/experiences',
      '/job-seeker/documents-and-certifications',
    ]);
  });
});
