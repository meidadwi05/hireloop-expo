import Ionicons from '@expo/vector-icons/Ionicons';
import React, {useRef, useState} from 'react';
import {ActivityIndicator, Modal, Pressable, StyleSheet, Text, View} from 'react-native';

import {toAppApiError} from '../../../core/api/api-error';
import {profileColors, profileFonts} from './profile-ui';

export function ProfileDeleteConfirmation({title, message, embedded = false, onCancel, onConfirm, onDeleted}: {
  title: string;
  message: string;
  embedded?: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<unknown>;
  onDeleted: () => void;
}) {
  const deleting = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const cancel = () => {
    if (!deleting.current) onCancel();
  };

  const confirm = async () => {
    if (deleting.current) return;
    deleting.current = true;
    setPending(true);
    setError('');
    try {
      await onConfirm();
    } catch (error) {
      setError(toAppApiError(error).message);
      return;
    } finally {
      deleting.current = false;
      setPending(false);
    }
    onDeleted();
  };

  const content = (
    <View style={styles.backdrop}>
      <View accessibilityViewIsModal style={styles.card}>
        <View style={styles.icon}><Ionicons name="trash-outline" size={26} color={profileColors.red} /></View>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Batal hapus" disabled={pending} onPress={cancel} style={styles.button}>
            <Text style={styles.buttonText}>Batal</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Konfirmasi hapus" disabled={pending} onPress={() => void confirm()} style={[styles.button, styles.deleteButton, pending && styles.pending]}>
            {pending ? <ActivityIndicator size="small" color="white" /> : null}
            <Text style={styles.deleteText}>{pending ? 'Menghapus...' : 'Hapus'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return embedded ? content : (
    <Modal animationType="fade" transparent visible onRequestClose={cancel}>
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(0,20,55,0.55)'},
  card: {width: '100%', maxWidth: 360, borderRadius: 18, backgroundColor: 'white', padding: 20, alignItems: 'center'},
  icon: {width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFF0F2', alignItems: 'center', justifyContent: 'center'},
  title: {marginTop: 12, color: profileColors.ink, fontFamily: profileFonts.bold, fontSize: 17, textAlign: 'center'},
  message: {marginTop: 6, color: profileColors.muted, fontFamily: profileFonts.regular, fontSize: 13, lineHeight: 19, textAlign: 'center'},
  error: {marginTop: 8, color: '#B42318', fontFamily: profileFonts.medium, fontSize: 12, textAlign: 'center'},
  actions: {alignSelf: 'stretch', flexDirection: 'row', gap: 10, marginTop: 18},
  button: {flex: 1, minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: profileColors.border, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center'},
  buttonText: {fontFamily: profileFonts.semibold, color: profileColors.ink},
  deleteButton: {backgroundColor: '#B42318', borderColor: '#B42318'},
  deleteText: {fontFamily: profileFonts.semibold, color: 'white'},
  pending: {opacity: 0.7},
});
