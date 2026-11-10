import React, {useRef} from 'react';
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {FormFieldFrame} from './FormFieldFrame';

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
  const disabled = editable === false;

  return (
    <FormFieldFrame
      accessible={false}
      activeContainerStyle={focusedContainerStyle}
      containerStyle={[styles.frame, containerStyle]}
      disabled={disabled}
      disabledContainerStyle={disabledContainerStyle}
      error={error}
      errorContainerStyle={errorContainerStyle}
      focusable={false}
      onPress={() => inputRef.current?.focus()}
      testID={fieldTestID}
    >
      {({setFocused}) => (
        <>
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
        </>
      )}
    </FormFieldFrame>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    flex: 1,
    minWidth: 0,
    outlineColor: 'transparent',
    outlineWidth: 0,
  } as TextStyle,
});
