import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import {router} from 'expo-router';
import React, {useMemo, useState} from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {toAppApiError} from '../../../core/api/api-error';
import {useAuth} from '../../auth/auth-provider';
import {profileApi} from '../api/profile.api';
import {calculateProfileCompletion, formatAddress} from '../profile.mapper';
import {useProfile, useProfileMutation} from '../hooks/use-profile';
import {
  PrimaryButton,
  ProfileCard,
  ProfileHeader,
  ProfilePage,
  ScreenState,
  profileColors,
  profileFonts,
} from '../components/profile-ui';

const menuItems = [
  {label: 'Data Diri', subtitle: 'Identitas, kontak & pendidikan', icon: 'id-card-outline' as const, route: '/(candidate)/profile/personal-data'},
  {label: 'Pengalaman', subtitle: 'Pengalaman kerja kandidat', icon: 'briefcase-outline' as const},
  {label: 'Keahlian', subtitle: 'Keahlian, tools & bahasa', icon: 'construct-outline' as const},
  {label: 'Preferensi Kerja', subtitle: 'Posisi, lokasi & gaji', icon: 'options-outline' as const, route: '/(candidate)/profile/work-preferences'},
  {label: 'Dokumen & Sertifikat', subtitle: 'CV dan sertifikasi', icon: 'document-text-outline' as const, route: '/(candidate)/profile/documents'},
  {label: 'Pengaturan Akun', subtitle: 'Kelola akun Anda', icon: 'settings-outline' as const},
];

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'HL';
}

