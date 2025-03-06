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
  TextInputProps,
} from 'react-native';
import { colors, spacing } from '../utils/theme';

interface InputProps extends TextInputProps {
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
 * Premium, minimal input with perfect alignment and spacing
 */
export const FloatingInput: React.FC<InputProps> = ({
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
  
  // Clean simple animation for label
  React.useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: (isFocused || value.length > 0) ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, animatedIsFocused]);
  
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
  
  // Set color states
  const getLabelColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return colors.textSecondary;
  };
  
  const getLineColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return `${colors.textSecondary}30`;
  };
  
  // Label animation styles
  const labelAnimatedStyle = {
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 0], // Move up when focused or has value
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: getLabelColor(),
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      <Animated.Text 
        style={[
          styles.label,
          labelAnimatedStyle,
          labelStyle
        ]}
      >
        {label}
      </Animated.Text>
      
      {/* Main input row */}
      <View style={styles.inputRow}>
        {/* Left icon with proper spacing */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        {/* Input with perfect alignment */}
        <TextInput
          style={[
            styles.input,
            {paddingTop: value || isFocused ? 20 : 10},
            leftIcon ? {marginLeft: 0} : undefined,
            rightIcon ? {marginRight: 0} : undefined,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={colors.primary}
          placeholderTextColor={`${colors.textSecondary}80`}
          secureTextEntry={secureTextEntry}
          {...restProps}
        />
        
        {/* Right icon with proper spacing */}
        {rightIcon && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {/* Bottom line with color change on focus/error */}
      <View style={styles.lineContainer}>
        <View 
          style={[
            styles.line, 
            {backgroundColor: getLineColor()},
            isFocused ? styles.activeLine : null
          ]} 
        />
      </View>
      
      {/* Error or hint message */}
      {(error || hint) && (
        <Text 
          style={[
            styles.helperText,
            error ? styles.errorText : styles.hintText
          ]}
          numberOfLines={1}
        >
          {error || hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    position: 'relative',
    width: '100%',
  },
  label: {
    position: 'absolute',
    left: 0,
    fontWeight: '500',
    letterSpacing: 0.2,
    zIndex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 56,
  },
  leftIconContainer: {
    marginRight: spacing.xs,
  },
  rightIconContainer: {
    marginLeft: spacing.xs,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    paddingBottom: 8,
    paddingTop: 20, // Space for the floating label
    minHeight: 56,
  },
  lineContainer: {
    width: '100%',
    height: 1,
    backgroundColor: `${colors.textSecondary}20`,
    marginTop: 0,
  },
  line: {
    height: 1,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  activeLine: {
    height: 2,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  errorText: {
    color: colors.error,
  },
  hintText: {
    color: colors.textSecondary,
  },
});

export default FloatingInput;