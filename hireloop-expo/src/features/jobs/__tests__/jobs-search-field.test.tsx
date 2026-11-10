import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet} from 'react-native';

import {JobsSearchField} from '../components/JobsSearchField';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);

describe('JobsSearchField', () => {
  it('menampilkan satu border biru tanpa outline input bawaan', () => {
    const onChangeText = jest.fn();
    const screen = render(
      <JobsSearchField
        height={56}
        iconSize={22}
        iconSlotSize={24}
        onChangeText={onChangeText}
        value="operator"
      />,
    );
    const input = screen.getByLabelText('Cari posisi, perusahaan, atau lokasi');
    const frame = screen.getByTestId('jobs-search-frame');

    expect(StyleSheet.flatten(input.props.style).outlineStyle).toBe('none');
    expect(StyleSheet.flatten(input.props.style).borderWidth).toBe(0);

    fireEvent(input, 'focus');
    expect(StyleSheet.flatten(frame.props.style).borderColor).toBe('#1268FF');

    fireEvent.press(screen.getByLabelText('Hapus pencarian'));
    expect(onChangeText).toHaveBeenCalledWith('');
  });
});
