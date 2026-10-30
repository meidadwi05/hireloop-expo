import Ionicons from '@expo/vector-icons/Ionicons';
import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {BrandedHeaderBackground} from '../../../components/ui/BrandedHeaderBackground';
import {useAuth} from '../../auth/auth-provider';
import {profileColors, profileFonts} from '../../profile/components/profile-ui';

type SettingsRowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  subtitle?: string;
  onPress: () => void;
  last?: boolean;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'HL';
}

function SettingsRow({icon, label, subtitle, onPress, last = false}: SettingsRowProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [styles.settingsRow, last && styles.settingsRowLast, pressed && styles.rowPressed]}
    >
      <View style={styles.iconSlot}>
        <Ionicons name={icon} size={22} color={profileColors.blue} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#667085" />
    </Pressable>
  );
}

export function AccountSettingsScreen() {
  const {user, logout} = useAuth();
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const [logoutPending, setLogoutPending] = useState(false);
  const [logoutConfirmationVisible, setLogoutConfirmationVisible] = useState(false);
  const containerWidth = Math.min(width, 440);
  const fullName = user?.full_name?.trim() || 'Kandidat HireLoop';
  const email = user?.email || 'Email belum tersedia';

  const showComingSoon = (title: string) => {
    Alert.alert(title, 'Fitur ini akan tersedia pada pembaruan berikutnya.');
  };

  const performLogout = async () => {
    if (logoutPending) return;
    setLogoutPending(true);
    try {
      await logout();
      setLogoutConfirmationVisible(false);
      router.replace('/(public)/login');
    } catch {
      setLogoutPending(false);
      Alert.alert('Gagal keluar dari akun', 'Sesi belum dapat diakhiri. Silakan coba kembali.');
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <BrandedHeaderBackground
        artworkTestID="account-header-artwork"
        containerWidth={containerWidth}
        testID="account-header"
        topInset={insets.top}
        variant="account"
        style={[styles.header, {paddingTop: insets.top + 8}]}
      >
        <View>
          <Text style={styles.headerTitle}>Akun</Text>
          <Text style={styles.headerSubtitle}>Kelola akun dan keamananmu</Text>
        </View>
      </BrandedHeaderBackground>

      <ScrollView
        contentContainerStyle={[styles.content, {paddingBottom: Math.max(insets.bottom, 18) + 18}]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          {user?.avatar_url ? (
            <Image accessibilityIgnoresInvertColors source={{uri: user.avatar_url}} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitials}>{initials(fullName)}</Text>
            </View>
          )}
          <View style={styles.profileCopy}>
            <Text numberOfLines={2} style={styles.profileName}>{fullName}</Text>
            <Text numberOfLines={1} style={styles.profileEmail}>{email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pengaturan Akun</Text>
          <View style={styles.settingsCard}>
            <SettingsRow
              icon="lock-closed-outline"
              label="Ubah Kata Sandi"
              subtitle="Perbarui keamanan akun"
              onPress={() => showComingSoon('Ubah Kata Sandi')}
              last
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi</Text>
          <View style={styles.settingsCard}>
            <SettingsRow
              icon="shield-checkmark-outline"
              label="Kebijakan Privasi"
              onPress={() => showComingSoon('Kebijakan Privasi')}
            />
            <SettingsRow
              icon="document-text-outline"
              label="Syarat & Ketentuan"
              onPress={() => showComingSoon('Syarat & Ketentuan')}
              last
            />
          </View>
        </View>

        <Pressable
          accessibilityLabel="Keluar dari akun"
          accessibilityRole="button"
          disabled={logoutPending}
          onPress={() => setLogoutConfirmationVisible(true)}
          style={({pressed}) => [styles.logoutButton, pressed && !logoutPending && styles.rowPressed, logoutPending && styles.logoutDisabled]}
        >
          {logoutPending ? (
            <ActivityIndicator color={profileColors.red} size="small" />
          ) : (
            <Ionicons name="log-out-outline" size={21} color={profileColors.red} />
          )}
          <Text style={styles.logoutText}>{logoutPending ? 'Keluar...' : 'Keluar Akun'}</Text>
        </Pressable>

        <Text style={styles.footer}>HireLoop</Text>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => {
          if (!logoutPending) setLogoutConfirmationVisible(false);
        }}
        presentationStyle="overFullScreen"
        transparent
        visible={logoutConfirmationVisible}
      >
        <View accessibilityViewIsModal style={styles.modalBackdrop}>
          <View style={styles.logoutModal}>
            <View style={styles.logoutModalIcon}>
              <Ionicons name="log-out-outline" size={28} color={profileColors.red} />
            </View>
            <Text style={styles.logoutModalTitle}>Keluar dari akun?</Text>
            <Text style={styles.logoutModalDescription}>Anda perlu masuk kembali untuk mengakses akun HireLoop.</Text>
            <View style={styles.logoutModalActions}>
              <Pressable
                accessibilityRole="button"
                disabled={logoutPending}
                onPress={() => setLogoutConfirmationVisible(false)}
                style={({pressed}) => [styles.cancelLogoutButton, pressed && styles.rowPressed]}
              >
                <Text style={styles.cancelLogoutText}>Batal</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Konfirmasi keluar akun"
                disabled={logoutPending}
                onPress={() => void performLogout()}
                style={({pressed}) => [styles.confirmLogoutButton, pressed && !logoutPending && styles.rowPressed, logoutPending && styles.logoutDisabled]}
              >
                {logoutPending && <ActivityIndicator color="white" size="small" />}
                <Text style={styles.confirmLogoutText}>{logoutPending ? 'Keluar...' : 'Keluar'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const cardShadow = {
  shadowColor: '#17365F',
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.07,
  shadowRadius: 10,
  elevation: 2,
};

const styles = StyleSheet.create({
  screen: {flex: 1, width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: profileColors.background},
  header: {paddingHorizontal: 22, paddingBottom: 12, justifyContent: 'center'},
  headerTitle: {fontFamily: profileFonts.bold, fontSize: 25, lineHeight: 31, color: 'white'},
  headerSubtitle: {fontFamily: profileFonts.regular, fontSize: 12, lineHeight: 18, color: '#DDEAFF', marginTop: 1},
  content: {paddingHorizontal: 18, paddingTop: 14, gap: 18},
  profileCard: {...cardShadow, minHeight: 102, borderRadius: 16, borderWidth: 1, borderColor: '#E8EDF4', backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', gap: 14},
  avatar: {width: 66, height: 66, borderRadius: 33, backgroundColor: '#E8EEF6'},
  avatarFallback: {alignItems: 'center', justifyContent: 'center'},
  avatarInitials: {fontFamily: profileFonts.bold, fontSize: 20, color: profileColors.navy},
  profileCopy: {flex: 1, minWidth: 0},
  profileName: {fontFamily: profileFonts.bold, fontSize: 16, lineHeight: 22, color: profileColors.ink},
  profileEmail: {fontFamily: profileFonts.regular, fontSize: 11.5, lineHeight: 18, color: profileColors.muted, marginTop: 2},
  section: {gap: 9},
  sectionTitle: {fontFamily: profileFonts.bold, fontSize: 15, lineHeight: 21, color: profileColors.ink, marginLeft: 2},
  settingsCard: {...cardShadow, borderRadius: 14, borderWidth: 1, borderColor: '#E8EDF4', backgroundColor: 'white', paddingHorizontal: 14, overflow: 'hidden'},
  settingsRow: {minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: profileColors.border, paddingVertical: 10},
  settingsRowLast: {borderBottomWidth: 0},
  iconSlot: {width: 34, height: 34, alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  rowCopy: {flex: 1, minWidth: 0},
  rowLabel: {fontFamily: profileFonts.semibold, fontSize: 12.5, lineHeight: 18, color: profileColors.ink},
  rowSubtitle: {fontFamily: profileFonts.regular, fontSize: 10, lineHeight: 15, color: profileColors.muted, marginTop: 2},
  rowPressed: {opacity: 0.7},
  logoutButton: {...cardShadow, minHeight: 54, borderRadius: 14, borderWidth: 1, borderColor: '#F1D5D8', backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9},
  logoutDisabled: {opacity: 0.6},
  logoutText: {fontFamily: profileFonts.semibold, fontSize: 12.5, color: profileColors.red},
  footer: {fontFamily: profileFonts.medium, fontSize: 10, color: '#8B95A7', textAlign: 'center', marginTop: -4},
  modalBackdrop: {flex: 1, backgroundColor: 'rgba(0,18,55,0.58)', alignItems: 'center', justifyContent: 'center', padding: 20},
  logoutModal: {...cardShadow, width: '100%', maxWidth: 380, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 24},
  logoutModalIcon: {width: 58, height: 58, borderRadius: 29, backgroundColor: '#FFF0F2', alignItems: 'center', justifyContent: 'center'},
  logoutModalTitle: {fontFamily: profileFonts.bold, fontSize: 18, lineHeight: 25, color: profileColors.ink, textAlign: 'center', marginTop: 15},
  logoutModalDescription: {fontFamily: profileFonts.regular, fontSize: 11.5, lineHeight: 18, color: profileColors.muted, textAlign: 'center', marginTop: 7},
  logoutModalActions: {width: '100%', flexDirection: 'row', gap: 10, marginTop: 22},
  cancelLogoutButton: {flex: 1, minHeight: 46, borderRadius: 11, borderWidth: 1, borderColor: '#D7DEE8', alignItems: 'center', justifyContent: 'center'},
  cancelLogoutText: {fontFamily: profileFonts.bold, fontSize: 12, color: profileColors.ink},
  confirmLogoutButton: {flex: 1, minHeight: 46, borderRadius: 11, backgroundColor: profileColors.red, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7},
  confirmLogoutText: {fontFamily: profileFonts.bold, fontSize: 12, color: 'white'},
});
