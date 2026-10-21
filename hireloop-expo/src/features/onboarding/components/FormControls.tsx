import {Ionicons} from '@expo/vector-icons';
import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import type {MasterOption} from '../onboarding.types';

const C = {blue: '#1268FF', navy: '#061B52', text: '#FFFFFF', muted: '#B9C1D1', error: '#FF5B67'};
const F = {regular: 'PlusJakartaSans_400Regular', medium: 'PlusJakartaSans_500Medium', semibold: 'PlusJakartaSans_600SemiBold', bold: 'PlusJakartaSans_700Bold'};

export function FieldLabel({label, required, tone = 'dark'}: {label: string; required?: boolean; tone?: 'dark' | 'light'}) {
  return <Text style={[styles.label, tone === 'light' && styles.labelLight]}>{label}{required ? <Text style={styles.required}> *</Text> : null}</Text>;
}

type TextFieldProps = Omit<TextInputProps, 'onChange' | 'onChangeText'> & {
  label: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  tone?: 'dark' | 'light';
  onChangeText?: (text: string) => void;
};

export function TextField({label, required, error, disabled, multiline, style, tone, ...props}: TextFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <FieldLabel label={label} required={required} tone={tone} />
      <TextInput
        {...props}
        editable={!disabled}
        multiline={multiline}
        placeholderTextColor="#B6BCC7"
        style={[styles.input, multiline && styles.textarea, disabled && styles.inputDisabled, error && styles.inputError, style]}
        accessibilityLabel={label}
        accessibilityState={{disabled: Boolean(disabled)}}
      />
      {error ? <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text> : null}
    </View>
  );
}

function isoToDisplay(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

function displayToIso(value: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value.trim();
}

export function DateField(props: Omit<TextFieldProps, 'value' | 'onChangeText'> & {value: string; onChange: (value: string) => void}) {
  const {value, onChange, ...fieldProps} = props;

  return (
    <View>
      <TextField
        {...fieldProps}
        value={isoToDisplay(value)}
        onChangeText={text => onChange(displayToIso(text))}
        placeholder="dd/mm/yyyy"
        keyboardType="number-pad"
      />
      <Ionicons name="calendar-outline" size={20} color="#172036" style={styles.dateIcon} pointerEvents="none" />
    </View>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  options: MasterOption[];
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  error?: string;
  searchable?: boolean;
  disabled?: boolean;
  tone?: 'dark' | 'light';
};

export function SelectField({label, value, options, onChange, placeholder, required, error, searchable, disabled, tone}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find(option => option.value === value);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? options.filter(option => option.label.toLowerCase().includes(normalized)) : options;
  }, [options, query]);

  return (
    <View style={styles.fieldGroup}>
      <FieldLabel label={label} required={required} tone={tone} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{expanded: open, disabled: Boolean(disabled)}}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.select, disabled && styles.inputDisabled, error && styles.inputError]}
      >
        <Text numberOfLines={1} style={[styles.selectText, !selected && styles.placeholder]}>{selected?.label ?? placeholder}</Text>
        <Ionicons name="chevron-down" size={20} color="#111827" />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={styles.selectModal}>
            <View style={styles.selectHeader}>
              <Text style={styles.selectTitle}>{label}</Text>
              <Pressable accessibilityLabel="Tutup pilihan" onPress={() => setOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color="#111827" />
              </Pressable>
            </View>
            {searchable ? (
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Cari..."
                placeholderTextColor="#98A1B2"
                style={styles.searchInput}
                autoFocus
              />
            ) : null}
            <FlatList
              data={filtered}
              keyExtractor={item => item.value}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Text style={styles.emptyText}>Data tidak ditemukan</Text>}
              renderItem={({item}) => (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{checked: item.value === value}}
                  onPress={() => { onChange(item.value); setOpen(false); setQuery(''); }}
                  style={[styles.option, item.value === value && styles.optionSelected]}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {item.value === value ? <Ionicons name="checkmark" size={21} color={C.blue} /> : null}
                </Pressable>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

export function CheckboxField({label, checked, onChange, required, disabled, tone = 'dark'}: {label: string; checked: boolean; onChange: (value: boolean) => void; required?: boolean; disabled?: boolean; tone?: 'dark' | 'light'}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{checked, disabled: Boolean(disabled)}}
      onPress={() => onChange(!checked)}
      disabled={disabled}
      style={styles.checkboxRow}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Ionicons name="checkmark" size={15} color="white" /> : null}
      </View>
      <Text style={[styles.checkboxLabel, tone === 'light' && styles.checkboxLabelLight]}>{label}{required ? <Text style={styles.required}> *</Text> : null}</Text>
    </Pressable>
  );
}

