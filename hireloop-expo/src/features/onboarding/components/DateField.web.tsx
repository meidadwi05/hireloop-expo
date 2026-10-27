import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {localDateToIso} from './date-field.utils';
import type {DateFieldProps} from './DateField.types';
import {FieldLabel} from './FormControls';

export type {DateFieldProps} from './DateField.types';
export {isoToLocalDate, localDateToIso} from './date-field.utils';

export function DateField({label, value, onChange, required, error, disabled, tone = 'dark', minimumDate, maximumDate}: DateFieldProps) {
  const [focused, setFocused] = useState(false);
  const input = React.createElement('input', {
    'aria-label': `${label}. ${value || 'Belum dipilih'}`,
    disabled,
    max: maximumDate ? localDateToIso(maximumDate) : undefined,
    min: minimumDate ? localDateToIso(minimumDate) : undefined,
    onBlur: () => setFocused(false),
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => onChange(event.currentTarget.value),
    onFocus: () => setFocused(true),
    style: {
      background: 'transparent',
      border: 0,
      boxSizing: 'border-box',
      color: disabled ? '#5E626B' : '#111827',
      cursor: disabled ? 'not-allowed' : 'pointer',
      flex: 1,
      fontFamily: 'PlusJakartaSans_400Regular',
      fontSize: 14,
      height: 50,
      minWidth: 0,
      outline: 'none',
      padding: '0 14px',
      width: '100%',
    } satisfies React.CSSProperties,
    type: 'date',
    value,
  });

  return (
    <View style={styles.group}>
      <FieldLabel label={label} required={required} tone={tone} />
      <View style={[styles.control, focused && styles.focused, error && styles.errorBorder, disabled && styles.disabled]}>
        {input}
      </View>
      {error ? <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {gap: 8, marginBottom: 20},
  control: {minHeight: 54, borderRadius: 11, borderWidth: 2, borderColor: '#E0E5EC', backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', overflow: 'hidden'},
  focused: {borderColor: '#111111'},
  disabled: {backgroundColor: '#D2CED0'},
  errorBorder: {borderColor: '#FF5B67'},
  error: {fontFamily: 'PlusJakartaSans_400Regular', color: '#FF8B93', fontSize: 11, lineHeight: 16},
});
