import Ionicons from '@expo/vector-icons/Ionicons';
import React, {useMemo, useState} from 'react';
import {Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {toAppApiError} from '../../../core/api/api-error';
import {DateField} from '../../onboarding/components/DateField';
import {CheckboxField, SelectField, TextField} from '../../onboarding/components/FormControls';
import {employmentStatusOptions, workSystemOptions} from '../../onboarding/onboarding.options';
import {profileApi} from '../api/profile.api';
import {useExperiences, useProfileMutation} from '../hooks/use-profile';
import type {ExperienceInput, ProfileExperience, WorkSetting, WorkType} from '../profile.types';
import {PrimaryButton, ProfileCard, ProfileHeader, ProfilePage, ScreenState, profileColors, profileFonts} from '../components/profile-ui';

type Draft = {
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  workSetting: WorkSetting;
  workType: WorkType;
  description: string;
};

const emptyDraft = (): Draft => ({
  position: '', company: '', startDate: '', endDate: '', current: false,
  workSetting: 'on_site', workType: 'full_time', description: '',
});
const CURRENT_TIMESTAMP = Date.now();

function monthYear(value: string | null) {
  if (!value) return '';
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat('id-ID', {month: 'short', year: 'numeric'}).format(parsed);
}

function ExperienceForm({item, visible, onClose}: {item: ProfileExperience | null; visible: boolean; onClose: () => void}) {
  const [draft, setDraft] = useState<Draft>(() => item ? {
    position: item.position,
    company: item.companyName,
    startDate: item.startDate,
    endDate: item.endDate ?? '',
    current: item.isCurrent,
    workSetting: item.workSetting,
    workType: item.workType,
    description: item.description,
  } : emptyDraft());
  const [error, setError] = useState('');
  const mutation = useProfileMutation(
    (payload: ExperienceInput) => item ? profileApi.updateExperience(item.id, payload) : profileApi.createExperience(payload),
    {refreshExperiences: true},
  );

  const save = async () => {
    if (!draft.position.trim() || !draft.company.trim() || !draft.startDate) {
      setError('Posisi, perusahaan, dan tanggal mulai wajib diisi.');
      return;
    }
    if (!draft.current && draft.endDate && draft.endDate < draft.startDate) {
      setError('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.');
      return;
    }
    const position = draft.position.trim();
    try {
      setError('');
      await mutation.mutateAsync({
        experience_list_id: item?.experienceListId ?? null,
        position,
        posisi: position,
        company_name: draft.company.trim(),
        start_date: draft.startDate,
        end_date: draft.current ? null : draft.endDate || null,
        is_current: draft.current,
        description: draft.description.trim() || null,
        job_type_expected: draft.workSetting,
        work_type: draft.workType,
        skill_ids: [],
      });
      onClose();
      Alert.alert('Berhasil', item ? 'Pengalaman berhasil diperbarui.' : 'Pengalaman berhasil ditambahkan.');
    } catch (cause) {
      setError(toAppApiError(cause).message);
    }
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={() => !mutation.isPending && onClose()}>
      <SafeAreaView style={styles.modalSafe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeading}><Text style={styles.modalTitle}>{item ? 'Ubah Pengalaman' : 'Tambah Pengalaman'}</Text><Text style={styles.modalSubtitle}>Lengkapi riwayat pekerjaanmu</Text></View>
            <Pressable accessibilityLabel="Tutup form pengalaman" disabled={mutation.isPending} onPress={onClose} style={styles.closeButton}><Ionicons name="close" size={25} color={profileColors.ink} /></Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.formContent}>
            <TextField tone="light" required label="Posisi Pekerjaan" value={draft.position} onChangeText={value => setDraft(current => ({...current, position: value}))} placeholder="Contoh: Product Designer" />
            <TextField tone="light" required label="Nama Perusahaan" value={draft.company} onChangeText={value => setDraft(current => ({...current, company: value}))} placeholder="Nama perusahaan" />
            <DateField tone="light" presentation="inline" required label="Tanggal Mulai" value={draft.startDate} onChange={value => setDraft(current => ({...current, startDate: value}))} maximumDate={new Date()} />
            <DateField tone="light" presentation="inline" required={!draft.current} disabled={draft.current} label="Tanggal Selesai" value={draft.endDate} onChange={value => setDraft(current => ({...current, endDate: value}))} minimumDate={draft.startDate ? new Date(`${draft.startDate}T00:00:00`) : undefined} />
            <CheckboxField tone="light" label="Saya masih bekerja di sini" checked={draft.current} onChange={value => setDraft(current => ({...current, current: value, endDate: value ? '' : current.endDate}))} />
            <SelectField tone="light" presentation="inline" required label="Sistem Kerja" value={draft.workSetting} onChange={value => setDraft(current => ({...current, workSetting: value as WorkSetting}))} options={workSystemOptions} placeholder="Pilih sistem kerja" />
            <SelectField tone="light" presentation="inline" required label="Status Pekerjaan" value={draft.workType} onChange={value => setDraft(current => ({...current, workType: value as WorkType}))} options={employmentStatusOptions} placeholder="Pilih status pekerjaan" />
            <TextField tone="light" multiline label="Deskripsi Pekerjaan" value={draft.description} onChangeText={value => setDraft(current => ({...current, description: value}))} placeholder="Jelaskan tanggung jawab atau pencapaian" maxLength={1000} />
            {error ? <View style={styles.errorBox}><Ionicons name="alert-circle-outline" size={19} color="#B42318" /><Text style={styles.errorText}>{error}</Text></View> : null}
            <PrimaryButton disabled={mutation.isPending} label={mutation.isPending ? 'Menyimpan...' : 'Simpan Pengalaman'} onPress={() => void save()} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

export function ExperienceScreen() {
  const query = useExperiences();
  const [selected, setSelected] = useState<ProfileExperience | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const removeMutation = useProfileMutation(profileApi.deleteExperience, {refreshExperiences: true});
  const experiences = useMemo(() => query.data ?? [], [query.data]);

  const totalYears = useMemo(() => experiences.reduce((months, item) => {
    const start = Date.parse(item.startDate);
    const end = item.isCurrent ? CURRENT_TIMESTAMP : Date.parse(item.endDate ?? item.startDate);
    return months + (Number.isNaN(start) || Number.isNaN(end) ? 0 : Math.max(0, (end - start) / 2_629_800_000));
  }, 0) / 12, [experiences]);

  const openForm = (item: ProfileExperience | null) => { setSelected(item); setFormOpen(true); };
  const remove = (item: ProfileExperience) => Alert.alert('Hapus pengalaman?', `${item.position} di ${item.companyName} akan dihapus.`, [
    {text: 'Batal', style: 'cancel'},
    {text: 'Hapus', style: 'destructive', onPress: async () => {
      try { await removeMutation.mutateAsync(item.id); } catch (cause) { Alert.alert('Gagal menghapus', toAppApiError(cause).message); }
    }},
  ]);

  return (
    <View style={styles.screen}>
      <ProfileHeader title="Pengalaman Kerja" rightIcon="add" rightLabel="Tambah" onRightPress={() => openForm(null)} fallback="/profile" />
      {query.isLoading || query.isError ? <ScreenState loading={query.isLoading} error={query.isError ? toAppApiError(query.error).message : undefined} onRetry={() => void query.refetch()} /> : (
        <ProfilePage>
          <ProfileCard style={styles.summary}>
            <View style={styles.summaryIcon}><Ionicons name="briefcase-outline" size={25} color={profileColors.blue} /></View>
            <View style={styles.summaryCopy}><Text style={styles.summaryValue}>{experiences.length} pengalaman</Text><Text style={styles.summaryText}>{totalYears > 0 ? `Sekitar ${totalYears.toFixed(1)} tahun pengalaman tercatat` : 'Tambahkan riwayat pekerjaan untuk melengkapi profil'}</Text></View>
          </ProfileCard>
          {experiences.length === 0 ? (
            <ProfileCard style={styles.empty}><Ionicons name="briefcase-outline" size={42} color="#98A2B3" /><Text style={styles.emptyTitle}>Belum ada pengalaman kerja</Text><Text style={styles.emptyText}>Riwayat pekerjaan membantu perusahaan memahami pengalamanmu.</Text><PrimaryButton label="Tambah Pengalaman" icon="add" onPress={() => openForm(null)} /></ProfileCard>
          ) : experiences.map((item, index) => (
            <ProfileCard key={item.id} style={styles.experienceCard}>
              <View style={styles.timeline}><View style={[styles.node, item.isCurrent && styles.nodeCurrent]} />{index < experiences.length - 1 ? <View style={styles.line} /> : null}</View>
              <View style={styles.cardCopy}>
                <View style={styles.cardTop}><View style={styles.cardHeading}><Text style={styles.position}>{item.position || 'Posisi belum diisi'}</Text><Text style={styles.company}>{item.companyName}</Text></View><View style={styles.actions}><Pressable accessibilityLabel={`Ubah ${item.position}`} onPress={() => openForm(item)} style={styles.action}><Ionicons name="pencil-outline" size={19} color={profileColors.blue} /></Pressable><Pressable accessibilityLabel={`Hapus ${item.position}`} onPress={() => remove(item)} style={[styles.action, styles.deleteAction]}><Ionicons name="trash-outline" size={19} color={profileColors.red} /></Pressable></View></View>
                <Text style={styles.dates}>{monthYear(item.startDate)} – {item.isCurrent ? 'Sekarang' : monthYear(item.endDate)}</Text>
                <View style={styles.badges}><Text style={styles.badge}>{workSystemOptions.find(option => option.value === item.workSetting)?.label}</Text><Text style={styles.badge}>{employmentStatusOptions.find(option => option.value === item.workType)?.label}</Text></View>
                {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
              </View>
            </ProfileCard>
          ))}
        </ProfilePage>
      )}
      {formOpen ? <ExperienceForm item={selected} visible onClose={() => setFormOpen(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: profileColors.background},
  modalSafe: {flex: 1, backgroundColor: profileColors.background},
  modalHeader: {minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: profileColors.border, backgroundColor: 'white'},
  modalHeading: {flex: 1, minWidth: 0}, modalTitle: {fontFamily: profileFonts.bold, fontSize: 18, color: profileColors.ink}, modalSubtitle: {fontFamily: profileFonts.regular, fontSize: 11, color: profileColors.muted, marginTop: 2},
  closeButton: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'}, formContent: {padding: 18, paddingBottom: 40},
  errorBox: {flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 10, backgroundColor: '#FEF3F2', padding: 12, marginBottom: 16}, errorText: {flex: 1, fontFamily: profileFonts.regular, fontSize: 11, lineHeight: 17, color: '#B42318'},
  summary: {flexDirection: 'row', alignItems: 'center', gap: 12}, summaryIcon: {width: 52, height: 52, borderRadius: 14, backgroundColor: '#EAF2FF', alignItems: 'center', justifyContent: 'center'}, summaryCopy: {flex: 1, minWidth: 0}, summaryValue: {fontFamily: profileFonts.bold, fontSize: 15, color: profileColors.ink}, summaryText: {fontFamily: profileFonts.regular, fontSize: 10.5, lineHeight: 16, color: profileColors.muted, marginTop: 3},
  empty: {alignItems: 'center', paddingVertical: 28}, emptyTitle: {fontFamily: profileFonts.bold, fontSize: 16, color: profileColors.ink, marginTop: 12}, emptyText: {fontFamily: profileFonts.regular, fontSize: 11, lineHeight: 17, color: profileColors.muted, textAlign: 'center', marginVertical: 7, marginBottom: 18},
  experienceCard: {flexDirection: 'row', paddingLeft: 12}, timeline: {width: 24, alignItems: 'center'}, node: {width: 12, height: 12, borderRadius: 6, backgroundColor: profileColors.blue, marginTop: 5, zIndex: 1}, nodeCurrent: {backgroundColor: profileColors.green}, line: {position: 'absolute', top: 16, bottom: -22, width: 2, backgroundColor: '#DCE5F2'}, cardCopy: {flex: 1, minWidth: 0, paddingLeft: 8}, cardTop: {flexDirection: 'row', alignItems: 'flex-start', gap: 8}, cardHeading: {flex: 1, minWidth: 0}, position: {fontFamily: profileFonts.bold, fontSize: 14, lineHeight: 19, color: profileColors.ink}, company: {fontFamily: profileFonts.medium, fontSize: 11.5, lineHeight: 17, color: '#475467', marginTop: 2}, actions: {flexDirection: 'row', gap: 5}, action: {width: 38, height: 38, borderRadius: 10, backgroundColor: '#EEF5FF', alignItems: 'center', justifyContent: 'center'}, deleteAction: {backgroundColor: '#FFF0F2'}, dates: {fontFamily: profileFonts.regular, fontSize: 10.5, color: profileColors.muted, marginTop: 6}, badges: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10}, badge: {fontFamily: profileFonts.medium, fontSize: 9.5, color: '#1B5FC8', backgroundColor: '#EEF5FF', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5}, description: {fontFamily: profileFonts.regular, fontSize: 11, lineHeight: 18, color: '#344054', marginTop: 11},
});
