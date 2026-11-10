import React from 'react';
import {
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {FormFieldFrame} from './FormFieldFrame';

export type FormFieldPressableProps = Omit<PressableProps, 'children' | 'style'> & {
  active?: boolean;
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  disabledContainerStyle?: StyleProp<ViewStyle>;
  error?: boolean;
  errorContainerStyle?: StyleProp<ViewStyle>;
  focusedContainerStyle?: StyleProp<ViewStyle>;
};

export function FormFieldPressable({
  active,
  children,
  containerStyle,
  disabled,
  disabledContainerStyle,
  error = false,
  errorContainerStyle,
  focusedContainerStyle,
  ...props
}: FormFieldPressableProps) {
  return (
    <FormFieldFrame
      {...props}
      active={active}
      activeContainerStyle={focusedContainerStyle}
      containerStyle={containerStyle}
      disabled={disabled}
      disabledContainerStyle={disabledContainerStyle}
      error={error}
      errorContainerStyle={errorContainerStyle}
    >
      {children}
    </FormFieldFrame>
  );
}
