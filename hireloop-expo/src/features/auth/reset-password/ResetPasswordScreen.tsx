import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import {router} from 'expo-router';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {toAppApiError} from '../../../core/api/api-error';
import {authApi} from '../api/auth.api';
import {
  getPasswordCriteria,
  isPasswordValid,
  passwordsMatch,
} from './reset-password.validation';

const F = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

const C = {
  navy: '#050D49',
  input: '#101D59',
  blue: '#0051FD',
  cyan: '#00DAFD',
  green: '#20D977',
  secondary: '#CBD6F1',
  border: '#314375',
};

type LinkStatus = 'valid' | 'invalid' | 'expired' | 'success';

type ResetPasswordScreenProps = {
  email: string;
  token: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GradientButton({
  label,
  disabled = false,
  loading = false,
  onPress,
}: {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{disabled, busy: loading}}
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [styles.button, disabled && styles.buttonDisabled, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={[C.blue, C.cyan]}
        start={{x: 0, y: 0.5}}
        end={{x: 1, y: 0.5}}
        style={styles.buttonInner}
      >
        {loading
          ? <ActivityIndicator color="#FFFFFF"/>
          : <Text style={styles.buttonText}>{label}</Text>}
      </LinearGradient>
    </Pressable>
  );
}

function PasswordInput({
  label,
  placeholder,
  value,
  visible,
  error,
  onChangeText,
  onToggleVisibility,
}: {
  label: string;
  placeholder: string;
  value: string;
  visible: boolean;
  error?: boolean;
  onChangeText: (value: string) => void;
  onToggleVisibility: () => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, focused && styles.inputFocused, error && styles.inputError]}>
        <Ionicons name="lock-closed-outline" size={20} color="#93A2C6"/>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor="#8D9ABB"
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          hitSlop={10}
          onPress={onToggleVisibility}
        >
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color="#93A2C6"/>
        </Pressable>
      </View>
    </View>
  );
}

function Criterion({met, children}: {met: boolean; children: React.ReactNode}) {
  return (
    <View style={styles.criterion}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={18}
        color={met ? C.green : '#7786AA'}
      />
      <Text style={[styles.criterionText, met && styles.criterionMet]}>{children}</Text>
    </View>
  );
}

