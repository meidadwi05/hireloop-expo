import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import type {DateFieldProps} from './DateField.types';
import {FieldLabel} from './FormControls';

function toIsoBoundary(value?: Date): string | undefined {
  if (!value) return undefined;
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DateField({label, value, onChange, required, error, disabled, tone = 'dark', minimumDate, maximumDate}: DateFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.group}>
      <FieldLabel label={label} required={required} tone={tone} />
      <View style={[styles.control, focused && styles.focused, disabled && styles.disabled, error && styles.errorBorder]}>
        <input
          aria-label={label}
          disabled={disabled}
          type="date"
          value={value}
          min={toIsoBoundary(minimumDate)}
          max={toIsoBoundary(maximumDate)}
          onChange={event => onChange(event.currentTarget.value)}
          onBlur={() => setFocused(false)}
          onFocus={() => setFocused(true)}
          style={webInputStyle}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const webInputStyle: React.CSSProperties = {
  appearance: 'none',
  background: 'transparent',
  border: 0,
  color: '#111827',
  flex: 1,
  fontFamily: 'PlusJakartaSans_400Regular',
  fontSize: 14,
  height: 52,
  minWidth: 0,
  outline: 'none',
  padding: '0 15px',
};

const styles = StyleSheet.create({
  group: {gap: 8, marginBottom: 20},
  control: {minHeight: 54, borderRadius: 11, backgroundColor: 'white', borderWidth: 2, borderColor: '#E0E5EC', flexDirection: 'row', alignItems: 'center', overflow: 'hidden'},
  focused: {borderColor: '#111111'},
  disabled: {backgroundColor: '#D2CED0'},
  errorBorder: {borderColor: '#FF5B67'},
  error: {fontFamily: 'PlusJakartaSans_400Regular', color: '#FF8B93', fontSize: 11, lineHeight: 16},
});
