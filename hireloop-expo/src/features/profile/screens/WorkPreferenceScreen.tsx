import Ionicons from '@expo/vector-icons/Ionicons';
import {useQuery} from '@tanstack/react-query';
import React, {useMemo, useState} from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';

import {toAppApiError} from '../../../core/api/api-error';
import {masterDataApi} from '../../master-data/api/master-data.api';
import {profileApi} from '../api/profile.api';
import {asRecord} from '../profile.mapper';
import type {WorkPeriodStatus, WorkSetting, WorkType} from '../profile.types';
import {useProfile, useProfileMutation} from '../hooks/use-profile';
import {
  PrimaryButton,
  ProfileHeader,
  ScreenState,
  profileColors,
  profileFonts,
} from '../components/profile-ui';

const workTypeOptions: [WorkType, string][] = [
  ['full_time', 'Full Time'], ['paruh_waktu', 'Paruh Waktu'], ['kontrak', 'Kontrak'],
  ['freelance', 'Freelance'], ['internship', 'Magang'], ['outsourcing', 'Outsourcing'], ['kasual', 'Kasual'],
];
const workSettingOptions: [WorkSetting, string][] = [['on_site', 'On-site'], ['remote', 'Remote'], ['hybrid', 'Hybrid']];
const availabilityOptions: [WorkPeriodStatus, string][] = [
  ['available', 'Siap Bekerja'], ['actively_looking', 'Aktif Mencari'], ['not_available', 'Belum Tersedia'], ['hired', 'Sudah Bekerja'],
];

type Role = {id: number; name: string};

function mapRoles(payload: unknown): Role[] {
  const root = asRecord(payload);
  const values = Array.isArray(payload) ? payload : Array.isArray(root.data) ? root.data : [];
  return values.map(item => {
    const raw = asRecord(item);
    return {id: Number(raw.id ?? raw.role_taxonomy_id), name: String(raw.role ?? raw.name ?? raw.title ?? '').trim()};
  }).filter(item => Number.isFinite(item.id) && item.id > 0 && item.name);
}

function ToggleChip({active, label, onPress}: {active: boolean; label: string; onPress: () => void}) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{checked: active}} onPress={onPress} style={[styles.toggleChip, active && styles.toggleChipActive]}>
      <Ionicons name={active ? 'checkbox' : 'square-outline'} size={18} color={active ? profileColors.blue : '#98A2B3'} />
      <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{label}</Text>
    </Pressable>
  );
}

function BinaryChoice({label, value, onChange}: {label: string; value: boolean; onChange: (value: boolean) => void}) {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionTitleRow}><Ionicons name="checkmark-circle-outline" size={20} color={profileColors.navy} /><Text style={styles.sectionTitle}>{label}</Text></View>
      <View style={styles.binaryRow}>
        {[true, false].map(option => <Pressable key={String(option)} onPress={() => onChange(option)} style={styles.radioOption}><Ionicons name={value === option ? 'radio-button-on' : 'radio-button-off'} size={21} color={value === option ? profileColors.blue : '#98A2B3'} /><Text style={styles.radioText}>{option ? 'Ya' : 'Tidak'}</Text></Pressable>)}
      </View>
    </View>
  );
}

