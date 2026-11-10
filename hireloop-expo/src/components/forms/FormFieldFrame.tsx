import React, {useState} from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';

export type FormFieldFrameRenderState = {
  active: boolean;
  setFocused: (focused: boolean) => void;
};

export type FormFieldFrameProps = Omit<PressableProps, 'children' | 'style'> & {
  active?: boolean;
  activeContainerStyle?: StyleProp<ViewStyle>;
  activateWhilePressed?: boolean;
  children: React.ReactNode | ((state: FormFieldFrameRenderState) => React.ReactNode);
  containerStyle?: StyleProp<ViewStyle>;
  disabledContainerStyle?: StyleProp<ViewStyle>;
  error?: boolean;
  errorContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * Shared visual and interaction frame for text inputs, selects, and date fields.
 * Text inputs update the internal focus state through setFocused. Controls that
 * open a picker or modal keep the frame highlighted through the active prop.
 */
export function FormFieldFrame({
  active = false,
  activeContainerStyle,
  activateWhilePressed = true,
  children,
  containerStyle,
  disabled,
  disabledContainerStyle,
  error = false,
  errorContainerStyle,
  onBlur,
  onFocus,
  ...pressableProps
}: FormFieldFrameProps) {
  const [focused, setFocused] = useState(false);
  const activeWithoutPress = !disabled && (active || focused);
  const content = typeof children === 'function'
    ? children({active: activeWithoutPress, setFocused})
    : children;

  return (
    <Pressable
      {...pressableProps}
      disabled={disabled}
      onBlur={event => {
        setFocused(false);
        onBlur?.(event);
      }}
      onFocus={event => {
        setFocused(true);
        onFocus?.(event);
      }}
      style={({pressed}) => {
        const highlighted = activeWithoutPress || (!disabled && activateWhilePressed && pressed);

        return [
          styles.frame,
          containerStyle,
          highlighted && styles.active,
          highlighted && activeContainerStyle,
          error && styles.error,
          error && errorContainerStyle,
          disabled && styles.disabled,
          disabled && disabledContainerStyle,
        ];
      }}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE3EA',
    borderRadius: 12,
    borderWidth: 2,
  },
  active: {borderColor: '#1268FF'},
  error: {borderColor: '#E25E6D'},
  disabled: {backgroundColor: '#D2CED0'},
});
