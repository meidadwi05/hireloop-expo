import {Ionicons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, {useState} from 'react';
import {ActivityIndicator, Image, Modal, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions} from 'react-native';

import {toAppApiError} from '../../../core/api/api-error';
import {ActionOverlayModal, type ActionOverlay} from '../../../shared/components/ActionOverlayModal';
import {onboardingApi, type KtpExtractedData} from '../api/onboarding.api';

const COLORS = {blue: '#087BFF', cyan: '#00D8F4', card: '#061D52', muted: '#B7C2D9', white: '#FFFFFF'} as const;
const KTP_MAX_SIZE = 5 * 1024 * 1024;
const AVATAR_MAX_SIZE = 2 * 1024 * 1024;
type UploadTarget = 'ktp' | 'avatar';

function imageName(asset: ImagePicker.ImagePickerAsset, target: UploadTarget) {
  return asset.fileName || `${target}-${Date.now()}.${asset.mimeType === 'image/png' ? 'png' : 'jpg'}`;
}

function CameraAction({label, onPress, disabled}: {label: string; onPress: () => void; disabled?: boolean}) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({pressed}) => [styles.action, pressed && styles.pressed, disabled && styles.disabled]}>
      <Ionicons name="camera-outline" size={17} color={COLORS.white} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

export function IdentityUploadCards({ktpPath, ktpUrl, avatarUrl, onKtpUploaded, onAvatarUploaded}: {
  ktpPath: string;
  ktpUrl: string;
  avatarUrl: string;
  onKtpUploaded: (result: {path: string; url: string; extracted: KtpExtractedData}) => void;
  onAvatarUploaded: (result: {path: string; url: string}) => void;
}) {
  const {width} = useWindowDimensions();
  const compact = width < 390;
  const [uploading, setUploading] = useState<UploadTarget | null>(null);
  const [sourceTarget, setSourceTarget] = useState<UploadTarget | null>(null);
  const [ktpFeedback, setKtpFeedback] = useState('');
  const [overlay, setOverlay] = useState<ActionOverlay | null>(null);

  const selectImage = async (target: UploadTarget, source: 'camera' | 'library') => {
    try {
      if (source === 'camera' && Platform.OS !== 'web') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setOverlay({kind: 'error', title: 'Izin Kamera Diperlukan', message: 'Aktifkan izin kamera pada pengaturan perangkat untuk mengambil foto langsung.'});
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: target === 'avatar',
        aspect: target === 'avatar' ? [1, 1] : undefined,
        quality: target === 'ktp' ? 0.75 : 0.7,
      };
      const result = source === 'camera' && Platform.OS !== 'web'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled) return;
      const asset = result.assets[0];
      const limit = target === 'ktp' ? KTP_MAX_SIZE : AVATAR_MAX_SIZE;
      if (asset.fileSize && asset.fileSize > limit) {
        setOverlay({kind: 'error', title: 'File Terlalu Besar', message: `Ukuran foto ${target === 'ktp' ? 'KTP maksimal 5 MB' : 'profil maksimal 2 MB'}.`});
        return;
      }
      const input = {uri: asset.uri, name: imageName(asset, target), mimeType: asset.mimeType || 'image/jpeg', file: asset.file ?? undefined};
      if (target === 'ktp') setKtpFeedback('');
      setUploading(target);
      setOverlay({kind: 'loading', message: target === 'ktp' ? 'Membaca dan memverifikasi data KTP...' : 'Mengunggah foto profil...'});
      if (target === 'ktp') {
        const uploaded = await onboardingApi.uploadKtp(input, ktpPath);
        onKtpUploaded(uploaded);
        setKtpFeedback('Data KTP berhasil dibaca. Silakan periksa dan edit data yang terisi.');
        setOverlay({kind: 'success', title: 'KTP Berhasil Dibaca', message: 'Data KTP sudah diisi otomatis. Periksa kembali dan edit bila diperlukan.'});
      } else {
        onAvatarUploaded(await onboardingApi.uploadAvatar(input));
        setOverlay({kind: 'success', title: 'Foto Profil Tersimpan', message: 'Foto profil berhasil diunggah.'});
      }
    } catch (error) {
      setOverlay({kind: 'error', title: target === 'ktp' ? 'OCR KTP Gagal' : 'Unggah Foto Gagal', message: toAppApiError(error).message});
    } finally {
      setUploading(null);
    }
  };

  const chooseFromGallery = () => {
    const target = sourceTarget;
    setSourceTarget(null);
    if (target) void selectImage(target, 'library');
  };

  return (
    <View testID="identity-upload-cards" style={styles.stack}>
      <View testID="ktp-upload-card" style={[styles.card, compact && styles.cardCompact]}>
        <View style={styles.header}>
          <View style={styles.headerIcon}><Ionicons name="document-text-outline" size={19} color={COLORS.white} /></View>
          <View style={styles.headerCopy}><Text style={styles.title}>Upload KTP</Text><Text style={styles.subtitle}>Isi data diri otomatis dari foto KTP</Text></View>
        </View>
        <Pressable
          accessibilityHint="Membuka pilihan galeri foto"
          accessibilityLabel={ktpPath ? 'Ganti foto KTP dari galeri' : 'Unggah foto KTP dari galeri'}
          accessibilityRole="button"
          disabled={Boolean(uploading)}
          onPress={() => setSourceTarget('ktp')}
          style={({pressed}) => [styles.dropZone, pressed && styles.pressed, Boolean(uploading) && styles.disabled]}
          testID="ktp-photo-trigger"
        >
          {uploading === 'ktp'
            ? <ActivityIndicator size="large" color="#8DBBFF" />
            : ktpUrl
              ? <Image source={{uri: ktpUrl}} resizeMode="contain" style={styles.ktpPreview} />
              : <View style={styles.identityIcon}><Ionicons name="card-outline" size={43} color="#8DBBFF" /></View>}
          <Text style={styles.dropTitle}>{ktpPath ? 'Foto KTP sudah terverifikasi' : 'Unggah atau ambil foto KTP Anda'}</Text>
          <Text style={styles.dropMeta}>JPG, PNG, atau WebP · maksimal 5 MB</Text>
        </Pressable>
        {ktpFeedback ? <View style={styles.successMessage}><Ionicons name="checkmark-circle" size={17} color="#34D399" /><Text style={styles.successText}>{ktpFeedback}</Text></View> : null}
        <View style={styles.singleAction}><CameraAction disabled={Boolean(uploading)} label={ktpPath ? 'Ambil Ulang Foto KTP' : 'Ambil Foto KTP'} onPress={() => void selectImage('ktp', 'camera')} /></View>
      </View>

      <View testID="profile-photo-card" style={[styles.card, compact && styles.cardCompact]}>
        <View style={styles.header}>
          <View style={styles.headerIcon}><Ionicons name="person" size={18} color={COLORS.white} /></View>
          <View style={styles.headerCopy}><Text style={styles.title}>Foto Profil</Text><Text style={styles.subtitle}>Foto profil akan digunakan pada profil Anda</Text></View>
        </View>
        <Pressable
          accessibilityHint="Membuka pilihan galeri foto"
          accessibilityLabel={avatarUrl ? 'Ganti foto profil dari galeri' : 'Unggah foto profil dari galeri'}
          accessibilityRole="button"
          disabled={Boolean(uploading)}
          onPress={() => setSourceTarget('avatar')}
          style={({pressed}) => [styles.avatar, pressed && styles.pressed, Boolean(uploading) && styles.disabled]}
          testID="avatar-photo-trigger"
        >
          {uploading === 'avatar'
            ? <ActivityIndicator size="large" color={COLORS.blue} />
            : avatarUrl
              ? <Image source={{uri: avatarUrl}} style={styles.avatarImage} />
              : <Ionicons name="person" size={54} color="#AAB8D1" />}
          {!uploading ? <View style={styles.editBadge}><Ionicons name="image-outline" size={15} color={COLORS.white} /></View> : null}
        </Pressable>
        <View style={styles.singleAction}><CameraAction disabled={Boolean(uploading)} label="Ambil Foto Profil" onPress={() => void selectImage('avatar', 'camera')} /></View>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setSourceTarget(null)}
        presentationStyle="overFullScreen"
        transparent
        visible={sourceTarget !== null}
      >
        <View style={styles.modalRoot}>
          <Pressable accessibilityLabel="Batal memilih foto" onPress={() => setSourceTarget(null)} style={StyleSheet.absoluteFill} />
          <View accessibilityViewIsModal style={styles.sourceModalCard} testID="photo-source-modal-card">
            <Text style={styles.sourceTitle}>{sourceTarget === 'ktp' ? 'Unggah Foto KTP' : 'Unggah Foto Profil'}</Text>
            <Pressable accessibilityRole="button" onPress={chooseFromGallery} style={({pressed}) => [styles.sourceOption, pressed && styles.pressed]}>
              <Ionicons name="images-outline" size={21} color="#087BFF" /><Text style={styles.sourceOptionText}>Galeri</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => setSourceTarget(null)} style={({pressed}) => [styles.cancelOption, pressed && styles.pressed]}>
              <Text style={styles.cancelText}>Batal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {overlay ? <ActionOverlayModal overlay={overlay} onClose={() => setOverlay(null)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {width: '100%', maxWidth: 620, alignSelf: 'center', gap: 16},
  card: {width: '100%', backgroundColor: COLORS.card, borderRadius: 24, padding: 18},
  cardCompact: {borderRadius: 20, padding: 14},
  header: {flexDirection: 'row', alignItems: 'center', gap: 11},
  headerIcon: {width: 34, height: 34, borderRadius: 10, backgroundColor: '#1766D8', alignItems: 'center', justifyContent: 'center'},
  headerCopy: {flex: 1, minWidth: 0},
  title: {fontFamily: 'PlusJakartaSans_600SemiBold', color: COLORS.white, fontSize: 15, lineHeight: 21},
  subtitle: {fontFamily: 'PlusJakartaSans_400Regular', color: COLORS.muted, fontSize: 10, lineHeight: 15},
  dropZone: {minHeight: 152, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#2F7FFF', borderRadius: 12, marginTop: 16, alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'hidden'},
  identityIcon: {width: 72, height: 54, borderRadius: 9, backgroundColor: '#D6E5FF', alignItems: 'center', justifyContent: 'center', marginBottom: 10},
  ktpPreview: {width: '100%', height: 92, marginBottom: 8},
  dropTitle: {fontFamily: 'PlusJakartaSans_500Medium', color: COLORS.white, fontSize: 11, lineHeight: 17, textAlign: 'center'},
  dropMeta: {fontFamily: 'PlusJakartaSans_400Regular', color: COLORS.muted, fontSize: 9, lineHeight: 14, textAlign: 'center'},
  singleAction: {marginTop: 10},
  action: {minHeight: 44, borderRadius: 9, backgroundColor: COLORS.blue, borderWidth: 1, borderColor: COLORS.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 12},
  actionText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: COLORS.white, fontSize: 11},
  pressed: {opacity: 0.82},
  disabled: {opacity: 0.55},
  avatar: {width: 96, height: 96, borderRadius: 48, alignSelf: 'center', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginVertical: 17},
  avatarImage: {width: '100%', height: '100%', borderRadius: 48},
  editBadge: {position: 'absolute', right: 1, bottom: 1, width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.blue, borderWidth: 2, borderColor: COLORS.white, alignItems: 'center', justifyContent: 'center'},
  successMessage: {marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: '#073B45', flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  successText: {flex: 1, fontFamily: 'PlusJakartaSans_400Regular', color: '#B9F6DE', fontSize: 10, lineHeight: 15},
  modalRoot: {flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 20},
  sourceModalCard: {width: '100%', maxWidth: 420, alignSelf: 'center', backgroundColor: COLORS.white, borderRadius: 22, padding: 20, gap: 12},
  sourceTitle: {fontFamily: 'PlusJakartaSans_600SemiBold', color: '#101828', fontSize: 17, marginBottom: 2, textAlign: 'center'},
  sourceOption: {minHeight: 52, borderRadius: 12, backgroundColor: '#EDF5FF', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12},
  sourceOptionText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0A58C7', fontSize: 14},
  cancelOption: {minHeight: 50, borderRadius: 12, borderWidth: 1, borderColor: '#D8DEE9', alignItems: 'center', justifyContent: 'center'},
  cancelText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: '#344054', fontSize: 14},
});
