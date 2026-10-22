import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet, Text} from 'react-native';

import {FormFieldPressable} from '../FormFieldPressable';

describe('FormFieldPressable', () => {
  it('menggambar focus border pada seluruh kontrol', () => {
    const screen = render(
      <FormFieldPressable accessibilityLabel="Pilih provinsi" testID="field">
        <Text>Pilih provinsi</Text>
      </FormFieldPressable>,
    );
    const field = screen.getByTestId('field');

    fireEvent(field, 'focus');
    expect(StyleSheet.flatten(field.props.style).borderColor).toBe('#111111');

    fireEvent(field, 'blur');
    expect(StyleSheet.flatten(field.props.style).borderColor).toBe('#DDE3EA');
  });

  it('mempertahankan error sebagai prioritas visual', () => {
    const screen = render(
      <FormFieldPressable
        accessibilityLabel="Pilih provinsi"
        error
        errorContainerStyle={{borderColor: '#FF5B67'}}
        testID="field"
      >
        <Text>Pilih provinsi</Text>
      </FormFieldPressable>,
    );
    const field = screen.getByTestId('field');

    fireEvent(field, 'focus');
    expect(StyleSheet.flatten(field.props.style).borderColor).toBe('#FF5B67');
  });
});
