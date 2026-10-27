import {Ionicons} from '@expo/vector-icons';
import DateTimePicker, {type DateTimePickerEvent} from '@react-native-community/datetimepicker';
import React, {useMemo, useState} from 'react';
import {Modal, Platform, Pressable, StyleSheet, Text, View} from 'react-native';

import {FormFieldPressable} from '../../../components/forms/FormFieldPressable';
import {isoToLocalDate, localDateToIso} from './date-field.utils';
import type {DateFieldProps} from './DateField.types';
import {FieldLabel} from './FormControls';

export type {DateFieldProps} from './DateField.types';
export {isoToLocalDate, localDateToIso} from './date-field.utils';

function displayDate(value: string): string {
  const date = isoToLocalDate(value);
  return date ? new Intl.DateTimeFormat('id-ID', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(date) : '';
}

function initialDate(value: string, minimumDate?: Date, maximumDate?: Date): Date {
  return isoToLocalDate(value) ?? maximumDate ?? minimumDate ?? new Date();
}

export function DateField({label, value, onChange, required, error, disabled, tone = 'dark', minimumDate, maximumDate, presentation = 'modal'}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(() => initialDate(value, minimumDate, maximumDate));
  const selectedDate = useMemo(() => initialDate(value, minimumDate, maximumDate), [maximumDate, minimumDate, value]);

  const openPicker = () => {
    if (disabled) return;
    setDraftDate(selectedDate);
    setOpen(true);
  };
  const handleAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    setOpen(false);
    if (event.type === 'set' && date) onChange(localDateToIso(date));
  };

  return (
    <View style={styles.group}>
      <FieldLabel label={label} required={required} tone={tone} />
      <FormFieldPressable
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${value ? displayDate(value) : 'Belum dipilih'}`}
        accessibilityState={{disabled: Boolean(disabled), expanded: open}}
        containerStyle={styles.control}
        disabled={disabled}
        disabledContainerStyle={styles.disabled}
        error={Boolean(error)}
        errorContainerStyle={styles.errorBorder}
        onPress={openPicker}
      >
        <Text style={[styles.value, !value && styles.placeholder, disabled && styles.disabledText]}>{value ? displayDate(value) : 'Pilih tanggal'}</Text>
        <View style={styles.iconButton}><Ionicons name="calendar-outline" size={21} color={disabled ? '#7A8190' : '#172036'} /></View>
      </FormFieldPressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {open && Platform.OS === 'android' ? (
        <DateTimePicker value={selectedDate} mode="date" display="default" minimumDate={minimumDate} maximumDate={maximumDate} onChange={handleAndroidChange} />
      ) : null}

      {Platform.OS === 'ios' && open && presentation === 'inline' ? (
        <View style={styles.inlinePicker}>
          <DateTimePicker
            value={draftDate}
            mode="date"
            display="spinner"
            locale="id-ID"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={(_, date) => { if (date) setDraftDate(date); }}
            style={styles.picker}
          />
          <View style={styles.actions}>
            <Pressable onPress={() => setOpen(false)} style={styles.cancelButton}><Text style={styles.cancelText}>Batal</Text></Pressable>
            <Pressable onPress={() => { onChange(localDateToIso(draftDate)); setOpen(false); }} style={styles.confirmButton}><Text style={styles.confirmText}>Pilih</Text></Pressable>
          </View>
        </View>
      ) : null}

      {Platform.OS === 'ios' && presentation === 'modal' ? (
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <View style={styles.overlay}>
            <View style={styles.pickerCard}>
              <Text style={styles.pickerTitle}>{label}</Text>
              <DateTimePicker
                value={draftDate}
                mode="date"
                display="spinner"
                locale="id-ID"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onChange={(_, date) => { if (date) setDraftDate(date); }}
                style={styles.picker}
              />
              <View style={styles.actions}>
                <Pressable onPress={() => setOpen(false)} style={styles.cancelButton}><Text style={styles.cancelText}>Batal</Text></Pressable>
                <Pressable onPress={() => { onChange(localDateToIso(draftDate)); setOpen(false); }} style={styles.confirmButton}><Text style={styles.confirmText}>Pilih</Text></Pressable>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {gap: 8, marginBottom: 20},
  control: {minHeight: 54, borderRadius: 11, paddingLeft: 15, paddingRight: 7, borderColor: '#E0E5EC', flexDirection: 'row', alignItems: 'center'},
  value: {flex: 1, fontFamily: 'PlusJakartaSans_400Regular', color: '#111827', fontSize: 14},
  placeholder: {color: '#B6BCC7'},
  iconButton: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  disabled: {backgroundColor: '#D2CED0'},
  disabledText: {color: '#5E626B'},
  errorBorder: {borderColor: '#FF5B67'},
  error: {fontFamily: 'PlusJakartaSans_400Regular', color: '#FF8B93', fontSize: 11, lineHeight: 16},
  overlay: {flex: 1, backgroundColor: 'rgba(1,5,20,0.78)', justifyContent: 'center', padding: 22},
  pickerCard: {width: '100%', maxWidth: 420, alignSelf: 'center', backgroundColor: 'white', borderRadius: 22, padding: 18},
  inlinePicker: {backgroundColor: '#F7F9FC', borderColor: '#D9DFE8', borderRadius: 14, borderWidth: 1, padding: 12},
  pickerTitle: {fontFamily: 'PlusJakartaSans_700Bold', color: '#111827', fontSize: 18, textAlign: 'center'},
  picker: {width: '100%', height: 210},
  actions: {flexDirection: 'row', gap: 12, marginTop: 8},
  cancelButton: {flex: 1, minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: '#AEB4BE', alignItems: 'center', justifyContent: 'center'},
  confirmButton: {flex: 1, minHeight: 48, borderRadius: 10, backgroundColor: '#087BFF', alignItems: 'center', justifyContent: 'center'},
  cancelText: {fontFamily: 'PlusJakartaSans_500Medium', color: '#111827'},
  confirmText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: 'white'},
});
