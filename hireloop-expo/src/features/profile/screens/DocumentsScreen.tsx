import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import * as Linking from 'expo-linking';
import React, {useMemo, useState} from 'react';
import {
  Alert,
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

import {toAppApiError} from '../../../core/api/api-error';
import {profileApi} from '../api/profile.api';
import type {ProfileFileItem, UploadInput, UploadedProfileFile} from '../profile.types';
import {useProfileFiles, useProfileMutation} from '../hooks/use-profile';
import {
  PrimaryButton,
  ProfileCard,
  ProfileHeader,
  ProfilePage,
  ScreenState,
  profileColors,
  profileFonts,
} from '../components/profile-ui';

type Filter = 'all' | 'document' | 'certification';
type Draft = {
  type: 'document' | 'certification';
  name: string;
  issuer: string;
  issuedDate: string;
  expiredDate: string;
  credentialId: string;
};

const allowedMime = ['application/pdf', 'image/jpeg', 'image/png'];

function humanSize(value: number) {
  if (!value) return 'Ukuran tidak tersedia';
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null) {
  if (!value) return '';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}).format(date);
}

function resolveFileUrl(item: ProfileFileItem) {
  const direct = item.url || item.path;
  if (!direct) return null;
  if (/^https?:\/\//i.test(direct)) return direct;
  const server = process.env.EXPO_PUBLIC_API_URL?.replace(/\/api\/?$/, '');
  if (!server) return null;
  const normalized = direct.startsWith('/storage/') ? direct : `/storage/${direct.replace(/^\/?storage\//, '')}`;
  return `${server}${normalized}`;
}

async function openItem(item: ProfileFileItem) {
  if (item.type === 'certification' && Platform.OS === 'web') {
    const blob = await profileApi.getCertificationMedia(item.id, 0);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    return;
  }
  const url = resolveFileUrl(item);
  if (!url) throw new Error('URL file tidak tersedia.');
  await Linking.openURL(url);
}

function FileCard({item, onMenu}: {item: ProfileFileItem; onMenu: () => void}) {
  const certification = item.type === 'certification';
  const description = certification
    ? [item.issuer, item.issuedDate && formatDate(item.issuedDate), item.expiredDate ? `– ${formatDate(item.expiredDate)}` : 'Tanpa kedaluwarsa'].filter(Boolean).join(' · ')
    : [item.originalName, humanSize(item.size)].filter(Boolean).join(' · ');
  return (
    <ProfileCard>
      <View style={styles.fileHeader}>
        <View style={styles.fileIcon}><Ionicons name={certification ? 'ribbon-outline' : 'document-text-outline'} size={26} color="#7655E9" /></View>
        <View style={styles.fileCopy}>
          <Text numberOfLines={2} style={styles.fileName}>{item.name}</Text>
          <View style={[styles.typeBadge, certification && styles.certBadge]}><Text style={[styles.typeBadgeText, certification && styles.certBadgeText]}>{certification ? 'Sertifikasi' : 'Dokumen'}</Text></View>
        </View>
        <Pressable accessibilityLabel={`Aksi ${item.name}`} onPress={onMenu} hitSlop={9}><Ionicons name="ellipsis-vertical" size={22} color="#475467" /></Pressable>
      </View>
      <Text style={styles.fileDescription}>{description || 'Metadata belum tersedia'}</Text>
      {item.credentialId ? <Text style={styles.credential}>ID Kredensial: {item.credentialId}</Text> : null}
      {certification && item.originalName ? <View style={styles.mediaRow}><Ionicons name="document-outline" size={18} color="#7655E9" /><Text numberOfLines={1} style={styles.mediaName}>{item.originalName}</Text><Text style={styles.mediaSize}>{humanSize(item.size)}</Text></View> : null}
      <View style={styles.fileActions}>
        <Pressable onPress={() => void openItem(item).catch(error => Alert.alert('File tidak dapat dibuka', toAppApiError(error).message))} style={styles.outlineButton}><Ionicons name="eye-outline" size={18} color={profileColors.blue} /><Text style={styles.outlineText}>Lihat</Text></Pressable>
        <Pressable onPress={() => void openItem(item).catch(error => Alert.alert('File tidak dapat diunduh', toAppApiError(error).message))} style={styles.downloadButton}><Ionicons name="download-outline" size={18} color="white" /><Text style={styles.downloadText}>Unduh</Text></Pressable>
      </View>
    </ProfileCard>
  );
}

function FileFormModal({item, visible, onClose}: {item: ProfileFileItem | null; visible: boolean; onClose: () => void}) {
  const [draft, setDraft] = useState<Draft>(() => ({
    type: item?.type ?? 'document', name: item?.name ?? '', issuer: item?.issuer ?? '',
    issuedDate: item?.issuedDate ?? '', expiredDate: item?.expiredDate ?? '', credentialId: item?.credentialId ?? '',
  }));
  const [picked, setPicked] = useState<UploadInput | null>(null);
  const saveMutation = useProfileMutation(async (_: void) => {
    let uploaded: UploadedProfileFile | null = null;
    try {
      if (picked) uploaded = await profileApi.uploadProfileFile(picked);
      const source = uploaded ?? item?.media[0] ?? (item?.path ? {type: 'file' as const, path: item.path, originalName: item.originalName, mimeType: item.mimeType, size: item.size} : null);
      if (!source) throw new Error('Pilih file yang akan disimpan.');
      if (draft.type === 'document') {
        const payload = {name: draft.name.trim(), file_path: source.path, original_name: source.originalName, mime_type: source.mimeType, file_size: source.size, source: 'profile' as const};
        if (item?.type === 'document') await profileApi.updateDocument(item.id, payload);
        else await profileApi.createDocument(payload);
      } else {
        const payload = {name: draft.name.trim(), issuer: draft.issuer.trim(), issued_date: draft.issuedDate, expired_date: draft.expiredDate || null, credential_id: draft.credentialId.trim() || null, media: [{type: 'file' as const, path: source.path, original_name: source.originalName}]};
        if (item?.type === 'certification') await profileApi.updateCertification(item.id, payload);
        else await profileApi.createCertification(payload);
      }
    } catch (error) {
      if (uploaded) await profileApi.deleteUploadedFile(uploaded.path).catch(() => undefined);
      throw error;
    }
  }, {refreshFiles: true});

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft(current => ({...current, [key]: value}));
  const pick = async () => {
    const result = await DocumentPicker.getDocumentAsync({type: allowedMime, copyToCacheDirectory: true});
    if (result.canceled) return;
    const asset = result.assets[0];
    if ((asset.size ?? 0) > 2 * 1024 * 1024) return Alert.alert('File terlalu besar', 'Ukuran file maksimal 2 MB.');
    if (asset.mimeType && !allowedMime.includes(asset.mimeType)) return Alert.alert('Format tidak didukung', 'Gunakan PDF, JPG, JPEG, atau PNG.');
    setPicked({uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? 'application/octet-stream', size: asset.size, file: asset.file});
  };

  const save = async () => {
    if (!draft.name.trim()) return Alert.alert('Nama wajib diisi', 'Masukkan nama dokumen atau sertifikat.');
    if (draft.type === 'certification' && (!draft.issuer.trim() || !draft.issuedDate.trim())) return Alert.alert('Data sertifikat belum lengkap', 'Penerbit dan tanggal terbit wajib diisi.');
    try {
      await saveMutation.mutateAsync();
      onClose();
      Alert.alert('Berhasil', `${draft.type === 'document' ? 'Dokumen' : 'Sertifikat'} berhasil disimpan.`);
    } catch (error) {
      Alert.alert('Gagal menyimpan', toAppApiError(error).message);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}><Text style={styles.sheetTitle}>{item ? 'Ubah Berkas' : 'Tambah Berkas'}</Text><Pressable onPress={onClose}><Ionicons name="close" size={25} /></Pressable></View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
            <View style={styles.segmented}>{(['document', 'certification'] as const).map(type => <Pressable disabled={Boolean(item)} key={type} onPress={() => set('type', type)} style={[styles.segment, draft.type === type && styles.segmentActive]}><Text style={[styles.segmentText, draft.type === type && styles.segmentTextActive]}>{type === 'document' ? 'Dokumen' : 'Sertifikat'}</Text></Pressable>)}</View>
            <FormField label={draft.type === 'document' ? 'Nama Dokumen *' : 'Nama Sertifikat *'} value={draft.name} onChangeText={value => set('name', value)} />
            {draft.type === 'certification' ? <>
              <FormField label="Penerbit *" value={draft.issuer} onChangeText={value => set('issuer', value)} />
              <FormField label="Tanggal Terbit *" placeholder="yyyy-mm-dd" value={draft.issuedDate} onChangeText={value => set('issuedDate', value)} />
              <FormField label="Tanggal Kedaluwarsa" placeholder="yyyy-mm-dd" value={draft.expiredDate} onChangeText={value => set('expiredDate', value)} />
              <FormField label="ID Kredensial" value={draft.credentialId} onChangeText={value => set('credentialId', value)} />
            </> : null}
            <View style={styles.uploadBox}><Ionicons name="cloud-upload-outline" size={31} color={profileColors.blue} /><Text style={styles.uploadTitle}>{picked?.name || item?.originalName || 'Pilih file pendukung'}</Text><Text style={styles.uploadHint}>{picked ? humanSize(picked.size ?? 0) : 'PDF, JPG, JPEG, PNG · Maksimal 2 MB'}</Text><Pressable onPress={() => void pick()} style={styles.pickButton}><Text style={styles.pickText}>{picked || item?.path ? 'Ganti File' : 'Pilih File'}</Text></Pressable></View>
            <PrimaryButton disabled={saveMutation.isPending} label={saveMutation.isPending ? 'Mengunggah...' : 'Simpan Berkas'} onPress={() => void save()} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FormField({label, ...props}: React.ComponentProps<typeof TextInput> & {label: string}) {
  return <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>{label}</Text><TextInput {...props} placeholderTextColor="#98A2B3" style={styles.field} /></View>;
}

function ActionModal({item, visible, onClose, onEdit}: {item: ProfileFileItem | null; visible: boolean; onClose: () => void; onEdit: () => void}) {
  const remove = useProfileMutation(async () => {
    if (!item) return;
    if (item.type === 'document') await profileApi.deleteDocument(item.id);
    else await profileApi.deleteCertification(item.id);
  }, {refreshFiles: true});
  const confirm = () => item && Alert.alert('Hapus berkas?', `${item.name} akan dihapus permanen.`, [
    {text: 'Batal', style: 'cancel'},
    {text: 'Hapus', style: 'destructive', onPress: async () => {
      try { await remove.mutateAsync(); onClose(); } catch (error) { Alert.alert('Gagal menghapus', toAppApiError(error).message); }
    }},
  ]);
  return <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}><Pressable onPress={onClose} style={styles.actionBackdrop}><Pressable style={styles.actionSheet}>
    <View style={styles.handle} /><Text style={styles.actionTitle}>Aksi Dokumen</Text>
    <Pressable onPress={onEdit} style={styles.actionRow}><Ionicons name="pencil-outline" size={21} color="#344054" /><Text style={styles.actionText}>Ubah Dokumen</Text></Pressable>
    <Pressable disabled={remove.isPending} onPress={confirm} style={styles.actionRow}><Ionicons name="trash-outline" size={21} color="#D92D20" /><Text style={styles.actionDelete}>{remove.isPending ? 'Menghapus...' : 'Hapus Dokumen'}</Text></Pressable>
  </Pressable></Pressable></Modal>;
}

export function DocumentsScreen() {
  const query = useProfileFiles();
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<ProfileFileItem | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const items = useMemo(() => (query.data ?? []).filter(item => filter === 'all' || item.type === filter), [filter, query.data]);

  const openMenu = (item: ProfileFileItem) => { setSelected(item); setActionOpen(true); };
  const add = () => { setSelected(null); setFormOpen(true); };
  const edit = () => { setActionOpen(false); setFormOpen(true); };

  return (
    <View style={styles.screen}>
      <ProfileHeader title="Dokumen & Sertifikat" />
      <ProfilePage>
        <Text style={styles.subtitle}>Kelola berkas pendukung lamaran.</Text>
        <PrimaryButton label="Tambah Dokumen" icon="add" onPress={add} />
        <View style={styles.filters}>{([['all', 'Semua'], ['document', 'Dokumen'], ['certification', 'Sertifikat']] as [Filter, string][]).map(([value, label]) => <Pressable key={value} onPress={() => setFilter(value)} style={[styles.filter, filter === value && styles.filterActive]}><Text style={[styles.filterText, filter === value && styles.filterTextActive]}>{label}</Text></Pressable>)}</View>
        {query.isLoading || query.isError ? <ScreenState loading={query.isLoading} error={query.isError ? toAppApiError(query.error).message : undefined} onRetry={() => void query.refetch()} /> : items.length === 0 ? <ScreenState empty={filter === 'all' ? 'Belum ada dokumen atau sertifikat.' : `Belum ada ${filter === 'document' ? 'dokumen' : 'sertifikat'}.`} /> : items.map(item => <FileCard key={item.key} item={item} onMenu={() => openMenu(item)} />)}
      </ProfilePage>
      <ActionModal item={selected} visible={actionOpen} onClose={() => setActionOpen(false)} onEdit={edit} />
      {formOpen ? <FileFormModal item={selected} visible onClose={() => setFormOpen(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: profileColors.background},
  subtitle: {fontFamily: profileFonts.regular, fontSize: 12, color: profileColors.muted},
  filters: {height: 48, flexDirection: 'row', borderRadius: 12, backgroundColor: '#EDF2F8', padding: 3},
  filter: {flex: 1, borderRadius: 9, alignItems: 'center', justifyContent: 'center'},
  filterActive: {backgroundColor: '#0B4DA5'},
  filterText: {fontFamily: profileFonts.semibold, fontSize: 11, color: '#475467'},
  filterTextActive: {color: 'white'},
  fileHeader: {flexDirection: 'row', alignItems: 'flex-start', gap: 11},
  fileIcon: {width: 47, height: 47, borderRadius: 12, backgroundColor: '#F0EBFF', alignItems: 'center', justifyContent: 'center'},
  fileCopy: {flex: 1, minWidth: 0, alignItems: 'flex-start'},
  fileName: {fontFamily: profileFonts.bold, fontSize: 14, lineHeight: 19, color: profileColors.ink},
  typeBadge: {marginTop: 5, borderRadius: 10, backgroundColor: '#EAF2FF', paddingHorizontal: 9, paddingVertical: 3},
  typeBadgeText: {fontFamily: profileFonts.semibold, fontSize: 9, color: profileColors.blue},
  certBadge: {backgroundColor: '#DFF8EA'},
  certBadgeText: {color: '#168457'},
  fileDescription: {fontFamily: profileFonts.regular, fontSize: 11, lineHeight: 17, color: profileColors.muted, marginTop: 11},
  credential: {fontFamily: profileFonts.regular, fontSize: 10, color: '#7B8493', marginTop: 4},
  mediaRow: {minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8},
  mediaName: {flex: 1, fontFamily: profileFonts.medium, fontSize: 10.5, color: '#344054'},
  mediaSize: {fontFamily: profileFonts.regular, fontSize: 9, color: '#7B8493'},
  fileActions: {flexDirection: 'row', gap: 10, marginTop: 13},
  outlineButton: {flex: 1, height: 43, borderRadius: 10, borderWidth: 1.5, borderColor: profileColors.blue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7},
  outlineText: {fontFamily: profileFonts.semibold, fontSize: 11, color: profileColors.blue},
  downloadButton: {flex: 1, height: 43, borderRadius: 10, backgroundColor: profileColors.blue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7},
  downloadText: {fontFamily: profileFonts.semibold, fontSize: 11, color: 'white'},
  modalBackdrop: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,20,55,0.55)'},
  sheet: {maxHeight: '92%', backgroundColor: 'white', borderTopLeftRadius: 22, borderTopRightRadius: 22, overflow: 'hidden'},
  sheetHeader: {height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: profileColors.border},
  sheetTitle: {fontFamily: profileFonts.bold, fontSize: 17, color: profileColors.ink},
  form: {padding: 18, gap: 14, paddingBottom: 30},
  segmented: {height: 44, flexDirection: 'row', borderRadius: 10, backgroundColor: '#EDF2F8', padding: 3},
  segment: {flex: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center'},
  segmentActive: {backgroundColor: profileColors.blue},
  segmentText: {fontFamily: profileFonts.semibold, fontSize: 11, color: '#475467'},
  segmentTextActive: {color: 'white'},
  fieldGroup: {gap: 7},
  fieldLabel: {fontFamily: profileFonts.semibold, fontSize: 12, color: profileColors.ink},
  field: {height: 48, borderWidth: 1.5, borderColor: '#D7DFEA', borderRadius: 11, paddingHorizontal: 12, fontFamily: profileFonts.regular, fontSize: 12, color: profileColors.ink},
  uploadBox: {minHeight: 155, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#72A8FF', borderRadius: 12, alignItems: 'center', justifyContent: 'center', padding: 15},
  uploadTitle: {fontFamily: profileFonts.semibold, fontSize: 11.5, color: profileColors.ink, marginTop: 6, textAlign: 'center'},
  uploadHint: {fontFamily: profileFonts.regular, fontSize: 9.5, color: profileColors.muted, marginTop: 3},
  pickButton: {minHeight: 36, borderRadius: 9, borderWidth: 1, borderColor: profileColors.blue, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', marginTop: 10},
  pickText: {fontFamily: profileFonts.semibold, fontSize: 10, color: profileColors.blue},
  actionBackdrop: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,20,55,0.45)'},
  actionSheet: {backgroundColor: 'white', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, paddingBottom: 32},
  handle: {width: 42, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 15},
  actionTitle: {fontFamily: profileFonts.bold, fontSize: 16, color: profileColors.ink, marginBottom: 9},
  actionRow: {minHeight: 53, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: profileColors.border},
  actionText: {fontFamily: profileFonts.medium, fontSize: 13, color: '#344054'},
  actionDelete: {fontFamily: profileFonts.medium, fontSize: 13, color: '#D92D20'},
});
