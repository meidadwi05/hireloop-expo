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
});
