import Ionicons from '@expo/vector-icons/Ionicons';
import {useQuery} from '@tanstack/react-query';
import React, {useMemo, useState} from 'react';
import {Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';

import {toAppApiError} from '../../../core/api/api-error';
import {masterDataApi} from '../../master-data/api/master-data.api';
import {AddressFields} from '../../onboarding/components/AddressFields';
import {DateField, isoToLocalDate} from '../../onboarding/components/DateField';
import {CheckboxField, SelectField, TextField} from '../../onboarding/components/FormControls';
import {educationLevelOptions, isNoFormalEducation} from '../../onboarding/onboarding.options';
import {emptyAddress, type AddressDetail, type MasterOption} from '../../onboarding/onboarding.types';
import {profileApi} from '../api/profile.api';
import {CardTitle, DataRow, PrimaryButton, ProfileCard, ProfileHeader, ProfilePage, ScreenState, profileColors, profileFonts} from '../components/profile-ui';
import {useProfile, useProfileMutation} from '../hooks/use-profile';
import {formatAddress} from '../profile.mapper';
import type {CandidateProfile, EducationInput, ProfileAddress, ProfileEducation} from '../profile.types';

function maskNik(value: string, visible: boolean) {
  if (!value) return 'Belum dilengkapi';
  if (visible) return value;
  return `${'•'.repeat(Math.max(0, value.length - 4))} ${value.slice(-4)}`;
}

function ageFromDate(value: string | null) {
  if (!value) return 'Belum dilengkapi';
  const date = new Date(`${value.split('T')[0]}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Belum dilengkapi';
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  if (now.getMonth() < date.getMonth() || (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())) age -= 1;
  return `${Math.max(0, age)} tahun`;
}

function displayDate(value: string | null) {
  if (!value) return 'Belum dilengkapi';
  const source = value.split('T')[0];
  const date = new Date(`${source}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}).format(date);
}