export function WorkPreferenceScreen() {
  const profile = useProfile();
  const rolesQuery = useQuery({queryKey: ['master', 'job-roles'], queryFn: async () => mapRoles(await masterDataApi.list('job-roles'))});
  const mutation = useProfileMutation(profileApi.updateWorkPreferences);
  const data = profile.data;
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(() => data?.jobPreferences.map(item => ({id: item.id, name: item.name || `Posisi ${item.id}`})) ?? []);
  const [roleSearch, setRoleSearch] = useState('');
  const [locations, setLocations] = useState<string[]>(() => data?.expectedLocations ?? []);
  const [locationInput, setLocationInput] = useState('');
  const [salary, setSalary] = useState(() => data?.expectedSalary ? String(data.expectedSalary) : '');
  const [availability, setAvailability] = useState<WorkPeriodStatus>(() => data?.workPeriodStatus ?? 'available');
  const [workTypes, setWorkTypes] = useState<WorkType[]>(() => data ? (data.preferredWorkTypes.length ? data.preferredWorkTypes : [data.workType]) : ['full_time']);
  const [workSettings, setWorkSettings] = useState<WorkSetting[]>(() => data ? (data.preferredWorkSettings.length ? data.preferredWorkSettings : [data.jobTypeExpected]) : ['on_site']);
  const [shift, setShift] = useState(() => data?.willingToWorkShifts ?? false);
  const [relocate, setRelocate] = useState(() => data?.willingToRelocate ?? false);

  const reset = () => {
    if (!profile.data) return;
    const current = profile.data;
    setSelectedRoles(current.jobPreferences.map(item => ({id: item.id, name: item.name || `Posisi ${item.id}`})));
    setLocations(current.expectedLocations);
    setSalary(current.expectedSalary ? String(current.expectedSalary) : '');
    setAvailability(current.workPeriodStatus);
    setWorkTypes(current.preferredWorkTypes.length ? current.preferredWorkTypes : [current.workType]);
    setWorkSettings(current.preferredWorkSettings.length ? current.preferredWorkSettings : [current.jobTypeExpected]);
    setShift(current.willingToWorkShifts);
    setRelocate(current.willingToRelocate);
  };

  const availableRoles = useMemo(() => {
    const query = roleSearch.trim().toLowerCase();
    if (!query) return [];
    return (rolesQuery.data ?? []).filter(role => role.name.toLowerCase().includes(query) && !selectedRoles.some(item => item.id === role.id)).slice(0, 6);
  }, [roleSearch, rolesQuery.data, selectedRoles]);

  const toggle = <T extends string>(list: T[], value: T, maximum: number, setList: (next: T[]) => void) => {
    if (list.includes(value)) {
      if (list.length === 1) return Alert.alert('Minimal satu pilihan', 'Setidaknya satu pilihan harus tetap aktif.');
      setList(list.filter(item => item !== value));
      return;
    }
    if (list.length >= maximum) return Alert.alert('Batas pilihan', `Maksimal ${maximum} pilihan.`);
    setList([...list, value]);
  };

  const addLocation = () => {
    const value = locationInput.trim();
    if (!value) return;
    if (locations.some(item => item.toLowerCase() === value.toLowerCase())) return setLocationInput('');
    if (locations.length >= 5) return Alert.alert('Batas lokasi', 'Maksimal lima lokasi ditampilkan pada preferensi mobile.');
    setLocations(current => [...current, value]);
    setLocationInput('');
  };

  const save = async () => {
    if (workTypes.length === 0 || workSettings.length === 0) return;
    try {
      await mutation.mutateAsync({
        job_type_expected: workSettings[0],
        work_type: workTypes[0],
        work_period_status: availability,
        expected_salary: salary ? Number(salary) : null,
        preferred_work_types: workTypes,
        preferred_work_settings: workSettings,
        willing_to_work_shifts: shift,
        willing_to_relocate: relocate,
        expected_locations: locations,
        job_preferences: selectedRoles.map(role => ({role_taxonomy_id: role.id})),
      });
      Alert.alert('Berhasil', 'Preferensi kerja berhasil disimpan.');
    } catch (error) {
      Alert.alert('Gagal menyimpan', toAppApiError(error).message);
    }
  };

  if (profile.isLoading || profile.isError || !profile.data) {
    return <View style={styles.screen}><ProfileHeader title="Preferensi Kerja" /><ScreenState loading={profile.isLoading} error={profile.isError ? toAppApiError(profile.error).message : !profile.data ? 'Profil tidak ditemukan.' : undefined} onRetry={() => void profile.refetch()} /></View>;
  }

  return (
    <View style={styles.screen}>
      <ProfileHeader title="Preferensi Kerja" />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.sectionBlock}>
          <View style={styles.sectionTitleRow}><Ionicons name="briefcase-outline" size={20} color={profileColors.navy} /><Text style={styles.sectionTitle}>Posisi yang diminati</Text></View>
          <View style={styles.chipWrap}>{selectedRoles.map(role => <View key={role.id} style={styles.selectedChip}><Text style={styles.selectedChipText}>{role.name}</Text><Pressable onPress={() => setSelectedRoles(items => items.filter(item => item.id !== role.id))}><Ionicons name="close" size={16} color={profileColors.blue} /></Pressable></View>)}</View>
          <TextInput placeholder="Cari posisi" placeholderTextColor="#98A2B3" value={roleSearch} onChangeText={setRoleSearch} style={styles.input} />
          {availableRoles.length > 0 ? <View style={styles.suggestionBox}>{availableRoles.map(role => <Pressable key={role.id} onPress={() => { if (selectedRoles.length >= 10) return Alert.alert('Batas posisi', 'Maksimal 10 posisi.'); setSelectedRoles(items => [...items, role]); setRoleSearch(''); }} style={styles.suggestion}><Text style={styles.suggestionText}>{role.name}</Text><Ionicons name="add" size={18} color={profileColors.blue} /></Pressable>)}</View> : null}
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionTitleRow}><Ionicons name="location-outline" size={20} color={profileColors.navy} /><Text style={styles.sectionTitle}>Lokasi kerja yang diminati</Text></View>
          <View style={styles.chipWrap}>{locations.map(location => <View key={location} style={styles.selectedChip}><Text style={styles.selectedChipText}>{location}</Text><Pressable onPress={() => setLocations(items => items.filter(item => item !== location))}><Ionicons name="close" size={16} color={profileColors.blue} /></Pressable></View>)}</View>
          <View style={styles.addRow}><TextInput placeholder="Tambah lokasi" placeholderTextColor="#98A2B3" value={locationInput} onChangeText={setLocationInput} onSubmitEditing={addLocation} style={[styles.input, styles.addInput]} /><Pressable onPress={addLocation} style={styles.addButton}><Ionicons name="add" size={21} color={profileColors.blue} /></Pressable></View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionTitleRow}><Ionicons name="cash-outline" size={20} color={profileColors.navy} /><Text style={styles.sectionTitle}>Ekspektasi gaji</Text></View>
          <TextInput keyboardType="number-pad" placeholder="Contoh: 8000000" placeholderTextColor="#98A2B3" value={salary} onChangeText={value => setSalary(value.replace(/\D/g, ''))} style={styles.input} />
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionTitleRow}><Ionicons name="time-outline" size={20} color={profileColors.navy} /><Text style={styles.sectionTitle}>Ketersediaan kerja</Text></View>
          <View style={styles.chipWrap}>{availabilityOptions.map(([value, label]) => <Pressable key={value} onPress={() => setAvailability(value)} style={[styles.optionChip, availability === value && styles.optionChipActive]}><Text style={[styles.optionText, availability === value && styles.optionTextActive]}>{label}</Text></Pressable>)}</View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionTitleRow}><Ionicons name="briefcase-outline" size={20} color={profileColors.navy} /><Text style={styles.sectionTitle}>Jenis pekerjaan</Text></View>
          <View style={styles.toggleGrid}>{workTypeOptions.map(([value, label]) => <ToggleChip key={value} active={workTypes.includes(value)} label={label} onPress={() => toggle(workTypes, value, 7, setWorkTypes)} />)}</View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionTitleRow}><Ionicons name="business-outline" size={20} color={profileColors.navy} /><Text style={styles.sectionTitle}>Tempat kerja</Text></View>
          <View style={styles.toggleGrid}>{workSettingOptions.map(([value, label]) => <ToggleChip key={value} active={workSettings.includes(value)} label={label} onPress={() => toggle(workSettings, value, 3, setWorkSettings)} />)}</View>
        </View>

        <BinaryChoice label="Bersedia bekerja shift" value={shift} onChange={setShift} />
        <BinaryChoice label="Bersedia ditempatkan di luar lokasi pilihan" value={relocate} onChange={setRelocate} />

        <View style={styles.infoBox}><Ionicons name="information-circle-outline" size={21} color={profileColors.blue} /><Text style={styles.infoText}>Preferensi membantu rekomendasi. Anda tetap dapat melamar di luar pilihan ini.</Text></View>
        <View style={styles.actions}><Pressable onPress={reset} style={styles.cancelButton}><Text style={styles.cancelText}>Batal</Text></Pressable><View style={styles.saveWrap}><PrimaryButton disabled={mutation.isPending} label={mutation.isPending ? 'Menyimpan...' : 'Simpan Preferensi'} onPress={() => void save()} /></View></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: profileColors.background},
  content: {padding: 16, gap: 18, paddingBottom: 32},
  sectionBlock: {gap: 10},
  sectionTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  sectionTitle: {fontFamily: profileFonts.bold, fontSize: 13, lineHeight: 18, color: profileColors.ink},
  chipWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  selectedChip: {minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, backgroundColor: '#EAF2FF', paddingHorizontal: 11},
  selectedChipText: {fontFamily: profileFonts.semibold, fontSize: 10.5, color: profileColors.blue},
  input: {height: 48, borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 11, backgroundColor: 'white', paddingHorizontal: 13, fontFamily: profileFonts.regular, fontSize: 12, color: profileColors.ink},
  suggestionBox: {borderWidth: 1, borderColor: profileColors.border, borderRadius: 10, backgroundColor: 'white', overflow: 'hidden'},
  suggestion: {minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: profileColors.border},
  suggestionText: {fontFamily: profileFonts.medium, fontSize: 11, color: profileColors.ink},
  addRow: {flexDirection: 'row', gap: 8},
  addInput: {flex: 1},
  addButton: {width: 48, height: 48, borderRadius: 11, borderWidth: 1.5, borderColor: profileColors.blue, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white'},
  optionChip: {minHeight: 38, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: 'white', justifyContent: 'center', paddingHorizontal: 12},
  optionChipActive: {backgroundColor: '#EAF2FF', borderColor: profileColors.blue},
  optionText: {fontFamily: profileFonts.medium, fontSize: 10.5, color: profileColors.muted},
  optionTextActive: {color: profileColors.blue},
  toggleGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  toggleChip: {width: '48%', minHeight: 44, flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, backgroundColor: '#F3F6FA', paddingHorizontal: 10},
  toggleChipActive: {backgroundColor: '#E5F0FF'},
  toggleText: {fontFamily: profileFonts.medium, fontSize: 10.5, color: profileColors.muted},
  toggleTextActive: {color: profileColors.blue},
  binaryRow: {flexDirection: 'row', gap: 24},
  radioOption: {minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 7},
  radioText: {fontFamily: profileFonts.medium, fontSize: 11, color: profileColors.ink},
  infoBox: {flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 11, borderWidth: 1, borderColor: '#84B6FF', backgroundColor: '#EDF5FF', padding: 12},
  infoText: {flex: 1, fontFamily: profileFonts.regular, fontSize: 10.5, lineHeight: 16, color: profileColors.blue},
  actions: {flexDirection: 'row', gap: 10},
  cancelButton: {flex: 0.8, minHeight: 49, borderWidth: 1.5, borderColor: profileColors.blue, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white'},
  cancelText: {fontFamily: profileFonts.semibold, fontSize: 12, color: profileColors.blue},
  saveWrap: {flex: 1.3},
});
