import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import React, {useMemo, useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, View, useWindowDimensions} from 'react-native';

import {calculateAge} from '../onboarding.schemas';
import type {EducationDraft, MasterOption, OnboardingAction, OnboardingDraft} from '../onboarding.types';
import {AddressFields} from './AddressFields';
import {EducationModal} from './EducationModal';
import {AddField, CheckboxField, DateField, SelectField, TextField} from './FormControls';

const genderOptions: MasterOption[] = [{value: 'male', label: 'Laki-laki'}, {value: 'female', label: 'Perempuan'}];
const maritalOptions: MasterOption[] = [{value: 'single', label: 'Belum Menikah'}, {value: 'married', label: 'Menikah'}, {value: 'other', label: 'Lainnya'}];

export function PersonalDataStep({draft, dispatch, majorOptions, onNext, onNotify}: {
  draft: OnboardingDraft;
  dispatch: React.Dispatch<OnboardingAction>;
  majorOptions: MasterOption[];
  onNext: () => void;
  onNotify: (status: 'success' | 'error', title: string, message: string) => void;
}) {
  const {width} = useWindowDimensions();
  const [educationOpen, setEducationOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<EducationDraft | null>(null);
  const age = useMemo(() => calculateAge(draft.birthDate), [draft.birthDate]);
  const setField = <K extends keyof OnboardingDraft>(field: K, value: OnboardingDraft[K]) => dispatch({type: 'set-field', field, value});

  const openEducation = (item: EducationDraft | null = null) => {
    setEditingEducation(item);
    setEducationOpen(true);
  };
  const saveEducation = (education: EducationDraft) => {
    dispatch({type: 'set-education', education});
    setEducationOpen(false);
    onNotify('success', 'Berhasil!', 'Data pendidikan berhasil disimpan ke profil.');
  };
  const removeEducation = (item: EducationDraft) => Alert.alert('Hapus pendidikan?', `${item.educationLevel} - ${item.schoolName}`, [
    {text: 'Batal', style: 'cancel'},
    {text: 'Hapus', style: 'destructive', onPress: () => dispatch({type: 'remove-education', id: item.id})},
  ]);

  return (
    <View style={styles.card}>
      <View style={styles.sectionTitle}><Ionicons name="person-outline" size={25} color="#2F7FFF" /><Text style={styles.sectionTitleText}>Informasi Pribadi</Text></View>
      <TextField label="Nama Lengkap" required value={draft.fullName} onChangeText={value => setField('fullName', value)} placeholder="Contoh: Andi Permana" />
      <SelectField label="Jenis Kelamin" required value={draft.gender} onChange={value => setField('gender', value as OnboardingDraft['gender'])} options={genderOptions} placeholder="Pilih jenis kelamin" />
      <View style={[styles.columns, width < 390 && styles.columnsNarrow]}>
        <View style={styles.column}><TextField label="Tempat Lahir" required value={draft.birthPlace} onChangeText={value => setField('birthPlace', value)} placeholder="Contoh: Jakarta" /></View>
        <View style={styles.column}><DateField label="Tanggal Lahir" required value={draft.birthDate} onChange={value => setField('birthDate', value)} /></View>
      </View>
      <TextField label="Usia" disabled value={age === null ? '-' : String(age)} />
      <SelectField label="Status Pernikahan" required value={draft.maritalStatus} onChange={value => setField('maritalStatus', value as OnboardingDraft['maritalStatus'])} options={maritalOptions} placeholder="Pilih status pernikahan" />
      <TextField label="No. Handphone / WhatsApp" required value={draft.phone} onChangeText={value => setField('phone', value)} keyboardType="phone-pad" placeholder="628xxxxxxxxxx" />
      <AddressFields label="Alamat KTP" value={draft.identityAddress} onChange={address => dispatch({type: 'set-address', target: 'identityAddress', address})} />
      <AddressFields label="Alamat Domisili" disabled={draft.domicileSameAsIdentity} value={draft.domicileAddress} onChange={address => dispatch({type: 'set-address', target: 'domicileAddress', address})} />
      <View style={styles.sameAddress}><CheckboxField label="Sama dengan alamat di KTP" checked={draft.domicileSameAsIdentity} onChange={value => setField('domicileSameAsIdentity', value)} /></View>

      <AddField label="Pendidikan Terakhir" required placeholder={draft.educations.length ? 'Tambah pendidikan lainnya' : 'Belum ada pendidikan ditambahkan'} onPress={() => openEducation()} />
      {draft.educations.map(item => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemIcon}><Ionicons name="school" size={17} color="#0B66EE" /></View>
          <View style={styles.itemCopy}>
            <Text style={styles.itemTitle}>{item.educationLevel} - {item.schoolName}</Text>
            <Text style={styles.itemMeta}>Jurusan: {item.majorName}</Text>
            <Text style={styles.itemMeta}>{item.startDate} - {item.ongoing ? 'Sekarang' : item.endDate}</Text>
          </View>
          <Pressable accessibilityLabel="Edit pendidikan" onPress={() => openEducation(item)} hitSlop={8}><Ionicons name="create-outline" size={20} color="#087BFF" /></Pressable>
          <Pressable accessibilityLabel="Hapus pendidikan" onPress={() => removeEducation(item)} hitSlop={8}><Ionicons name="trash-outline" size={20} color="#FF3347" /></Pressable>
        </View>
      ))}

      <View style={styles.privacy}><Ionicons name="shield-checkmark-outline" size={25} color="#3B86FF" /><Text style={styles.privacyText}>Data yang Anda berikan ke sistem kami akan dilindungi dan hanya digunakan untuk kebutuhan rekrutmen.</Text></View>
      <Pressable accessibilityRole="button" onPress={onNext} style={styles.primaryButton}>
        <LinearGradient colors={['#0B5CFF', '#00D8F4']} end={{x: 1, y: 0}} start={{x: 0, y: 0}} style={styles.gradient}><Text style={styles.primaryText}>Selanjutnya</Text></LinearGradient>
      </Pressable>

      {educationOpen ? <EducationModal visible initialValue={editingEducation} majorOptions={majorOptions} onCancel={() => setEducationOpen(false)} onSave={saveEducation} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {width: '100%', maxWidth: 620, alignSelf: 'center', backgroundColor: '#061D52', borderRadius: 34, paddingHorizontal: 24, paddingTop: 31, paddingBottom: 30},
  sectionTitle: {flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 31},
  sectionTitleText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: 'white', fontSize: 19},
  columns: {flexDirection: 'row', gap: 12},
  columnsNarrow: {flexDirection: 'column', gap: 0},
  column: {flex: 1, minWidth: 0},
  sameAddress: {marginTop: -9, marginBottom: 13},
  itemCard: {backgroundColor: 'white', borderRadius: 11, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 9},
  itemIcon: {width: 28, height: 28, borderRadius: 14, backgroundColor: '#E8F1FF', alignItems: 'center', justifyContent: 'center'},
  itemCopy: {flex: 1},
  itemTitle: {fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: '#172036'},
  itemMeta: {fontFamily: 'PlusJakartaSans_400Regular', fontSize: 9, color: '#616A79', marginTop: 2},
  privacy: {flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#0B2A62', borderRadius: 12, padding: 14, marginTop: 14, marginBottom: 22},
  privacyText: {flex: 1, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, lineHeight: 15, color: '#438AFF'},
  primaryButton: {height: 56, borderRadius: 11, overflow: 'hidden'},
  gradient: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  primaryText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: 'white', fontSize: 15},
});
