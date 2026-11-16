import {httpClient} from '../../../core/api/http-client';
import {KTP_OCR_REQUEST_TIMEOUT_MS, onboardingApi} from '../api/onboarding.api';

jest.mock('../../../core/api/http-client', () => ({
  httpClient: {get: jest.fn(), post: jest.fn()},
}));

describe('onboardingApi OCR KTP', () => {
  const post = jest.mocked(httpClient.post);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the authenticated OCR route with a dedicated timeout and browser-managed multipart boundary', async () => {
    post.mockResolvedValue({
      data: {
        success: true,
        data: {
          ktp_path: 'ktp/example.jpg',
          ktp_url: 'https://app.hireloop.site/storage/ktp/example.jpg',
          extracted: {nik: '3275010101900001'},
        },
      },
    });

    const result = await onboardingApi.uploadKtp({
      uri: 'file:///ktp.jpg',
      name: 'ktp.jpg',
      mimeType: 'image/jpeg',
    });

    expect(result.extracted.nik).toBe('3275010101900001');
    expect(post).toHaveBeenCalledWith(
      '/ocr/ktp',
      expect.any(FormData),
      {timeout: KTP_OCR_REQUEST_TIMEOUT_MS},
    );
  });
});
