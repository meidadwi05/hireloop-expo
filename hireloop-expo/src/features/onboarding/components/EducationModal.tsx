import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import React, {useState} from 'react';
import {ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {educationSchema} from '../onboarding.schemas';
import {educationLevelOptions, isNoFormalEducation} from '../onboarding.options';
import type {EducationDraft, MasterOption} from '../onboarding.types';
import {DateField, isoToLocalDate} from './DateField';
import {CheckboxField, FieldLabel, SelectField, TextField} from './FormControls';

function emptyEducation(): EducationDraft {
  return {id: `education-${Date.now()}`, educationLevel: '', schoolName: '', majorId: null, majorName: '', startDate: '', endDate: '', ongoing: false};
}

export function EducationModal({visible, initialValue, majorOptions, majorLoading, majorError, onRetryMajors, onCancel, onSave}: {
  visible: boolean;
  initialValue: EducationDraft | null;
  majorOptions: MasterOption[];
  majorLoading?: boolean;
  majorError?: boolean;
  onRetryMajors?: () => void;
  onCancel: () => void;
  onSave: (education: EducationDraft) => void;
}) {
  const [value, setValue] = useState<EducationDraft>(() => initialValue ? {...initialValue} : emptyEducation());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const customMajorValue = !value.majorId && value.majorName ? `custom:${value.majorName}` : '';
  const selectableMajorOptions = customMajorValue && !majorOptions.some(option => option.label === value.majorName)
    ? [{value: customMajorValue, label: value.majorName}, ...majorOptions]
    : majorOptions;

  const update = <K extends keyof EducationDraft>(field: K, next: EducationDraft[K]) => {
    setValue(current => ({...current, [field]: next}));
    setErrors(current => ({...current, [field]: ''}));
  };
  const updateLevel = (next: string) => {
    if (isNoFormalEducation(next)) {
      setValue(current => ({...current, educationLevel: next, schoolName: '', majorId: null, majorName: '', startDate: '', endDate: '', ongoing: false}));
      setErrors({});
      return;
    }
    update('educationLevel', next);
  };
  const noFormalEducation = isNoFormalEducation(value.educationLevel);
  const updateMajor = (next: string) => {
    const option = selectableMajorOptions.find(item => item.value === next);
    setValue(current => ({
      ...current,
      majorId: next.startsWith('custom:') ? null : Number.isFinite(Number(next)) ? Number(next) : null,
      majorName: option?.label ?? '',
    }));
    setErrors(current => ({...current, majorId: '', majorName: ''}));
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
    <Modal visible={visible} transparent animationType="fade" presentationStyle="overFullScreen" onRequestClose={onCancel}>
      <SafeAreaView style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
          <View style={styles.card} testID="education-modal-card">
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.title}>{initialValue ? 'Edit Pendidikan' : 'Tambah Pendidikan'}</Text>
                <Text style={styles.subtitle}>Lengkapi informasi pendidikan Anda</Text>
              </View>
              <Pressable accessibilityLabel="Tutup modal pendidikan" onPress={onCancel} hitSlop={10}><Ionicons name="close" size={25} /></Pressable>
            </View>
            <ScrollView style={styles.body} nestedScrollEnabled keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
              <SelectField presentation="inline" tone="light" label="Tingkat Pendidikan" required value={value.educationLevel} onChange={updateLevel} options={educationLevelOptions} placeholder="Pilih tingkat pendidikan" error={errors.educationLevel} />
              <TextField disabled={noFormalEducation} tone="light" label="Nama Sekolah / Universitas / Instansi (Opsional)" value={value.schoolName} onChangeText={next => update('schoolName', next)} placeholder={noFormalEducation ? 'Tidak diperlukan' : 'Nama institusi'} error={errors.schoolName} />
              {!noFormalEducation && majorLoading ? (
                <View style={styles.masterGroup}>
                  <FieldLabel label="Jurusan (Opsional)" tone="light" />
                  <View style={styles.masterState}><ActivityIndicator color="#1268FF" /><Text style={styles.masterStateText}>Memuat jurusan...</Text></View>
                </View>
              ) : !noFormalEducation && majorError ? (
                <View style={styles.masterGroup}>
                  <FieldLabel label="Jurusan (Opsional)" tone="light" />
                  <View style={styles.masterError}>
                    <Text style={styles.masterErrorText}>Jurusan belum dapat dimuat.</Text>
                    <Pressable accessibilityRole="button" onPress={onRetryMajors} style={styles.retryButton}><Text style={styles.retryText}>Coba lagi</Text></Pressable>
                  </View>
                </View>
              ) : !noFormalEducation ? (
                <SelectField presentation="inline" tone="light" label="Jurusan (Opsional)" searchable value={value.majorId ? String(value.majorId) : customMajorValue} onChange={updateMajor} options={selectableMajorOptions} placeholder={majorOptions.length ? 'Pilih jurusan' : 'Jurusan belum tersedia'} error={errors.majorName} />
              ) : null}
              <DateField presentation="inline" tone="light" label="Mulai Pendidikan (Opsional)" disabled={noFormalEducation} value={value.startDate} onChange={next => update('startDate', next)} maximumDate={new Date()} error={errors.startDate} />
              <DateField presentation="inline" tone="light" label="Selesai Pendidikan (Opsional)" disabled={noFormalEducation || value.ongoing} value={value.endDate} onChange={next => update('endDate', next)} minimumDate={isoToLocalDate(value.startDate) ?? undefined} maximumDate={new Date()} error={errors.endDate} />
              {!noFormalEducation ? <CheckboxField tone="light" label="Sedang berlangsung" checked={value.ongoing} onChange={next => { update('ongoing', next); if (next) update('endDate', ''); }} /> : null}
            </ScrollView>
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" onPress={onCancel} style={styles.cancel}><Text style={styles.cancelText}>Batal</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={save} style={styles.save}><LinearGradient colors={['#0B5CFF', '#00D8F4']} end={{x: 1, y: 0}} start={{x: 0, y: 0}} style={styles.saveGradient}><Text style={styles.saveText}>{initialValue ? 'Simpan' : 'Tambah'}</Text></LinearGradient></Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(1,5,20,0.78)', justifyContent: 'center', padding: 12},
  keyboard: {flex: 1, width: '100%', maxWidth: 460, alignSelf: 'center', justifyContent: 'center'},
  card: {backgroundColor: 'white', borderRadius: 22, overflow: 'hidden', height: '92%', maxHeight: 720, width: '100%'},
  header: {paddingHorizontal: 18, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#E7E9ED', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
  headerCopy: {flex: 1, paddingRight: 14},
  title: {fontFamily: 'PlusJakartaSans_700Bold', fontSize: 21, color: '#111'},
  subtitle: {fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: '#555', marginTop: 5},
  body: {flex: 1},
  content: {padding: 18, paddingBottom: 28},
  masterGroup: {gap: 8, marginBottom: 20},
  masterState: {minHeight: 54, borderRadius: 11, borderWidth: 2, borderColor: '#E0E5EC', backgroundColor: '#F7F9FC', paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10},
  masterStateText: {fontFamily: 'PlusJakartaSans_400Regular', color: '#667085', fontSize: 13},
  masterError: {minHeight: 62, borderRadius: 11, borderWidth: 1, borderColor: '#F2A5AC', backgroundColor: '#FFF4F5', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10},
  masterErrorText: {flex: 1, fontFamily: 'PlusJakartaSans_400Regular', color: '#A72B39', fontSize: 12},
  retryButton: {minHeight: 40, paddingHorizontal: 12, borderRadius: 9, backgroundColor: '#1268FF', alignItems: 'center', justifyContent: 'center'},
  retryText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: 'white', fontSize: 12},
  actions: {flexDirection: 'row', gap: 12, paddingHorizontal: 18, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#E7E9ED', backgroundColor: 'white'},
  cancel: {flex: 1, height: 50, borderRadius: 10, borderWidth: 1, borderColor: '#AEB4BE', alignItems: 'center', justifyContent: 'center'},
  cancelText: {fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: '#111'},
  save: {flex: 1, height: 50, borderRadius: 10, overflow: 'hidden'},
  saveGradient: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  saveText: {fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: 'white'},
});
