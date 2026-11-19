import {render} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet} from 'react-native';

import {SkillMultiSelect} from '../components/SkillMultiSelect';

jest.mock('@expo/vector-icons', () => ({Ionicons: () => null}));

describe('SkillMultiSelect', () => {
  const props = {
    options: [],
    selected: [],
    onToggle: jest.fn(),
    onToggleCustom: jest.fn(),
  };

  it('uses the light form label color inside the profile modal', () => {
    const screen = render(<SkillMultiSelect {...props} tone="light" />);
    const labelStyle = StyleSheet.flatten(screen.getByText(/Keahlian/).props.style);

    expect(labelStyle.color).toBe('#151923');
  });
});
