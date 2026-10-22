import React, {useRef, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export type FormTextInputProps = Omit<TextInputProps, 'style'> & {
  containerStyle?: StyleProp<ViewStyle>;
  disabledContainerStyle?: StyleProp<ViewStyle>;
  error?: boolean;
  errorContainerStyle?: StyleProp<ViewStyle>;
  fieldTestID?: string;
  focusedContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
};

export function FormTextInput({
  accessibilityState,
  containerStyle,
  disabledContainerStyle,
  editable = true,
  error = false,
  errorContainerStyle,
  fieldTestID,
  focusedContainerStyle,
  inputStyle,
  leftAccessory,
  onBlur,
  onFocus,
  rightAccessory,
  underlineColorAndroid = 'transparent',
  ...inputProps
}: FormTextInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const disabled = editable === false;

  return (
    <Pressable
      accessible={false}
      disabled={disabled}
      focusable={false}
      onPress={() => inputRef.current?.focus()}
      style={[
        styles.frame,
        containerStyle,
        focused && styles.focused,
        focused && focusedContainerStyle,
        error && styles.error,
        error && errorContainerStyle,
        disabled && styles.disabled,
        disabled && disabledContainerStyle,
      ]}
      testID={fieldTestID}
    >
      {leftAccessory}
      <TextInput
        {...inputProps}
        ref={inputRef}
        accessibilityState={{
          ...accessibilityState,
          disabled,
        }}
        editable={!disabled}
        onBlur={event => {
          setFocused(false);
          onBlur?.(event);
        }}
        onFocus={event => {
          setFocused(true);
          onFocus?.(event);
        }}
        style={[styles.input, inputStyle]}
        underlineColorAndroid={underlineColorAndroid}
      />
      {rightAccessory}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE3EA',
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
  },
  focused: {borderColor: '#111111'},
  error: {borderColor: '#E25E6D'},
  disabled: {backgroundColor: '#D2CED0'},
  input: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    flex: 1,
    minWidth: 0,
    outlineColor: 'transparent',
    outlineWidth: 0,
  } as TextStyle,
});
