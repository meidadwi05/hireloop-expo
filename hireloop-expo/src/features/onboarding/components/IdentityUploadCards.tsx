import {Ionicons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, {useState} from 'react';
import {ActivityIndicator, Alert, Image, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions} from 'react-native';

import {toAppApiError} from '../../../core/api/api-error';
import {onboardingApi, type KtpExtractedData} from '../api/onboarding.api';

const COLORS = {blue: '#087BFF', cyan: '#00D8F4', card: '#061D52', cardInner: '#08265F', muted: '#B7C2D9', white: '#FFFFFF'} as const;
const KTP_MAX_SIZE = 5 * 1024 * 1024;
const AVATAR_MAX_SIZE = 2 * 1024 * 1024;
type UploadTarget = 'ktp' | 'avatar';

function imageName(asset: ImagePicker.ImagePickerAsset, target: UploadTarget) {
  return asset.fileName || `${target}-${Date.now()}.${asset.mimeType === 'image/png' ? 'png' : 'jpg'}`;
}

function UploadAction({icon, label, primary, onPress, disabled}: {icon: React.ComponentProps<typeof Ionicons>['name']; label: string; primary?: boolean; onPress: () => void; disabled?: boolean}) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({pressed}) => [styles.action, primary ? styles.actionPrimary : styles.actionOutline, pressed && styles.pressed, disabled && styles.disabled]}>
    <Ionicons name={icon} size={17} color={COLORS.white} /><Text style={styles.actionText}>{label}</Text>
  </Pressable>;
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

  const selectImage = async (target: UploadTarget, source: 'camera' | 'library') => {
    try {
      if (source === 'camera' && Platform.OS !== 'web') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return Alert.alert('Izin kamera diperlukan', 'Aktifkan izin kamera untuk mengambil foto langsung.');
      }
      const options: ImagePicker.ImagePickerOptions = {mediaTypes: ['images'], allowsEditing: target === 'avatar', aspect: target === 'avatar' ? [1, 1] : undefined, quality: 0.85};
      const result = source === 'camera' && Platform.OS !== 'web' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled) return;
      const asset = result.assets[0];
      const limit = target === 'ktp' ? KTP_MAX_SIZE : AVATAR_MAX_SIZE;
      if (asset.fileSize && asset.fileSize > limit) return Alert.alert('File terlalu besar', `Ukuran foto ${target === 'ktp' ? 'KTP maksimal 5 MB' : 'profil maksimal 2 MB'}.`);
      const input = {uri: asset.uri, name: imageName(asset, target), mimeType: asset.mimeType || 'image/jpeg', file: asset.file ?? undefined};
      setUploading(target);
      if (target === 'ktp') onKtpUploaded(await onboardingApi.uploadKtp(input, ktpPath));
      else onAvatarUploaded(await onboardingApi.uploadAvatar(input));
    } catch (error) {
      Alert.alert('Gagal mengunggah foto', toAppApiError(error).message);
    } finally {
      setUploading(null);
    }
  };

  return (
    <View testID="identity-upload-cards" style={styles.stack}>
      <View testID="ktp-upload-card" style={[styles.card, compact && styles.cardCompact]}>
        <View style={styles.header}><View style={styles.headerIcon}><Ionicons name="document-text-outline" size={19} color={COLORS.white} /></View><View style={styles.headerCopy}><Text style={styles.title}>Upload KTP</Text><Text style={styles.subtitle}>Isi data diri otomatis dari foto KTP</Text></View></View>
        <View style={styles.dropZone}>
          {uploading === 'ktp' ? <ActivityIndicator size="large" color="#8DBBFF" /> : ktpUrl ? <Image source={{uri: ktpUrl}} resizeMode="contain" style={styles.ktpPreview} /> : <View style={styles.identityIcon}><Ionicons name="card-outline" size={43} color="#8DBBFF" /></View>}
          <Text style={styles.dropTitle}>{ktpPath ? 'Foto KTP sudah terverifikasi' : 'Unggah atau ambil foto KTP Anda'}</Text><Text style={styles.dropMeta}>JPG, PNG, atau WebP · maksimal 5 MB</Text>
        </View>
        <View style={styles.ktpActions}><UploadAction disabled={Boolean(uploading)} icon="camera-outline" label="Ambil Foto KTP" primary onPress={() => void selectImage('ktp', 'camera')} /><UploadAction disabled={Boolean(uploading)} icon="cloud-upload-outline" label={ktpPath ? 'Ganti Foto' : 'Unggah Foto'} onPress={() => void selectImage('ktp', 'library')} /></View>
      </View>

      <View testID="profile-photo-card" style={[styles.card, compact && styles.cardCompact]}>
        <View style={styles.header}><View style={styles.headerIcon}><Ionicons name="person" size={18} color={COLORS.white} /></View><View style={styles.headerCopy}><Text style={styles.title}>Foto Profil</Text><Text style={styles.subtitle}>Foto profil akan digunakan pada profil Anda</Text></View></View>
        <View style={styles.avatar}>{uploading === 'avatar' ? <ActivityIndicator size="large" color={COLORS.blue} /> : avatarUrl ? <Image source={{uri: avatarUrl}} style={styles.avatarImage} /> : <Ionicons name="person" size={54} color="#AAB8D1" />}</View>
        <View style={[styles.profileActions, compact && styles.profileActionsCompact]}><View style={styles.profileAction}><UploadAction disabled={Boolean(uploading)} icon="camera-outline" label="Ambil Foto" primary onPress={() => void selectImage('avatar', 'camera')} /></View><View style={styles.profileAction}><UploadAction disabled={Boolean(uploading)} icon="image-outline" label="Pilih dari Galeri" onPress={() => void selectImage('avatar', 'library')} /></View></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {width: '100%', maxWidth: 620, alignSelf: 'center', gap: 16}, card: {width: '100%', backgroundColor: COLORS.card, borderRadius: 24, padding: 18}, cardCompact: {borderRadius: 20, padding: 14},
  header: {flexDirection: 'row', alignItems: 'center', gap: 11}, headerIcon: {width: 34, height: 34, borderRadius: 10, backgroundColor: '#1766D8', alignItems: 'center', justifyContent: 'center'}, headerCopy: {flex: 1, minWidth: 0},
  title: {fontFamily: 'PlusJakartaSans_600SemiBold', color: COLORS.white, fontSize: 15, lineHeight: 21}, subtitle: {fontFamily: 'PlusJakartaSans_400Regular', color: COLORS.muted, fontSize: 10, lineHeight: 15},
  dropZone: {minHeight: 152, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#2F7FFF', borderRadius: 12, marginTop: 16, alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'hidden'}, identityIcon: {width: 72, height: 54, borderRadius: 9, backgroundColor: '#D6E5FF', alignItems: 'center', justifyContent: 'center', marginBottom: 10}, ktpPreview: {width: '100%', height: 92, marginBottom: 8},
  dropTitle: {fontFamily: 'PlusJakartaSans_500Medium', color: COLORS.white, fontSize: 11, lineHeight: 17, textAlign: 'center'}, dropMeta: {fontFamily: 'PlusJakartaSans_400Regular', color: COLORS.muted, fontSize: 9, lineHeight: 14, textAlign: 'center'}, ktpActions: {gap: 9, marginTop: 10},
  action: {minHeight: 44, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 12}, actionPrimary: {backgroundColor: COLORS.blue, borderWidth: 1, borderColor: COLORS.cyan}, actionOutline: {backgroundColor: COLORS.cardInner, borderWidth: 1.5, borderColor: '#2F7FFF'}, actionText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: COLORS.white, fontSize: 11}, pressed: {opacity: 0.82}, disabled: {opacity: 0.55},
  avatar: {width: 96, height: 96, borderRadius: 48, overflow: 'hidden', alignSelf: 'center', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginVertical: 17}, avatarImage: {width: '100%', height: '100%'}, profileActions: {flexDirection: 'row', gap: 10}, profileActionsCompact: {flexDirection: 'column'}, profileAction: {flex: 1, minWidth: 0},
});
