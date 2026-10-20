import Ionicons from '@expo/vector-icons/Ionicons';
import {router} from 'expo-router';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {toAppApiError} from '../../core/api/api-error';
import {authApi} from '../../features/auth/api/auth.api';
import {useAuth} from '../../features/auth/auth-provider';

type FieldErrors = Partial<Record<'name' | 'phone' | 'email' | 'password' | 'confirmation' | 'otp', string>>;

const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

function splitName(value: string): {firstName: string; lastName: string} {
  const [firstName = '', ...rest] = value.trim().split(/\s+/);
  return {firstName, lastName: rest.join(' ')};
}

export default function RegisterRoute() {
  const {refreshUser} = useAuth();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const submitRegister = async () => {
    const {firstName, lastName} = splitName(name);
    const nextErrors: FieldErrors = {
      name: !firstName || !lastName ? 'Masukkan nama depan dan nama belakang.' : undefined,
      phone: !/^08\d{8,13}$/.test(phone.replace(/[\s-]/g, '')) ? 'Masukkan nomor telepon Indonesia yang valid.' : undefined,
      email: validEmail(email) ? undefined : 'Masukkan alamat email yang valid.',
      password: password.length >= 6 ? undefined : 'Password minimal 6 karakter.',
      confirmation: confirmation === password ? undefined : 'Konfirmasi password tidak sama.',
    };
    setErrors(nextErrors);
    setNotice('');
    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const message = await authApi.register({
        firstName,
        lastName,
        email,
        password,
        passwordConfirmation: confirmation,
      });
      setNotice(message ?? 'Kode OTP sudah dikirim ke email kamu.');
      setStep('otp');
    } catch (error) {
      const apiError = toAppApiError(error);
      const validation = apiError.validationErrors;
      setErrors({
        name: validation.first_name?.[0] ?? validation.last_name?.[0],
        email: validation.email?.[0],
        password: validation.password?.[0],
      });
      setNotice(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setErrors((current) => ({...current, otp: 'Kode OTP harus terdiri dari 6 angka.'}));
      return;
    }

    setLoading(true);
    setNotice('');
    try {
      await authApi.verifyRegistrationOtp(email, otp);
      const user = await refreshUser();
      if (!user) throw new Error('Akun berhasil dibuat, tetapi sesi login gagal dimuat. Silakan masuk kembali.');
      router.replace('/');
    } catch (error) {
      const apiError = toAppApiError(error);
      setErrors((current) => ({...current, otp: apiError.validationErrors.code?.[0]}));
      setNotice(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setResending(true);
    setNotice('');
    try {
      const message = await authApi.resendRegistrationOtp(email);
      setNotice(message ?? 'Kode OTP baru sudah dikirim.');
    } catch (error) {
      setNotice(toAppApiError(error).message);
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={step === 'otp' ? 'Kembali ke form registrasi' : 'Kembali ke login'}
            onPress={() => step === 'otp' ? setStep('form') : router.back()}
            style={styles.back}>
            <Ionicons name="arrow-back" size={20} color="white" />
            <Text style={styles.backText}>Kembali</Text>
          </Pressable>

          <Text style={styles.title}>{step === 'form' ? 'Buat Akun' : 'Verifikasi Email'}</Text>
          <Text style={styles.description}>
            {step === 'form'
              ? 'Lengkapi informasi berikut untuk memulai perjalanan kariermu bersama HireLoop.'
              : `Masukkan kode OTP 6 angka yang telah dikirim ke ${email.trim().toLowerCase()}.`}
          </Text>

          {step === 'form' ? (
            <View style={styles.card}>
              <RegisterInput label="Nama Depan & Belakang *" value={name} onChange={setName} placeholder="Nama lengkap" error={errors.name} />
              <RegisterInput label="Nomor Telepon *" value={phone} onChange={setPhone} placeholder="08xxxxxxxxxx" keyboardType="phone-pad" error={errors.phone} />
              <RegisterInput label="Email *" value={email} onChange={setEmail} placeholder="nama@email.com" keyboardType="email-address" error={errors.email} />
              <RegisterInput label="Buat Password *" value={password} onChange={setPassword} placeholder="Minimal 6 karakter" secureTextEntry error={errors.password} />
              <RegisterInput label="Konfirmasi Password *" value={confirmation} onChange={setConfirmation} placeholder="Ulangi password" secureTextEntry error={errors.confirmation} />
              {!!notice && <Text style={styles.notice}>{notice}</Text>}
              <PrimaryButton label="Daftar" loading={loading} onPress={() => void submitRegister()} />
            </View>
          ) : (
            <View style={styles.otpCard}>
              <TextInput
                accessibilityLabel="Kode OTP"
                autoComplete="one-time-code"
                keyboardType="number-pad"
                maxLength={6}
                onChangeText={(value) => {
                  setOtp(value.replace(/\D/g, ''));
                  setErrors((current) => ({...current, otp: undefined}));
                }}
                placeholder="000000"
                placeholderTextColor="#9AA6B9"
                style={styles.otpInput}
                value={otp}
              />
              {!!errors.otp && <Text style={styles.fieldError}>{errors.otp}</Text>}
              {!!notice && <Text style={styles.otpNotice}>{notice}</Text>}
              <PrimaryButton label="Verifikasi & Masuk" loading={loading} onPress={() => void verifyOtp()} />
              <Pressable disabled={resending} onPress={() => void resendOtp()} style={styles.resendButton}>
                {resending ? <ActivityIndicator color="#0865FF" /> : <Text style={styles.resendText}>Kirim ulang kode OTP</Text>}
              </Pressable>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <Pressable onPress={() => router.replace('/(public)/login')}>
              <Text style={styles.loginText}>Masuk</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type RegisterInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  error?: string;
};

function RegisterInput({label, value, onChange, placeholder, keyboardType = 'default', secureTextEntry, error}: RegisterInputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        autoCorrect={false}
        keyboardType={keyboardType}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9AA6B9"
        secureTextEntry={secureTextEntry}
        style={[styles.input, error && styles.inputError]}
        value={value}
      />
      {!!error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

function PrimaryButton({label, loading, onPress}: {label: string; loading: boolean; onPress: () => void}) {
  return (
    <Pressable disabled={loading} onPress={onPress} style={({pressed}) => [styles.button, (pressed || loading) && styles.buttonPressed]}>
      {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#050D49'},
  page: {flexGrow: 1, padding: 22, paddingTop: 12, paddingBottom: 45},
  back: {flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 45},
  backText: {fontFamily: 'PlusJakartaSans_500Medium', color: 'white', fontSize: 13},
  title: {fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 25, color: 'white', marginTop: 10},
  description: {fontFamily: 'PlusJakartaSans_400Regular', color: '#CBD6F1', fontSize: 12, lineHeight: 19, marginTop: 8, marginBottom: 22},
  card: {borderRadius: 17, backgroundColor: '#101D59', padding: 18},
  inputGroup: {marginBottom: 14},
  label: {fontFamily: 'PlusJakartaSans_600SemiBold', color: '#E0E8FF', fontSize: 12, marginBottom: 7},
  input: {fontFamily: 'PlusJakartaSans_400Regular', minHeight: 46, backgroundColor: 'white', borderRadius: 7, paddingHorizontal: 13, fontSize: 13, color: '#121B35', borderWidth: 1.5, borderColor: 'transparent'},
  inputError: {borderColor: '#FF6978'},
  fieldError: {fontFamily: 'PlusJakartaSans_400Regular', color: '#FF9FA9', fontSize: 11, lineHeight: 17, marginTop: 5},
  notice: {fontFamily: 'PlusJakartaSans_400Regular', color: '#FFCBD0', fontSize: 12, lineHeight: 18, marginBottom: 12},
  button: {height: 48, borderRadius: 9, backgroundColor: '#0865FF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24},
  buttonPressed: {opacity: 0.72},
  buttonText: {fontFamily: 'PlusJakartaSans_700Bold', color: 'white', fontSize: 12},
  otpCard: {backgroundColor: 'white', borderRadius: 18, padding: 22},
  otpInput: {fontFamily: 'PlusJakartaSans_700Bold', borderColor: '#DCE7FC', borderWidth: 1.5, borderRadius: 9, backgroundColor: '#F5F8FF', height: 56, textAlign: 'center', fontSize: 24, letterSpacing: 10, color: '#0865FF'},
  otpNotice: {fontFamily: 'PlusJakartaSans_400Regular', color: '#53627A', fontSize: 12, lineHeight: 18, textAlign: 'center', marginVertical: 12},
  resendButton: {minHeight: 45, justifyContent: 'center', alignItems: 'center', marginTop: 8},
  resendText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0865FF', fontSize: 12},
  footer: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14},
  footerText: {fontFamily: 'PlusJakartaSans_400Regular', color: '#BDC9E8', fontSize: 12},
  loginText: {fontFamily: 'PlusJakartaSans_700Bold', color: 'white', fontSize: 12},
});