export default function ResetPasswordScreen({email, token}: ResetPasswordScreenProps) {
  const hasRequiredParams = token.trim().length > 0 && EMAIL_PATTERN.test(email.trim());
  const [status, setStatus] = useState<LinkStatus>(hasRequiredParams ? 'valid' : 'invalid');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [countdown, setCountdown] = useState(3);
  const criteria = useMemo(() => getPasswordCriteria(password), [password]);
  const matches = passwordsMatch(password, confirmation);
  const canSubmit = isPasswordValid(password) && matches && !submitting;

  const openHireLoop = useCallback(async () => {
    if (Platform.OS === 'web') {
      await Linking.openURL('hireloop://login').catch(() => undefined);
      return;
    }

    router.replace('/(public)/login');
  }, []);

  useEffect(() => {
    if (status !== 'success') return;

    const interval = setInterval(() => {
      setCountdown(current => {
        if (current <= 1) {
          clearInterval(interval);
          void openHireLoop();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [openHireLoop, status]);

  const submit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    setFormError(undefined);
    try {
      await authApi.resetPassword({
        email,
        token,
        password,
        passwordConfirmation: confirmation,
      });
      setCountdown(3);
      setStatus('success');
      router.setParams({email: '', token: ''});
    } catch (error) {
      const apiError = toAppApiError(error);
      const message = apiError.message.toLowerCase();

      if (message.includes('expired') || message.includes('kedaluwarsa')) {
        setStatus('expired');
      } else if ([400, 404, 410, 422].includes(apiError.status ?? 0)) {
        setStatus('invalid');
      } else {
        setFormError(apiError.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const requestAnotherLink = () => {
    router.replace({
      pathname: '/(public)/forgot-password',
      params: email ? {email} : undefined,
    });
  };

  const renderContent = () => {
    if (status === 'invalid' || status === 'expired') {
      return (
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Ionicons name="link-outline" size={42} color={C.cyan}/>
          </View>
          <Text style={styles.statusTitle}>
            {status === 'expired' ? 'Tautan Telah Kedaluwarsa' : 'Tautan Tidak Valid'}
          </Text>
          <Text style={styles.statusDescription}>
            {status === 'expired'
              ? 'Tautan reset password telah kedaluwarsa. Silakan minta tautan baru.'
              : 'Tautan reset password tidak valid atau sudah digunakan.'}
          </Text>
          <View style={styles.statusButton}>
            <GradientButton label="Kirim Ulang Tautan" onPress={requestAnotherLink}/>
          </View>
        </View>
      );
    }

    if (status === 'success') {
      return (
        <View style={styles.successCard}>
          <Image
            source={require('../../../assets/Email_reset_succesed.png')}
            style={styles.successImage}
            resizeMode="contain"
            accessibilityLabel="Ilustrasi password berhasil diubah"
          />
          <Text style={styles.successTitle}>Password Berhasil Diubah!</Text>
          <Text style={styles.successDescription}>
            Kata sandi Anda telah berhasil diubah. Anda akan diarahkan kembali ke aplikasi.
          </Text>
          <Text style={styles.countdownText}>
            Mengalihkan dalam <Text style={styles.countdownNumber}>{countdown}</Text> detik...
          </Text>
          <View style={styles.successButton}>
            <GradientButton
              label="Kembali ke HireLoop"
              onPress={() => router.replace('/(public)/login')}
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.formCard}>
        <Text style={styles.title}>Buat Kata Sandi Baru</Text>
        <Text style={styles.description}>Silakan buat kata sandi baru untuk akun Anda.</Text>

        <PasswordInput
          label="Kata Sandi Baru"
          placeholder="Masukkan kata sandi baru"
          value={password}
          visible={showPassword}
          onChangeText={value => {
            setPassword(value);
            setFormError(undefined);
          }}
          onToggleVisibility={() => setShowPassword(value => !value)}
        />

        <View style={styles.criteria}>
          <Criterion met={criteria.minimumLength}>Minimal 8 karakter</Criterion>
          <Criterion met={criteria.mixedCase}>Mengandung huruf besar dan huruf kecil</Criterion>
          <Criterion met={criteria.numberOrSymbol}>Mengandung angka atau simbol</Criterion>
        </View>

        <PasswordInput
          label="Konfirmasi Kata Sandi"
          placeholder="Ulangi kata sandi baru"
          value={confirmation}
          visible={showConfirmation}
          error={confirmation.length > 0 && !matches}
          onChangeText={value => {
            setConfirmation(value);
            setFormError(undefined);
          }}
          onToggleVisibility={() => setShowConfirmation(value => !value)}
        />
        {confirmation.length > 0 && !matches && (
          <Text accessibilityLiveRegion="polite" style={styles.errorText}>
            Konfirmasi kata sandi tidak sama.
          </Text>
        )}
        {!!formError && (
          <Text accessibilityLiveRegion="polite" style={styles.errorText}>{formError}</Text>
        )}

        <View style={styles.submitSpacing}>
          <GradientButton
            label="Simpan Kata Sandi"
            disabled={!canSubmit}
            loading={submitting}
            onPress={() => void submit()}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents="none" style={styles.decorOne}/>
      <View pointerEvents="none" style={styles.decorTwo}/>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require('../../../assets/HireLoopLogo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="HireLoop"
          />
          {renderContent()}
          <Text style={styles.footer}>© 2026 HireLoop. All rights reserved.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: C.navy, overflow: 'hidden'},
  flex: {flex: 1},
  decorOne: {position: 'absolute', width: 330, height: 330, borderRadius: 165, borderWidth: 1, borderColor: '#122469', top: -170, right: -145},
  decorTwo: {position: 'absolute', width: 440, height: 440, borderRadius: 220, borderWidth: 1, borderColor: '#122469', bottom: -260, left: -260},
  scrollContent: {flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: 34, paddingBottom: 22},
  logo: {alignSelf: 'center', width: 190, height: 68, marginBottom: 52},
  formCard: {width: '100%'},
  title: {fontFamily: F.bold, color: '#FFFFFF', fontSize: 28, lineHeight: 36, textAlign: 'center'},
  description: {fontFamily: F.regular, color: C.secondary, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 8, marginBottom: 34},
  fieldGroup: {marginTop: 18},
  label: {fontFamily: F.semibold, color: '#FFFFFF', fontSize: 14, marginBottom: 9},
  inputWrap: {height: 56, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.input, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 15},
  inputFocused: {borderColor: C.cyan, borderWidth: 1.5},
  inputError: {borderColor: '#FF8292'},
  input: {flex: 1, height: '100%', paddingVertical: 0, fontFamily: F.regular, color: '#FFFFFF', fontSize: 14},
  criteria: {gap: 9, marginTop: 16, marginBottom: 2},
  criterion: {flexDirection: 'row', alignItems: 'center', gap: 9},
  criterionText: {flex: 1, fontFamily: F.regular, color: '#8D9ABB', fontSize: 12, lineHeight: 18},
  criterionMet: {color: C.green},
  errorText: {fontFamily: F.regular, color: '#FF9CAA', fontSize: 12, lineHeight: 18, marginTop: 8},
  submitSpacing: {marginTop: 28},
  button: {width: '100%', borderRadius: 10, overflow: 'hidden'},
  buttonInner: {height: 52, justifyContent: 'center', alignItems: 'center'},
  buttonText: {fontFamily: F.semibold, color: '#FFFFFF', fontSize: 15},
  buttonDisabled: {opacity: 0.45},
  pressed: {opacity: 0.82},
  statusCard: {width: '100%', alignItems: 'center', borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: '#0B1755', paddingHorizontal: 24, paddingVertical: 38},
  statusIcon: {width: 82, height: 82, borderRadius: 41, backgroundColor: '#10266F', justifyContent: 'center', alignItems: 'center', marginBottom: 22},
  statusTitle: {fontFamily: F.bold, color: '#FFFFFF', fontSize: 23, lineHeight: 31, textAlign: 'center', marginTop: 18},
  statusDescription: {fontFamily: F.regular, color: C.secondary, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 12},
  statusButton: {width: '100%', marginTop: 28},
  successCard: {width: '100%', alignItems: 'center'},
  successImage: {width: 190, height: 190},
  successTitle: {fontFamily: F.bold, color: '#FFFFFF', fontSize: 26, lineHeight: 34, textAlign: 'center', marginTop: 12},
  successDescription: {fontFamily: F.regular, color: C.secondary, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 12},
  countdownText: {fontFamily: F.regular, color: C.secondary, fontSize: 14, marginTop: 24},
  countdownNumber: {fontFamily: F.bold, color: C.cyan, fontSize: 21},
  successButton: {width: '100%', marginTop: 28},
  footer: {fontFamily: F.regular, color: '#8390B1', fontSize: 11, textAlign: 'center', marginTop: 48},
});
