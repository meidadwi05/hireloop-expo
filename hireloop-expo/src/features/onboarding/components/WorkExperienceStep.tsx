import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import React, {useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';

import type {CertificationDraft, ExperienceDraft, MasterOption, OnboardingAction, OnboardingDraft, SkillOption} from '../onboarding.types';
import {CertificationModal} from './CertificationModal';
import {ExperienceModal} from './ExperienceModal';
import {AddField, CheckboxField, SelectField, TextField} from './FormControls';
import {SkillMultiSelect} from './SkillMultiSelect';

const availabilityOptions: MasterOption[] = [
  {value: 'available', label: 'Tersedia segera'},
  {value: 'actively_looking', label: 'Aktif mencari pekerjaan'},
  {value: 'not_available', label: 'Belum tersedia'},
];

export function WorkExperienceStep({draft, dispatch, skills, submitting, onBack, onFinish, onNotify}: {
  draft: OnboardingDraft;
  dispatch: React.Dispatch<OnboardingAction>;
  skills: SkillOption[];
  submitting: boolean;
  onBack: () => void;
  onFinish: () => void;
  onNotify: (status: 'success' | 'error', title: string, message: string) => void;
}) {
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<ExperienceDraft | null>(null);
  const [certificationOpen, setCertificationOpen] = useState(false);
  const [editingCertification, setEditingCertification] = useState<CertificationDraft | null>(null);
  const setField = <K extends keyof OnboardingDraft>(field: K, value: OnboardingDraft[K]) => dispatch({type: 'set-field', field, value});

  const openExperience = (item: ExperienceDraft | null = null) => { setEditingExperience(item); setExperienceOpen(true); };
  const saveExperience = (experience: ExperienceDraft) => {
    dispatch({type: 'set-experience', experience});
    setField('hasNoExperience', false);
    setExperienceOpen(false);
    onNotify('success', 'Berhasil!', 'Pengalaman kerja berhasil disimpan.');
  };
  const openCertification = (item: CertificationDraft | null = null) => { setEditingCertification(item); setCertificationOpen(true); };
  const saveCertification = (certification: CertificationDraft) => {
    dispatch({type: 'set-certification', certification});
    setCertificationOpen(false);
    onNotify('success', 'Berhasil!', 'Sertifikasi berhasil disimpan.');
  };
  const confirmRemove = (title: string, onPress: () => void) => Alert.alert(title, 'Data yang dihapus tidak dapat dikembalikan.', [{text: 'Batal', style: 'cancel'}, {text: 'Hapus', style: 'destructive', onPress}]);

  return (
    <View style={styles.card}>
      <View style={styles.sectionTitle}><Ionicons name="briefcase-outline" size={27} color="#2F7FFF" /><Text style={styles.sectionTitleText}>Pengalaman Kerja</Text></View>

      <AddField label="Pengalaman Kerja" required placeholder={draft.experiences.length ? 'Tambah pengalaman lainnya' : 'Belum ada pengalaman ditambahkan'} onPress={() => openExperience()} />
      {draft.experiences.map(item => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemIcon}><Ionicons name="briefcase" size={16} color="#0B66EE" /></View>
          <View style={styles.itemCopy}><Text style={styles.itemTitle}>{item.position}</Text><Text style={styles.itemMeta}>{item.companyName}</Text><Text style={styles.itemMeta}>{item.startDate} - {item.current ? 'Sekarang' : item.endDate}</Text></View>
          <Pressable accessibilityLabel="Edit pengalaman" onPress={() => openExperience(item)} hitSlop={8}><Ionicons name="create-outline" size={20} color="#087BFF" /></Pressable>
          <Pressable accessibilityLabel="Hapus pengalaman" onPress={() => confirmRemove('Hapus pengalaman?', () => dispatch({type: 'remove-experience', id: item.id}))} hitSlop={8}><Ionicons name="trash-outline" size={20} color="#FF3347" /></Pressable>
        </View>
      ))}
      <View style={styles.compactCheckbox}><CheckboxField label="Belum memiliki pengalaman kerja" checked={draft.hasNoExperience} onChange={value => setField('hasNoExperience', value)} /></View>

      <SkillMultiSelect options={skills} selected={draft.skills} onToggle={skill => dispatch({type: 'toggle-skill', skill})} />
      <TextField label="Pengalaman mesin / tools" required value={draft.tools} onChangeText={value => setField('tools', value)} placeholder="Contoh: Mesin CNC, Forklift" />

      <AddField label="Sertifikasi" required placeholder={draft.certifications.length ? 'Tambah sertifikasi lainnya' : 'Belum ada sertifikat yang ditambahkan'} onPress={() => openCertification()} />
      {draft.certifications.map(item => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemIcon}><Ionicons name="ribbon" size={17} color="#0B66EE" /></View>
          <View style={styles.itemCopy}><Text style={styles.itemTitle}>{item.name}</Text><Text style={styles.itemMeta}>{item.issuer}</Text><Text style={styles.itemMeta}>{item.originalName}</Text></View>
          <Pressable accessibilityLabel="Edit sertifikasi" onPress={() => openCertification(item)} hitSlop={8}><Ionicons name="create-outline" size={20} color="#087BFF" /></Pressable>
          <Pressable accessibilityLabel="Hapus sertifikasi" onPress={() => confirmRemove('Hapus sertifikasi?', () => dispatch({type: 'remove-certification', id: item.id}))} hitSlop={8}><Ionicons name="trash-outline" size={20} color="#FF3347" /></Pressable>
        </View>
      ))}

      <SelectField label="Status Ketersediaan Kerja" required value={draft.availability} onChange={value => setField('availability', value as OnboardingDraft['availability'])} options={availabilityOptions} placeholder="Pilih status ketersediaan" />
      <View style={styles.consentBox}>
        <CheckboxField required label="Saya memahami dan bersedia mengikuti ketentuan yang berlaku." checked={draft.acceptedTerms} onChange={value => setField('acceptedTerms', value)} />
        <CheckboxField required label="Saya bersedia dipertimbangkan untuk posisi yang sesuai dengan profil saya." checked={draft.acceptedMatching} onChange={value => setField('acceptedMatching', value)} />
      </View>
      <View style={styles.actions}>
        <Pressable disabled={submitting} accessibilityRole="button" onPress={onBack} style={styles.backButton}><Text style={styles.backText}>Kembali</Text></Pressable>
        <Pressable disabled={submitting} accessibilityRole="button" onPress={onFinish} style={styles.finishButton}>
          <LinearGradient colors={['#0B5CFF', '#00D8F4']} end={{x: 1, y: 0}} start={{x: 0, y: 0}} style={styles.gradient}><Text style={styles.finishText}>{submitting ? 'Menyimpan...' : 'Selesai'}</Text></LinearGradient>
        </Pressable>
      </View>

      {experienceOpen ? <ExperienceModal visible initialValue={editingExperience} onCancel={() => setExperienceOpen(false)} onSave={saveExperience} /> : null}
      {certificationOpen ? <CertificationModal visible initialValue={editingCertification} onCancel={() => setCertificationOpen(false)} onSave={saveCertification} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {width: '100%', maxWidth: 620, alignSelf: 'center', backgroundColor: '#061D52', borderRadius: 34, paddingHorizontal: 24, paddingTop: 31, paddingBottom: 30},
  sectionTitle: {flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 31},
  sectionTitleText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: 'white', fontSize: 19},
  itemCard: {backgroundColor: 'white', borderRadius: 11, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 9},
  itemIcon: {width: 28, height: 28, borderRadius: 14, backgroundColor: '#E8F1FF', alignItems: 'center', justifyContent: 'center'},
  itemCopy: {flex: 1},
  itemTitle: {fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: '#172036'},
  itemMeta: {fontFamily: 'PlusJakartaSans_400Regular', fontSize: 9, color: '#616A79', marginTop: 2},
  compactCheckbox: {marginTop: -8, marginBottom: 20},
  consentBox: {backgroundColor: '#0B2A62', borderRadius: 12, padding: 14, gap: 7, marginTop: 4, marginBottom: 25},
  actions: {flexDirection: 'row', gap: 18},
  backButton: {flex: 1, height: 55, borderRadius: 11, borderWidth: 1.5, borderColor: '#347CFF', alignItems: 'center', justifyContent: 'center'},
  backText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: 'white', fontSize: 14},
  finishButton: {flex: 1, height: 55, borderRadius: 11, overflow: 'hidden'},
  gradient: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  finishText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: 'white', fontSize: 14},
});
