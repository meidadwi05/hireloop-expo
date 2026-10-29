import Ionicons from '@expo/vector-icons/Ionicons';
import {File, Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type {CandidateBlacklistInfo} from '../../features/auth/auth.types';

const F = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

function evidenceName(value: string | null) {
  const base = value?.trim() || 'Bukti Pelanggaran.pdf';
  const withExtension = base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`;
  return withExtension.replace(/[^a-zA-Z0-9._ -]/g, '_');
}

function validEvidenceUrl(value: string | null) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol) ? value : null;
  } catch {
    return null;
  }
}

function formatSanctionDate(value: string | null) {
  const normalized = value?.includes('T') ? value : value?.replace(' ', 'T');
  if (!normalized || Number.isNaN(Date.parse(normalized))) return 'Tanggal tidak tersedia';
  return new Intl.DateTimeFormat('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}).format(new Date(normalized));
}

export function CandidateEvaluationNotice({
  initiallyVisible = false,
  notice,
  onInitialOpenHandled,
}: {
  initiallyVisible?: boolean;
  notice: CandidateBlacklistInfo | null | undefined;
  onInitialOpenHandled?: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  if (!notice || notice.status !== 'active') return null;

  const tierTwo = notice.tier === 'tier_2';
  const tone = tierTwo ? styles.blacklistTone : styles.warningTone;
  const accent = tierTwo ? '#D92D45' : '#B85C00';
  const fileUrl = validEvidenceUrl(notice.evidence_file_url);
  const fileName = evidenceName(notice.evidence_file_name);
  const closeModal = () => {
    setVisible(false);
    if (initiallyVisible) onInitialOpenHandled?.();
  };

  const downloadEvidence = async () => {
    if (!fileUrl || downloading) return;
    setDownloading(true);
    try {
      if (Platform.OS === 'web') {
        await Linking.openURL(fileUrl);
        return;
      }

      const destination = new File(Paths.cache, fileName);
      const file = await File.downloadFileAsync(fileUrl, destination, {idempotent: true});
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {dialogTitle: 'Buka atau simpan bukti pelanggaran', mimeType: 'application/pdf'});
      } else {
        await Linking.openURL(fileUrl);
      }
    } catch {
      Alert.alert('PDF belum dapat dibuka', 'Periksa koneksi Anda lalu coba unduh kembali.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Pressable
        accessibilityLabel={tierTwo ? 'Lihat detail blacklist' : 'Lihat catatan evaluasi'}
        accessibilityRole="button"
        onPress={() => setVisible(true)}
        style={({pressed}) => [styles.notice, tone, pressed && styles.pressed]}
        testID="candidate-evaluation-alert"
      >
        <View style={styles.noticeBadge}>
          <Ionicons name={tierTwo ? 'shield-checkmark' : 'document-text'} size={15} color={accent} />
          <Text style={[styles.noticeBadgeText, {color: accent}]}>{tierTwo ? 'Blacklist' : 'Catatan Evaluasi'}</Text>
        </View>
        <Text style={styles.noticeCopy}>
          {tierTwo
            ? 'Akun Anda masuk daftar blacklist dan tidak dapat melamar di seluruh proyek HireLoop.'
            : 'Anda memiliki catatan evaluasi. Anda tetap dapat melamar di proyek lain.'}
        </Text>
        <View style={styles.noticeAction}>
          <Text style={[styles.noticeActionText, {color: accent}]}>{tierTwo ? 'Lihat Detail' : 'Lihat Catatan'}</Text>
          <Ionicons name="chevron-forward" size={18} color={accent} />
        </View>
      </Pressable>

      <Modal animationType="fade" onRequestClose={closeModal} presentationStyle="overFullScreen" transparent visible={visible || initiallyVisible}>
        <Pressable accessibilityRole="button" accessibilityLabel="Tutup detail evaluasi" style={styles.backdrop} onPress={closeModal}>
          <Pressable accessibilityViewIsModal style={styles.modalCard} onPress={event => event.stopPropagation()}>
            <Pressable accessibilityRole="button" accessibilityLabel="Tutup" hitSlop={10} onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="close" size={27} color="#00195E" />
            </Pressable>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{tierTwo ? 'Detail Blacklist' : 'Detail Catatan Evaluasi'}</Text>

              <Text style={styles.fieldLabel}>Tingkat Sanksi</Text>
              <View style={[styles.sanctionBadge, tierTwo ? styles.blacklistBadge : styles.warningBadge]}>
                <Ionicons name={tierTwo ? 'shield-checkmark-outline' : 'warning-outline'} size={22} color={accent} />
                <Text style={[styles.sanctionBadgeText, {color: accent}]}>{tierTwo ? 'Blacklist' : 'Peringatan'}</Text>
              </View>

              <View style={styles.detailBlock}>
                <Text style={styles.fieldLabel}>Alasan / Kategori Pelanggaran</Text>
                <Text style={styles.fieldValue}>{notice.reason || 'Alasan tidak tersedia'}</Text>
              </View>

              <View style={styles.detailBlock}>
                <Text style={styles.fieldLabel}>Catatan Detail Kronologi Pelanggaran</Text>
                <Text style={styles.fieldValue}>{notice.notes || 'Tidak ada catatan tambahan.'}</Text>
              </View>

              {(notice.company_name || notice.position_name || notice.blacklisted_from) && (
                <View style={styles.detailBlock}>
                  <Text style={styles.fieldLabel}>Informasi Proyek</Text>
                  <Text style={styles.fieldValue}>{[notice.company_name, notice.position_name, notice.blacklisted_from].filter(Boolean).join(' \u00B7 ')}</Text>
                  <Text style={styles.dateText}>{formatSanctionDate(notice.blacklisted_at)}</Text>
                </View>
              )}

              {notice.evidence_file_url && (
                <View style={styles.evidenceSection}>
                  <Text style={styles.fieldLabel}>File Pendukung / Bukti Pelanggaran</Text>
                  <View style={styles.evidenceCard}>
                    <View style={styles.pdfIcon}><Text style={styles.pdfText}>PDF</Text></View>
                    <Text numberOfLines={2} style={styles.evidenceName}>{fileName}</Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Unduh ${fileName}`}
                      disabled={!fileUrl || downloading}
                      onPress={() => void downloadEvidence()}
                      style={({pressed}) => [styles.downloadButton, (!fileUrl || downloading) && styles.downloadDisabled, pressed && styles.pressed]}
                    >
                      {downloading ? <ActivityIndicator size="small" color="#146CFF" /> : <Ionicons name="download-outline" size={21} color="#146CFF" />}
                      <Text style={styles.downloadText}>{downloading ? 'Mengunduh...' : 'Download'}</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              <View style={[styles.impactBox, tierTwo ? styles.impactDanger : styles.impactWarning]}>
                <Ionicons name="information-circle-outline" size={23} color={accent} />
                <Text style={styles.impactText}>
                  {tierTwo
                    ? 'Akun Anda tidak dapat digunakan untuk melamar atau mengikuti proses rekrutmen di seluruh proyek HireLoop.'
                    : 'Catatan ini tidak membatasi akses melamar. Anda tetap dapat melamar di proyek lain.'}
                </Text>
              </View>

              <Pressable accessibilityRole="button" onPress={closeModal} style={({pressed}) => [styles.dismissButton, pressed && styles.pressed]}>
                <Text style={styles.dismissText}>Tutup</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  notice: {borderWidth: 1.5, borderRadius: 15, paddingHorizontal: 16, paddingVertical: 13},
  warningTone: {borderColor: '#F4B331', backgroundColor: '#FFF9EA'},
  blacklistTone: {borderColor: '#FF8A9A', backgroundColor: '#FFF1F3'},
  noticeBadge: {alignSelf: 'flex-start', minHeight: 27, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.7)', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 10},
  noticeBadgeText: {fontFamily: F.bold, fontSize: 10.5},
  noticeCopy: {fontFamily: F.medium, fontSize: 12, lineHeight: 18, color: '#3D2A20', marginTop: 8},
  noticeAction: {alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 7},
  noticeActionText: {fontFamily: F.bold, fontSize: 12},
  pressed: {opacity: 0.75},
  backdrop: {flex: 1, backgroundColor: 'rgba(0,18,55,0.64)', alignItems: 'center', justifyContent: 'center', padding: 16},
  modalCard: {width: '100%', maxWidth: 420, maxHeight: '86%', borderRadius: 24, backgroundColor: 'white', overflow: 'hidden'},
  closeButton: {position: 'absolute', top: 13, right: 13, zIndex: 2, width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  modalContent: {padding: 22, paddingTop: 27},
  modalTitle: {fontFamily: F.bold, fontSize: 23, lineHeight: 31, color: '#00195E', paddingRight: 48, marginBottom: 20},
  fieldLabel: {fontFamily: F.bold, fontSize: 12.5, lineHeight: 18, color: '#10204D'},
  fieldValue: {fontFamily: F.regular, fontSize: 12, lineHeight: 19, color: '#29395D', marginTop: 6},
  sanctionBadge: {alignSelf: 'flex-start', minHeight: 42, borderRadius: 22, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 15, marginTop: 9},
  warningBadge: {backgroundColor: '#FFF0D2'},
  blacklistBadge: {backgroundColor: '#FFE5E9'},
  sanctionBadgeText: {fontFamily: F.bold, fontSize: 13},
  detailBlock: {borderBottomWidth: 1, borderBottomColor: '#E5EAF2', paddingVertical: 17},
  dateText: {fontFamily: F.medium, fontSize: 10.5, color: '#7B879A', marginTop: 6},
  evidenceSection: {paddingTop: 17},
  evidenceCard: {borderWidth: 1, borderColor: '#D9E2EF', borderRadius: 13, backgroundColor: '#F8FAFD', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 9},
  pdfIcon: {width: 42, height: 50, borderRadius: 8, backgroundColor: '#E92737', alignItems: 'center', justifyContent: 'center'},
  pdfText: {fontFamily: F.bold, fontSize: 11, color: 'white'},
  evidenceName: {flex: 1, minWidth: 0, fontFamily: F.semibold, fontSize: 10.5, lineHeight: 15, color: '#122044'},
  downloadButton: {minHeight: 42, borderWidth: 1.5, borderColor: '#146CFF', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 10},
  downloadDisabled: {opacity: 0.5},
  downloadText: {fontFamily: F.bold, fontSize: 9.5, color: '#146CFF'},
  impactBox: {borderRadius: 13, padding: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 20},
  impactWarning: {backgroundColor: '#FFF1D6'},
  impactDanger: {backgroundColor: '#FFE8EC'},
  impactText: {flex: 1, fontFamily: F.medium, fontSize: 11, lineHeight: 17, color: '#3D2A20'},
  dismissButton: {minHeight: 50, borderWidth: 1.5, borderColor: '#CCD7E6', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 16},
  dismissText: {fontFamily: F.bold, fontSize: 13, color: '#111827'},
});
