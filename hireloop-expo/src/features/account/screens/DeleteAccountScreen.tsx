import Ionicons from '@expo/vector-icons/Ionicons';
import {router} from 'expo-router';
import React, {useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';

import {toAppApiError} from '../../../core/api/api-error';
import {useAuth} from '../../auth/auth-provider';
import {ProfileCard, ProfileHeader, ProfilePage, profileColors, profileFonts} from '../../profile/components/profile-ui';
import {accountApi} from '../api/account.api';

const PHRASE = 'hapus akun hireloop';

export function DeleteAccountScreen() {
  const {user, logout} = useAuth();
  const [understood, setUnderstood] = useState(false);
  const [phrase, setPhrase] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const active = Boolean(user?.has_active_contract || user?.active_contract);
  const valid = understood && phrase === PHRASE && !active;
  const submit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      await accountApi.confirmDeleteAccount(phrase);
      Alert.alert('Akun berhasil dihapus', 'Seluruh sesi HireLoop telah diakhiri.', [{text: 'Selesai', onPress: async () => {await logout(); router.replace('/(public)/login');}}]);
    } catch (cause) {
      Alert.alert('Akun belum dapat dihapus', toAppApiError(cause).message);
      setSubmitting(false);
    }
  };

  return <View style={styles.screen}><ProfileHeader title="Hapus Akun" fallback="/profile" /><ProfilePage>
    <ProfileCard style={styles.warning}><View style={styles.warningIcon}><Ionicons name="warning-outline" size={27} color="#B54708" /></View><View style={styles.warningCopy}><Text style={styles.warningTitle}>{active ? 'Akun masih terikat kontrak aktif' : 'Tindakan ini tidak dapat dibatalkan'}</Text><Text style={styles.warningText}>{active ? `Selesaikan kontrak ${user?.active_contract?.position_name ?? ''} ${user?.active_contract?.project_name ? `di ${user.active_contract.project_name}` : ''} sebelum menghapus akun.` : 'Akun, sesi aktif, dan akses kandidat akan dinonaktifkan setelah dikonfirmasi.'}</Text></View></ProfileCard>
    <ProfileCard>
      <Pressable accessibilityRole="checkbox" accessibilityState={{checked: understood, disabled: active}} disabled={active || submitting} onPress={() => setUnderstood(current => !current)} style={styles.checkRow}><View style={[styles.checkbox, understood && styles.checkboxOn]}>{understood ? <Ionicons name="checkmark" size={15} color="white" /> : null}</View><Text style={styles.checkText}>Saya memahami dampak penghapusan akun.</Text></Pressable>
      <Text style={styles.instruction}>Ketik frasa berikut secara manual:</Text><Text selectable={false} style={styles.phrase}>{PHRASE}</Text>
      <TextInput accessibilityLabel="Frasa konfirmasi hapus akun" autoCapitalize="none" autoCorrect={false} editable={!active && !submitting} placeholder="Ketik frasa konfirmasi" placeholderTextColor="#98A2B3" style={styles.input} value={phrase} onChangeText={setPhrase} />
      <Pressable accessibilityRole="button" disabled={!valid || submitting} onPress={() => void submit()} style={[styles.deleteButton, (!valid || submitting) && styles.disabled]}><Ionicons name="trash-outline" size={20} color="white" /><Text style={styles.deleteText}>{submitting ? 'Menghapus akun...' : 'Hapus Akun Permanen'}</Text></Pressable>
    </ProfileCard>
  </ProfilePage></View>;
}

const styles = StyleSheet.create({
  screen: {flex: 1, width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: profileColors.background}, warning: {flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#FFFAEB', borderColor: '#FEDF89'}, warningIcon: {width: 46, height: 46, borderRadius: 13, backgroundColor: '#FEF0C7', alignItems: 'center', justifyContent: 'center'}, warningCopy: {flex: 1, minWidth: 0}, warningTitle: {fontFamily: profileFonts.bold, fontSize: 14, color: '#93370D'}, warningText: {fontFamily: profileFonts.regular, fontSize: 10.5, lineHeight: 17, color: '#B54708', marginTop: 4}, checkRow: {minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10}, checkbox: {width: 21, height: 21, borderRadius: 5, borderWidth: 1.5, borderColor: '#B8C0CD', alignItems: 'center', justifyContent: 'center'}, checkboxOn: {backgroundColor: profileColors.red, borderColor: profileColors.red}, checkText: {flex: 1, fontFamily: profileFonts.medium, fontSize: 11, color: profileColors.ink}, instruction: {fontFamily: profileFonts.regular, fontSize: 11, color: profileColors.muted, marginTop: 14}, phrase: {alignSelf: 'flex-start', fontFamily: profileFonts.bold, fontSize: 12, color: '#B42318', backgroundColor: '#FEF3F2', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, marginVertical: 9}, input: {minHeight: 54, borderWidth: 1.5, borderColor: '#D7DFEA', borderRadius: 12, paddingHorizontal: 14, fontFamily: profileFonts.regular, fontSize: 13, color: profileColors.ink}, deleteButton: {minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, backgroundColor: '#D92D20', marginTop: 18}, disabled: {opacity: 0.45}, deleteText: {fontFamily: profileFonts.bold, fontSize: 12.5, color: 'white'},
});
