import React from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
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
  bold: 'PlusJakartaSans_700Bold',
} as const;

const C = {navy: '#050D49', blue: '#0865FF', cyan: '#00CBEA', ink: '#12224B'};
const RESET_AUTH_ICON = require('../assets/reset_auth.png');

type ForgotPasswordPageProps = {
  email: string;
  error?: string;
  isSubmitting: boolean;
  successVisible: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onSuccessDismiss: () => void;
};

function GradientTitle() {
  return (
    <MaskedView
      style={styles.pageTitleMask}
      maskElement={<Text style={styles.pageTitle}>Lupa Kata Sandi</Text>}
    >
      <LinearGradient
        colors={['#0051FD', '#00DAFD']}
        start={{x: 0, y: 0.5}}
        end={{x: 1, y: 0.5}}
      >
        <Text style={[styles.pageTitle, {opacity: 0}]}>Lupa Kata Sandi</Text>
      </LinearGradient>
    </MaskedView>
  );
}

function SubmitButton({isSubmitting, onPress}: {isSubmitting: boolean; onPress: () => void}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{busy: isSubmitting, disabled: isSubmitting}}
      disabled={isSubmitting}
      onPress={onPress}
      style={({pressed}) => [styles.button, isSubmitting && styles.buttonDisabled, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={[C.blue, C.cyan]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.buttonInner}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white"/>
        ) : (
          <>
            <Text style={styles.buttonText}>Kirim tautan reset</Text>
            <Ionicons name="arrow-forward" size={19} color="white"/>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

function GradientSuccessTitle() {
  return (
    <MaskedView
      style={styles.successTitleMask}
      maskElement={<Text style={styles.successTitle}>Tautan Reset Terkirim!</Text>}
    >
      <LinearGradient
        colors={['#0051FD', '#00DAFD']}
        start={{x: 0, y: 0.5}}
        end={{x: 1, y: 0.5}}
      >
        <Text style={[styles.successTitle, {opacity: 0}]}>Tautan Reset Terkirim!</Text>
      </LinearGradient>
    </MaskedView>
  );
}

function SuccessButton({onPress}: {onPress: () => void}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [styles.successButton, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={['#0051FD', '#00DAFD']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.successButtonInner}
      >
        <Text style={styles.successButtonText}>Oke, Mengerti</Text>
      </LinearGradient>
    </Pressable>
  );
}

export default function ForgotPasswordPage({
  email,
  error,
  isSubmitting,
  successVisible,
  onEmailChange,
  onSubmit,
  onBack,
  onSuccessDismiss,
}: ForgotPasswordPageProps) {
  return (
    <>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.forgot}>
        <View style={styles.forgotHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali ke login"
            style={styles.back}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={22} color={C.navy}/>
          </Pressable>
          <GradientTitle/>
          <View style={{width: 40}}/>
        </View>

        <View style={styles.forgotHero}>
          <Image
            source={require('../assets/Lupasandi.png')}
            style={styles.forgotIllustration}
            resizeMode="contain"
            accessibilityLabel="Ilustrasi keamanan akun dan gembok"
          />
        </View>

        <View style={styles.resetCard}>
          <Text style={styles.resetBody}>Kami akan mengirimkan tautan untuk{ '\n'}mengatur ulang kata sandi Anda.</Text>
          <Text style={styles.resetLabel}>Email</Text>
          <View style={[styles.resetInputWrap, error ? styles.resetInputError : null]}>
            <Ionicons name="mail-outline" size={17} color="#7B879D"/>
            <TextInput
              accessibilityLabel="Email terdaftar"
              style={styles.resetInput}
              value={email}
              onChangeText={onEmailChange}
              placeholder="Masukkan email terdaftar"
              placeholderTextColor="#A2AAB9"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>
          {!!error && <Text accessibilityLiveRegion="polite" style={styles.resetError}>{error}</Text>}
          <View style={styles.resetButtonSpacing}>
            <SubmitButton isSubmitting={isSubmitting} onPress={onSubmit}/>
          </View>
          <Pressable accessibilityRole="button" style={styles.resetBack} onPress={onBack}>
            <Text style={styles.resetBackText}>Kembali ke halaman Masuk</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={successVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={onSuccessDismiss}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successImageFrame}>
              <Image
                source={RESET_AUTH_ICON}
                style={styles.successImage}
                resizeMode="contain"
                accessibilityLabel="Ilustrasi tautan reset berhasil dikirim"
              />
            </View>
            <GradientSuccessTitle/>
            <Text style={styles.successDescription}>
              Kami telah mengirimkan tautan untuk mereset kata sandi Anda ke email
            </Text>
            <View style={styles.successEmailBox}>
              <Ionicons name="lock-closed-outline" size={21} color="#1557CD"/>
              <Text
                style={styles.successEmail}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.72}
              >
                {email.trim()}
              </Text>
            </View>
            <SuccessButton onPress={onSuccessDismiss}/>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  forgot: {flexGrow: 1, paddingHorizontal: 18, paddingTop: 7, paddingBottom: 35, backgroundColor: '#FFFFFF'},
  forgotHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 57},
  back: {width: 40, height: 44, justifyContent: 'center', alignItems: 'center'},
  pageTitleMask: {alignSelf: 'center'},
  pageTitle: {fontFamily: F.bold, fontSize: 18},
  forgotHero: {height: 205, alignItems: 'center', justifyContent: 'flex-end', marginTop: 13},
  forgotIllustration: {width: '100%', height: 202},
  resetCard: {backgroundColor: C.navy, borderRadius: 16, paddingHorizontal: 19, paddingTop: 27, paddingBottom: 20, marginTop: -4},
  resetBody: {fontFamily: F.regular, color: '#E0E6F9', fontSize: 12, lineHeight: 18, textAlign: 'center', marginBottom: 26},
  resetLabel: {fontFamily: F.medium, color: 'white', fontSize: 11, marginBottom: 7},
  resetInputWrap: {minHeight: 43, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'white', borderRadius: 7, paddingHorizontal: 11},
  resetInputError: {borderColor: '#ED8691', borderWidth: 1.5},
  resetInput: {fontFamily: F.regular, color: C.ink, flex: 1, fontSize: 11, paddingVertical: 10},
  resetError: {fontFamily: F.regular, color: '#FFADB7', fontSize: 11, marginTop: 7},
  resetButtonSpacing: {marginTop: 24},
  resetBack: {alignItems: 'center', paddingVertical: 14, marginTop: 3},
  resetBackText: {fontFamily: F.regular, color: '#E5EBFB', fontSize: 11},
  button: {borderRadius: 10, overflow: 'hidden'},
  buttonDisabled: {opacity: 0.6},
  pressed: {opacity: 0.82},
  buttonInner: {height: 52, paddingHorizontal: 22, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16},
  buttonText: {fontFamily: F.bold, color: 'white', fontSize: 14},
  modalOverlay: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(5, 13, 73, 0.58)', padding: 22},
  successCard: {width: '100%', maxWidth: 380, borderRadius: 28, backgroundColor: 'white', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 28, alignItems: 'center'},
  successImageFrame: {width: 180, height: 180, overflow: 'hidden'},
  successImage: {width: '100%', height: '100%'},
  successTitleMask: {alignSelf: 'stretch', marginTop: 4},
  successTitle: {fontFamily: F.bold, fontSize: 25, lineHeight: 32, textAlign: 'center'},
  successDescription: {fontFamily: F.regular, color: '#202020', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 16, paddingHorizontal: 4},
  successEmailBox: {width: '100%', minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#EEF4FF', borderRadius: 13, paddingHorizontal: 17, marginTop: 24},
  successEmail: {flex: 1, fontFamily: F.regular, color: '#1557CD', fontSize: 16},
  successButton: {width: '78%', borderRadius: 12, overflow: 'hidden', marginTop: 27},
  successButtonInner: {height: 52, justifyContent: 'center', alignItems: 'center'},
  successButtonText: {fontFamily: F.medium, color: 'white', fontSize: 16},
});
