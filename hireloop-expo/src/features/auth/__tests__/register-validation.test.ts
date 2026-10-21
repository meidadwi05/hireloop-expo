import {validateRegisterForm} from '../register-validation';

describe('validateRegisterForm', () => {
  it('requires every field', () => {
    expect(validateRegisterForm({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      password: '',
      confirmation: '',
    })).toEqual({
      firstName: 'Nama depan wajib diisi.',
      lastName: 'Nama belakang wajib diisi.',
      phone: 'Nomor handphone wajib diisi.',
      email: 'Email wajib diisi.',
      password: 'Kata sandi wajib diisi.',
      confirmation: 'Konfirmasi kata sandi wajib diisi.',
    });
  });

  it('accepts a complete valid form', () => {
    expect(validateRegisterForm({
      firstName: 'Zaki',
      lastName: 'Wirawan',
      phone: '+6281234567890',
      email: 'zaki@example.com',
      password: 'rahasia',
      confirmation: 'rahasia',
    })).toEqual({
      firstName: undefined,
      lastName: undefined,
      phone: undefined,
      email: undefined,
      password: undefined,
      confirmation: undefined,
    });
  });
});
