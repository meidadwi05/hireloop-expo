import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet} from 'react-native';

import {FormTextInput} from '../FormTextInput';

describe('FormTextInput', () => {
  it('menggambar fokus pada seluruh wrapper dan mengembalikannya saat blur', () => {
    const screen = render(
      <FormTextInput
        accessibilityLabel="Email"
        fieldTestID="email-frame"
        value=""
      />,
    );
    const input = screen.getByLabelText('Email');
    const frame = screen.getByTestId('email-frame');

    fireEvent(input, 'focus');
    expect(StyleSheet.flatten(frame.props.style).borderColor).toBe('#111111');

    fireEvent(input, 'blur');
    expect(StyleSheet.flatten(frame.props.style).borderColor).toBe('#DDE3EA');
  });

  it('memprioritaskan border error ketika field sedang fokus', () => {
    const screen = render(
      <FormTextInput
        accessibilityLabel="Email"
        error
        errorContainerStyle={{borderColor: '#FF5B67'}}
        fieldTestID="email-frame"
        value="invalid"
      />,
    );
    const input = screen.getByLabelText('Email');

    fireEvent(input, 'focus');

    expect(StyleSheet.flatten(screen.getByTestId('email-frame').props.style).borderColor).toBe('#FF5B67');
  });

  it('meneruskan callback focus dan blur milik pemanggil', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const screen = render(
      <FormTextInput
        accessibilityLabel="Nama"
        onBlur={onBlur}
        onFocus={onFocus}
        value=""
      />,
    );
    const input = screen.getByLabelText('Nama');

    fireEvent(input, 'focus');
    fireEvent(input, 'blur');

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
