import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, View, useWindowDimensions} from 'react-native';

import {calculateAge} from '../onboarding.schemas';
import {toAppApiError} from '../../../core/api/api-error';
import type {EducationDraft, MasterOption, OnboardingAction, OnboardingDraft, RunOnboardingAction} from '../onboarding.types';
import {AddressFields} from './AddressFields';
import {DateField} from './DateField';
import {EducationModal} from './EducationModal';
import {AddField, CheckboxField, SelectField, TextField} from './FormControls';
import {IdentityUploadCards} from './IdentityUploadCards';
import {onboardingApi, type KtpExtractedData} from '../api/onboarding.api';
import {resolveKtpAddress} from '../ktp-ocr';

const genderOptions: MasterOption[] = [{value: 'male', label: 'Laki-laki'}, {value: 'female', label: 'Perempuan'}];
const maritalOptions: MasterOption[] = [{value: 'single', label: 'Belum Menikah'}, {value: 'married', label: 'Menikah'}, {value: 'other', label: 'Lainnya'}];

export function PersonalDataStep({draft, dispatch, majorOptions, majorLoading, majorError, onRetryMajors, onNext, runAction}: {
  draft: OnboardingDraft;
  dispatch: React.Dispatch<OnboardingAction>;
  majorOptions: MasterOption[];
  majorLoading?: boolean;
  majorError?: boolean;
  onRetryMajors?: () => void;
  onNext: () => void;
  runAction: RunOnboardingAction;
}) {
  const {width} = useWindowDimensions();
  const [educationOpen, setEducationOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<EducationDraft | null>(null);
  const [nikCheck, setNikCheck] = useState<{status: 'idle' | 'checking' | 'valid' | 'warning' | 'invalid' | 'error'; message: string}>({status: 'idle', message: ''});
  const nikRequestId = useRef(0);
  const age = useMemo(() => calculateAge(draft.birthDate), [draft.birthDate]);
  const birthDateLimits = useMemo(() => {
    const today = new Date();
    return {
      minimumDate: new Date(today.getFullYear() - 100, today.getMonth(), today.getDate(), 12),
      maximumDate: new Date(today.getFullYear() - 15, today.getMonth(), today.getDate(), 12),
    };
  }, []);
  const setField = <K extends keyof OnboardingDraft>(field: K, value: OnboardingDraft[K]) => dispatch({type: 'set-field', field, value});
  const applyOcr = async (extracted: KtpExtractedData) => {
    if (extracted.nik) setField('nik', extracted.nik.replace(/\D/g, '').slice(0, 16));
    if (extracted.full_name) setField('fullName', extracted.full_name);
    if (extracted.birth_place) setField('birthPlace', extracted.birth_place);
    if (extracted.birth_date) setField('birthDate', extracted.birth_date);
    if (extracted.gender) setField('gender', extracted.gender);
    if (extracted.marital_status) setField('maritalStatus', extracted.marital_status);
    try {
      const resolvedAddress = await resolveKtpAddress(extracted, draft.identityAddress);
      dispatch({type: 'set-address', target: 'identityAddress', address: resolvedAddress});
    } catch {
      const addressLine = extracted.full_address || extracted.address;
      if (addressLine) dispatch({type: 'set-address', target: 'identityAddress', address: {...draft.identityAddress, addressLine}});
    }
  };

  useEffect(() => {
    const nik = draft.nik.replace(/\D/g, '');
    const requestId = ++nikRequestId.current;
    if (nik.length !== 16) {
      setNikCheck({status: 'idle', message: ''});
      return;
    }
    setNikCheck({status: 'checking', message: 'Memeriksa ketersediaan NIK...'});
    const timer = setTimeout(() => {
      void onboardingApi.checkNik(nik).then(result => {
        if (requestId !== nikRequestId.current) return;
        if (!result.available || result.status === 'active_user') {
          setNikCheck({status: 'invalid', message: result.message});
        } else if (result.status === 'reused_deleted' || result.hasBlacklist) {
          setNikCheck({status: 'warning', message: result.message});
        } else {
          setNikCheck({status: 'valid', message: result.message});
        }
      }).catch(error => {
        if (requestId !== nikRequestId.current) return;
        setNikCheck({status: 'error', message: toAppApiError(error).message});
      });
    }, 450);
    return () => clearTimeout(timer);
  }, [draft.nik]);

  const continueWhenNikValid = () => {
    if (nikCheck.status === 'checking') return Alert.alert('NIK sedang diperiksa', 'Tunggu hingga pemeriksaan NIK selesai.');
    if (nikCheck.status === 'invalid' || nikCheck.status === 'error') {
      return Alert.alert('NIK belum dapat digunakan', nikCheck.message || 'Periksa kembali NIK Anda.');
    }
    onNext();
  };

  const openEducation = (item: EducationDraft | null = null) => {
    setEditingEducation(item);
    setEducationOpen(true);
  };
  const saveEducation = (education: EducationDraft) => {
    setEducationOpen(false);
    runAction({
      loadingMessage: 'Menyimpan pendidikan...',
      successTitle: 'Berhasil!',
      successMessage: 'Data pendidikan berhasil disimpan ke profil.',
    }, () => dispatch({type: 'set-education', education}));
  };
  const removeEducation = (item: EducationDraft) => Alert.alert('Hapus pendidikan?', `${item.educationLevel} - ${item.schoolName}`, [
    {text: 'Batal', style: 'cancel'},
    {text: 'Hapus', style: 'destructive', onPress: () => dispatch({type: 'remove-education', id: item.id})},
  ]);

  return (
    <View testID="personal-data-step" style={styles.stepContent}>
      <IdentityUploadCards
        avatarUrl={draft.avatarUrl}
        ktpPath={draft.ktpPath}
        ktpUrl={draft.ktpUrl}
        onAvatarUploaded={result => {
          setField('avatarPath', result.path);
          setField('avatarUrl', result.url);
        }}
        onKtpUploaded={result => {
          setField('ktpPath', result.path);
          setField('ktpUrl', result.url);
          void applyOcr(result.extracted);
        }}
      />
      <View testID="personal-information-card" style={[styles.card, width < 390 && styles.cardNarrow]}>
        <View style={styles.sectionTitle}><Ionicons name="person-outline" size={25} color="#2F7FFF" /><Text style={styles.sectionTitleText}>Informasi Pribadi</Text></View>
        <TextField
          label="NIK"
          required
          value={draft.nik}
          onChangeText={value => setField('nik', value.replace(/\D/g, '').slice(0, 16))}
          keyboardType="number-pad"
          maxLength={16}
          placeholder="Contoh: 3275010101900001"
        />
        {nikCheck.status !== 'idle' ? (
          <View style={[styles.nikStatus, nikCheck.status === 'invalid' || nikCheck.status === 'error' ? styles.nikStatusError : nikCheck.status === 'warning' ? styles.nikStatusWarning : styles.nikStatusValid]}>
            {nikCheck.status === 'checking'
              ? <Ionicons name="sync-outline" size={15} color="#8DBBFF" />
              : <Ionicons name={nikCheck.status === 'invalid' || nikCheck.status === 'error' ? 'alert-circle-outline' : nikCheck.status === 'warning' ? 'warning-outline' : 'checkmark-circle-outline'} size={15} color={nikCheck.status === 'invalid' || nikCheck.status === 'error' ? '#FF8A98' : nikCheck.status === 'warning' ? '#FACC15' : '#5EE2AE'} />}
            <Text style={styles.nikStatusText}>{nikCheck.message}</Text>
          </View>
        ) : null}
        <TextField label="Nama Lengkap" required value={draft.fullName} onChangeText={value => setField('fullName', value)} placeholder="Contoh: Andi Permana" />
      <SelectField label="Jenis Kelamin" required value={draft.gender} onChange={value => setField('gender', value as OnboardingDraft['gender'])} options={genderOptions} placeholder="Pilih jenis kelamin" />
      <View style={[styles.columns, width < 390 && styles.columnsNarrow]}>
        <View style={styles.column}><TextField label="Tempat Lahir" required value={draft.birthPlace} onChangeText={value => setField('birthPlace', value)} placeholder="Contoh: Jakarta" /></View>
        <View style={styles.column}><DateField label="Tanggal Lahir" required value={draft.birthDate} onChange={value => setField('birthDate', value)} {...birthDateLimits} /></View>
      </View>
      <TextField label="Usia" disabled value={age === null ? '-' : String(age)} />
      <SelectField label="Status Pernikahan" required value={draft.maritalStatus} onChange={value => setField('maritalStatus', value as OnboardingDraft['maritalStatus'])} options={maritalOptions} placeholder="Pilih status pernikahan" />
      <TextField label="No. Handphone / WhatsApp" required value={draft.phone} onChangeText={value => setField('phone', value)} keyboardType="phone-pad" placeholder="628xxxxxxxxxx" />
      <AddressFields label="Alamat KTP" value={draft.identityAddress} onChange={address => dispatch({type: 'set-address', target: 'identityAddress', address})} />
      <AddressFields
        label="Alamat Domisili"
        disabled={draft.domicileSameAsIdentity}
        value={draft.domicileAddress}
        onChange={address => dispatch({type: 'set-address', target: 'domicileAddress', address})}
        afterAddressLine={(
          <View style={styles.sameAddress} testID="same-address-after-domicile">
            <CheckboxField label="Sama dengan alamat di KTP" checked={draft.domicileSameAsIdentity} onChange={value => setField('domicileSameAsIdentity', value)} />
          </View>
        )}
      />

      <AddField label="Pendidikan Terakhir" required placeholder={draft.educations.length ? 'Tambah pendidikan lainnya' : 'Belum ada pendidikan ditambahkan'} onPress={() => openEducation()} />
      {draft.educations.map(item => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemIcon}><Ionicons name="school" size={17} color="#0B66EE" /></View>
          <View style={styles.itemCopy}>
            <Text style={styles.itemTitle}>{item.educationLevel}{item.schoolName ? ` - ${item.schoolName}` : ''}</Text>
            {item.majorName ? <Text style={styles.itemMeta}>Jurusan: {item.majorName}</Text> : null}
            {item.startDate ? <Text style={styles.itemMeta}>{item.startDate}{item.ongoing ? ' - Sekarang' : item.endDate ? ` - ${item.endDate}` : ''}</Text> : null}
          </View>
          <View style={styles.itemActions}>
            <Pressable accessibilityLabel="Edit pendidikan" onPress={() => openEducation(item)} style={styles.itemAction}><Ionicons name="create-outline" size={20} color="#087BFF" /></Pressable>
            <Pressable accessibilityLabel="Hapus pendidikan" onPress={() => removeEducation(item)} style={styles.itemAction}><Ionicons name="trash-outline" size={20} color="#FF3347" /></Pressable>
          </View>
        </View>
      ))}

      <View style={styles.privacy}><Ionicons name="shield-checkmark-outline" size={25} color="#3B86FF" /><Text style={styles.privacyText}>Data yang Anda berikan ke sistem kami akan dilindungi dan hanya digunakan untuk kebutuhan rekrutmen.</Text></View>
      <Pressable accessibilityRole="button" onPress={continueWhenNikValid} style={styles.primaryButton}>
        <LinearGradient colors={['#0B5CFF', '#00D8F4']} end={{x: 1, y: 0}} start={{x: 0, y: 0}} style={styles.gradient}><Text style={styles.primaryText}>Selanjutnya</Text></LinearGradient>
      </Pressable>

        {educationOpen ? <EducationModal visible initialValue={editingEducation} majorOptions={majorOptions} majorLoading={majorLoading} majorError={majorError} onRetryMajors={onRetryMajors} onCancel={() => setEducationOpen(false)} onSave={saveEducation} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContent: {width: '100%', gap: 16},
  card: {width: '100%', maxWidth: 620, alignSelf: 'center', backgroundColor: '#061D52', borderRadius: 22, paddingHorizontal: 24, paddingTop: 31, paddingBottom: 30},
  cardNarrow: {borderRadius: 18, paddingHorizontal: 16, paddingTop: 25},
  sectionTitle: {flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 31},
  sectionTitleText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: 'white', fontSize: 19},
  columns: {flexDirection: 'row', gap: 12},
  columnsNarrow: {flexDirection: 'column', gap: 0},
  column: {flex: 1, minWidth: 0},
  sameAddress: {marginBottom: 10},
  nikStatus: {marginTop: -8, marginBottom: 14, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 9, flexDirection: 'row', alignItems: 'flex-start', gap: 7},
  nikStatusValid: {backgroundColor: '#073B45'},
  nikStatusWarning: {backgroundColor: '#4A3B08'},
  nikStatusError: {backgroundColor: '#4B1930'},
  nikStatusText: {flex: 1, fontFamily: 'PlusJakartaSans_400Regular', color: 'white', fontSize: 10, lineHeight: 15},
  itemCard: {backgroundColor: 'white', borderRadius: 11, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 9},
  itemIcon: {width: 28, height: 28, borderRadius: 14, backgroundColor: '#E8F1FF', alignItems: 'center', justifyContent: 'center'},
  itemCopy: {flex: 1, minWidth: 0},
  itemActions: {flexDirection: 'row', alignItems: 'center'},
  itemAction: {width: 40, height: 44, alignItems: 'center', justifyContent: 'center'},
  itemTitle: {fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: '#172036'},
  itemMeta: {fontFamily: 'PlusJakartaSans_400Regular', fontSize: 9, color: '#616A79', marginTop: 2},
  privacy: {flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#0B2A62', borderRadius: 12, padding: 14, marginTop: 14, marginBottom: 22},
  privacyText: {flex: 1, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, lineHeight: 15, color: '#438AFF'},
  primaryButton: {height: 56, borderRadius: 11, overflow: 'hidden'},
  gradient: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  primaryText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: 'white', fontSize: 15},
});
