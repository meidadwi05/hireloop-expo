export type RegisterFormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmation: string;
};

export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>;

const validEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function validateRegisterForm(values: RegisterFormValues): RegisterFormErrors {
  const normalizedPhone = values.phone.replace(/[\s-]/g, '');

  return {
    firstName: values.firstName.trim() ? undefined : 'Nama depan wajib diisi.',
    lastName: values.lastName.trim() ? undefined : 'Nama belakang wajib diisi.',
    phone: !normalizedPhone
      ? 'Nomor handphone wajib diisi.'
      : /^(?:\+62|62|0)8\d{8,12}$/.test(normalizedPhone)
        ? undefined
        : 'Masukkan nomor handphone Indonesia yang valid.',
    email: !values.email.trim()
      ? 'Email wajib diisi.'
      : validEmail(values.email)
        ? undefined
        : 'Masukkan alamat email yang valid.',
    password: !values.password
      ? 'Kata sandi wajib diisi.'
      : values.password.length >= 6
        ? undefined
        : 'Kata sandi minimal 6 karakter.',
    confirmation: !values.confirmation
      ? 'Konfirmasi kata sandi wajib diisi.'
      : values.confirmation === values.password
        ? undefined
        : 'Konfirmasi kata sandi tidak sama.',
  };
}
