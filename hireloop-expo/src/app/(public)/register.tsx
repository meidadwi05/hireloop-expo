import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
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

type FieldErrors = Partial<Record<'firstName' | 'lastName' | 'phone' | 'email' | 'password' | 'confirmation' | 'otp', string>>;
type Dialog = 'registerSuccess' | 'otp' | 'verifySuccess' | null;
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const OTP_RESEND_SECONDS = 120;
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function RegisterRoute() {
  const {refreshUser} = useAuth();
  const otpInputRef = useRef<TextInput>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [countdown, setCountdown] = useState(OTP_RESEND_SECONDS);

  useEffect(() => {
    if (dialog !== 'registerSuccess') return;
    const timer = setTimeout(() => setDialog('otp'), 1400);
    return () => clearTimeout(timer);
  }, [dialog]);

  useEffect(() => {
    if (dialog !== 'otp' || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((current) => Math.max(0, current - 1)), 1000);
    return () => clearInterval(timer);
  }, [countdown, dialog]);

  const submitRegister = async () => {
    const normalizedPhone = phone.replace(/[\s-]/g, '');
    const nextErrors: FieldErrors = {
      firstName: firstName.trim() ? undefined : 'Masukkan nama depan.',
      lastName: lastName.trim() ? undefined : 'Masukkan nama belakang.',
      phone: /^(?:\+62|62|0)8\d{8,12}$/.test(normalizedPhone) ? undefined : 'Masukkan nomor handphone Indonesia yang valid.',
      email: validEmail(email) ? undefined : 'Masukkan alamat email yang valid.',
      password: password.length >= 6 ? undefined : 'Kata sandi minimal 6 karakter.',
      confirmation: confirmation === password ? undefined : 'Konfirmasi kata sandi tidak sama.',
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
      setNotice(message ?? 'OTP telah dikirimkan ke email kamu.');
      setOtp('');
      setCountdown(OTP_RESEND_SECONDS);
      setDialog('registerSuccess');
    } catch (error) {
      const apiError = toAppApiError(error);
      const validation = apiError.validationErrors;
      setErrors({
        firstName: validation.first_name?.[0],
        lastName: validation.last_name?.[0],
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
      setDialog('verifySuccess');
    } catch (error) {
      const apiError = toAppApiError(error);
      setErrors((current) => ({...current, otp: apiError.validationErrors.code?.[0]}));
      setNotice(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    setResending(true);
    setNotice('');
    try {
      const message = await authApi.resendRegistrationOtp(email);
      setNotice(message ?? 'Kode OTP baru sudah dikirim.');
      setCountdown(OTP_RESEND_SECONDS);
    } catch (error) {
      setNotice(toAppApiError(error).message);
    } finally {
      setResending(false);
    }
  };

  const closeOtp = () => {
    if (loading || resending) return;
    setDialog(null);
    setOtp('');
    setErrors((current) => ({...current, otp: undefined}));
    setNotice('');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'right', 'bottom', 'left']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page} bounces={false}>
          <View style={styles.hero}>
            <Image
              accessibilityLabel="Ilustrasi pendaftaran akun HireLoop"
              source={require('../../assets/register_icon.png')}
              resizeMode="cover"
              style={styles.heroImage}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kembali ke login"
              onPress={() => router.back()}
              style={styles.back}
            >
              <Ionicons name="arrow-back" size={25} color="white" />
            </Pressable>
            <View style={styles.heroCopy}>
              <Text style={styles.title}>Buat Akun</Text>
              <Text style={styles.description}>Lengkapi informasi berikut untuk memulai perjalanan karirmu</Text>
            </View>
          </View>

          <View style={styles.card}>
            <RegisterInput label="Nama Depan" value={firstName} onChange={(value) => { setFirstName(value); setErrors((current) => ({...current, firstName: undefined})); }} placeholder="Masukkan nama depan" icon="person-outline" error={errors.firstName} />
            <RegisterInput label="Nama Belakang" value={lastName} onChange={(value) => { setLastName(value); setErrors((current) => ({...current, lastName: undefined})); }} placeholder="Masukkan nama belakang" icon="person-outline" error={errors.lastName} />
            <RegisterInput label="Email" value={email} onChange={(value) => { setEmail(value); setErrors((current) => ({...current, email: undefined})); }} placeholder="Masukkan email" keyboardType="email-address" icon="mail-outline" error={errors.email} />
            <RegisterInput label="Nomor Handphone" value={phone} onChange={(value) => { setPhone(value); setErrors((current) => ({...current, phone: undefined})); }} placeholder="+628 xxxxxxxxx" keyboardType="phone-pad" icon="call-outline" error={errors.phone} />
            <RegisterInput label="Kata Sandi" value={password} onChange={(value) => { setPassword(value); setErrors((current) => ({...current, password: undefined})); }} placeholder="Masukkan kata sandi" icon="lock-closed-outline" secureTextEntry={!showPassword} onToggleSecure={() => setShowPassword((current) => !current)} error={errors.password} />
            <RegisterInput label="Konfirmasi Kata Sandi" value={confirmation} onChange={(value) => { setConfirmation(value); setErrors((current) => ({...current, confirmation: undefined})); }} placeholder="Masukkan kata sandi" icon="lock-closed-outline" secureTextEntry={!showConfirmation} onToggleSecure={() => setShowConfirmation((current) => !current)} error={errors.confirmation} />
            {!!notice && !dialog && <Text style={styles.notice}>{notice}</Text>}
            <PrimaryButton label="Daftar" loading={loading} onPress={() => void submitRegister()} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Sudah punya akun? </Text>
              <Pressable accessibilityRole="button" onPress={() => router.replace('/(public)/login')}>
                <Text style={styles.loginText}>Masuk</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal animationType="fade" onRequestClose={dialog === 'verifySuccess' ? () => router.replace('/') : closeOtp} transparent visible={dialog !== null}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          {dialog === 'registerSuccess' && (
            <View accessibilityRole="alert" style={styles.modalCard}>
              <View style={styles.mailIllustration}>
                <Ionicons name="mail" size={65} color="#0865FF" />
                <Ionicons name="checkmark-circle" size={35} color="#22CC70" style={styles.mailCheck} />
              </View>
              <Text style={styles.modalTitle}>Registrasi Berhasil!</Text>
              <Text style={styles.modalBody}>Akun anda berhasil dibuat.{`\n`}OTP telah dikirimkan ke email</Text>
              <Text style={styles.modalEmail}>{email.trim().toLowerCase()}</Text>
            </View>
          )}

          {dialog === 'otp' && (
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Verifikasi OTP</Text>
              <Text style={styles.modalBody}>Masukkan 6 digit kode yang kami kirim ke</Text>
              <Text style={styles.modalEmail}>{email.trim().toLowerCase()}</Text>
              <TextInput ref={otpInputRef} accessibilityLabel="Kode OTP enam digit" autoComplete="one-time-code" keyboardType="number-pad" maxLength={6} onChangeText={(value) => { setOtp(value.replace(/\D/g, '')); setErrors((current) => ({...current, otp: undefined})); }} style={styles.hiddenOtpInput} value={otp} />
              <Pressable accessibilityRole="button" accessibilityLabel="Masukkan kode OTP" onPress={() => otpInputRef.current?.focus()} style={styles.otpBoxes}>
                {Array.from({length: 6}, (_, index) => (
                  <View key={index} style={[styles.otpBox, errors.otp && styles.otpBoxError]}>
                    <Text style={styles.otpDigit}>{otp[index] ?? ''}</Text>
                  </View>
                ))}
              </Pressable>
              {!!errors.otp && <Text style={styles.modalError}>{errors.otp}</Text>}
              {!!notice && <Text style={styles.otpNotice}>{notice}</Text>}
              <PrimaryButton label="Verifikasi OTP" loading={loading} disabled={otp.length !== 6} onPress={() => void verifyOtp()} />
              {countdown > 0 ? (
                <Text style={styles.countdownText}>Kirim ulang OTP dalam <Text style={styles.countdownValue}>{formatCountdown(countdown)}</Text></Text>
              ) : (
                <Pressable disabled={resending} onPress={() => void resendOtp()} style={styles.resendButton}>
                  {resending ? <ActivityIndicator color="#0865FF" /> : <Text style={styles.resendText}>Kirim ulang OTP</Text>}
                </Pressable>
              )}
              <Pressable accessibilityRole="button" disabled={loading || resending} onPress={closeOtp} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Batal</Text>
              </Pressable>
            </View>
          )}

          {dialog === 'verifySuccess' && (
            <View accessibilityRole="alert" style={styles.modalCard}>
              <Ionicons name="checkmark-circle" size={98} color="#22CC70" />
              <Text style={styles.modalTitle}>Verifikasi Berhasil!</Text>
              <Text style={styles.modalBody}>Akun Anda berhasil diverifikasi. Anda akan segera dialihkan ke halaman berikutnya.</Text>
              <PrimaryButton label="OK" loading={false} onPress={() => router.replace('/')} compact />
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

type RegisterInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: IoniconName;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  onToggleSecure?: () => void;
  error?: string;
};

function RegisterInput({label, value, onChange, placeholder, icon, keyboardType = 'default', secureTextEntry, onToggleSecure, error}: RegisterInputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error && styles.inputError]}>
        <Ionicons name={icon} size={21} color="#7C828A" />
        <TextInput accessibilityLabel={label} autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'} autoCorrect={false} keyboardType={keyboardType} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#B3B8C0" secureTextEntry={secureTextEntry} style={styles.input} value={value} />
        {!!onToggleSecure && (
          <Pressable accessibilityRole="button" accessibilityLabel={secureTextEntry ? 'Tampilkan kata sandi' : 'Sembunyikan kata sandi'} hitSlop={10} onPress={onToggleSecure} style={styles.eyeButton}>
            <Ionicons name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} size={21} color="#A8AFB8" />
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

function PrimaryButton({label, loading, disabled = false, compact = false, onPress}: {label: string; loading: boolean; disabled?: boolean; compact?: boolean; onPress: () => void}) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{disabled: loading || disabled}} disabled={loading || disabled} onPress={onPress} style={({pressed}) => [styles.button, compact && styles.buttonCompact, (pressed || loading || disabled) && styles.buttonPressed]}>
      <LinearGradient colors={['#0B5CFF', '#00D8F4']} end={{x: 1, y: 0}} start={{x: 0, y: 0}} style={styles.buttonGradient}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{label}</Text>}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#020B38'},
  page: {flexGrow: 1, paddingBottom: 28},
  hero: {width: '100%', aspectRatio: 1.6, minHeight: 245, backgroundColor: '#020B38', overflow: 'hidden'},
  heroImage: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, width: '100%', height: '100%'},
  back: {position: 'absolute', top: 12, left: 18, width: 48, height: 48, alignItems: 'center', justifyContent: 'center'},
  heroCopy: {position: 'absolute', left: 28, right: 28, bottom: 26, maxWidth: 285},
  title: {fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 34, color: 'white', lineHeight: 43},
  description: {fontFamily: 'PlusJakartaSans_400Regular', color: '#F0F4FF', fontSize: 14, lineHeight: 21, marginTop: 8, maxWidth: 250},
  card: {borderRadius: 30, backgroundColor: '#061A50', paddingHorizontal: 24, paddingTop: 26, paddingBottom: 30, marginHorizontal: 20, marginTop: -18},
  inputGroup: {marginBottom: 16},
  label: {fontFamily: 'PlusJakartaSans_500Medium', color: '#FFFFFF', fontSize: 13, marginBottom: 8},
  inputWrap: {minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 14, borderWidth: 1.5, borderColor: '#DDE3EA'},
  input: {fontFamily: 'PlusJakartaSans_400Regular', flex: 1, minHeight: 50, fontSize: 13, color: '#121B35', paddingVertical: 0},
  inputError: {borderColor: '#FF6978'},
  eyeButton: {width: 36, height: 44, alignItems: 'center', justifyContent: 'center'},
  fieldError: {fontFamily: 'PlusJakartaSans_400Regular', color: '#FF9FA9', fontSize: 11, lineHeight: 17, marginTop: 5},
  notice: {fontFamily: 'PlusJakartaSans_400Regular', color: '#FFCBD0', fontSize: 12, lineHeight: 18, marginBottom: 12},
  button: {height: 52, borderRadius: 12, overflow: 'hidden', marginTop: 4},
  buttonCompact: {width: '58%', alignSelf: 'center', marginTop: 24},
  buttonGradient: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24},
  buttonPressed: {opacity: 0.65},
  buttonText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: 'white', fontSize: 14},
  footer: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 26},
  footerText: {fontFamily: 'PlusJakartaSans_400Regular', color: '#FFFFFF', fontSize: 12},
  loginText: {fontFamily: 'PlusJakartaSans_700Bold', color: '#0B63FF', fontSize: 12},
  modalOverlay: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(1, 7, 31, 0.82)', padding: 28},
  modalCard: {width: '100%', maxWidth: 390, borderRadius: 24, backgroundColor: 'white', paddingHorizontal: 22, paddingTop: 30, paddingBottom: 26, alignItems: 'center'},
  mailIllustration: {width: 130, height: 130, borderRadius: 65, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center', marginBottom: 14},
  mailCheck: {position: 'absolute', right: 13, bottom: 18, backgroundColor: 'white', borderRadius: 18},
  modalTitle: {fontFamily: 'PlusJakartaSans_700Bold', color: '#0878FF', fontSize: 25, lineHeight: 33, textAlign: 'center', marginTop: 8},
  modalBody: {fontFamily: 'PlusJakartaSans_400Regular', color: '#1B1C20', fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 10},
  modalEmail: {fontFamily: 'PlusJakartaSans_500Medium', color: '#1359D5', fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 6},
  hiddenOtpInput: {position: 'absolute', width: 1, height: 1, opacity: 0},
  otpBoxes: {width: '100%', flexDirection: 'row', justifyContent: 'space-between', gap: 7, marginTop: 28, marginBottom: 12},
  otpBox: {flex: 1, maxWidth: 52, aspectRatio: 0.86, borderRadius: 12, backgroundColor: '#F1F1F1', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'transparent'},
  otpBoxError: {borderColor: '#FF6978'},
  otpDigit: {fontFamily: 'PlusJakartaSans_700Bold', color: '#0878FF', fontSize: 23},
  modalError: {fontFamily: 'PlusJakartaSans_400Regular', color: '#D9364B', fontSize: 11, lineHeight: 17, textAlign: 'center', marginBottom: 8},
  otpNotice: {fontFamily: 'PlusJakartaSans_400Regular', color: '#53627A', fontSize: 11, lineHeight: 17, textAlign: 'center', marginBottom: 8},
  countdownText: {fontFamily: 'PlusJakartaSans_400Regular', color: '#111318', fontSize: 12, lineHeight: 20, textAlign: 'center', marginTop: 18},
  countdownValue: {fontFamily: 'PlusJakartaSans_700Bold', color: '#061A50'},
  resendButton: {minHeight: 44, justifyContent: 'center', alignItems: 'center', marginTop: 8},
  resendText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0865FF', fontSize: 12},
  cancelButton: {minHeight: 44, justifyContent: 'center', alignItems: 'center', marginTop: 4, paddingHorizontal: 18},
  cancelText: {fontFamily: 'PlusJakartaSans_500Medium', color: '#B5A8AA', fontSize: 13},
});
