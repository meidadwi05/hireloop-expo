import {Ionicons} from '@expo/vector-icons';
import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type TextInputProps,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {FormFieldPressable} from '../../../components/forms/FormFieldPressable';
import {FormTextInput} from '../../../components/forms/FormTextInput';
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
  groupStyle?: StyleProp<ViewStyle>;
  onChangeText?: (text: string) => void;
};

export function TextField({label, required, error, disabled, multiline, style, tone, groupStyle, ...props}: TextFieldProps) {
  return (
    <View style={[styles.fieldGroup, groupStyle]}>
      <FieldLabel label={label} required={required} tone={tone} />
      <FormTextInput
        {...props}
        accessibilityLabel={label}
        containerStyle={[styles.inputFrame, multiline && styles.textareaFrame]}
        editable={!disabled}
        error={Boolean(error)}
        errorContainerStyle={styles.inputError}
        inputStyle={[styles.input, multiline && styles.textarea, disabled && styles.inputTextDisabled, style]}
        multiline={multiline}
        placeholderTextColor="#B6BCC7"
        disabledContainerStyle={styles.inputDisabled}
      />
      {error ? <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text> : null}
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
  presentation?: 'modal' | 'inline';
};

export function SelectField({label, value, options, onChange, placeholder, required, error, searchable, disabled, tone, presentation = 'modal'}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find(option => option.value === value);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? options.filter(option => option.label.toLowerCase().includes(normalized)) : options;
  }, [options, query]);
  const chooseOption = (option: MasterOption) => {
    onChange(option.value);
    setOpen(false);
    setQuery('');
  };
  const optionRow = (option: MasterOption) => (
    <Pressable
      key={option.value}
      accessibilityRole="radio"
      accessibilityState={{checked: option.value === value}}
      onPress={() => chooseOption(option)}
      style={[styles.option, option.value === value && styles.optionSelected]}
    >
      <Text style={styles.optionText}>{option.label}</Text>
      {option.value === value ? <Ionicons name="checkmark" size={21} color={C.blue} /> : null}
    </Pressable>
  );
  const searchField = searchable ? (
    <FormTextInput
      accessibilityLabel={`Cari ${label}`}
      autoFocus
      containerStyle={styles.searchInputFrame}
      inputStyle={styles.searchInput}
      value={query}
      onChangeText={setQuery}
      placeholder="Cari..."
      placeholderTextColor="#98A1B2"
    />
  ) : null;

  return (
    <View style={styles.fieldGroup}>
      <FieldLabel label={label} required={required} tone={tone} />
      <FormFieldPressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{expanded: open, disabled: Boolean(disabled)}}
        containerStyle={styles.select}
        disabled={disabled}
        disabledContainerStyle={styles.inputDisabled}
        error={Boolean(error)}
        errorContainerStyle={styles.inputError}
        onPress={() => setOpen(true)}
      >
        <Text numberOfLines={1} style={[styles.selectText, !selected && styles.placeholder]}>{selected?.label ?? placeholder}</Text>
        <Ionicons name="chevron-down" size={20} color="#111827" />
      </FormFieldPressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {open && presentation === 'inline' ? (
        <View style={styles.inlineSelect} testID={`inline-options-${label}`}>
          {searchField}
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={styles.inlineOptions}>
            {filtered.length ? filtered.map(optionRow) : <Text style={styles.emptyText}>Data tidak ditemukan</Text>}
          </ScrollView>
        </View>
      ) : null}
      {presentation === 'modal' ? <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={styles.selectModal}>
            <View style={styles.selectHeader}>
              <Text style={styles.selectTitle}>{label}</Text>
              <Pressable accessibilityLabel="Tutup pilihan" onPress={() => setOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color="#111827" />
              </Pressable>
            </View>
            {searchField}
            <FlatList
              data={filtered}
              keyExtractor={item => item.value}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Text style={styles.emptyText}>Data tidak ditemukan</Text>}
              renderItem={({item}) => optionRow(item)}
            />
          </View>
        </SafeAreaView>
      </Modal> : null}
    </View>
  );
}

