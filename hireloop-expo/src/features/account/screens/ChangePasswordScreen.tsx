import Ionicons from '@expo/vector-icons/Ionicons';
import {router} from 'expo-router';
import React, {useMemo, useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';

import {toAppApiError} from '../../../core/api/api-error';
import {useAuth} from '../../auth/auth-provider';
import {ProfileCard, ProfileHeader, ProfilePage, PrimaryButton, profileColors, profileFonts} from '../../profile/components/profile-ui';
import {accountApi} from '../api/account.api';

function PasswordField({label, value, onChange}: {label: string; value: string; onChange: (value: string) => void}) {
  const [visible, setVisible] = useState(false);
  return <View style={styles.field}><Text style={styles.label}>{label} <Text style={styles.required}>*</Text></Text><View style={styles.inputFrame}><Ionicons name="lock-closed-outline" size={19} color="#8390A4" /><TextInput accessibilityLabel={label} autoCapitalize="none" autoCorrect={false} secureTextEntry={!visible} value={value} onChangeText={onChange} style={styles.input} placeholder="Masukkan kata sandi" placeholderTextColor="#A7AFBD" /><Pressable accessibilityLabel={`${visible ? 'Sembunyikan' : 'Tampilkan'} ${label}`} onPress={() => setVisible(current => !current)} style={styles.eye}><Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={21} color="#667085" /></Pressable></View></View>;
}

export function ChangePasswordScreen() {
  const {logout} = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const rules = useMemo(() => ({length: newPassword.length >= 8, lowercase: /[a-z]/.test(newPassword), numberOrSymbol: /[\d\s\W]/.test(newPassword), match: confirmation.length > 0 && newPassword === confirmation}), [confirmation, newPassword]);
  const valid = Boolean(currentPassword) && Object.values(rules).every(Boolean);

  const submit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true); setError('');
    try {
      await accountApi.changePassword({current_password: currentPassword, new_password: newPassword, new_password_confirmation: confirmation});
      Alert.alert('Kata sandi diperbarui', 'Silakan masuk kembali menggunakan kata sandi baru.', [{text: 'Masuk kembali', onPress: async () => {await logout(); router.replace('/(public)/login');}}]);
    } catch (cause) {
      setError(toAppApiError(cause).message);
      setSubmitting(false);
    }
  };

  return <View style={styles.screen}><ProfileHeader title="Ubah Kata Sandi" fallback="/profile" /><ProfilePage>
    <ProfileCard><View style={styles.titleRow}><View style={styles.titleIcon}><Ionicons name="shield-checkmark-outline" size={25} color={profileColors.blue} /></View><View style={styles.titleCopy}><Text style={styles.title}>Keamanan Akun</Text><Text style={styles.subtitle}>Gunakan kata sandi kuat dan jangan membagikannya.</Text></View></View></ProfileCard>
    <ProfileCard><PasswordField label="Kata Sandi Saat Ini" value={currentPassword} onChange={setCurrentPassword} /><PasswordField label="Kata Sandi Baru" value={newPassword} onChange={setNewPassword} /><PasswordField label="Konfirmasi Kata Sandi Baru" value={confirmation} onChange={setConfirmation} />
      <View style={styles.rules}><Text style={styles.rulesTitle}>Syarat kata sandi</Text><Rule ok={rules.length} text="Minimal 8 karakter" /><Rule ok={rules.lowercase} text="Memiliki huruf kecil" /><Rule ok={rules.numberOrSymbol} text="Memiliki angka, simbol, atau spasi" /><Rule ok={rules.match} text="Konfirmasi kata sandi sesuai" /></View>
      {error ? <View style={styles.error}><Ionicons name="alert-circle-outline" size={18} color="#B42318" /><Text style={styles.errorText}>{error}</Text></View> : null}
      <PrimaryButton disabled={!valid || submitting} label={submitting ? 'Memperbarui...' : 'Simpan Perubahan'} onPress={() => void submit()} />
    </ProfileCard>
  </ProfilePage></View>;
}

function Rule({ok, text}: {ok: boolean; text: string}) { return <View style={styles.rule}><Ionicons name={ok ? 'checkmark-circle' : 'ellipse-outline'} size={17} color={ok ? '#12B76A' : '#98A2B3'} /><Text style={[styles.ruleText, ok && styles.ruleTextOk]}>{text}</Text></View>; }

const styles = StyleSheet.create({
  screen: {flex: 1, width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: profileColors.background}, titleRow: {flexDirection: 'row', alignItems: 'center', gap: 12}, titleIcon: {width: 52, height: 52, borderRadius: 14, backgroundColor: '#EAF2FF', alignItems: 'center', justifyContent: 'center'}, titleCopy: {flex: 1, minWidth: 0}, title: {fontFamily: profileFonts.bold, fontSize: 16, color: profileColors.ink}, subtitle: {fontFamily: profileFonts.regular, fontSize: 10.5, lineHeight: 16, color: profileColors.muted, marginTop: 3}, field: {gap: 8, marginBottom: 17}, label: {fontFamily: profileFonts.semibold, fontSize: 12, color: profileColors.ink}, required: {color: profileColors.red}, inputFrame: {minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1.5, borderColor: '#D7DFEA', borderRadius: 12, paddingLeft: 14}, input: {flex: 1, minWidth: 0, minHeight: 50, fontFamily: profileFonts.regular, fontSize: 13, color: profileColors.ink}, eye: {width: 48, height: 48, alignItems: 'center', justifyContent: 'center'}, rules: {borderRadius: 12, backgroundColor: '#F7F9FC', padding: 14, gap: 8, marginBottom: 16}, rulesTitle: {fontFamily: profileFonts.bold, fontSize: 12, color: profileColors.ink, marginBottom: 2}, rule: {flexDirection: 'row', alignItems: 'center', gap: 8}, ruleText: {fontFamily: profileFonts.regular, fontSize: 10.5, color: '#667085'}, ruleTextOk: {color: '#067647'}, error: {flexDirection: 'row', gap: 8, borderRadius: 10, backgroundColor: '#FEF3F2', padding: 11, marginBottom: 14}, errorText: {flex: 1, fontFamily: profileFonts.regular, fontSize: 11, color: '#B42318'},
});
