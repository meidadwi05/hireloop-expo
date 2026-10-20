import React, {useState} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaskedView from '@react-native-masked-view/masked-view';
import {LinearGradient} from 'expo-linear-gradient';

const F = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

const C = {blue: '#0865FF', cyan: '#00CBEA', ink: '#12224B', muted: '#7B869D'};

type LoginPageProps = {
  email: string;
  password: string;
  errors: {email?: string; password?: string};
  remember: boolean;
  notice: string;
  loading: boolean;
  googleLoading?: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberChange: (value: boolean) => void;
  onNoticeChange?: (value: string) => void;
  onLogin: () => void;
  onGoogleLogin?: () => void;
  onForgotPassword: () => void;
  onRegister: () => void;
  onShowOnboarding: () => void;
};

function GradientWelcome() {
  return (
    <MaskedView
      style={styles.welcomeMask}
      maskElement={<Text style={styles.welcome}>Selamat Datang!</Text>}
    >
      <LinearGradient
        colors={['#0051FD', '#00DAFD']}
        start={{x: 0, y: 0.5}}
        end={{x: 1, y: 0.5}}
      >
        <Text style={[styles.welcome, {opacity: 0}]}>Selamat Datang!</Text>
      </LinearGradient>
    </MaskedView>
  );
}

function Field({
  label,
  value,
  onChange,
  password = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  password?: boolean;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error ? styles.inputError : null]}>
        <Ionicons
          name={password ? 'lock-closed-outline' : 'mail-outline'}
          size={18}
          color="#8B96AC"
        />
        <TextInput
          accessibilityLabel={label}
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={password ? 'Masukkan kata sandi' : 'nama@email.com'}
          placeholderTextColor="#A0A9BB"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={password ? 'default' : 'email-address'}
          secureTextEntry={password && !visible}
          textContentType={password ? 'password' : 'emailAddress'}
          autoComplete={password ? 'current-password' : 'email'}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            hitSlop={10}
            onPress={() => setVisible(!visible)}
          >
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={19}
              color="#8B96AC"
            />
          </Pressable>
        )}
      </View>
      {!!error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
    </View>
  );
}

function Link({label, onPress, light = false}: {label: string; onPress: () => void; light?: boolean}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={styles.link}>
      <Text style={[styles.linkText, light && styles.linkTextLight]}>{label}</Text>
    </Pressable>
  );
}

