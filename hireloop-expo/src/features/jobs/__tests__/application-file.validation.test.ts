import {MAX_APPLICATION_FILE_BYTES, validateApplicationFile} from '../application-file.validation';

describe('validasi file lamaran', () => {
  it('menerima PDF, JPG, JPEG, dan PNG sampai dengan 2 MB', () => {
    expect(validateApplicationFile({name: 'cv.pdf', mimeType: 'application/pdf', size: MAX_APPLICATION_FILE_BYTES})).toBeNull();
    expect(validateApplicationFile({name: 'ktp.JPG', mimeType: 'image/jpeg', size: 1024})).toBeNull();
    expect(validateApplicationFile({name: 'foto.png', mimeType: 'image/png', size: 1024})).toBeNull();
  });

  it('menolak ekstensi atau MIME di luar daftar', () => {
    expect(validateApplicationFile({name: 'cv.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 1024})).toContain('tidak didukung');
    expect(validateApplicationFile({name: 'foto.jpg', mimeType: 'application/x-msdownload', size: 1024})).toContain('tidak didukung');
  });

  it('menolak file yang melebihi 2 MB', () => {
    expect(validateApplicationFile({name: 'cv.pdf', mimeType: 'application/pdf', size: MAX_APPLICATION_FILE_BYTES + 1})).toContain('melebihi batas maksimal 2 MB');
  });
});
