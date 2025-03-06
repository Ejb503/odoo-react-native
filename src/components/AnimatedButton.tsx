import React, { useEffect } from "react";
import {
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolateColor,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import {
  colors,
  components,
  createShadow,
  animationPresets,
  timing,
} from "../utils/theme";

type ButtonVariant = "primary" | "secondary" | "text" | "gradient";
type ButtonSize = "normal" | "compact" | "large";

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
  gradientColors?: [string, string, ...string[]];
  glowEffect?: boolean;
}

/**
 * Enhanced AnimatedButton provides a highly customizable button with fluid animations,
 * gradient backgrounds, press effects, and optional glow animations following 
 * the app's design language.
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  title,
  variant = "primary",
  size = "normal",
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  gradientColors,
  glowEffect = true,
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);
  const glowOpacity = useSharedValue(0.5);
  const glowScale = useSharedValue(1);
  const gradientPosition = useSharedValue(0);
  const shimmerOpacity = useSharedValue(0);

  // Setup animations
  useEffect(() => {
    if (Platform.OS === 'web') return;
    
    if (glowEffect && !disabled && !loading && variant !== "text") {
      // Pulsing glow effect
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: timing.slow }),
          withTiming(0.2, { duration: timing.slow })
        ),
        -1,
        true
      );
      
      // Subtle scale effect
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: timing.slow + 300 }),
          withTiming(1, { duration: timing.slow + 300 })
        ),
        -1,
        true
      );
      
      // Gradient shimmer effect for primary and gradient variants
      if (variant === "primary" || variant === "gradient") {
        // Animate gradient position
        gradientPosition.value = withRepeat(
          withTiming(1, { duration: 2500 }),
          -1,
          true
        );
        
        // Shimmer effect
        shimmerOpacity.value = withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withDelay(1000, withTiming(0.3, { duration: 500 })),
            withTiming(0, { duration: 500 })
          ),
          -1,
          false
        );
      }
    }
  }, [glowEffect, disabled, loading, variant]);

  // Handle button press animations
  const handlePressIn = () => {
    if (Platform.OS === 'web') return;
    
    scale.value = withSpring(0.96, { ...animationPresets.spring, stiffness: 200 });
    pressed.value = withTiming(1, { duration: timing.fast });
    
    // Increase glow on press
    if (glowEffect && (variant === "primary" || variant === "gradient")) {
      glowOpacity.value = withTiming(0.9, { duration: timing.fast });
      glowScale.value = withTiming(1.3, { duration: timing.fast });
    }
  };

  const handlePressOut = () => {
    if (Platform.OS === 'web') return;
    
    scale.value = withSpring(1, { 
      ...animationPresets.spring, 
      stiffness: 120,
      damping: 15,
      mass: 0.8
    });
    pressed.value = withTiming(0, { duration: timing.normal });
    
    // Return to normal glow animation if needed
    if (glowEffect && !disabled && (variant === "primary" || variant === "gradient")) {
      glowOpacity.value = withTiming(0.5, { duration: timing.normal });
      glowScale.value = withTiming(1, { duration: timing.normal });
    }
  };

  // Determine button colors based on variant
  const getButtonColors = (): [string, string, ...string[]] => {
    switch (variant) {
      case "primary":
        return gradientColors || [colors.primary, `${colors.secondary}CC`];
      case "gradient":
        return gradientColors || [`${colors.accent}EE`, colors.primary, `${colors.secondary}DD`];
      case "secondary":
        return [colors.backgroundLight, colors.backgroundLight];
      case "text":
        return ["transparent", "transparent"];
      default:
        return [colors.primary, `${colors.secondary}CC`];
    }
  };

  // Animated styles for button scaling and effects
  const animatedStyles = useAnimatedStyle(() => {
    if (Platform.OS === 'web') {
      return {
        opacity: disabled ? 0.6 : 1,
        backgroundColor: variant === "text" ? "transparent" : undefined,
      };
    }

    return {
      transform: [{ scale: scale.value }],
      borderColor: variant === "secondary" 
        ? interpolateColor(
            pressed.value,
            [0, 1],
            [`${colors.primary}30`, colors.primary]
          )
        : undefined,
      opacity: disabled ? 0.6 : 1,
      backgroundColor: variant === "text" ? "transparent" : undefined,
    };
  });

  // Glow effect animation
  const glowAnimatedStyle = useAnimatedStyle(() => {
    if (Platform.OS === 'web') {
      return { opacity: 0 };
    }
    
    return {
      opacity: glowOpacity.value,
      transform: [{ scale: glowScale.value }],
    };
  });

  // Shimmer animation
  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    if (Platform.OS === 'web') {
      return { opacity: 0 };
    }
    
    return {
      opacity: shimmerOpacity.value,
      transform: [{ translateX: (gradientPosition.value * 200) - 100 }],
    };
  });

  // Animated styles for text color changes
  const textAnimatedStyle = useAnimatedStyle(() => {
    let textColor;

    switch (variant) {
      case "primary":
      case "gradient":
        textColor = colors.textPrimary;
        break;
      case "secondary":
        textColor = colors.primary;
        break;
      case "text":
        textColor = colors.primary;
        break;
      default:
        textColor = colors.textPrimary;
    }

    if (Platform.OS === 'web') {
      return { color: textColor };
    }

    // Brighten text slightly when pressed for 'secondary' and 'text' variants
    if (variant === "secondary" || variant === "text") {
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
  const getButtonHeight = () => {
    switch (size) {
      case "compact":
        return components.button.compactHeight;
      case "large":
        return components.button.height + 8;
      default:
        return components.button.height;
    }
  };

  // Get font size based on button size
  const getFontSize = () => {
    switch (size) {
      case "compact":
        return 14;
      case "large":
        return 18;
      default:
        return 16;
    }
  };

  const buttonHeight = getButtonHeight();
  const fontSize = getFontSize();

  // Get button colors for gradient or solid background
  const buttonColors = getButtonColors();

  // Apply drop shadow effect based on variant
  const shadowStyle =
    variant !== "text"
      ? createShadow(
          variant === "primary" || variant === "gradient" ? 6 : 3,
          variant === "primary" || variant === "gradient" 
            ? `${buttonColors[0]}70` 
            : "rgba(0,0,0,0.15)"
        )
      : {};

  // Render button content (text and icons)
  const renderContent = () => (
    <View style={styles.contentContainer}>
      {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
      
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === "primary" || variant === "gradient" ? colors.textPrimary : colors.primary} 
        />
      ) : (
        <Animated.Text 
          style={[
            styles.text, 
            { fontSize }, 
            textAnimatedStyle, 
            textStyle
          ]}
        >
          {title}
        </Animated.Text>
      )}
      
      {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
    </View>
  );

  // Use gradient for primary and gradient variants
  const useGradient = variant === "primary" || variant === "gradient";

  if (Platform.OS === 'web') {
    const webStyles = {
      ...styles.button,
      height: buttonHeight,
      ...shadowStyle,
      transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
      cursor: (!disabled && !loading) ? 'pointer' : 'default',
      opacity: disabled ? 0.6 : 1,
      backgroundColor: useGradient ? buttonColors[0] : buttonColors[0],
      ':hover': {
        transform: (!disabled && !loading) ? 'scale(0.98)' : 'none',
        opacity: (!disabled && !loading) ? 0.9 : disabled ? 0.6 : 1,
      },
    };

    return (
      <div
        onClick={(!disabled && !loading) ? onPress : undefined}
        style={webStyles}
      >
        {renderContent()}
      </div>
    );
  }

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
          style,
        ]}
      >
        {/* Glow effect (conditionally rendered) */}
        {glowEffect && !disabled && (variant === "primary" || variant === "gradient") && (
          <Animated.View 
            style={[
              styles.glow,
              { backgroundColor: `${buttonColors[0]}40` },
              glowAnimatedStyle
            ]} 
          />
        )}
        
        {useGradient ? (
          <>
            <LinearGradient
              colors={buttonColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              {/* Shimmer effect */}
              {glowEffect && !disabled && !loading && (
                <Animated.View style={[styles.shimmer, shimmerAnimatedStyle]} />
              )}
              
              {renderContent()}
            </LinearGradient>
          </>
        ) : (
          <View
            style={[
              styles.container,
              {
                backgroundColor: buttonColors[0],
                borderWidth: variant === "secondary" ? 1 : 0,
                borderColor:
                  variant === "secondary" ? `${colors.primary}30` : undefined,
              },
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
    overflow: "hidden",
    minWidth: 100,
    position: "relative",
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: components.button.borderRadius,
    position: "relative",
    overflow: "hidden",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    zIndex: 2,
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  glow: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: components.button.borderRadius * 1.5,
    zIndex: -1,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "40%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    transform: [{ skewX: "-20deg" }],
    zIndex: 1,
  }
});

export default AnimatedButton;
