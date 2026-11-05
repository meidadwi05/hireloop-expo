import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import React, {useMemo, useState} from 'react';
import {KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import type {CandidateJobDetail} from '../../jobs/jobs.types';
import type {CompleteRequirementsInput, RequirementUpload} from '../applications.types';
import {APPLICATION_COLORS, APPLICATION_FONTS} from './applications.ui';

type Props = {visible: boolean; applicationId: number; job: CandidateJobDetail; loading: boolean; error?: string; onClose: () => void; onSubmit: (input: CompleteRequirementsInput) => void};

export function CompleteRequirementsModal({visible, applicationId, job, loading, error, onClose, onSubmit}: Props) {
  const [uploads, setUploads] = useState<Record<number, RequirementUpload>>({});
  const [familyRelation, setFamilyRelation] = useState(false);
  const [policyChecks, setPolicyChecks] = useState<Record<number, boolean>>({});
  const [agreed, setAgreed] = useState(false);
  const [validation, setValidation] = useState('');

  const requiredComplete = useMemo(() => job.documentRequirements.every((item, index) => !item.required || Boolean(uploads[index]?.uri)), [job.documentRequirements, uploads]);
  const policiesComplete = useMemo(() => job.policies.every((item, index) => !item.required || policyChecks[index]), [job.policies, policyChecks]);

  const choose = async (index: number, requirement: CandidateJobDetail['documentRequirements'][number]) => {
    const result = await DocumentPicker.getDocumentAsync({type: ['application/pdf', 'image/jpeg', 'image/png'], copyToCacheDirectory: true});
    if (result.canceled) return;
    const asset = result.assets[0];
    if ((asset.size ?? 0) > 2 * 1024 * 1024) return setValidation('Ukuran setiap file maksimal 2 MB.');
    setValidation('');
    setUploads(current => ({...current, [index]: {label: requirement.label, group: requirement.group, required: requirement.required, uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? 'application/octet-stream', file: asset.file}}));
  };
  const submit = () => {
    if (!requiredComplete) return setValidation('Lengkapi seluruh dokumen yang berstatus wajib.');
    if (!policiesComplete) return setValidation('Setujui seluruh pernyataan yang berstatus wajib.');
    if (!agreed) return setValidation('Persetujuan akhir wajib dicentang.');
    const documents = job.documentRequirements.map((item, index) => uploads[index] ?? item);
    onSubmit({applicationId, documents, familyDeclaration: job.familyDeclarationRequired ? {has_family_relation: familyRelation} : undefined, statements: job.policies.length ? Object.fromEntries(job.policies.map((item, index) => [item.name, Boolean(policyChecks[index])])) : undefined, agreed: true});
  };

  return <Modal visible={visible} animationType="slide" onRequestClose={() => !loading && onClose()}><SafeAreaView style={styles.safe}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.safe}>
    <View style={styles.header}><View style={styles.headerCopy}><Text style={styles.title}>Lengkapi Persyaratan</Text><Text numberOfLines={2} style={styles.subtitle}>{job.title} · {job.company}</Text></View><Pressable accessibilityLabel="Tutup persyaratan" disabled={loading} onPress={onClose} style={styles.close}><Ionicons name="close" size={25} color={APPLICATION_COLORS.navy} /></Pressable></View>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <View style={styles.info}><Ionicons name="shield-checkmark-outline" size={23} color={APPLICATION_COLORS.blue} /><Text style={styles.infoText}>Lamaran akan aktif setelah persyaratan wajib dikirim dan diverifikasi oleh sistem.</Text></View>
      <Text style={styles.sectionTitle}>Dokumen</Text>
      {job.documentRequirements.length ? job.documentRequirements.map((item, index) => <View key={`${item.group}:${item.label}:${index}`} style={styles.requirement}><View style={styles.requirementTop}><View style={styles.fileIcon}><Ionicons name={item.group === 'sertifikasi' ? 'ribbon-outline' : 'document-text-outline'} size={21} color={APPLICATION_COLORS.blue} /></View><View style={styles.requirementCopy}><Text style={styles.requirementLabel}>{item.label}{item.required ? <Text style={styles.required}> *</Text> : null}</Text><Text style={styles.requirementHint}>PDF/JPG/PNG · maksimal 2 MB</Text></View></View><Pressable disabled={loading} onPress={() => void choose(index, item)} style={styles.fileButton}><Ionicons name={uploads[index] ? 'checkmark-circle' : 'cloud-upload-outline'} size={20} color={uploads[index] ? '#087A51' : APPLICATION_COLORS.blue} /><Text numberOfLines={1} style={[styles.fileButtonText, uploads[index] && styles.fileSelected]}>{uploads[index]?.name ?? 'Pilih File'}</Text></Pressable></View>) : <Text style={styles.empty}>Posisi ini tidak meminta dokumen tambahan.</Text>}
      {job.familyDeclarationRequired ? <><Text style={styles.sectionTitle}>Hubungan Keluarga</Text><CheckRow checked={familyRelation} onPress={() => setFamilyRelation(current => !current)} label="Saya memiliki hubungan keluarga dengan karyawan/perwakilan perusahaan." /></> : null}
      {job.policies.length ? <><Text style={styles.sectionTitle}>Pernyataan</Text>{job.policies.map((item, index) => <CheckRow key={`${item.name}:${index}`} checked={Boolean(policyChecks[index])} onPress={() => setPolicyChecks(current => ({...current, [index]: !current[index]}))} label={`${item.name}${item.required ? ' *' : ''}`} />)}</> : null}
      <Text style={styles.sectionTitle}>Persetujuan</Text><CheckRow checked={agreed} onPress={() => setAgreed(current => !current)} label="Saya menyetujui syarat dan ketentuan yang berlaku. *" />
      {validation || error ? <View style={styles.error}><Ionicons name="alert-circle-outline" size={18} color="#B42318" /><Text style={styles.errorText}>{validation || error}</Text></View> : null}
      <Pressable accessibilityRole="button" disabled={loading} onPress={submit} style={[styles.submit, loading && styles.disabled]}><Text style={styles.submitText}>{loading ? 'Mengirim persyaratan...' : 'Kirim Persyaratan'}</Text><Ionicons name="arrow-forward" size={20} color="white" /></Pressable>
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView></Modal>;
}

