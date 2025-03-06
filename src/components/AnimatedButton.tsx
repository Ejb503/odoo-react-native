import React, { useState } from 'react';
import { 
  StyleSheet, 
  TouchableWithoutFeedback, 
  View, 
  Text, 
  StyleProp, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  interpolateColor
} from 'react-native-reanimated';
// Conditional import to handle web compatibility
let LinearGradient: any;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (error) {
  // Fallback for web - simple View
  LinearGradient = ({ children, style, colors, start, end }: any) => (
    <View style={[style, { backgroundColor: colors[0] }]}>{children}</View>
  );
}
import { colors, components, createShadow, animationPresets } from '../utils/theme';

type ButtonVariant = 'primary' | 'secondary' | 'text';
type ButtonSize = 'normal' | 'compact';

interface AnimatedButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  gradientColors?: string[];
}

/**
 * AnimatedButton provides a highly customizable button with fluid animations,
 * gradient backgrounds, and press effects following the app's design language.
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'normal',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  gradientColors,
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);
  
  // Handle button press animations
  const handlePressIn = () => {
    scale.value = withSpring(0.97, animationPresets.spring);
    pressed.value = withTiming(1, { duration: 150 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, animationPresets.spring);
    pressed.value = withTiming(0, { duration: 200 });
  };
  
  // Determine button colors based on variant
  const getButtonColors = () => {
    switch (variant) {
      case 'primary':
        return gradientColors || [colors.primary, `${colors.secondary}CC`];
      case 'secondary':
        return [colors.backgroundLight, colors.backgroundLight];
      case 'text':
        return ['transparent', 'transparent'];
      default:
        return [colors.primary, `${colors.secondary}CC`];
    }
  };
  
  // Animated styles for button scaling and glow effects
  const animatedStyles = useAnimatedStyle(() => {
    // Increase brightness slightly when pressed
    const brightness = pressed.value * 0.1;
    
    return {
      transform: [{ scale: scale.value }],
      opacity: disabled ? 0.6 : 1,
      backgroundColor: variant === 'text' ? 'transparent' : undefined,
    };
  });
  
  // Animated styles for text color changes
  const textAnimatedStyle = useAnimatedStyle(() => {
    let textColor;
    
    switch (variant) {
      case 'primary':
        textColor = colors.textPrimary;
        break;
      case 'secondary':
        textColor = colors.primary;
        break;
      case 'text':
        textColor = colors.primary;
        break;
      default:
        textColor = colors.textPrimary;
    }
    
    // Brighten text slightly when pressed for 'secondary' and 'text' variants
    if (variant !== 'primary') {
      const brighterColor = interpolateColor(
        pressed.value,
        [0, 1],
        [textColor, colors.secondary]
      );
      
      return { color: brighterColor };
    }
    
    return { color: textColor };
  });
  
  // Determine button height based on size
  const buttonHeight = size === 'compact' 
    ? components.button.compactHeight 
    : components.button.height;
  
  // Get button colors for gradient or solid background
  const buttonColors = getButtonColors();
  
  // Apply drop shadow effect only to primary and secondary buttons
  const shadowStyle = (variant === 'primary' || variant === 'secondary') 
    ? createShadow(4, variant === 'primary' ? colors.primary : 'rgba(0,0,0,0.15)')
    : {};
  
  // Render button content (text and icons)
  const renderContent = () => (
    <View style={styles.contentContainer}>
      {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
      <Animated.Text style={[styles.text, textAnimatedStyle, textStyle]}>
        {loading ? 'Loading...' : title}
      </Animated.Text>
      {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
    </View>
  );
  
  // Render the button with appropriate styling based on variant
  return (
    <TouchableWithoutFeedback
      onPress={!disabled && !loading ? onPress : undefined}
      onPressIn={!disabled && !loading ? handlePressIn : undefined}
      onPressOut={!disabled && !loading ? handlePressOut : undefined}
    >
      <Animated.View 
        style={[
          styles.button, 
          { height: buttonHeight },
          shadowStyle,
          animatedStyles,
          style
        ]}
      >
        {variant === 'primary' ? (
          <LinearGradient
            colors={buttonColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {renderContent()}
          </LinearGradient>
        ) : (
          <View 
            style={[
              styles.container, 
              { 
                backgroundColor: buttonColors[0],
                borderWidth: variant === 'secondary' ? 1 : 0,
                borderColor: variant === 'secondary' ? `${colors.primary}30` : undefined,
              }
            ]}
          >
            {renderContent()}
          </View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: components.button.borderRadius,
    overflow: 'hidden',
    minWidth: 90,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: components.button.borderRadius,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default AnimatedButton;