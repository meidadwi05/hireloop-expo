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
      firstName: 'Nama depan minimal 2 karakter.',
      lastName: 'Nama belakang minimal 2 karakter.',
      phone: 'Nomor handphone wajib diisi.',
      email: 'Email wajib diisi.',
      password: 'Kata sandi wajib diisi.',
      confirmation: 'Konfirmasi kata sandi wajib diisi.',
    });
  });

  it('rejects one-character names after trimming', () => {
    const errors = validateRegisterForm({
      firstName: ' Z ',
      lastName: ' W ',
      phone: '081234567890',
      email: 'zaki@example.com',
      password: 'rahasia',
      confirmation: 'rahasia',
    });
    expect(errors.firstName).toBe('Nama depan minimal 2 karakter.');
    expect(errors.lastName).toBe('Nama belakang minimal 2 karakter.');
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