function CheckRow({checked, onPress, label}: {checked: boolean; onPress: () => void; label: string}) { return <Pressable accessibilityRole="checkbox" accessibilityState={{checked}} onPress={onPress} style={styles.checkRow}><View style={[styles.checkbox, checked && styles.checkboxOn]}>{checked ? <Ionicons name="checkmark" size={15} color="white" /> : null}</View><Text style={styles.checkText}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: APPLICATION_COLORS.background}, header: {minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: APPLICATION_COLORS.border, paddingHorizontal: 18}, headerCopy: {flex: 1, minWidth: 0}, title: {fontFamily: APPLICATION_FONTS.bold, fontSize: 18, color: APPLICATION_COLORS.navy}, subtitle: {fontFamily: APPLICATION_FONTS.regular, fontSize: 10.5, lineHeight: 16, color: APPLICATION_COLORS.body, marginTop: 2}, close: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'}, content: {padding: 18, paddingBottom: 42, gap: 12}, info: {flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: '#B2CCFF', backgroundColor: '#EFF8FF', borderRadius: 12, padding: 13}, infoText: {flex: 1, fontFamily: APPLICATION_FONTS.regular, fontSize: 10.5, lineHeight: 17, color: '#175CD3'}, sectionTitle: {fontFamily: APPLICATION_FONTS.bold, fontSize: 14, color: APPLICATION_COLORS.navy, marginTop: 8}, requirement: {borderRadius: 14, borderWidth: 1, borderColor: APPLICATION_COLORS.border, backgroundColor: 'white', padding: 13, gap: 11}, requirementTop: {flexDirection: 'row', alignItems: 'center', gap: 10}, fileIcon: {width: 42, height: 42, borderRadius: 11, backgroundColor: '#EDF5FF', alignItems: 'center', justifyContent: 'center'}, requirementCopy: {flex: 1, minWidth: 0}, requirementLabel: {fontFamily: APPLICATION_FONTS.semibold, fontSize: 11.5, lineHeight: 17, color: APPLICATION_COLORS.navy}, required: {color: APPLICATION_COLORS.red}, requirementHint: {fontFamily: APPLICATION_FONTS.regular, fontSize: 9, color: APPLICATION_COLORS.body, marginTop: 2}, fileButton: {minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 10, borderWidth: 1, borderColor: '#B2CCFF', paddingHorizontal: 12}, fileButtonText: {maxWidth: '82%', fontFamily: APPLICATION_FONTS.semibold, fontSize: 10.5, color: APPLICATION_COLORS.blue}, fileSelected: {color: '#087A51'}, empty: {fontFamily: APPLICATION_FONTS.regular, fontSize: 10.5, color: APPLICATION_COLORS.body, fontStyle: 'italic'}, checkRow: {minHeight: 50, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 12, borderWidth: 1, borderColor: APPLICATION_COLORS.border, backgroundColor: 'white', padding: 13}, checkbox: {width: 21, height: 21, borderRadius: 5, borderWidth: 1.5, borderColor: '#B7C1D0', alignItems: 'center', justifyContent: 'center'}, checkboxOn: {backgroundColor: APPLICATION_COLORS.blue, borderColor: APPLICATION_COLORS.blue}, checkText: {flex: 1, fontFamily: APPLICATION_FONTS.regular, fontSize: 10.5, lineHeight: 17, color: APPLICATION_COLORS.body}, error: {flexDirection: 'row', gap: 8, borderRadius: 10, backgroundColor: '#FEF3F2', padding: 11}, errorText: {flex: 1, fontFamily: APPLICATION_FONTS.regular, fontSize: 10.5, lineHeight: 16, color: '#B42318'}, submit: {minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, backgroundColor: APPLICATION_COLORS.blue, marginTop: 8}, disabled: {opacity: 0.55}, submitText: {fontFamily: APPLICATION_FONTS.bold, fontSize: 12.5, color: 'white'},
});
