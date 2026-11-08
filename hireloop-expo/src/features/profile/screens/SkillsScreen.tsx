import Ionicons from '@expo/vector-icons/Ionicons';
import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {toAppApiError} from '../../../core/api/api-error';
import {profileApi} from '../api/profile.api';
import {useLanguages, useProfile, useProfileMutation, useSkillTools} from '../hooks/use-profile';
import type {ProfileLanguage, ProfileSkill, ProfileSkillTool} from '../profile.types';
import {PrimaryButton, ProfileCard, ProfileHeader, ProfilePage, ScreenState, profileColors, profileFonts} from '../components/profile-ui';

type EditorMode = 'skill' | 'tool' | 'language' | null;
type MasterItem = {id: number; name: string};
type DeleteRequest = {title: string; message: string; action: () => Promise<unknown>};

function EditorModal({mode, tool, existingLanguageIds, onClose}: {mode: EditorMode; tool: ProfileSkillTool | null; existingLanguageIds: number[]; onClose: () => void}) {
  const [value, setValue] = useState(() => mode === 'tool' ? tool?.name ?? '' : '');
  const [results, setResults] = useState<MasterItem[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState('');
  const skillMutation = useProfileMutation((payload: {skill_id: number} | {custom_name: string}) => profileApi.addSkill(payload));
  const toolMutation = useProfileMutation((name: string) => tool ? profileApi.updateSkillTool(tool.id, name) : profileApi.createSkillTool(name), {refreshTools: true});
  const languageMutation = useProfileMutation(profileApi.addLanguage, {refreshLanguages: true});
  const pending = skillMutation.isPending || toolMutation.isPending || languageMutation.isPending;

  useEffect(() => {
    if (mode !== 'skill' && mode !== 'language') return;
    let active = true;
    const timer = setTimeout(async () => {
      setLoadingResults(true);
      try {
        const items = mode === 'skill' ? await profileApi.listMasterSkills(value) : await profileApi.listMasterLanguages();
        if (active) setResults(items.filter(item => mode !== 'language' || (!existingLanguageIds.includes(item.id) && (!value.trim() || item.name.toLowerCase().includes(value.trim().toLowerCase())))).slice(0, 40));
      } catch (cause) {
        if (active) setError(toAppApiError(cause).message);
      } finally {
        if (active) setLoadingResults(false);
      }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [existingLanguageIds, mode, value]);

  const complete = (message: string) => { onClose(); Alert.alert('Berhasil', message); };
  const addSkill = async (item?: MasterItem) => {
    const custom = value.trim().replace(/\s+/g, ' ');
    if (!item && custom.length < 2) return setError('Masukkan minimal 2 karakter.');
    try { await skillMutation.mutateAsync(item ? {skill_id: item.id} : {custom_name: custom}); complete('Keahlian berhasil ditambahkan.'); } catch (cause) { setError(toAppApiError(cause).message); }
  };
  const saveTool = async () => {
    const name = value.trim().replace(/\s+/g, ' ');
    if (!name) return setError('Nama tool wajib diisi.');
    try { await toolMutation.mutateAsync(name); complete(tool ? 'Tool berhasil diperbarui.' : 'Tool berhasil ditambahkan.'); } catch (cause) { setError(toAppApiError(cause).message); }
  };
  const addLanguage = async (item: MasterItem) => {
    try { await languageMutation.mutateAsync(item.id); complete('Bahasa berhasil ditambahkan.'); } catch (cause) { setError(toAppApiError(cause).message); }
  };

  const title = mode === 'skill' ? 'Tambah Keahlian' : mode === 'language' ? 'Tambah Bahasa' : tool ? 'Ubah Tool' : 'Tambah Tool';
  return (
    <Modal animationType="slide" visible={Boolean(mode)} onRequestClose={() => !pending && onClose()}>
      <SafeAreaView style={styles.modalSafe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalSafe}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{title}</Text><Pressable accessibilityLabel="Tutup editor" onPress={onClose} style={styles.close}><Ionicons name="close" size={25} color={profileColors.ink} /></Pressable></View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalContent}>
            <Text style={styles.inputLabel}>{mode === 'language' ? 'Cari bahasa' : mode === 'skill' ? 'Cari atau tulis keahlian' : 'Nama tool'}</Text>
            <View style={styles.inputFrame}><Ionicons name="search-outline" size={20} color="#667085" /><TextInput autoFocus editable={!pending} value={value} onChangeText={setValue} style={styles.input} placeholder={mode === 'tool' ? 'Contoh: Figma' : 'Mulai mengetik...'} placeholderTextColor="#98A2B3" /></View>
            {error ? <View style={styles.errorBox}><Ionicons name="alert-circle-outline" size={18} color="#B42318" /><Text style={styles.errorText}>{error}</Text></View> : null}
            {mode === 'tool' ? <PrimaryButton disabled={pending} label={pending ? 'Menyimpan...' : 'Simpan Tool'} onPress={() => void saveTool()} /> : (
              <View style={styles.results}>
                {mode === 'skill' && value.trim().length >= 2 && !results.some(item => item.name.toLowerCase() === value.trim().toLowerCase()) ? <Pressable disabled={pending} onPress={() => void addSkill()} style={styles.resultRow}><View style={styles.addResultIcon}><Ionicons name="add" size={20} color="white" /></View><Text style={styles.resultText}>Tambahkan “{value.trim()}”</Text></Pressable> : null}
                {loadingResults ? <Text style={styles.resultEmpty}>Mencari data...</Text> : results.map(item => <Pressable disabled={pending} key={item.id} onPress={() => void (mode === 'skill' ? addSkill(item) : addLanguage(item))} style={styles.resultRow}><Text style={styles.resultText}>{item.name}</Text><Ionicons name="add-circle-outline" size={22} color={profileColors.blue} /></Pressable>)}
                {!loadingResults && results.length === 0 && (mode === 'language' || value.trim().length > 0) ? <Text style={styles.resultEmpty}>Data tidak ditemukan.</Text> : null}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function SectionHeader({icon, title, action}: {icon: React.ComponentProps<typeof Ionicons>['name']; title: string; action: () => void}) {
  return <View style={styles.sectionHeader}><Ionicons name={icon} size={22} color={profileColors.blue} /><Text style={styles.sectionTitle}>{title}</Text><Pressable accessibilityRole="button" onPress={action} style={styles.addButton}><Ionicons name="add" size={18} color={profileColors.blue} /><Text style={styles.addText}>Tambah</Text></Pressable></View>;
}

function DeleteConfirmationModal({request, pending, error, onCancel, onConfirm}: {request: DeleteRequest | null; pending: boolean; error: string; onCancel: () => void; onConfirm: () => void}) {
  return (
    <Modal animationType="fade" transparent visible={Boolean(request)} onRequestClose={() => !pending && onCancel()}>
      <Pressable accessibilityRole="button" onPress={() => !pending && onCancel()} style={styles.confirmBackdrop}>
        <Pressable accessibilityRole="none" onPress={() => undefined} style={styles.confirmCard}>
          <View style={styles.confirmIcon}><Ionicons name="trash-outline" size={28} color={profileColors.red} /></View>
          <Text style={styles.confirmTitle}>{request?.title}</Text>
          <Text style={styles.confirmMessage}>{request?.message}</Text>
          {error ? <Text style={styles.confirmError}>{error}</Text> : null}
          <View style={styles.confirmActions}>
            <Pressable accessibilityLabel="Batal hapus" disabled={pending} onPress={onCancel} style={styles.confirmCancel}><Text style={styles.confirmCancelText}>Batal</Text></Pressable>
            <Pressable accessibilityLabel="Konfirmasi hapus" disabled={pending} onPress={onConfirm} style={[styles.confirmDelete, pending && styles.confirmDisabled]}>
              {pending ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="trash-outline" size={18} color="white" />}
              <Text style={styles.confirmDeleteText}>{pending ? 'Menghapus...' : 'Hapus'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function SkillsScreen() {
  const profile = useProfile();
  const tools = useSkillTools();
  const languages = useLanguages();
  const [mode, setMode] = useState<EditorMode>(null);
  const [selectedTool, setSelectedTool] = useState<ProfileSkillTool | null>(null);
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const removeSkill = useProfileMutation(async (item: ProfileSkill) => {
    if (item.entryId) return profileApi.deleteSkillEntry(item.entryId);
    if (item.skillId) return profileApi.deleteDatasetSkill(item.skillId);
    throw new Error('ID keahlian tidak tersedia. Muat ulang profil lalu coba lagi.');
  });
  const removeTool = useProfileMutation(profileApi.deleteSkillTool, {refreshTools: true});
  const removeLanguage = useProfileMutation(profileApi.deleteLanguage, {refreshLanguages: true});
  const skills = profile.data?.skillItems ?? [];
  const toolItems = tools.data ?? [];
  const languageItems = useMemo(() => languages.data ?? [], [languages.data]);
  const loading = profile.isLoading || tools.isLoading || languages.isLoading;
  const error = profile.error ?? tools.error ?? languages.error;

  const removing = removeSkill.isPending || removeTool.isPending || removeLanguage.isPending;
  const requestDelete = (title: string, message: string, action: () => Promise<unknown>) => {
    setDeleteError('');
    setDeleteRequest({title, message, action});
  };
  const cancelDelete = () => {
    if (removing) return;
    setDeleteRequest(null);
    setDeleteError('');
  };
  const confirmDelete = async () => {
    if (!deleteRequest || removing) return;
    setDeleteError('');
    try {
      await deleteRequest.action();
      setDeleteRequest(null);
    } catch (cause) {
      setDeleteError(toAppApiError(cause).message);
    }
  };
  const openTool = (item: ProfileSkillTool | null) => { setSelectedTool(item); setMode('tool'); };
  const existingLanguageIds = useMemo(() => languageItems.map(item => item.id), [languageItems]);

  return (
    <View style={styles.screen}>
      <ProfileHeader title="Keahlian" fallback="/profile" />
      {loading || error ? <ScreenState loading={loading} error={error ? toAppApiError(error).message : undefined} onRetry={() => void Promise.all([profile.refetch(), tools.refetch(), languages.refetch()])} /> : (
        <ProfilePage>
          <ProfileCard>
            <SectionHeader icon="sparkles-outline" title="Keahlian" action={() => setMode('skill')} />
            <View style={styles.chips}>{skills.length ? skills.map((item: ProfileSkill) => <View key={`${item.source}:${item.entryId ?? item.skillId}:${item.name}`} style={styles.chip}><Text style={styles.chipText}>{item.name}</Text><Pressable accessibilityLabel={`Hapus ${item.name}`} onPress={() => requestDelete('Hapus keahlian?', `Keahlian ${item.name} akan dihapus.`, () => removeSkill.mutateAsync(item))} style={styles.chipAction}><Ionicons name="close" size={17} color="#B42318" /></Pressable></View>) : <Text style={styles.empty}>Belum ada keahlian ditambahkan.</Text>}</View>
          </ProfileCard>
          <ProfileCard>
            <SectionHeader icon="construct-outline" title="Tools" action={() => openTool(null)} />
            {toolItems.length ? toolItems.map((item: ProfileSkillTool, index) => <View key={item.id} style={[styles.listRow, index === toolItems.length - 1 && styles.listRowLast]}><View style={styles.listIcon}><Ionicons name="hammer-outline" size={20} color={profileColors.blue} /></View><Text style={styles.listText}>{item.name}</Text><Pressable accessibilityLabel={`Ubah ${item.name}`} onPress={() => openTool(item)} style={styles.rowAction}><Ionicons name="pencil-outline" size={19} color={profileColors.blue} /></Pressable><Pressable accessibilityLabel={`Hapus ${item.name}`} onPress={() => requestDelete('Hapus tool?', `Tool ${item.name} akan dihapus.`, () => removeTool.mutateAsync(item.id))} style={styles.rowAction}><Ionicons name="trash-outline" size={19} color={profileColors.red} /></Pressable></View>) : <Text style={styles.empty}>Belum ada tool ditambahkan.</Text>}
          </ProfileCard>
          <ProfileCard>
            <SectionHeader icon="language-outline" title="Bahasa" action={() => setMode('language')} />
            <View style={styles.chips}>{languageItems.length ? languageItems.map((item: ProfileLanguage) => <View key={item.id} style={[styles.chip, styles.languageChip]}><Text style={styles.chipText}>{item.name}</Text><Pressable accessibilityLabel={`Hapus bahasa ${item.name}`} onPress={() => requestDelete('Hapus bahasa?', `Bahasa ${item.name} akan dihapus.`, () => removeLanguage.mutateAsync(item.id))} style={styles.chipAction}><Ionicons name="close" size={17} color="#B42318" /></Pressable></View>) : <Text style={styles.empty}>Belum ada bahasa ditambahkan.</Text>}</View>
          </ProfileCard>
        </ProfilePage>
      )}
      {mode ? <EditorModal mode={mode} tool={selectedTool} existingLanguageIds={existingLanguageIds} onClose={() => {setMode(null); setSelectedTool(null);}} /> : null}
      <DeleteConfirmationModal request={deleteRequest} pending={removing} error={deleteError} onCancel={cancelDelete} onConfirm={() => void confirmDelete()} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: profileColors.background}, modalSafe: {flex: 1, backgroundColor: profileColors.background},
  modalHeader: {minHeight: 66, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: profileColors.border}, modalTitle: {flex: 1, fontFamily: profileFonts.bold, fontSize: 18, color: profileColors.ink}, close: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'}, modalContent: {padding: 18, paddingBottom: 40},
  inputLabel: {fontFamily: profileFonts.semibold, fontSize: 12, color: profileColors.ink, marginBottom: 8}, inputFrame: {minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 12, borderWidth: 1.5, borderColor: '#D7DFEA', backgroundColor: 'white', paddingHorizontal: 14}, input: {flex: 1, minWidth: 0, minHeight: 50, fontFamily: profileFonts.regular, fontSize: 13, color: profileColors.ink, outlineStyle: 'none' as never},
  errorBox: {flexDirection: 'row', gap: 8, borderRadius: 10, backgroundColor: '#FEF3F2', padding: 11, marginTop: 12}, errorText: {flex: 1, fontFamily: profileFonts.regular, fontSize: 11, color: '#B42318'}, results: {marginTop: 14, borderRadius: 13, borderWidth: 1, borderColor: profileColors.border, backgroundColor: 'white', overflow: 'hidden'}, resultRow: {minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: profileColors.border}, resultText: {flex: 1, minWidth: 0, fontFamily: profileFonts.medium, fontSize: 12, color: profileColors.ink}, addResultIcon: {width: 28, height: 28, borderRadius: 8, backgroundColor: profileColors.blue, alignItems: 'center', justifyContent: 'center'}, resultEmpty: {fontFamily: profileFonts.regular, fontSize: 11, color: profileColors.muted, textAlign: 'center', padding: 24},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', gap: 9, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: profileColors.border}, sectionTitle: {flex: 1, minWidth: 0, fontFamily: profileFonts.bold, fontSize: 15, color: profileColors.ink}, addButton: {minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6}, addText: {fontFamily: profileFonts.semibold, fontSize: 11, color: profileColors.blue},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 14}, chip: {minHeight: 38, maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 19, borderWidth: 1, borderColor: '#CFE0FF', backgroundColor: '#EEF5FF', paddingLeft: 12, paddingRight: 4}, languageChip: {backgroundColor: '#F1EDFF', borderColor: '#DCD2FF'}, chipText: {flexShrink: 1, fontFamily: profileFonts.medium, fontSize: 11, color: '#174EA6'}, chipAction: {width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center'}, empty: {width: '100%', fontFamily: profileFonts.regular, fontSize: 11, color: profileColors.muted, fontStyle: 'italic', paddingVertical: 18},
  listRow: {minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: profileColors.border}, listRowLast: {borderBottomWidth: 0}, listIcon: {width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF5FF', alignItems: 'center', justifyContent: 'center'}, listText: {flex: 1, minWidth: 0, fontFamily: profileFonts.medium, fontSize: 12, color: profileColors.ink}, rowAction: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  confirmBackdrop: {flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,20,55,0.55)', padding: 20},
  confirmCard: {width: '100%', maxWidth: 390, alignSelf: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: 'white', padding: 22},
  confirmIcon: {width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F2'},
  confirmTitle: {fontFamily: profileFonts.bold, fontSize: 18, color: profileColors.ink, textAlign: 'center', marginTop: 14},
  confirmMessage: {fontFamily: profileFonts.regular, fontSize: 12, lineHeight: 19, color: profileColors.muted, textAlign: 'center', marginTop: 7},
  confirmError: {width: '100%', borderRadius: 10, backgroundColor: '#FEF3F2', padding: 10, fontFamily: profileFonts.regular, fontSize: 11, lineHeight: 17, color: '#B42318', textAlign: 'center', marginTop: 12},
  confirmActions: {width: '100%', flexDirection: 'row', gap: 10, marginTop: 20},
  confirmCancel: {flex: 1, minHeight: 46, borderRadius: 11, borderWidth: 1.5, borderColor: '#CDD5DF', alignItems: 'center', justifyContent: 'center'},
  confirmCancelText: {fontFamily: profileFonts.semibold, fontSize: 12, color: '#344054'},
  confirmDelete: {flex: 1, minHeight: 46, borderRadius: 11, flexDirection: 'row', gap: 7, backgroundColor: profileColors.red, alignItems: 'center', justifyContent: 'center'},
  confirmDisabled: {opacity: 0.65},
  confirmDeleteText: {fontFamily: profileFonts.semibold, fontSize: 12, color: 'white'},
});
