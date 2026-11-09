import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import React, {useState} from 'react';
import {KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {experienceSchema} from '../onboarding.schemas';
import {employmentStatusOptions, normalizeEmploymentStatus, normalizeWorkSystem, workSystemOptions} from '../onboarding.options';
import type {ExperienceDraft, ExperienceOption, MasterOption} from '../onboarding.types';
import {DateField, isoToLocalDate} from './DateField';
import {CheckboxField, SelectField, TextField} from './FormControls';

function emptyExperience(): ExperienceDraft {
  return {id: `experience-${Date.now()}`, experienceListId: null, position: '', companyName: '', startDate: '', endDate: '', current: false, workSystem: '', employmentStatus: '', location: '', description: ''};
}

export function ExperienceModal({visible, initialValue, experienceOptions, experienceLoading, experienceError, onRetryExperiences, onCancel, onSave}: {
  visible: boolean;
  initialValue: ExperienceDraft | null;
  experienceOptions: ExperienceOption[];
  experienceLoading?: boolean;
  experienceError?: boolean;
  onRetryExperiences?: () => void;
  onCancel: () => void;
  onSave: (experience: ExperienceDraft) => void;
}) {
  const [value, setValue] = useState<ExperienceDraft>(() => initialValue ? {
    ...initialValue,
    workSystem: normalizeWorkSystem(initialValue.workSystem),
    employmentStatus: normalizeEmploymentStatus(initialValue.employmentStatus),
  } : emptyExperience());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const positionOptions: MasterOption[] = experienceOptions.map(option => ({
    value: String(option.id),
    label: option.similar?.length ? `${option.name} · ${option.similar.join(', ')}` : option.name,
  }));
  const update = <K extends keyof ExperienceDraft>(field: K, next: ExperienceDraft[K]) => {
    setValue(current => ({...current, [field]: next}));
    setErrors(current => ({...current, [field]: ''}));
  };
  const save = () => {
    const result = experienceSchema.safeParse(value);
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => { nextErrors[String(issue.path[0])] ??= issue.message; });
      setErrors(nextErrors);
      return;
    }
    onSave(result.data);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <SafeAreaView style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
          <View style={styles.card}>
            <View style={styles.header}>
              <View><Text style={styles.title}>{initialValue ? 'Edit Pengalaman' : 'Tambah Pengalaman'}</Text><Text style={styles.subtitle}>Lengkapi informasi pengalaman kerja Anda</Text></View>
              <Pressable accessibilityLabel="Tutup modal pengalaman" onPress={onCancel} hitSlop={10}><Ionicons name="close" size={25} /></Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
              <TextField tone="light" label="Nama Perusahaan" required value={value.companyName} onChangeText={next => update('companyName', next)} placeholder="Contoh: PT Inovasi Digital" error={errors.companyName} />
              {experienceLoading ? <Text style={styles.masterState}>Memuat daftar posisi...</Text> : null}
              {experienceError ? (
                <Pressable accessibilityRole="button" onPress={onRetryExperiences} style={styles.retryMaster}>
                  <Text style={styles.retryMasterText}>Daftar posisi gagal dimuat. Coba lagi</Text>
                </Pressable>
              ) : null}
              {positionOptions.length ? (
                <>
                  <SelectField
                    tone="light"
                    label="Posisi / Jabatan"
                    required
                    searchable
                    value={value.experienceListId ? String(value.experienceListId) : ''}
                    onChange={next => {
                      const selected = experienceOptions.find(option => option.id === Number(next));
                      update('experienceListId', selected?.id ?? null);
                      update('position', selected?.name ?? '');
                    }}
                    options={positionOptions}
                    placeholder="Pilih posisi dari daftar"
                    error={value.experienceListId ? errors.position : undefined}
                  />
                  <TextField
                    tone="light"
                    label="Posisi lain (opsional)"
                    value={value.experienceListId ? '' : value.position}
                    onChangeText={next => { update('experienceListId', null); update('position', next); }}
                    placeholder="Isi jika posisi tidak tersedia"
                    error={!value.experienceListId ? errors.position : undefined}
                  />
                </>
              ) : (
                <TextField tone="light" label="Posisi / Jabatan" required value={value.position} onChangeText={next => { update('experienceListId', null); update('position', next); }} placeholder="Contoh: UI/UX Designer" error={errors.position} />
              )}
              <SelectField tone="light" label="Tipe Pekerjaan" required value={value.employmentStatus} onChange={next => update('employmentStatus', normalizeEmploymentStatus(next))} options={employmentStatusOptions} placeholder="Pilih tipe pekerjaan" error={errors.employmentStatus} />
              <SelectField tone="light" label="Sistem Kerja" required value={value.workSystem} onChange={next => update('workSystem', normalizeWorkSystem(next))} options={workSystemOptions} placeholder="Pilih sistem kerja" error={errors.workSystem} />
              <TextField tone="light" label="Lokasi Kerja" value={value.location} onChangeText={next => update('location', next)} placeholder="Contoh: Jakarta" />
              <DateField tone="light" label="Mulai Bekerja" required value={value.startDate} onChange={next => update('startDate', next)} maximumDate={new Date()} error={errors.startDate} />
              <DateField tone="light" label="Selesai Bekerja" required={!value.current} disabled={value.current} value={value.endDate} onChange={next => update('endDate', next)} minimumDate={isoToLocalDate(value.startDate) ?? undefined} maximumDate={new Date()} error={errors.endDate} />
              <CheckboxField tone="light" label="Masih bekerja di sini" checked={value.current} onChange={next => { update('current', next); if (next) update('endDate', ''); }} />
              <TextField tone="light" label="Deskripsi Pekerjaan" multiline value={value.description} onChangeText={next => update('description', next)} placeholder="Jelaskan tanggung jawab atau pencapaian Anda" />
            </ScrollView>
            <View style={styles.actions}>
              <Pressable onPress={onCancel} style={styles.cancel}><Text style={styles.cancelText}>Batal</Text></Pressable>
              <Pressable onPress={save} style={styles.save}><LinearGradient colors={['#0B5CFF', '#00D8F4']} end={{x: 1, y: 0}} start={{x: 0, y: 0}} style={styles.saveGradient}><Text style={styles.saveText}>{initialValue ? 'Simpan' : 'Tambah'}</Text></LinearGradient></Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(1,5,20,0.78)', justifyContent: 'center', padding: 12},
  keyboard: {maxHeight: '92%', width: '100%', maxWidth: 460, alignSelf: 'center'},
  card: {backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', maxHeight: '100%'},
  header: {paddingHorizontal: 18, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#E7E9ED', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
  title: {fontFamily: 'PlusJakartaSans_700Bold', fontSize: 21, color: '#111'},
  subtitle: {fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: '#555', marginTop: 5},
  content: {padding: 18},
  actions: {flexDirection: 'row', gap: 12, paddingHorizontal: 18, paddingBottom: 18},
  cancel: {flex: 1, height: 50, borderRadius: 10, borderWidth: 1, borderColor: '#AEB4BE', alignItems: 'center', justifyContent: 'center'},
  cancelText: {fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14},
  save: {flex: 1, height: 50, borderRadius: 10, overflow: 'hidden'},
  saveGradient: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  saveText: {fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: 'white'},
  masterState: {fontFamily: 'PlusJakartaSans_400Regular', color: '#667085', fontSize: 12, marginBottom: 10},
  retryMaster: {minHeight: 42, borderRadius: 10, backgroundColor: '#FFF4F4', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, marginBottom: 12},
  retryMasterText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: '#D92D20', fontSize: 12},
});
