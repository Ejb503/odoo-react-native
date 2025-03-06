import React, { useState } from 'react';
import { 
  StyleSheet,
  View, 
  TextInput,
  Animated,
  StyleProp,
  ViewStyle,
  TextStyle,
  Text,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TextInputProps
} from 'react-native';
import { colors, components, spacing, typography, createShadow } from '../utils/theme';

interface FloatingInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  error?: string;
  hint?: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
}

/**
 * FloatingInput provides a modern text input with animated floating label,
 * customizable styles, and error states following the app's design system.
 */
export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  value,
  onChangeText,
  containerStyle,
  inputStyle,
  labelStyle,
  error,
  hint,
  rightIcon,
  leftIcon,
  secureTextEntry,
  ...restProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [animatedIsFocused] = useState(new Animated.Value(value ? 1 : 0));
  
  // Handle animation when focus changes or value changes
  React.useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: (isFocused || value.length > 0) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, animatedIsFocused]);
  
  // Animated styles for the floating label
  const labelContainerStyle = {
    position: 'absolute',
    left: leftIcon ? 40 : 16,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 8],
    }),
    zIndex: 1,
  };
  
  const labelTextStyle = {
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.textSecondary, isFocused ? colors.primary : colors.textMuted],
    }),
  };
  
  // Handle focus and blur events
  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    if (restProps.onFocus) {
      restProps.onFocus(e);
    }
  };
  
  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    if (restProps.onBlur) {
      restProps.onBlur(e);
    }
  };
  
  // Determine the border color based on focus state and error
  const getBorderColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return `${colors.textSecondary}30`; // Semi-transparent secondary
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      <View 
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: `${colors.backgroundLight}70`,
          },
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {/* Animated floating label */}
        <Animated.View style={labelContainerStyle}>
          <Animated.Text style={[styles.label, labelTextStyle, labelStyle]}>
            {label}
          </Animated.Text>
        </Animated.View>
        
        {/* Left icon if provided */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        {/* Text input */}
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={colors.primary}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry}
          {...restProps}
        />
        
        {/* Right icon if provided */}
        {rightIcon && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {/* Error or hint text */}
      {(error || hint) && (
        <Text style={[
          styles.helperText,
          error ? styles.errorText : styles.hintText
        ]}>
          {error || hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  inputContainer: {
    height: components.input.height,
    borderRadius: components.input.borderRadius,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    ...createShadow(2, 'rgba(0,0,0,0.1)'),
  },
  inputContainerFocused: {
    ...createShadow(4, `${colors.primary}40`),
  },
  inputContainerError: {
    ...createShadow(4, `${colors.error}40`),
  },
  label: {
    fontWeight: '500',
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: '400',
    height: '100%',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg, // Add extra padding on top for the label
    paddingBottom: spacing.xs,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: spacing.xs,
  },
  leftIconContainer: {
    marginLeft: spacing.md,
  },
  rightIconContainer: {
    marginRight: spacing.md,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    marginLeft: spacing.md,
  },
  errorText: {
    color: colors.error,
  },
  hintText: {
    color: colors.textSecondary,
  },
});

export default FloatingInput;