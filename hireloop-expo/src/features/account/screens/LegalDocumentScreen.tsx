import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {ProfileCard, ProfileHeader, ProfilePage, profileColors, profileFonts} from '../../profile/components/profile-ui';

type Kind = 'privacy' | 'terms';
const documents = {
  privacy: {
    title: 'Kebijakan Privasi', icon: 'shield-checkmark-outline' as const,
    intro: 'Ringkasan ini menjelaskan bagaimana data kandidat digunakan di aplikasi HireLoop.',
    sections: [
      ['Data yang diproses', 'Data akun, profil kandidat, dokumen, riwayat lamaran, aktivitas rekrutmen, serta informasi perangkat yang dibutuhkan untuk keamanan layanan.'],
      ['Tujuan penggunaan', 'Data digunakan untuk autentikasi, pembuatan profil, pencocokan lowongan, proses lamaran, komunikasi rekrutmen, dan keamanan akun.'],
      ['Berbagi data', 'Data kandidat hanya ditampilkan kepada pihak yang terlibat dalam layanan dan proses rekrutmen sesuai hak akses pada sistem HireLoop.'],
      ['Keamanan dan penyimpanan', 'HireLoop menerapkan kontrol akses dan perlindungan teknis. Kandidat tetap perlu menjaga kerahasiaan kata sandi dan perangkatnya.'],
      ['Hak kandidat', 'Kandidat dapat memperbarui profil, mengelola dokumen, mengganti kata sandi, atau mengajukan penghapusan akun melalui pengaturan aplikasi.'],
    ],
  },
  terms: {
    title: 'Syarat & Ketentuan', icon: 'document-text-outline' as const,
    intro: 'Ketentuan berikut berlaku ketika kandidat menggunakan aplikasi HireLoop.',
    sections: [
      ['Akun kandidat', 'Pengguna wajib memberikan informasi yang benar, menjaga keamanan akun, dan tidak menggunakan akun milik pihak lain.'],
      ['Profil dan lamaran', 'Kandidat bertanggung jawab atas isi profil dan dokumen. Keputusan rekrutmen dibuat oleh perusahaan atau pengelola lowongan terkait.'],
      ['Penggunaan yang dilarang', 'Dilarang mengunggah dokumen palsu, menyalahgunakan layanan, mengganggu sistem, atau mencoba mengakses data di luar kewenangan akun.'],
      ['Ketersediaan layanan', 'Fitur dapat diperbarui untuk keamanan dan peningkatan layanan. Gangguan jaringan atau layanan pihak ketiga dapat memengaruhi sementara akses aplikasi.'],
      ['Pengakhiran akses', 'Akun dapat dibatasi jika melanggar ketentuan. Penghapusan akun tidak tersedia ketika kandidat masih mempunyai kontrak kerja aktif.'],
    ],
  },
} as const;

export function LegalDocumentScreen({kind}: {kind: Kind}) {
  const document = documents[kind];
  return <View style={styles.screen}><ProfileHeader title={document.title} fallback="/profile" /><ProfilePage>
    <ProfileCard><View style={styles.hero}><View style={styles.icon}><Ionicons name={document.icon} size={27} color={profileColors.blue} /></View><View style={styles.heroCopy}><Text style={styles.title}>{document.title}</Text><Text style={styles.version}>Versi ringkasan aplikasi · 5 November 2026</Text></View></View><Text style={styles.intro}>{document.intro}</Text></ProfileCard>
    {document.sections.map(([title, content], index) => <ProfileCard key={title}><View style={styles.sectionTitleRow}><View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View><Text style={styles.sectionTitle}>{title}</Text></View><Text style={styles.content}>{content}</Text></ProfileCard>)}
    <View style={styles.note}><Ionicons name="information-circle-outline" size={20} color="#175CD3" /><Text style={styles.noteText}>Untuk pertanyaan atau permintaan terkait akun, gunakan kanal dukungan resmi HireLoop yang tersedia pada layanan HireLoop.</Text></View>
  </ProfilePage></View>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: profileColors.background}, hero: {flexDirection: 'row', alignItems: 'center', gap: 12}, icon: {width: 52, height: 52, borderRadius: 14, backgroundColor: '#EAF2FF', alignItems: 'center', justifyContent: 'center'}, heroCopy: {flex: 1, minWidth: 0}, title: {fontFamily: profileFonts.bold, fontSize: 17, color: profileColors.ink}, version: {fontFamily: profileFonts.regular, fontSize: 9.5, color: profileColors.muted, marginTop: 3}, intro: {fontFamily: profileFonts.regular, fontSize: 11.5, lineHeight: 19, color: '#344054', marginTop: 14}, sectionTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 10}, number: {width: 30, height: 30, borderRadius: 9, backgroundColor: '#EAF2FF', alignItems: 'center', justifyContent: 'center'}, numberText: {fontFamily: profileFonts.bold, fontSize: 11, color: profileColors.blue}, sectionTitle: {flex: 1, fontFamily: profileFonts.bold, fontSize: 14, color: profileColors.ink}, content: {fontFamily: profileFonts.regular, fontSize: 11.5, lineHeight: 19, color: '#475467', marginTop: 12}, note: {flexDirection: 'row', alignItems: 'flex-start', gap: 9, borderWidth: 1, borderColor: '#B2CCFF', backgroundColor: '#EFF8FF', borderRadius: 13, padding: 14}, noteText: {flex: 1, fontFamily: profileFonts.regular, fontSize: 10.5, lineHeight: 17, color: '#175CD3'},
});