export function ProfileScreen() {
  const {logout} = useAuth();
  const profile = useProfile();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [about, setAbout] = useState('');
  const updateDescription = useProfileMutation(profileApi.updateDescription);
  const uploadAvatar = useProfileMutation(profileApi.uploadAvatar);
  const data = profile.data;
  const completion = useMemo(() => data ? calculateProfileCompletion(data) : 0, [data]);

  const chooseAvatar = async () => {
    const result = await DocumentPicker.getDocumentAsync({type: ['image/jpeg', 'image/png'], copyToCacheDirectory: true});
    if (result.canceled) return;
    const asset = result.assets[0];
    if ((asset.size ?? 0) > 2 * 1024 * 1024) {
      Alert.alert('File terlalu besar', 'Foto profil maksimal 2 MB.');
      return;
    }
    try {
      await uploadAvatar.mutateAsync({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? 'image/jpeg',
        size: asset.size,
        file: asset.file,
      });
      Alert.alert('Berhasil', 'Foto profil berhasil diperbarui.');
    } catch (error) {
      Alert.alert('Gagal memperbarui foto', toAppApiError(error).message);
    }
  };

  const openAbout = () => {
    setAbout(data?.selfDescription ?? '');
    setAboutOpen(true);
  };

  const saveAbout = async () => {
    try {
      await updateDescription.mutateAsync(about.trim());
      setAboutOpen(false);
      Alert.alert('Berhasil', 'Tentang Saya berhasil diperbarui.');
    } catch (error) {
      Alert.alert('Gagal menyimpan', toAppApiError(error).message);
    }
  };

  return (
    <View style={styles.screen}>
      <ProfileHeader title="Profil Saya" rightIcon="settings-outline" rightLabel="Pengaturan" onRightPress={() => Alert.alert('Pengaturan Akun', 'Pengaturan akun akan tersedia pada pembaruan berikutnya.')} fallback="/(candidate)/(tabs)/home" />
      {profile.isLoading || profile.isError || !data ? (
        <ScreenState
          loading={profile.isLoading}
          error={profile.isError ? toAppApiError(profile.error).message : !data ? 'Profil kandidat tidak ditemukan.' : undefined}
          onRetry={() => void profile.refetch()}
        />
      ) : (
        <ProfilePage refreshControl={undefined}>
          <ProfileCard style={styles.summaryCard}>
            <View style={styles.avatarWrap}>
              {data.avatarUrl ? (
                <Image source={{uri: data.avatarUrl}} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}><Text style={styles.avatarInitials}>{initials(data.fullName)}</Text></View>
              )}
              <Pressable accessibilityLabel="Ubah foto profil" onPress={() => void chooseAvatar()} style={styles.cameraButton}>
                <Ionicons name="camera-outline" size={19} color="white" />
              </Pressable>
            </View>
            <View style={styles.summaryCopy}>
              <Text numberOfLines={2} style={styles.name}>{data.fullName || 'Kandidat HireLoop'}</Text>
              <View style={styles.availableBadge}><View style={styles.availableDot} /><Text style={styles.availableText}>Tersedia untuk bekerja</Text></View>
              <View style={styles.metaRow}><Ionicons name="location-outline" size={18} color={profileColors.blue} /><Text numberOfLines={2} style={styles.metaText}>{data.domicileAddress?.regencyName || data.ktpAddress?.regencyName || 'Lokasi belum dilengkapi'}</Text></View>
              <View style={styles.metaRow}><Ionicons name="briefcase-outline" size={18} color={profileColors.blue} /><Text style={styles.metaText}>{data.experienceYears} tahun pengalaman</Text></View>
            </View>
          </ProfileCard>

          <ProfileCard>
            <View style={styles.completionHeader}><Text style={styles.cardTitle}>Kelengkapan Profil</Text><Text style={styles.completionValue}>{completion}%</Text></View>
            <View style={styles.progressTrack}><View style={[styles.progressFill, {width: `${completion}%`}]} /></View>
            <Text style={styles.helper}>Lengkapi profil Anda untuk kesempatan kerja yang lebih besar.</Text>
            <PrimaryButton label="Unduh CV" icon="download-outline" onPress={() => Alert.alert('Unduh CV', 'CV dapat diunduh setelah resume kandidat tersedia.')} />
          </ProfileCard>

          <ProfileCard>
            <View style={styles.aboutHeader}><Text style={styles.cardTitle}>Tentang Saya</Text><Pressable accessibilityLabel="Ubah Tentang Saya" onPress={openAbout}><Ionicons name="pencil" size={20} color={profileColors.blue} /></Pressable></View>
            <Text style={[styles.aboutText, !data.selfDescription && styles.emptyText]}>{data.selfDescription || 'Tambahkan ringkasan singkat tentang pengalaman dan tujuan karier Anda.'}</Text>
          </ProfileCard>

          <ProfileCard style={styles.menuCard}>
            <Text style={[styles.cardTitle, styles.menuTitle]}>Kelola Profil</Text>
            {menuItems.map((item, index) => (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                onPress={() => item.route ? router.push(item.route as never) : Alert.alert(item.label, 'Fitur ini akan tersedia pada pembaruan berikutnya.')}
                style={[styles.menuRow, index === menuItems.length - 1 && styles.menuRowLast]}
              >
                <Ionicons name={item.icon} size={23} color={profileColors.blue} />
                <View style={styles.menuCopy}><Text style={styles.menuLabel}>{item.label}</Text><Text style={styles.menuSubtitle}>{item.subtitle}</Text></View>
                <Ionicons name="chevron-forward" size={21} color="#667085" />
              </Pressable>
            ))}
          </ProfileCard>

          <Pressable onPress={() => void logout()} style={styles.logout}><Ionicons name="log-out-outline" size={20} color="#B42318" /><Text style={styles.logoutText}>Keluar dari akun</Text></Pressable>
          <Text style={styles.hiddenAddress} accessibilityElementsHidden>{formatAddress(data.domicileAddress)}</Text>
        </ProfilePage>
      )}

      <Modal animationType="fade" transparent visible={aboutOpen} onRequestClose={() => setAboutOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Ubah Tentang Saya</Text>
            <TextInput
              multiline
              maxLength={1000}
              onChangeText={setAbout}
              placeholder="Ceritakan pengalaman dan tujuan karier Anda"
              style={styles.aboutInput}
              textAlignVertical="top"
              value={about}
            />
            <Text style={styles.counter}>{about.length}/1000</Text>
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setAboutOpen(false)} style={styles.cancelButton}><Text style={styles.cancelText}>Batal</Text></Pressable>
              <Pressable disabled={updateDescription.isPending} onPress={() => void saveAbout()} style={styles.saveButton}><Text style={styles.saveText}>{updateDescription.isPending ? 'Menyimpan...' : 'Simpan'}</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: profileColors.background},
  summaryCard: {flexDirection: 'row', alignItems: 'center', gap: 16},
  avatarWrap: {width: 108, height: 108, flexShrink: 0},
  avatar: {width: 104, height: 104, borderRadius: 52, backgroundColor: '#E8EEF6'},
  avatarFallback: {alignItems: 'center', justifyContent: 'center'},
  avatarInitials: {fontFamily: profileFonts.bold, fontSize: 28, color: profileColors.navy},
  cameraButton: {position: 'absolute', right: 0, bottom: 2, width: 38, height: 38, borderRadius: 19, backgroundColor: profileColors.navy, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center'},
  summaryCopy: {flex: 1, minWidth: 0, gap: 7},
  name: {fontFamily: profileFonts.bold, fontSize: 19, lineHeight: 25, color: profileColors.ink},
  availableBadge: {alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, backgroundColor: '#E0FAEE', paddingHorizontal: 9, paddingVertical: 5},
  availableDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: profileColors.green},
  availableText: {fontFamily: profileFonts.semibold, fontSize: 9.5, color: '#168457'},
  metaRow: {flexDirection: 'row', alignItems: 'center', gap: 7},
  metaText: {flex: 1, fontFamily: profileFonts.regular, fontSize: 11.5, lineHeight: 16, color: profileColors.muted},
  completionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  cardTitle: {fontFamily: profileFonts.bold, fontSize: 15, color: profileColors.ink},
  completionValue: {fontFamily: profileFonts.bold, fontSize: 15, color: profileColors.blue},
  progressTrack: {height: 9, borderRadius: 5, backgroundColor: '#E7ECF3', marginTop: 12, overflow: 'hidden'},
  progressFill: {height: '100%', borderRadius: 5, backgroundColor: profileColors.blue},
  helper: {fontFamily: profileFonts.regular, fontSize: 11, lineHeight: 17, color: profileColors.muted, marginVertical: 10},
  aboutHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  aboutText: {fontFamily: profileFonts.regular, fontSize: 12, lineHeight: 19, color: '#344054', marginTop: 12},
  emptyText: {color: '#98A2B3', fontStyle: 'italic'},
  menuCard: {paddingBottom: 4},
  menuTitle: {paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#E3E9F2'},
  menuRow: {minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#E3E9F2'},
  menuRowLast: {borderBottomWidth: 0},
  menuCopy: {flex: 1, minWidth: 0},
  menuLabel: {fontFamily: profileFonts.semibold, fontSize: 13, color: profileColors.ink},
  menuSubtitle: {fontFamily: profileFonts.regular, fontSize: 10.5, color: profileColors.muted, marginTop: 2},
  logout: {height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8},
  logoutText: {fontFamily: profileFonts.semibold, fontSize: 12, color: '#B42318'},
  hiddenAddress: {position: 'absolute', width: 1, height: 1, opacity: 0},
  modalBackdrop: {flex: 1, backgroundColor: 'rgba(0,20,55,0.55)', justifyContent: 'center', padding: 20},
  modalCard: {backgroundColor: 'white', borderRadius: 18, padding: 18},
  modalTitle: {fontFamily: profileFonts.bold, fontSize: 18, color: profileColors.ink},
  aboutInput: {height: 150, borderWidth: 1.5, borderColor: '#D7DFEA', borderRadius: 12, padding: 12, fontFamily: profileFonts.regular, fontSize: 13, color: profileColors.ink, marginTop: 14},
  counter: {fontFamily: profileFonts.regular, fontSize: 10, color: profileColors.muted, textAlign: 'right', marginTop: 5},
  modalButtons: {flexDirection: 'row', gap: 10, marginTop: 14},
  cancelButton: {flex: 1, minHeight: 46, borderRadius: 10, borderWidth: 1.5, borderColor: profileColors.blue, alignItems: 'center', justifyContent: 'center'},
  cancelText: {fontFamily: profileFonts.semibold, color: profileColors.blue},
  saveButton: {flex: 1, minHeight: 46, borderRadius: 10, backgroundColor: profileColors.blue, alignItems: 'center', justifyContent: 'center'},
  saveText: {fontFamily: profileFonts.bold, color: 'white'},
});