function LoginButton({onPress, loading}: {onPress: () => void; loading: boolean}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{busy: loading, disabled: loading}}
      disabled={loading}
      onPress={onPress}
      style={({pressed}) => [styles.button, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={[C.blue, C.cyan]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.buttonInner}
      >
        {loading ? (
          <Text style={styles.buttonText}>Menghubungkan...</Text>
        ) : (
          <>
            <Text style={styles.buttonText}>Masuk</Text>
            <Ionicons name="arrow-forward" size={19} color="white"/>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export default function LoginPage({
  email,
  password,
  errors,
  remember,
  notice,
  loading,
  googleLoading = false,
  onEmailChange,
  onPasswordChange,
  onRememberChange,
  onLogin,
  onGoogleLogin,
  onForgotPassword,
  onRegister,
  onShowOnboarding,
}: LoginPageProps) {
  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.loginScroll}>
      <View style={styles.brand}>
        <Image
          source={require('../assets/HireLoopLogo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Logo HireLoop"
        />
        <Text style={styles.tagline}>Temukan pekerjaan terbaik dan{ '\n'}pantau proses lamaranmu</Text>
      </View>

      <View style={styles.loginCard}>
        <View style={styles.row}>
          <View>
            <GradientWelcome/>
            <Text style={styles.sub}>Masuk untuk melanjutkan</Text>
          </View>
          <View style={styles.iconBox}>
            <Image
              source={require('../assets/lockcheck.png')}
              style={styles.loginLockImage}
              resizeMode="contain"
              accessibilityLabel="Ikon keamanan akun"
            />
          </View>
        </View>

        <View style={styles.fields}>
          <Field label="Email" value={email} onChange={onEmailChange} error={errors.email}/>
          <Field label="Password" value={password} onChange={onPasswordChange} password error={errors.password}/>
        </View>

        <View style={styles.options}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{checked: remember}}
            onPress={() => onRememberChange(!remember)}
            style={styles.checkRow}
          >
            <Ionicons
              name={remember ? 'checkbox' : 'square-outline'}
              size={18}
              color={remember ? C.blue : '#A6B0C4'}
            />
            <Text style={styles.small}>Ingat saya</Text>
          </Pressable>
          <Link label="Lupa kata sandi?" onPress={onForgotPassword}/>
        </View>

        <LoginButton onPress={onLogin} loading={loading}/>

        <View style={styles.divider}>
          <View style={styles.line}/>
          <Text style={styles.small}>atau</Text>
          <View style={styles.line}/>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{busy: googleLoading, disabled: loading || googleLoading}}
          disabled={loading || googleLoading}
          style={({pressed}) => [styles.google, pressed && styles.pressed]}
          onPress={onGoogleLogin}
        >
          <Text style={styles.googleG}>G</Text>
          <Text style={styles.googleText}>
            {googleLoading ? 'Menghubungkan ke Google...' : 'Masuk dengan Google'}
          </Text>
        </Pressable>

        <View style={styles.signup}>
          <Text style={styles.small}>Belum punya akun?</Text>
          <Link label="Daftar Sekarang" onPress={onRegister}/>
        </View>
        {!!notice && <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text>}
      </View>

      <Text style={styles.demoNote}>API KANDIDAT · LARAVEL SANCTUM</Text>
      <Link label="Lihat onboarding" light onPress={onShowOnboarding}/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loginScroll: {flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 35},
  brand: {alignItems: 'center', marginBottom: 30},
  logo: {width: 235, height: 61, alignSelf: 'center'},
  tagline: {fontFamily: F.regular, fontSize: 12, lineHeight: 18, color: '#D1DAF4', textAlign: 'center', marginTop: 12},
  loginCard: {backgroundColor: 'white', borderRadius: 22, padding: 24},
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  welcomeMask: {alignSelf: 'flex-start'},
  welcome: {fontFamily: F.bold, fontSize: 22, letterSpacing: -0.5},
  sub: {fontFamily: F.regular, fontSize: 12, color: C.muted, marginTop: 6},
  iconBox: {width: 52, height: 52, justifyContent: 'center', alignItems: 'center'},
  loginLockImage: {width: 52, height: 52},
  fields: {gap: 19, marginTop: 28},
  field: {gap: 8},
  label: {fontFamily: F.medium, fontSize: 12, color: '#49536A'},
  inputWrap: {flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#E4E9F2', borderRadius: 8, paddingHorizontal: 12, backgroundColor: 'white', minHeight: 48},
  inputError: {borderColor: '#E25E6D'},
  input: {fontFamily: F.regular, flex: 1, minWidth: 0, paddingVertical: 13, fontSize: 13, color: C.ink, outlineWidth: 0} as any,
  error: {fontFamily: F.regular, fontSize: 11, color: '#DE5364', lineHeight: 16},
  options: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, marginBottom: 12, flexWrap: 'wrap'},
  checkRow: {flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44},
  small: {fontFamily: F.regular, fontSize: 11, color: C.muted},
  link: {paddingVertical: 12},
  linkText: {fontFamily: F.regular, color: C.blue, fontSize: 12, fontWeight: '600'},
  linkTextLight: {color: '#C7D5FF'},
  button: {borderRadius: 10, overflow: 'hidden'},
  pressed: {opacity: 0.82},
  buttonInner: {height: 52, paddingHorizontal: 22, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16},
  buttonText: {fontFamily: F.bold, color: 'white', fontSize: 14},
  divider: {flexDirection: 'row', gap: 14, alignItems: 'center', marginVertical: 21},
  line: {height: 1, backgroundColor: '#EDF0F6', flex: 1},
  google: {minHeight: 48, borderColor: '#E5EAF3', borderWidth: 1, borderRadius: 8, flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'center'},
  googleG: {fontFamily: F.bold, color: '#4285F4', fontSize: 21},
  googleText: {fontFamily: F.semibold, color: C.ink, fontSize: 12},
  signup: {flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center', marginTop: 10, flexWrap: 'wrap'},
  notice: {fontFamily: F.regular, fontSize: 12, lineHeight: 19, backgroundColor: '#EDF5FF', padding: 12, borderRadius: 8, color: '#275DA8', marginTop: 8},
  demoNote: {fontFamily: F.medium, fontSize: 10, letterSpacing: 1.1, color: '#8D9BC6', textAlign: 'center', marginTop: 24},
});
