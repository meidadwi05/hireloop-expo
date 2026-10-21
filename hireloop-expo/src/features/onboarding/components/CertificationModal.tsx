import {Ionicons} from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, {useState} from 'react';
import {KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {onboardingApi} from '../api/onboarding.api';
import type {CertificationDraft} from '../onboarding.types';
import {CheckboxField, DateField, TextField} from './FormControls';

const MAX_FILE_SIZE = 2 * 1024 * 1024;

function emptyCertification(): CertificationDraft {
  return {id: `certification-${Date.now()}`, name: '', issuer: '', issuedDate: '', expiredDate: '', noExpiry: false, credentialId: ''};
}

export function CertificationModal({visible, initialValue, onCancel, onSave}: {
  visible: boolean;
  initialValue: CertificationDraft | null;
  onCancel: () => void;
  onSave: (certification: CertificationDraft) => void;
}) {
  const [value, setValue] = useState<CertificationDraft>(() => initialValue ? {...initialValue} : emptyCertification());
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const update = <K extends keyof CertificationDraft>(field: K, next: CertificationDraft[K]) => {
    setValue(current => ({...current, [field]: next}));
    setError('');
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.size && asset.size > MAX_FILE_SIZE) {
      setError('Ukuran dokumen maksimal 2 MB.');
      return;
    }
    setFile(asset);
    setError('');
  };

  const save = async () => {
    if (!value.name.trim() || !value.issuer.trim() || !value.issuedDate) {
      setError('Nama sertifikat, penerbit, dan tanggal terbit wajib diisi.');
      return;
    }
    if (!value.noExpiry && value.expiredDate && value.expiredDate < value.issuedDate) {
      setError('Tanggal kedaluwarsa harus setelah tanggal terbit.');
      return;
    }
    if (!file && !value.remotePath) {
      setError('Pilih dokumen sertifikat (PDF, JPG, atau PNG).');
      return;
    }
    setUploading(true);
    try {
      let next = value;
      if (file) {
        const uploaded = await onboardingApi.uploadCertification({
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType ?? 'application/octet-stream',
          file: file.file ?? undefined,
        });
        next = {...value, remotePath: uploaded.path, originalName: uploaded.originalName, mimeType: uploaded.mimeType, fileSize: uploaded.fileSize ?? file.size};
      }
      onSave(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Dokumen gagal diunggah. Silakan coba lagi.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <SafeAreaView style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
          <View style={styles.card}>
            <View style={styles.header}>
              <View><Text style={styles.title}>{initialValue ? 'Edit Sertifikasi' : 'Tambah Sertifikasi'}</Text><Text style={styles.subtitle}>Tambahkan bukti sertifikasi Anda</Text></View>
              <Pressable accessibilityLabel="Tutup modal sertifikasi" onPress={onCancel} hitSlop={10}><Ionicons name="close" size={25} /></Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
              <TextField tone="light" label="Nama Sertifikat" required value={value.name} onChangeText={next => update('name', next)} placeholder="Contoh: Google Data Analytics" />
              <TextField tone="light" label="Penerbit" required value={value.issuer} onChangeText={next => update('issuer', next)} placeholder="Nama lembaga penerbit" />
              <DateField tone="light" label="Tanggal Terbit" required value={value.issuedDate} onChange={next => update('issuedDate', next)} />
              <DateField tone="light" label="Tanggal Kedaluwarsa" disabled={value.noExpiry} value={value.expiredDate} onChange={next => update('expiredDate', next)} />
              <CheckboxField tone="light" label="Tidak memiliki tanggal kedaluwarsa" checked={value.noExpiry} onChange={next => update('noExpiry', next)} />
              <TextField tone="light" label="ID Kredensial" value={value.credentialId} onChangeText={next => update('credentialId', next)} placeholder="Opsional" />
              <Pressable accessibilityRole="button" onPress={pickFile} style={styles.fileButton}>
                <Ionicons name="cloud-upload-outline" size={23} color="#087BFF" />
                <View style={styles.fileCopy}><Text style={styles.fileTitle}>{file?.name ?? value.originalName ?? 'Pilih dokumen'}</Text><Text style={styles.fileHint}>PDF, JPG, atau PNG · maksimal 2 MB</Text></View>
              </Pressable>
              {error ? <Text style={styles.error} accessibilityLiveRegion="assertive">{error}</Text> : null}
            </ScrollView>
            <View style={styles.actions}>
              <Pressable disabled={uploading} onPress={onCancel} style={styles.cancel}><Text style={styles.cancelText}>Batal</Text></Pressable>
              <Pressable disabled={uploading} onPress={save} style={[styles.save, uploading && styles.disabled]}><Text style={styles.saveText}>{uploading ? 'Mengunggah...' : initialValue ? 'Simpan' : 'Tambah'}</Text></Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(1,5,20,0.78)', justifyContent: 'center', padding: 20},
  keyboard: {maxHeight: '92%', width: '100%', maxWidth: 460, alignSelf: 'center'},
  card: {backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', maxHeight: '100%'},
  header: {paddingHorizontal: 24, paddingVertical: 22, borderBottomWidth: 1, borderBottomColor: '#E7E9ED', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
  title: {fontFamily: 'PlusJakartaSans_700Bold', fontSize: 23, color: '#111'},
  subtitle: {fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: '#555', marginTop: 5},
  content: {padding: 24},
  fileButton: {minHeight: 72, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#80AEFF', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14},
  fileCopy: {flex: 1},
  fileTitle: {fontFamily: 'PlusJakartaSans_600SemiBold', color: '#172036', fontSize: 13},
  fileHint: {fontFamily: 'PlusJakartaSans_400Regular', color: '#687386', fontSize: 10, marginTop: 3},
  error: {fontFamily: 'PlusJakartaSans_400Regular', color: '#D91E2B', fontSize: 11, marginTop: 10},
  actions: {flexDirection: 'row', gap: 18, paddingHorizontal: 24, paddingBottom: 24},
  cancel: {flex: 1, height: 50, borderRadius: 10, borderWidth: 1, borderColor: '#AEB4BE', alignItems: 'center', justifyContent: 'center'},
  cancelText: {fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14},
  save: {flex: 1, height: 50, borderRadius: 10, backgroundColor: '#087BFF', alignItems: 'center', justifyContent: 'center'},
  saveText: {fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: 'white'},
  disabled: {opacity: 0.55},
});
