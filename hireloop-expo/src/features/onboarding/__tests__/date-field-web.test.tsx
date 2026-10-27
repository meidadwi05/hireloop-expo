import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';

import {DateField, isoToLocalDate} from '../components/DateField.web';

describe('DateField web', () => {
  it('menggunakan input date browser dan menyimpan nilai ISO', () => {
    const onChange = jest.fn();
    const screen = render(
      <DateField
        label="Mulai Pendidikan"
        value=""
        onChange={onChange}
        minimumDate={new Date(2020, 0, 1, 12)}
        maximumDate={new Date(2026, 9, 27, 12)}
      />,
    );
    const input = screen.getByLabelText('Mulai Pendidikan. Belum dipilih');

    expect(input.props.type).toBe('date');
    expect(input.props.min).toBe('2020-01-01');
    expect(input.props.max).toBe('2026-10-27');

    fireEvent(input, 'change', {currentTarget: {value: '2024-08-17'}});
    expect(onChange).toHaveBeenCalledWith('2024-08-17');
    expect(isoToLocalDate('2024-08-17')).toBeInstanceOf(Date);
  });
});
