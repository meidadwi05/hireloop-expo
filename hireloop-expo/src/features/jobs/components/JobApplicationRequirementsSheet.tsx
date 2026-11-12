import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import React, {useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import type {CandidateApplicationUpload, CandidateJobDetail} from '../jobs.types';
import {JOBS_COLORS, JOBS_FONTS} from './jobs.ui';

export type JobApplicationRequirementsValue = {
  documents: CandidateApplicationUpload[];
  familyDeclaration?: Record<string, string>;
  statements?: Record<string, 'Ya' | 'Tidak'>;
  referral?: string;
  agreed: true;
};

type Props = {
  visible: boolean;
  job: CandidateJobDetail;
  submitting: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (value: JobApplicationRequirementsValue) => void;
};

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export function JobApplicationRequirementsSheet({visible, job, submitting, error, onClose, onSubmit}: Props) {
  const {height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [uploads, setUploads] = useState<Record<number, CandidateApplicationUpload>>({});
  const [family, setFamily] = useState<Record<string, string>>({});
  const [statements, setStatements] = useState<Record<string, 'Ya' | 'Tidak'>>({});
  const [referral, setReferral] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [validation, setValidation] = useState('');

  const requiredDocumentsComplete = useMemo(
    () => job.documentRequirements.every((item, index) => !item.required || Boolean(uploads[index]?.uri)),
    [job.documentRequirements, uploads],
  );
  const requiredFamilyComplete = useMemo(
    () => job.familyRequirements.every(item => !item.required || Boolean(family[item.key]?.trim())),
    [family, job.familyRequirements],
  );
  const requiredStatementsComplete = useMemo(
    () => job.policies.every(item => !item.required || Boolean(statements[item.key])),
    [job.policies, statements],
  );

  const chooseFile = async (index: number, requirement: CandidateJobDetail['documentRequirements'][number]) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if ((asset.size ?? 0) > MAX_FILE_SIZE) {
      setValidation('Ukuran setiap file maksimal 2 MB.');
      return;
    }

    setValidation('');
    setUploads(current => ({
      ...current,
      [index]: {
        label: requirement.label,
        group: requirement.group,
        required: requirement.required,
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? 'application/octet-stream',
        file: asset.file,
      },
    }));
  };

  const submit = () => {
    if (!requiredDocumentsComplete) return setValidation('Lengkapi seluruh dokumen yang berstatus wajib.');
    if (!requiredFamilyComplete) return setValidation('Lengkapi data keluarga yang berstatus wajib.');
    if (!requiredStatementsComplete) return setValidation('Jawab seluruh pernyataan yang berstatus wajib.');
    if (!agreed) return setValidation('Persetujuan akhir wajib dicentang.');

    setValidation('');
    onSubmit({
      documents: job.documentRequirements.map((item, index) => uploads[index] ?? item),
      familyDeclaration: job.familyRequirements.length ? family : undefined,
      statements: job.policies.length ? statements : undefined,
      referral: referral.trim() || undefined,
      agreed: true,
    });
  };

  return (
    <Modal animationType="slide" onRequestClose={() => !submitting && onClose()} transparent visible={visible}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
        <Pressable accessibilityLabel="Tutup formulir lamaran" onPress={() => !submitting && onClose()} style={styles.backdrop} />
        <View style={[styles.sheet, {maxHeight: Math.min(height * 0.9, 760), paddingBottom: Math.max(insets.bottom, 12)}]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Lengkapi Dokumen Lamaran</Text>
              <Text numberOfLines={2} style={styles.subtitle}>{job.title} · {job.company}</Text>
            </View>
            <Pressable accessibilityLabel="Tutup" disabled={submitting} hitSlop={8} onPress={onClose} style={styles.closeButton}>
              <Ionicons color={JOBS_COLORS.ink} name="close" size={23} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.infoBanner}>
              <Ionicons color={JOBS_COLORS.blue} name="shield-checkmark-outline" size={21} />
              <Text style={styles.infoText}>Pastikan data dan dokumen benar. Lamaran akan diproses setelah persyaratan terkirim.</Text>
            </View>

            {job.documentRequirements.length ? (
              <Section icon="document-attach-outline" title="Dokumen & Sertifikasi">
                {job.documentRequirements.map((item, index) => (
                  <View key={`${item.group}:${item.label}:${index}`} style={styles.requirementRow}>
                    <View style={styles.requirementIcon}>
                      <Ionicons color={item.group === 'sertifikasi' ? '#7A4CE0' : JOBS_COLORS.blue} name={item.group === 'sertifikasi' ? 'ribbon-outline' : 'document-text-outline'} size={20} />
                    </View>
                    <View style={styles.requirementCopy}>
                      <Text style={styles.requirementLabel}>{item.label}{item.required ? <Text style={styles.required}> *</Text> : null}</Text>
                      <Text style={styles.requirementHint}>PDF/JPG/PNG · maksimal 2 MB</Text>
                    </View>
                    <Pressable accessibilityRole="button" disabled={submitting} onPress={() => void chooseFile(index, item)} style={[styles.uploadButton, uploads[index] && styles.uploadButtonDone]}>
                      <Ionicons color={uploads[index] ? '#087A51' : JOBS_COLORS.blue} name={uploads[index] ? 'checkmark' : 'cloud-upload-outline'} size={17} />
                      <Text numberOfLines={1} style={[styles.uploadText, uploads[index] && styles.uploadTextDone]}>{uploads[index]?.name ?? 'Pilih'}</Text>
                    </Pressable>
                  </View>
                ))}
              </Section>
            ) : null}

            {job.familyRequirements.length ? (
              <Section icon="people-outline" title="Deklarasi Keluarga">
                <Text style={styles.sectionDescription}>Data ini digunakan sesuai kebijakan proses rekrutmen perusahaan.</Text>
                {job.familyRequirements.map(item => (
                  <View key={item.key} style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>{item.label}{item.required ? <Text style={styles.required}> *</Text> : null}</Text>
                    <TextInput
                      editable={!submitting}
                      onChangeText={value => setFamily(current => ({...current, [item.key]: value}))}
                      placeholder={`Masukkan ${item.label.toLowerCase()}`}
                      placeholderTextColor="#98A2B3"
                      style={styles.input}
                      value={family[item.key] ?? ''}
                    />
                  </View>
                ))}
              </Section>
            ) : null}

            {job.policies.length ? (
              <Section icon="checkbox-outline" title="Pernyataan">
                {job.policies.map(item => (
                  <View key={item.key} style={styles.policyRow}>
                    <Text style={styles.policyQuestion}>{item.name}{item.required ? <Text style={styles.required}> *</Text> : null}</Text>
                    <View style={styles.choiceRow}>
                      {(['Ya', 'Tidak'] as const).map(value => (
                        <Pressable
                          accessibilityRole="radio"
                          accessibilityState={{selected: statements[item.key] === value}}
                          disabled={submitting}
                          key={value}
                          onPress={() => setStatements(current => ({...current, [item.key]: value}))}
                          style={[styles.choice, statements[item.key] === value && styles.choiceActive]}
                        >
                          <Text style={[styles.choiceText, statements[item.key] === value && styles.choiceTextActive]}>{value}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
              </Section>
            ) : null}

            <Section icon="person-add-outline" title="Referral">
              <TextInput
                editable={!submitting}
                onChangeText={setReferral}
                placeholder="Masukkan referensi/referral (opsional)"
                placeholderTextColor="#98A2B3"
                style={styles.input}
                value={referral}
              />
            </Section>

            <Pressable accessibilityRole="checkbox" accessibilityState={{checked: agreed}} disabled={submitting} onPress={() => setAgreed(current => !current)} style={styles.agreement}>
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>{agreed ? <Ionicons color="white" name="checkmark" size={15} /> : null}</View>
              <Text style={styles.agreementText}>Saya menyetujui data profil digunakan untuk proses rekrutmen. <Text style={styles.required}>*</Text></Text>
            </Pressable>

            {validation || error ? (
              <View style={styles.errorBanner}>
                <Ionicons color="#B42318" name="alert-circle-outline" size={18} />
                <Text style={styles.errorText}>{validation || error}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable accessibilityRole="button" disabled={submitting} onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Batal</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={submitting} onPress={submit} style={[styles.submitButton, submitting && styles.disabled]}>
              <Text style={styles.submitText}>{submitting ? 'Mengirim...' : 'Kirim Lamaran'}</Text>
              <Ionicons color="white" name="arrow-forward" size={18} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Section({icon, title, children}: {icon: React.ComponentProps<typeof Ionicons>['name']; title: string; children: React.ReactNode}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons color={JOBS_COLORS.blue} name={icon} size={19} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  modalRoot: {flex: 1, justifyContent: 'flex-end'},
  backdrop: {...StyleSheet.absoluteFill, backgroundColor: 'rgba(4, 14, 37, 0.58)'},
  sheet: {width: '100%', maxWidth: 720, alignSelf: 'center', overflow: 'hidden', borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: '#F7FAFE'},
  handle: {width: 48, height: 5, alignSelf: 'center', borderRadius: 3, backgroundColor: '#CBD5E1', marginTop: 9},
  header: {minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#E4EAF2', paddingHorizontal: 18},
  headerCopy: {flex: 1, minWidth: 0},
  title: {fontFamily: JOBS_FONTS.bold, fontSize: 17, color: JOBS_COLORS.ink},
  subtitle: {fontFamily: JOBS_FONTS.regular, fontSize: 10.5, lineHeight: 15, color: JOBS_COLORS.body, marginTop: 2},
  closeButton: {width: 42, height: 42, alignItems: 'center', justifyContent: 'center'},
  content: {padding: 16, paddingBottom: 20, gap: 13},
  infoBanner: {flexDirection: 'row', alignItems: 'flex-start', gap: 9, borderWidth: 1, borderColor: '#B2CCFF', borderRadius: 12, backgroundColor: '#EFF8FF', padding: 12},
  infoText: {flex: 1, fontFamily: JOBS_FONTS.regular, fontSize: 10.5, lineHeight: 16, color: '#175CD3'},
  section: {gap: 11, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, backgroundColor: 'white', padding: 13},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', gap: 7},
  sectionTitle: {fontFamily: JOBS_FONTS.bold, fontSize: 12.5, color: JOBS_COLORS.ink},
  sectionDescription: {fontFamily: JOBS_FONTS.regular, fontSize: 9.5, lineHeight: 15, color: JOBS_COLORS.body},
  requirementRow: {flexDirection: 'row', alignItems: 'center', gap: 9, borderTopWidth: 1, borderTopColor: '#EEF2F6', paddingTop: 11},
  requirementIcon: {width: 38, height: 38, flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#EDF5FF'},
  requirementCopy: {flex: 1, minWidth: 0},
  requirementLabel: {fontFamily: JOBS_FONTS.semibold, fontSize: 10.5, lineHeight: 15, color: JOBS_COLORS.ink},
  requirementHint: {fontFamily: JOBS_FONTS.regular, fontSize: 8.5, lineHeight: 13, color: JOBS_COLORS.body, marginTop: 2},
  required: {color: '#D92D20'},
  uploadButton: {maxWidth: 105, minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderWidth: 1, borderColor: '#AFCBFF', borderRadius: 9, paddingHorizontal: 9},
  uploadButtonDone: {borderColor: '#A6E6C8', backgroundColor: '#ECFDF3'},
  uploadText: {maxWidth: 65, fontFamily: JOBS_FONTS.semibold, fontSize: 9, color: JOBS_COLORS.blue},
  uploadTextDone: {color: '#087A51'},
  fieldGroup: {gap: 6},
  fieldLabel: {fontFamily: JOBS_FONTS.semibold, fontSize: 10.5, color: JOBS_COLORS.ink},
  input: {minHeight: 46, borderWidth: 1, borderColor: '#D5DDE8', borderRadius: 10, backgroundColor: 'white', paddingHorizontal: 12, fontFamily: JOBS_FONTS.regular, fontSize: 11, color: JOBS_COLORS.ink},
  policyRow: {gap: 9, borderTopWidth: 1, borderTopColor: '#EEF2F6', paddingTop: 11},
  policyQuestion: {fontFamily: JOBS_FONTS.medium, fontSize: 10.5, lineHeight: 16, color: JOBS_COLORS.ink},
  choiceRow: {flexDirection: 'row', gap: 8},
  choice: {minWidth: 76, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D5DDE8', borderRadius: 9, backgroundColor: 'white'},
  choiceActive: {borderColor: JOBS_COLORS.blue, backgroundColor: '#EAF2FF'},
  choiceText: {fontFamily: JOBS_FONTS.semibold, fontSize: 10, color: JOBS_COLORS.body},
  choiceTextActive: {color: JOBS_COLORS.blue},
  agreement: {minHeight: 52, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: '#D5DDE8', borderRadius: 12, backgroundColor: 'white', padding: 13},
  checkbox: {width: 21, height: 21, flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#AAB4C3', borderRadius: 5},
  checkboxChecked: {borderColor: JOBS_COLORS.blue, backgroundColor: JOBS_COLORS.blue},
  agreementText: {flex: 1, fontFamily: JOBS_FONTS.regular, fontSize: 10.5, lineHeight: 17, color: JOBS_COLORS.body},
  errorBanner: {flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 10, backgroundColor: '#FEF3F2', padding: 11},
  errorText: {flex: 1, fontFamily: JOBS_FONTS.regular, fontSize: 10, lineHeight: 15, color: '#B42318'},
  footer: {flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#E4EAF2', backgroundColor: 'white', paddingHorizontal: 16, paddingTop: 12},
  cancelButton: {minHeight: 48, flex: 0.75, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#C8D2E1', borderRadius: 11},
  cancelText: {fontFamily: JOBS_FONTS.semibold, fontSize: 11, color: JOBS_COLORS.body},
  submitButton: {minHeight: 48, flex: 1.25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 11, backgroundColor: JOBS_COLORS.blue},
  submitText: {fontFamily: JOBS_FONTS.bold, fontSize: 11, color: 'white'},
  disabled: {opacity: 0.55},
});