export function CheckboxField({label, checked, onChange, required, disabled, tone = 'dark'}: {label: string; checked: boolean; onChange: (value: boolean) => void; required?: boolean; disabled?: boolean; tone?: 'dark' | 'light'}) {
  return (
    <FormFieldPressable
      accessibilityRole="checkbox"
      accessibilityState={{checked, disabled: Boolean(disabled)}}
      containerStyle={styles.checkboxRow}
      disabled={disabled}
      disabledContainerStyle={styles.checkboxRowDisabled}
      onPress={() => onChange(!checked)}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Ionicons name="checkmark" size={15} color="white" /> : null}
      </View>
      <Text style={[styles.checkboxLabel, tone === 'light' && styles.checkboxLabelLight]}>{label}{required ? <Text style={styles.required}> *</Text> : null}</Text>
    </FormFieldPressable>
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
      <FormFieldPressable accessibilityRole="button" accessibilityLabel={label} containerStyle={styles.addPlaceholder} onPress={onPress}>
        <Text style={styles.placeholder}>{placeholder}</Text>
      </FormFieldPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {gap: 8, marginBottom: 20},
  label: {fontFamily: F.medium, fontSize: 13, lineHeight: 20, color: C.text},
  labelLight: {color: '#151923'},
  required: {color: C.error},
  inputFrame: {minHeight: 54, borderRadius: 11, borderColor: '#E0E5EC', paddingHorizontal: 15},
  input: {minHeight: 50, color: '#111827', paddingVertical: 0, fontFamily: F.regular, fontSize: 14},
  textareaFrame: {alignItems: 'stretch', minHeight: 88},
  textarea: {minHeight: 88, textAlignVertical: 'top', paddingTop: 14},
  inputDisabled: {backgroundColor: '#D2CED0'},
  inputTextDisabled: {color: '#5E626B'},
  inputError: {borderColor: C.error},
  error: {fontFamily: F.regular, color: '#FF8B93', fontSize: 11, lineHeight: 16},
  select: {minHeight: 54, borderRadius: 11, paddingHorizontal: 15, borderColor: '#E0E5EC', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12},
  selectText: {flex: 1, fontFamily: F.regular, color: '#111827', fontSize: 14},
  placeholder: {fontFamily: F.regular, color: '#B6BCC7', fontSize: 13},
  modalOverlay: {flex: 1, backgroundColor: 'rgba(2,7,25,0.72)', justifyContent: 'center', padding: 12},
  selectModal: {width: '100%', maxWidth: 430, maxHeight: '72%', alignSelf: 'center', backgroundColor: 'white', borderRadius: 22, padding: 18},
  inlineSelect: {borderWidth: 1, borderColor: '#D9DFE8', borderRadius: 12, backgroundColor: '#FFFFFF', padding: 10, marginTop: -2, marginBottom: 4},
  inlineOptions: {maxHeight: 210},
  selectHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14},
  selectTitle: {fontFamily: F.bold, color: '#111827', fontSize: 18},
  searchInputFrame: {height: 46, borderRadius: 10, borderColor: '#D9DFE8', paddingHorizontal: 13, marginBottom: 10},
  searchInput: {height: 42, paddingVertical: 0, fontFamily: F.regular, color: '#111827'},
  option: {minHeight: 48, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8},
  optionSelected: {backgroundColor: '#EEF5FF'},
  optionText: {fontFamily: F.regular, fontSize: 14, color: '#111827', flex: 1},
  emptyText: {fontFamily: F.regular, color: '#6B7280', textAlign: 'center', paddingVertical: 30},
  checkboxRow: {flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 44, borderColor: 'transparent', backgroundColor: 'transparent', paddingHorizontal: 4},
  checkboxRowDisabled: {backgroundColor: 'transparent', opacity: 0.65},
  checkbox: {width: 18, height: 18, borderRadius: 3, borderWidth: 1.5, borderColor: '#DCE5F5', alignItems: 'center', justifyContent: 'center', marginTop: 1},
  checkboxChecked: {backgroundColor: C.blue, borderColor: C.blue},
  checkboxLabel: {flex: 1, fontFamily: F.regular, color: '#D7DEEE', fontSize: 11, lineHeight: 16},
  checkboxLabelLight: {color: '#252A35'},
  addLabelRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  addButton: {width: 44, height: 44, borderRadius: 8, borderWidth: 1.5, borderColor: C.blue, alignItems: 'center', justifyContent: 'center'},
  addPlaceholder: {minHeight: 54, borderRadius: 11, borderColor: '#E0E5EC', paddingHorizontal: 15, justifyContent: 'center'},
});
