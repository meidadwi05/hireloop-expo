import {Ionicons} from '@expo/vector-icons';
import React, {useState} from 'react';
import {KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {educationSchema} from '../onboarding.schemas';
import type {EducationDraft, MasterOption} from '../onboarding.types';
import {CheckboxField, DateField, SelectField, TextField} from './FormControls';

const educationLevels: MasterOption[] = ['SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3']
  .map(value => ({value, label: value}));

function emptyEducation(): EducationDraft {
  return {id: `education-${Date.now()}`, educationLevel: '', schoolName: '', majorName: '', startDate: '', endDate: '', ongoing: false};
}

export function EducationModal({visible, initialValue, majorOptions, onCancel, onSave}: {
  visible: boolean;
  initialValue: EducationDraft | null;
  majorOptions: MasterOption[];
  onCancel: () => void;
  onSave: (education: EducationDraft) => void;
}) {
  const [value, setValue] = useState<EducationDraft>(() => initialValue ? {...initialValue} : emptyEducation());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof EducationDraft>(field: K, next: EducationDraft[K]) => {
    setValue(current => ({...current, [field]: next}));
    setErrors(current => ({...current, [field]: ''}));
  };

  const save = () => {
    const result = educationSchema.safeParse(value);
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => { nextErrors[String(issue.path[0])] ??= issue.message; });
      setErrors(nextErrors);
      return;
    }
    onSave(result.data);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <SafeAreaView style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
          <View style={styles.card}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>{initialValue ? 'Edit Pendidikan' : 'Tambah Pendidikan'}</Text>
                <Text style={styles.subtitle}>Lengkapi informasi pendidikan Anda</Text>
              </View>
              <Pressable accessibilityLabel="Tutup modal pendidikan" onPress={onCancel} hitSlop={10}><Ionicons name="close" size={25} /></Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
              <SelectField tone="light" label="Tingkat Pendidikan" required value={value.educationLevel} onChange={next => update('educationLevel', next)} options={educationLevels} placeholder="Pilih tingkat pendidikan" error={errors.educationLevel} />
              <TextField tone="light" label="Nama Sekolah / Universitas / Instansi" required value={value.schoolName} onChangeText={next => update('schoolName', next)} placeholder="Contoh: Universitas Indonesia" error={errors.schoolName} />
              <SelectField tone="light" label="Jurusan" required searchable value={value.majorName} onChange={next => update('majorName', next)} options={majorOptions} placeholder="Cari jurusan pendidikan terakhir" error={errors.majorName} />
              <DateField tone="light" label="Mulai Pendidikan" required value={value.startDate} onChange={next => update('startDate', next)} error={errors.startDate} />
              <DateField tone="light" label="Selesai Pendidikan" required={!value.ongoing} disabled={value.ongoing} value={value.endDate} onChange={next => update('endDate', next)} error={errors.endDate} />
              <CheckboxField tone="light" label="Sedang berlangsung" checked={value.ongoing} onChange={next => update('ongoing', next)} />
            </ScrollView>
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" onPress={onCancel} style={styles.cancel}><Text style={styles.cancelText}>Batal</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={save} style={styles.save}><Text style={styles.saveText}>{initialValue ? 'Simpan' : 'Tambah'}</Text></Pressable>
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
  title: {fontFamily: 'PlusJakartaSans_700Bold', fontSize: 24, color: '#111'},
  subtitle: {fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: '#555', marginTop: 5},
  content: {padding: 24},
  actions: {flexDirection: 'row', gap: 18, paddingHorizontal: 24, paddingBottom: 24},
  cancel: {flex: 1, height: 50, borderRadius: 10, borderWidth: 1, borderColor: '#AEB4BE', alignItems: 'center', justifyContent: 'center'},
  cancelText: {fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: '#111'},
  save: {flex: 1, height: 50, borderRadius: 10, backgroundColor: '#087BFF', alignItems: 'center', justifyContent: 'center'},
  saveText: {fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: 'white'},
});
