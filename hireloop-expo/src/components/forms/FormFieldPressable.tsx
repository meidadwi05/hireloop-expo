import React, {useState} from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export type FormFieldPressableProps = Omit<PressableProps, 'style'> & {
  containerStyle?: StyleProp<ViewStyle>;
  disabledContainerStyle?: StyleProp<ViewStyle>;
  error?: boolean;
  errorContainerStyle?: StyleProp<ViewStyle>;
  focusedContainerStyle?: StyleProp<ViewStyle>;
};

export function FormFieldPressable({
  containerStyle,
  disabled,
  disabledContainerStyle,
  error = false,
  errorContainerStyle,
  focusedContainerStyle,
  onBlur,
  onFocus,
  ...props
}: FormFieldPressableProps) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onBlur={event => {
        setFocused(false);
        onBlur?.(event);
      }}
      onFocus={event => {
        setFocused(true);
        onFocus?.(event);
      }}
      style={({pressed}) => [
        styles.frame,
        containerStyle,
        (focused || pressed) && styles.focused,
        (focused || pressed) && focusedContainerStyle,
        error && styles.error,
        error && errorContainerStyle,
        disabled && styles.disabled,
        disabled && disabledContainerStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE3EA',
    borderRadius: 12,
    borderWidth: 2,
  },
  focused: {borderColor: '#111111'},
  error: {borderColor: '#E25E6D'},
  disabled: {backgroundColor: '#D2CED0'},
});