function addressPayload(value: ProfileAddress | AddressDetail) {
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

function normalizeMasterOptions(input: unknown): MasterOption[] {
  const root = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const source = Array.isArray(input) ? input : Array.isArray(root.data) ? root.data : [];
  return source.map(item => {
    const record = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    return {value: String(record.id ?? ''), label: String(record.name ?? record.label ?? '')};
  }).filter(item => item.value && item.label);
}

type PersonalDraft = {
  nik: string;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  phone: string;
  gender: 'male' | 'female';
  maritalStatus: 'single' | 'married' | 'other';
  ktpAddress: AddressDetail;
  domicileAddress: AddressDetail;
  sameAsKtp: boolean;
};

function PersonalEditModal({profile, visible, onClose}: {profile: CandidateProfile; visible: boolean; onClose: () => void}) {
  const [draft, setDraft] = useState<PersonalDraft>(() => ({
    nik: profile.nik,
    fullName: profile.fullName,
    birthPlace: profile.birthPlace,
    birthDate: profile.birthDate?.split('T')[0] ?? '',
    phone: profile.phone,
    gender: profile.gender || 'male',
    maritalStatus: profile.maritalStatus || 'single',
    ktpAddress: profile.ktpAddress ? {...profile.ktpAddress} : emptyAddress(),
    domicileAddress: profile.domicileAddress ? {...profile.domicileAddress} : emptyAddress(),
    sameAsKtp: profile.sameAsKtp,
  }));
  const mutation = useProfileMutation(profileApi.updatePersonalInfo);
  const set = <K extends keyof PersonalDraft>(key: K, value: PersonalDraft[K]) => setDraft(current => {
    const next = {...current, [key]: value};
    if (key === 'sameAsKtp' && value === true) next.domicileAddress = {...current.ktpAddress};
    if (key === 'ktpAddress' && current.sameAsKtp) next.domicileAddress = {...value as AddressDetail};
    return next;
  });

  const save = async () => {
    if (!draft.fullName.trim()) return Alert.alert('Nama wajib diisi', 'Masukkan nama lengkap kandidat.');
    if (!profile.nik && !/^\d{16}$/.test(draft.nik)) return Alert.alert('NIK tidak valid', 'NIK harus tepat 16 digit angka.');
    const requiredAddress = (value: AddressDetail) => value.addressLine && value.provinceCode && value.regencyCode && value.districtCode && value.villageCode;
    if (!requiredAddress(draft.ktpAddress) || (!draft.sameAsKtp && !requiredAddress(draft.domicileAddress))) return Alert.alert('Alamat belum lengkap', 'Lengkapi seluruh wilayah dan detail alamat.');
    try {
      if (!profile.nik) await profileApi.updateNik(draft.nik);
      await mutation.mutateAsync({
        ...(!profile.nik ? {nik: draft.nik} : {}), full_name: draft.fullName.trim(), gender: draft.gender,
        birth_place: draft.birthPlace.trim(), birth_date: draft.birthDate || null, phone: draft.phone.trim(), marital_status: draft.maritalStatus,
        same_as_ktp: draft.sameAsKtp, ktp_address_detail: addressPayload(draft.ktpAddress), domicile_address_detail: draft.sameAsKtp ? null : addressPayload(draft.domicileAddress),
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
            {!profile.nik ? <TextField tone="light" label="NIK" required keyboardType="number-pad" maxLength={16} value={draft.nik} onChangeText={value => set('nik', value.replace(/\D/g, '').slice(0, 16))} /> : null}
            <TextField tone="light" label="Nama Lengkap" required value={draft.fullName} onChangeText={value => set('fullName', value)} />
            <TextField tone="light" label="Tempat Lahir" required value={draft.birthPlace} onChangeText={value => set('birthPlace', value)} />
            <DateField tone="light" label="Tanggal Lahir" required value={draft.birthDate} onChange={value => set('birthDate', value)} maximumDate={new Date()} />
            <TextField tone="light" label="Nomor WhatsApp" required keyboardType="phone-pad" value={draft.phone} onChangeText={value => set('phone', value)} />
            <SelectField tone="light" label="Jenis Kelamin" required value={draft.gender} onChange={value => set('gender', value as PersonalDraft['gender'])} options={[{value: 'male', label: 'Laki-laki'}, {value: 'female', label: 'Perempuan'}]} placeholder="Pilih jenis kelamin" />
            <SelectField tone="light" label="Status Pernikahan" required value={draft.maritalStatus} onChange={value => set('maritalStatus', value as PersonalDraft['maritalStatus'])} options={[{value: 'single', label: 'Belum menikah'}, {value: 'married', label: 'Menikah'}, {value: 'other', label: 'Lainnya'}]} placeholder="Pilih status" />
            <AddressFields tone="light" label="Alamat KTP" value={draft.ktpAddress} onChange={value => set('ktpAddress', value)} />
            <AddressFields tone="light" label="Alamat Domisili" disabled={draft.sameAsKtp} value={draft.domicileAddress} onChange={value => set('domicileAddress', value)} afterAddressLine={<CheckboxField tone="light" label="Sama dengan alamat KTP" checked={draft.sameAsKtp} onChange={value => set('sameAsKtp', value)} />} />
            <PrimaryButton disabled={mutation.isPending} label={mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'} onPress={() => void save()} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type EducationDraft = {level: string; school: string; majorId: string; startDate: string; endDate: string; info: string; ongoing: boolean};

function EducationModal({item, visible, onClose}: {item: ProfileEducation | null; visible: boolean; onClose: () => void}) {
  const [draft, setDraft] = useState<EducationDraft>(() => ({level: item?.educationLevel ?? '', school: item?.schoolName ?? '', majorId: item?.majorId ? String(item.majorId) : '', startDate: item?.startDate ?? '', endDate: item?.endDate ?? '', info: item?.additionalInfo ?? '', ongoing: Boolean(item?.startDate && !item?.endDate)}));
  const majors = useQuery({queryKey: ['master-data', 'majors'], queryFn: () => masterDataApi.list('majors'), staleTime: 30 * 60 * 1000});
  const majorOptions = useMemo(() => normalizeMasterOptions(majors.data), [majors.data]);
  const saveMutation = useProfileMutation(async (payload: EducationInput) => item ? profileApi.updateEducation(item.id, payload) : profileApi.createEducation(payload));
  const deleteMutation = useProfileMutation((id: number) => profileApi.deleteEducation(id));
  const set = <K extends keyof EducationDraft>(key: K, value: EducationDraft[K]) => setDraft(current => ({...current, [key]: value}));
  const noFormal = isNoFormalEducation(draft.level);
  const setLevel = (level: string) => setDraft(current => isNoFormalEducation(level) ? {...current, level, school: '', majorId: '', startDate: '', endDate: '', ongoing: false} : {...current, level});

  const save = async () => {
    if (!draft.level) return Alert.alert('Pendidikan wajib diisi', 'Pilih tingkat pendidikan terakhir.');
    if (!draft.ongoing && draft.startDate && draft.endDate && draft.endDate < draft.startDate) return Alert.alert('Tanggal tidak valid', 'Tanggal selesai harus setelah tanggal mulai.');
    try {
      await saveMutation.mutateAsync({education_level: draft.level, school_name: draft.school.trim() || null, major_id: draft.majorId ? Number(draft.majorId) : null, start_date: draft.startDate || null, end_date: draft.ongoing ? null : draft.endDate || null, additional_info: draft.info.trim() || null});
      onClose();
      Alert.alert('Berhasil', item ? 'Pendidikan berhasil diperbarui.' : 'Pendidikan berhasil ditambahkan.');
    } catch (error) {
      Alert.alert('Gagal menyimpan pendidikan', toAppApiError(error).message);
    }
  };
  const remove = () => item && Alert.alert('Hapus pendidikan?', `${item.educationLevel} di ${item.schoolName || 'institusi ini'} akan dihapus.`, [{text: 'Batal', style: 'cancel'}, {text: 'Hapus', style: 'destructive', onPress: async () => { try { await deleteMutation.mutateAsync(item.id); onClose(); } catch (error) { Alert.alert('Gagal menghapus', toAppApiError(error).message); } }}]);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}><Text style={styles.sheetTitle}>{item ? 'Ubah Pendidikan' : 'Tambah Pendidikan'}</Text><Pressable onPress={onClose}><Ionicons name="close" size={25} /></Pressable></View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
            <SelectField presentation="inline" tone="light" label="Tingkat Pendidikan" required value={draft.level} onChange={setLevel} options={educationLevelOptions} placeholder="Pilih tingkat pendidikan" />
            <TextField disabled={noFormal} tone="light" label="Nama Institusi" value={draft.school} onChangeText={value => set('school', value)} placeholder={noFormal ? 'Tidak diperlukan' : 'Universitas atau sekolah'} />
            {!noFormal ? <SelectField presentation="inline" searchable tone="light" label="Jurusan" value={draft.majorId} onChange={value => set('majorId', value)} options={majorOptions} placeholder={majors.isLoading ? 'Memuat jurusan...' : 'Pilih jurusan (opsional)'} /> : null}
            <DateField tone="light" disabled={noFormal} label="Tanggal Mulai" value={draft.startDate} onChange={value => set('startDate', value)} maximumDate={new Date()} />
            <DateField tone="light" disabled={noFormal || draft.ongoing} label="Tanggal Selesai" value={draft.endDate} onChange={value => set('endDate', value)} minimumDate={isoToLocalDate(draft.startDate) ?? undefined} maximumDate={new Date()} />
            {!noFormal ? <CheckboxField tone="light" label="Sedang berlangsung" checked={draft.ongoing} onChange={value => setDraft(current => ({...current, ongoing: value, endDate: value ? '' : current.endDate}))} /> : null}
            <TextField tone="light" label="Informasi Tambahan" multiline value={draft.info} onChangeText={value => set('info', value)} />
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

  return <View style={styles.screen}>
    <ProfileHeader title="Data Diri" rightIcon="pencil-outline" rightLabel="Ubah" onRightPress={() => data && setEditOpen(true)} />
    {query.isLoading || query.isError || !data ? <ScreenState loading={query.isLoading} error={query.isError ? toAppApiError(query.error).message : !data ? 'Data diri tidak ditemukan.' : undefined} onRetry={() => void query.refetch()} /> : <ProfilePage>
      <ProfileCard><CardTitle icon="person-outline" title="Identitas & Kontak" /><DataRow label="NIK" value={maskNik(data.nik, nikVisible)} right={data.nik ? <Pressable accessibilityLabel={nikVisible ? 'Sembunyikan NIK' : 'Tampilkan NIK'} onPress={() => setNikVisible(value => !value)}><Ionicons name={nikVisible ? 'eye-off-outline' : 'eye-outline'} size={21} color={profileColors.blue} /></Pressable> : undefined} /><DataRow label="Nama Lengkap" value={data.fullName} /><DataRow label="Email" value={data.email} icon="mail-outline" /><DataRow label="WhatsApp" value={data.phone} icon="call-outline" last /></ProfileCard>
      <ProfileCard><CardTitle icon="calendar-outline" title="Data Pribadi" /><DataRow label="Tempat Lahir" value={data.birthPlace} /><DataRow label="Tanggal Lahir" value={displayDate(data.birthDate)} /><DataRow label="Usia" value={ageFromDate(data.birthDate)} /><DataRow label="Jenis Kelamin" value={data.gender === 'female' ? 'Perempuan' : data.gender === 'male' ? 'Laki-laki' : 'Belum dilengkapi'} /><DataRow label="Status Pernikahan" value={{single: 'Belum menikah', married: 'Menikah', other: 'Lainnya', '': 'Belum dilengkapi'}[data.maritalStatus]} last /></ProfileCard>
      <ProfileCard><CardTitle icon="location-outline" title="Alamat" /><DataRow label="Alamat KTP" value={formatAddress(data.ktpAddress)} /><DataRow label="Alamat Domisili" value={formatAddress(data.domicileAddress)} right={data.sameAsKtp ? <View style={styles.sameBadge}><Text style={styles.sameBadgeText}>Sama dengan KTP</Text></View> : undefined} last /></ProfileCard>
      <ProfileCard><CardTitle icon="school-outline" title="Pendidikan" action="+ Tambah" onAction={() => openEducation(null)} />{education.length === 0 ? <View style={styles.emptyEducation}><Ionicons name="school-outline" size={30} color="#98A2B3" /><Text style={styles.emptyEducationText}>Pendidikan belum ditambahkan.</Text></View> : education.map((item, index) => <Pressable key={item.id} onPress={() => openEducation(item)} style={[styles.educationRow, index === education.length - 1 && styles.educationRowLast]}><View style={styles.educationCopy}><Text style={styles.educationTitle}>{[item.educationLevel, item.majorName].filter(Boolean).join(' – ')}</Text><Text style={styles.educationSchool}>{item.schoolName || 'Institusi belum diisi'}</Text><Text style={styles.educationDate}>{displayDate(item.startDate)} – {item.startDate && !item.endDate ? 'Sekarang' : displayDate(item.endDate)}</Text></View><View style={styles.editIcon}><Ionicons name="pencil" size={18} color={profileColors.blue} /></View></Pressable>)}</ProfileCard>
    </ProfilePage>}
    {data && editOpen ? <PersonalEditModal profile={data} visible onClose={() => setEditOpen(false)} /> : null}
    {educationOpen ? <EducationModal item={selectedEducation} visible onClose={() => setEducationOpen(false)} /> : null}
  </View>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: profileColors.background}, sameBadge: {position: 'absolute', right: 0, bottom: -17, borderRadius: 12, backgroundColor: '#DDF8E9', paddingHorizontal: 9, paddingVertical: 4}, sameBadgeText: {fontFamily: profileFonts.semibold, fontSize: 8.5, color: '#168457'},
  emptyEducation: {minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: 8}, emptyEducationText: {fontFamily: profileFonts.regular, fontSize: 11, color: profileColors.muted}, educationRow: {minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: profileColors.border, paddingVertical: 12}, educationRowLast: {borderBottomWidth: 0, paddingBottom: 0}, educationCopy: {flex: 1, minWidth: 0}, educationTitle: {fontFamily: profileFonts.bold, fontSize: 13, lineHeight: 18, color: profileColors.ink}, educationSchool: {fontFamily: profileFonts.regular, fontSize: 11, color: profileColors.muted, marginTop: 3}, educationDate: {fontFamily: profileFonts.regular, fontSize: 10, color: '#7B8493', marginTop: 3}, editIcon: {width: 38, height: 38, borderRadius: 9, backgroundColor: '#EEF5FF', alignItems: 'center', justifyContent: 'center'},
  modalBackdrop: {flex: 1, backgroundColor: 'rgba(0,20,55,0.55)', justifyContent: 'flex-end'}, sheet: {maxHeight: '94%', backgroundColor: 'white', borderTopLeftRadius: 22, borderTopRightRadius: 22, overflow: 'hidden'}, sheetHeader: {height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: profileColors.border}, sheetTitle: {fontFamily: profileFonts.bold, fontSize: 17, color: profileColors.ink}, form: {padding: 18, paddingBottom: 34}, deleteButton: {minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7}, deleteText: {fontFamily: profileFonts.semibold, fontSize: 12, color: '#D92D20'},
});