export function AddField({label, placeholder, onPress, required}: {label: string; placeholder: string; onPress: () => void; required?: boolean}) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.addLabelRow}>
        <FieldLabel label={label} required={required} />
        <Pressable accessibilityRole="button" accessibilityLabel={`Tambah ${label}`} onPress={onPress} style={styles.addButton}>
          <Ionicons name="add" size={21} color="white" />
        </Pressable>
      </View>
      <Pressable onPress={onPress} style={styles.addPlaceholder}>
        <Text style={styles.placeholder}>{placeholder}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {gap: 8, marginBottom: 20},
  label: {fontFamily: F.medium, fontSize: 13, lineHeight: 20, color: C.text},
  labelLight: {color: '#151923'},
  required: {color: C.error},
  input: {minHeight: 54, borderRadius: 11, backgroundColor: 'white', color: '#111827', paddingHorizontal: 15, fontFamily: F.regular, fontSize: 14, borderWidth: 1, borderColor: '#E0E5EC'},
  textarea: {minHeight: 88, textAlignVertical: 'top', paddingTop: 14},
  inputDisabled: {backgroundColor: '#D2CED0', color: '#5E626B'},
  inputError: {borderColor: C.error},
  error: {fontFamily: F.regular, color: '#FF8B93', fontSize: 11, lineHeight: 16},
  dateIcon: {position: 'absolute', right: 16, top: 43},
  select: {minHeight: 54, borderRadius: 11, backgroundColor: 'white', paddingHorizontal: 15, borderWidth: 1, borderColor: '#E0E5EC', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12},
  selectText: {flex: 1, fontFamily: F.regular, color: '#111827', fontSize: 14},
  placeholder: {fontFamily: F.regular, color: '#B6BCC7', fontSize: 13},
  modalOverlay: {flex: 1, backgroundColor: 'rgba(2,7,25,0.72)', justifyContent: 'center', padding: 22},
  selectModal: {width: '100%', maxWidth: 430, maxHeight: '72%', alignSelf: 'center', backgroundColor: 'white', borderRadius: 22, padding: 18},
  selectHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14},
  selectTitle: {fontFamily: F.bold, color: '#111827', fontSize: 18},
  searchInput: {height: 46, borderRadius: 10, borderWidth: 1, borderColor: '#D9DFE8', paddingHorizontal: 13, fontFamily: F.regular, marginBottom: 10},
  option: {minHeight: 48, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8},
  optionSelected: {backgroundColor: '#EEF5FF'},
  optionText: {fontFamily: F.regular, fontSize: 14, color: '#111827', flex: 1},
  emptyText: {fontFamily: F.regular, color: '#6B7280', textAlign: 'center', paddingVertical: 30},
  checkboxRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 9, minHeight: 32},
  checkbox: {width: 18, height: 18, borderRadius: 3, borderWidth: 1.5, borderColor: '#DCE5F5', alignItems: 'center', justifyContent: 'center', marginTop: 1},
  checkboxChecked: {backgroundColor: C.blue, borderColor: C.blue},
  checkboxLabel: {flex: 1, fontFamily: F.regular, color: '#D7DEEE', fontSize: 11, lineHeight: 16},
  checkboxLabelLight: {color: '#252A35'},
  addLabelRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  addButton: {width: 28, height: 28, borderRadius: 3, borderWidth: 1.5, borderColor: C.blue, alignItems: 'center', justifyContent: 'center'},
  addPlaceholder: {minHeight: 54, borderRadius: 11, backgroundColor: 'white', paddingHorizontal: 15, justifyContent: 'center'},
});
