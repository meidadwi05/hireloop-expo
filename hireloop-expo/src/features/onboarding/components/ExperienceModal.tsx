import {Ionicons} from '@expo/vector-icons';
import React, {useState} from 'react';
import {KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {experienceSchema} from '../onboarding.schemas';
import type {ExperienceDraft, MasterOption} from '../onboarding.types';
import {DateField, isoToLocalDate} from './DateField';
import {CheckboxField, SelectField, TextField} from './FormControls';

const workSystems: MasterOption[] = [
  {value: 'onsite', label: 'On-site'}, {value: 'hybrid', label: 'Hybrid'}, {value: 'remote', label: 'Remote'},
];
const employmentStatuses: MasterOption[] = [
  {value: 'full_time', label: 'Penuh Waktu'}, {value: 'part_time', label: 'Paruh Waktu'}, {value: 'contract', label: 'Kontrak'},
  {value: 'internship', label: 'Magang'}, {value: 'freelance', label: 'Freelance'},
];

function emptyExperience(): ExperienceDraft {
  return {id: `experience-${Date.now()}`, experienceListId: null, position: '', companyName: '', startDate: '', endDate: '', current: false, workSystem: '', employmentStatus: '', location: '', description: ''};
}

export function ExperienceModal({visible, initialValue, onCancel, onSave}: {
  visible: boolean;
  initialValue: ExperienceDraft | null;
  onCancel: () => void;
  onSave: (experience: ExperienceDraft) => void;
}) {
  const [value, setValue] = useState<ExperienceDraft>(() => initialValue ? {...initialValue} : emptyExperience());
  const [errors, setErrors] = useState<Record<string, string>>({});
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
              <TextField tone="light" label="Posisi / Jabatan" required value={value.position} onChangeText={next => update('position', next)} placeholder="Contoh: UI/UX Designer" error={errors.position} />
              <SelectField tone="light" label="Tipe Pekerjaan" required value={value.employmentStatus} onChange={next => update('employmentStatus', next)} options={employmentStatuses} placeholder="Pilih tipe pekerjaan" error={errors.employmentStatus} />
              <SelectField tone="light" label="Sistem Kerja" required value={value.workSystem} onChange={next => update('workSystem', next)} options={workSystems} placeholder="Pilih sistem kerja" error={errors.workSystem} />
              <TextField tone="light" label="Lokasi Kerja" value={value.location} onChangeText={next => update('location', next)} placeholder="Contoh: Jakarta" />
              <DateField tone="light" label="Mulai Bekerja" required value={value.startDate} onChange={next => update('startDate', next)} maximumDate={new Date()} error={errors.startDate} />
              <DateField tone="light" label="Selesai Bekerja" required={!value.current} disabled={value.current} value={value.endDate} onChange={next => update('endDate', next)} minimumDate={isoToLocalDate(value.startDate) ?? undefined} maximumDate={new Date()} error={errors.endDate} />
              <CheckboxField tone="light" label="Masih bekerja di sini" checked={value.current} onChange={next => { update('current', next); if (next) update('endDate', ''); }} />
              <TextField tone="light" label="Deskripsi Pekerjaan" multiline value={value.description} onChangeText={next => update('description', next)} placeholder="Jelaskan tanggung jawab atau pencapaian Anda" />
            </ScrollView>
            <View style={styles.actions}>
              <Pressable onPress={onCancel} style={styles.cancel}><Text style={styles.cancelText}>Batal</Text></Pressable>
              <Pressable onPress={save} style={styles.save}><Text style={styles.saveText}>{initialValue ? 'Simpan' : 'Tambah'}</Text></Pressable>
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
  save: {flex: 1, height: 50, borderRadius: 10, backgroundColor: '#087BFF', alignItems: 'center', justifyContent: 'center'},
  saveText: {fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: 'white'},
});
