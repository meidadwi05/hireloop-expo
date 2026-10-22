import {getResetPasswordLayout} from '../reset-password.layout';

describe('reset password responsive layout', () => {
  test('menggunakan layout compact pada layar kecil atau pendek', () => {
    expect(getResetPasswordLayout(320, 640)).toEqual({
      compact: true,
      contentHorizontalPadding: 18,
      logoBottomMargin: 40,
      logoHeight: 48,
      logoWidth: 170,
      successCountdownGap: 42,
      successImageSize: 240,
    });
  });

  test('mengikuti ukuran referensi pada ponsel umum', () => {
    expect(getResetPasswordLayout(390, 844)).toEqual({
      compact: false,
      contentHorizontalPadding: 24,
      logoBottomMargin: 72,
      logoHeight: 56,
      logoWidth: 200,
      successCountdownGap: 72,
      successImageSize: 265,
    });
  });

  test('membatasi ilustrasi sukses pada layar lebar', () => {
    expect(getResetPasswordLayout(1200, 900).successImageSize).toBe(300);
  });
});
