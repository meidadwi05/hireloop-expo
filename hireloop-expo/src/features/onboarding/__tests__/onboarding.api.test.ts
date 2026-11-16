import {httpClient} from '../../../core/api/http-client';
import {KTP_OCR_REQUEST_TIMEOUT_MS, onboardingApi} from '../api/onboarding.api';

jest.mock('react-native', () => ({Platform: {OS: 'web'}}));

jest.mock('../../../core/api/http-client', () => ({
  httpClient: {get: jest.fn(), post: jest.fn()},
}));

describe('onboardingApi OCR KTP', () => {
  const post = jest.mocked(httpClient.post);

  const successfulOcrResponse = {
    data: {
      success: true,
      data: {
        ktp_path: 'ktp/example.jpg',
        ktp_url: 'https://app.hireloop.site/storage/ktp/example.jpg',
        extracted: {nik: '3275010101900001'},
      },
    },
  };

  function formDataValue(body: FormData, field: string): unknown {
    const readable = body as FormData & {
      get?: (name: string) => unknown;
      _parts?: [string, unknown][];
    };
    return readable.get?.(field) ?? readable._parts?.find(([name]) => name === field)?.[1];
  }

  beforeEach(() => {
    jest.clearAllMocks();
    post.mockResolvedValue(successfulOcrResponse);
  });

  it('uploads the browser File/Blob as image with a dedicated OCR timeout', async () => {
    const file = new Blob(['ktp-image'], {type: 'image/jpeg'});
    const result = await onboardingApi.uploadKtp({
      uri: 'blob:ktp-image',
      name: 'ktp.jpg',
      mimeType: 'image/jpeg',
      file,
    }, 'ktp/previous.jpg');

    expect(result.extracted.nik).toBe('3275010101900001');
    expect(post).toHaveBeenCalledWith(
      '/ocr/ktp',
      expect.any(FormData),
      {timeout: KTP_OCR_REQUEST_TIMEOUT_MS},
    );
    const body = post.mock.calls[0][1] as FormData;
    expect(formDataValue(body, 'image')).toBeTruthy();
    expect(formDataValue(body, 'previous_ktp_path')).toBe('ktp/previous.jpg');
  });

  it('converts a web asset URI to Blob when ImagePicker does not provide file', async () => {
    const blob = new Blob(['ktp-image'], {type: 'image/jpeg'});
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: async () => blob,
    });
    Object.defineProperty(global, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    });

    await onboardingApi.uploadKtp({
      uri: 'blob:ktp-fallback',
      name: 'ktp.jpg',
      mimeType: 'image/jpeg',
    });

    expect(fetchMock).toHaveBeenCalledWith('blob:ktp-fallback');
    const body = post.mock.calls[0][1] as FormData;
    expect(formDataValue(body, 'image')).toBeTruthy();
  });

  it('does not call the OCR endpoint when the browser returns an empty file', async () => {
    await expect(onboardingApi.uploadKtp({
      uri: 'blob:empty-ktp',
      name: 'ktp.jpg',
      mimeType: 'image/jpeg',
      file: new Blob([], {type: 'image/jpeg'}),
    })).rejects.toThrow('File foto kosong');

    expect(post).not.toHaveBeenCalled();
  });
});
