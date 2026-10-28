import Ionicons from '@expo/vector-icons/Ionicons';
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
import {
  CardTitle,
  DataRow,
  PrimaryButton,
  ProfileCard,
  ProfileHeader,
  ProfilePage,
  ScreenState,
  profileColors,
  profileFonts,
} from '../components/profile-ui';
import {formatAddress} from '../profile.mapper';
import type {CandidateProfile, EducationInput, ProfileAddress, ProfileEducation} from '../profile.types';
import {useProfile, useProfileMutation} from '../hooks/use-profile';

function maskNik(value: string, visible: boolean) {
  if (!value) return 'Belum dilengkapi';
  if (visible) return value;
  return `${'•'.repeat(Math.max(0, value.length - 4))} ${value.slice(-4)}`;
}

function ageFromDate(value: string | null) {
  if (!value) return 'Belum dilengkapi';
  const parts = value.includes('/') ? value.split('/').reverse() : value.split('-');
  const date = new Date(parts.join('-'));
  if (Number.isNaN(date.getTime())) return 'Belum dilengkapi';
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  if (now.getMonth() < date.getMonth() || (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())) age -= 1;
  return `${Math.max(0, age)} tahun`;
}

function displayDate(value: string | null) {
  if (!value) return 'Belum dilengkapi';
  const source = value.includes('/') ? value.split('/').reverse().join('-') : value;
  const date = new Date(`${source}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}).format(date);
}

function apiDate(value: string) {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value.split('/').reverse().join('-');
  return value;
}

function addressPayload(value: ProfileAddress) {
  return {
    address_line: value.addressLine,
    province_code: value.provinceCode,
    province_name: value.provinceName || null,
    regency_code: value.regencyCode,
    regency_name: value.regencyName || null,
    district_code: value.districtCode,
    district_name: value.districtName || null,
    village_code: value.villageCode,
    village_name: value.villageName || null,
    postal_code: value.postalCode || null,
  };
}

type PersonalDraft = {
  nik: string;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  phone: string;
  gender: 'male' | 'female';
  maritalStatus: 'single' | 'married' | 'other';
};

function PersonalEditModal({profile, visible, onClose}: {profile: CandidateProfile; visible: boolean; onClose: () => void}) {
  const [draft, setDraft] = useState<PersonalDraft>(() => ({
    nik: profile.nik,
    fullName: profile.fullName,
    birthPlace: profile.birthPlace,
    birthDate: profile.birthDate ?? '',
    phone: profile.phone,
    gender: profile.gender || 'male',
    maritalStatus: profile.maritalStatus || 'single',
  }));
  const mutation = useProfileMutation(profileApi.updatePersonalInfo);

  const set = <K extends keyof PersonalDraft>(key: K, value: PersonalDraft[K]) => setDraft(current => ({...current, [key]: value}));

  const save = async () => {
    if (!draft.fullName.trim()) {
      Alert.alert('Nama wajib diisi', 'Masukkan nama lengkap kandidat.');
      return;
    }
    if (!profile.nik && draft.nik && !/^\d{16}$/.test(draft.nik)) {
      Alert.alert('NIK tidak valid', 'NIK harus tepat 16 digit angka.');
      return;
    }
    if (!profile.ktpAddress || (!profile.sameAsKtp && !profile.domicileAddress)) {
      Alert.alert('Alamat belum lengkap', 'Lengkapi alamat melalui onboarding sebelum mengubah data diri.');
      return;
    }
    try {
      if (!profile.nik && draft.nik) await profileApi.updateNik(draft.nik);
      await mutation.mutateAsync({
        ...(profile.nik ? {nik: profile.nik} : {}),
        full_name: draft.fullName.trim(),
        gender: draft.gender,
        birth_place: draft.birthPlace.trim() || null,
        birth_date: draft.birthDate.trim() ? apiDate(draft.birthDate.trim()) : null,
        phone: draft.phone.trim() || null,
        marital_status: draft.maritalStatus,
        same_as_ktp: profile.sameAsKtp,
        ktp_address_detail: addressPayload(profile.ktpAddress),
        domicile_address_detail: profile.sameAsKtp ? null : addressPayload(profile.domicileAddress!),
      });
      onClose();
      Alert.alert('Berhasil', 'Data diri berhasil diperbarui.');
    } catch (error) {
      Alert.alert('Gagal menyimpan', toAppApiError(error).message);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}><Text style={styles.sheetTitle}>Ubah Data Diri</Text><Pressable onPress={onClose}><Ionicons name="close" size={25} color={profileColors.ink} /></Pressable></View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
            {!profile.nik ? <Field label="NIK" keyboardType="number-pad" maxLength={16} value={draft.nik} onChangeText={value => set('nik', value.replace(/\D/g, ''))} /> : null}
            <Field label="Nama Lengkap *" value={draft.fullName} onChangeText={value => set('fullName', value)} />
            <Field label="Tempat Lahir" value={draft.birthPlace} onChangeText={value => set('birthPlace', value)} />
            <Field label="Tanggal Lahir" placeholder="dd/mm/yyyy" value={draft.birthDate} onChangeText={value => set('birthDate', value)} />
            <Field label="Nomor WhatsApp" keyboardType="phone-pad" value={draft.phone} onChangeText={value => set('phone', value)} />
            <Choice label="Jenis Kelamin" value={draft.gender} options={[['male', 'Laki-laki'], ['female', 'Perempuan']]} onChange={value => set('gender', value as PersonalDraft['gender'])} />
            <Choice label="Status Pernikahan" value={draft.maritalStatus} options={[['single', 'Belum menikah'], ['married', 'Menikah'], ['other', 'Lainnya']]} onChange={value => set('maritalStatus', value as PersonalDraft['maritalStatus'])} />
            <PrimaryButton disabled={mutation.isPending} label={mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'} onPress={() => void save()} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({label, ...props}: React.ComponentProps<typeof TextInput> & {label: string}) {
  return <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>{label}</Text><TextInput {...props} placeholderTextColor="#98A2B3" style={styles.field} /></View>;
}

function Choice({label, value, options, onChange}: {label: string; value: string; options: [string, string][]; onChange: (value: string) => void}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.choiceWrap}>{options.map(([key, text]) => <Pressable key={key} onPress={() => onChange(key)} style={[styles.choice, value === key && styles.choiceActive]}><Text style={[styles.choiceText, value === key && styles.choiceTextActive]}>{text}</Text></Pressable>)}</View>
    </View>
  );
}

type EducationDraft = {level: string; school: string; majorId: string; startDate: string; endDate: string; info: string};

function EducationModal({item, visible, onClose}: {item: ProfileEducation | null; visible: boolean; onClose: () => void}) {
  const [draft, setDraft] = useState<EducationDraft>(() => ({
    level: item?.educationLevel ?? '', school: item?.schoolName ?? '', majorId: item?.majorId ? String(item.majorId) : '',
    startDate: item?.startDate ?? '', endDate: item?.endDate ?? '', info: item?.additionalInfo ?? '',
  }));
  const saveMutation = useProfileMutation(async (payload: EducationInput) => item ? profileApi.updateEducation(item.id, payload) : profileApi.createEducation(payload));
  const deleteMutation = useProfileMutation((id: number) => profileApi.deleteEducation(id));

  const set = (key: keyof EducationDraft, value: string) => setDraft(current => ({...current, [key]: value}));
  const save = async () => {
    if (!draft.level.trim()) {
      Alert.alert('Pendidikan wajib diisi', 'Masukkan tingkat pendidikan terakhir.');
      return;
    }
    try {
      await saveMutation.mutateAsync({
        education_level: draft.level.trim(), school_name: draft.school.trim() || null,
        major_id: draft.majorId.trim() ? Number(draft.majorId) : null,
        start_date: draft.startDate.trim() ? apiDate(draft.startDate.trim()) : null,
        end_date: draft.endDate.trim() ? apiDate(draft.endDate.trim()) : null,
        additional_info: draft.info.trim() || null,
      });
      onClose();
      Alert.alert('Berhasil', item ? 'Pendidikan berhasil diperbarui.' : 'Pendidikan berhasil ditambahkan.');
    } catch (error) {
      Alert.alert('Gagal menyimpan pendidikan', toAppApiError(error).message);
    }
  };
  const remove = () => item && Alert.alert('Hapus pendidikan?', `${item.educationLevel} di ${item.schoolName || 'institusi ini'} akan dihapus.`, [
    {text: 'Batal', style: 'cancel'},
    {text: 'Hapus', style: 'destructive', onPress: async () => {
      try { await deleteMutation.mutateAsync(item.id); onClose(); } catch (error) { Alert.alert('Gagal menghapus', toAppApiError(error).message); }
    }},
  ]);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}><Text style={styles.sheetTitle}>{item ? 'Ubah Pendidikan' : 'Tambah Pendidikan'}</Text><Pressable onPress={onClose}><Ionicons name="close" size={25} /></Pressable></View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
            <Field label="Tingkat Pendidikan *" placeholder="Contoh: S1" value={draft.level} onChangeText={value => set('level', value)} />
            <Field label="Nama Institusi" placeholder="Universitas atau sekolah" value={draft.school} onChangeText={value => set('school', value)} />
            <Field label="ID Jurusan (opsional)" keyboardType="number-pad" value={draft.majorId} onChangeText={value => set('majorId', value.replace(/\D/g, ''))} />
            <Field label="Tanggal Mulai" placeholder="yyyy-mm-dd" value={draft.startDate} onChangeText={value => set('startDate', value)} />
            <Field label="Tanggal Selesai" placeholder="yyyy-mm-dd" value={draft.endDate} onChangeText={value => set('endDate', value)} />
            <Field label="Informasi Tambahan" multiline value={draft.info} onChangeText={value => set('info', value)} />
            <PrimaryButton disabled={saveMutation.isPending} label={saveMutation.isPending ? 'Menyimpan...' : 'Simpan Pendidikan'} onPress={() => void save()} />
            {item ? <Pressable disabled={deleteMutation.isPending} onPress={remove} style={styles.deleteButton}><Ionicons name="trash-outline" size={18} color="#D92D20" /><Text style={styles.deleteText}>Hapus Pendidikan</Text></Pressable> : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function PersonalDataScreen() {
  const query = useProfile();
  const [nikVisible, setNikVisible] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [educationOpen, setEducationOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState<ProfileEducation | null>(null);
  const data = query.data;
  const education = useMemo(() => data?.educations ?? [], [data]);

  const openEducation = (item: ProfileEducation | null) => { setSelectedEducation(item); setEducationOpen(true); };

  return (
    <View style={styles.screen}>
      <ProfileHeader title="Data Diri" rightIcon="pencil-outline" rightLabel="Ubah" onRightPress={() => data && setEditOpen(true)} />
      {query.isLoading || query.isError || !data ? (
        <ScreenState loading={query.isLoading} error={query.isError ? toAppApiError(query.error).message : !data ? 'Data diri tidak ditemukan.' : undefined} onRetry={() => void query.refetch()} />
      ) : (
        <ProfilePage>
          <ProfileCard>
            <CardTitle icon="person-outline" title="Identitas & Kontak" />
            <DataRow label="NIK" value={maskNik(data.nik, nikVisible)} right={data.nik ? <Pressable accessibilityLabel={nikVisible ? 'Sembunyikan NIK' : 'Tampilkan NIK'} onPress={() => setNikVisible(value => !value)}><Ionicons name={nikVisible ? 'eye-off-outline' : 'eye-outline'} size={21} color={profileColors.blue} /></Pressable> : undefined} />
            <DataRow label="Nama Lengkap" value={data.fullName} />
            <DataRow label="Email" value={data.email} icon="mail-outline" />
            <DataRow label="WhatsApp" value={data.phone} icon="call-outline" last />
          </ProfileCard>

          <ProfileCard>
            <CardTitle icon="calendar-outline" title="Data Pribadi" />
            <DataRow label="Tempat Lahir" value={data.birthPlace} />
            <DataRow label="Tanggal Lahir" value={displayDate(data.birthDate)} />
            <DataRow label="Usia" value={ageFromDate(data.birthDate)} />
            <DataRow label="Jenis Kelamin" value={data.gender === 'female' ? 'Perempuan' : data.gender === 'male' ? 'Laki-laki' : 'Belum dilengkapi'} />
            <DataRow label="Status Pernikahan" value={{single: 'Belum menikah', married: 'Menikah', other: 'Lainnya', '': 'Belum dilengkapi'}[data.maritalStatus]} last />
          </ProfileCard>

          <ProfileCard>
            <CardTitle icon="location-outline" title="Alamat" />
            <DataRow label="Alamat KTP" value={formatAddress(data.ktpAddress)} />
            <DataRow label="Alamat Domisili" value={formatAddress(data.domicileAddress)} right={data.sameAsKtp ? <View style={styles.sameBadge}><Text style={styles.sameBadgeText}>Sama dengan KTP</Text></View> : undefined} last />
          </ProfileCard>

          <ProfileCard>
            <CardTitle icon="school-outline" title="Pendidikan" action="+ Tambah" onAction={() => openEducation(null)} />
            {education.length === 0 ? (
              <View style={styles.emptyEducation}><Ionicons name="school-outline" size={30} color="#98A2B3" /><Text style={styles.emptyEducationText}>Pendidikan belum ditambahkan.</Text></View>
            ) : education.map((item, index) => (
              <Pressable key={item.id} onPress={() => openEducation(item)} style={[styles.educationRow, index === education.length - 1 && styles.educationRowLast]}>
                <View style={styles.educationCopy}>
                  <Text style={styles.educationTitle}>{[item.educationLevel, item.majorName].filter(Boolean).join(' – ')}</Text>
                  <Text style={styles.educationSchool}>{item.schoolName || 'Institusi belum diisi'}</Text>
                  <Text style={styles.educationDate}>{displayDate(item.startDate)} – {displayDate(item.endDate)}</Text>
                </View>
                <View style={styles.editIcon}><Ionicons name="pencil" size={18} color={profileColors.blue} /></View>
              </Pressable>
            ))}
          </ProfileCard>
        </ProfilePage>
      )}
      {data && editOpen ? <PersonalEditModal profile={data} visible onClose={() => setEditOpen(false)} /> : null}
      {educationOpen ? <EducationModal item={selectedEducation} visible onClose={() => setEducationOpen(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: profileColors.background},
  sameBadge: {position: 'absolute', right: 0, bottom: -17, borderRadius: 12, backgroundColor: '#DDF8E9', paddingHorizontal: 9, paddingVertical: 4},
  sameBadgeText: {fontFamily: profileFonts.semibold, fontSize: 8.5, color: '#168457'},
  emptyEducation: {minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: 8},
  emptyEducationText: {fontFamily: profileFonts.regular, fontSize: 11, color: profileColors.muted},
  educationRow: {minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: profileColors.border, paddingVertical: 12},
  educationRowLast: {borderBottomWidth: 0, paddingBottom: 0},
  educationCopy: {flex: 1, minWidth: 0},
  educationTitle: {fontFamily: profileFonts.bold, fontSize: 13, lineHeight: 18, color: profileColors.ink},
  educationSchool: {fontFamily: profileFonts.regular, fontSize: 11, color: profileColors.muted, marginTop: 3},
  educationDate: {fontFamily: profileFonts.regular, fontSize: 10, color: '#7B8493', marginTop: 3},
  editIcon: {width: 38, height: 38, borderRadius: 9, backgroundColor: '#EEF5FF', alignItems: 'center', justifyContent: 'center'},
  modalBackdrop: {flex: 1, backgroundColor: 'rgba(0,20,55,0.55)', justifyContent: 'flex-end'},
  sheet: {maxHeight: '91%', backgroundColor: 'white', borderTopLeftRadius: 22, borderTopRightRadius: 22, overflow: 'hidden'},
  sheetHeader: {height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: profileColors.border},
  sheetTitle: {fontFamily: profileFonts.bold, fontSize: 17, color: profileColors.ink},
  form: {padding: 18, gap: 15, paddingBottom: 30},
  fieldGroup: {gap: 7},
  fieldLabel: {fontFamily: profileFonts.semibold, fontSize: 12, color: profileColors.ink},
  field: {minHeight: 48, borderWidth: 1.5, borderColor: '#D7DFEA', borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10, fontFamily: profileFonts.regular, fontSize: 13, color: profileColors.ink},
  choiceWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  choice: {minHeight: 40, borderRadius: 10, borderWidth: 1, borderColor: '#D7DFEA', justifyContent: 'center', paddingHorizontal: 12},
  choiceActive: {borderColor: profileColors.blue, backgroundColor: '#EAF2FF'},
  choiceText: {fontFamily: profileFonts.medium, fontSize: 11, color: profileColors.muted},
  choiceTextActive: {color: profileColors.blue},
  deleteButton: {minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7},
  deleteText: {fontFamily: profileFonts.semibold, fontSize: 12, color: '#D92D20'},
});
