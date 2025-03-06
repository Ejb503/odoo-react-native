import React, { ReactNode, useEffect } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, Platform, Pressable } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withRepeat,
  withSequence,
  Easing,
  interpolateColor
} from 'react-native-reanimated';
import { colors, components, createShadow, timing } from '../utils/theme';

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: number;
  glowColor?: string;
  animated?: boolean;
  onPress?: () => void;
  pulseGlow?: boolean;
}

/**
 * Enhanced GlassCard component provides a modern, glass-morphism style card with
 * advanced animation effects. It creates a frosted glass effect with a subtle glow
 * that can pulse for added visual interest.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  elevation = 4,
  glowColor = colors.primary,
  animated = true,
  onPress,
  pulseGlow = true,
}) => {
  // Animated values
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);
  const glowSpread = useSharedValue(1);
  const borderGlow = useSharedValue(0);
  
  // Initialize animations
  useEffect(() => {
    if (pulseGlow) {
      // Subtle pulsing glow effect
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: timing.slow, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: timing.slow, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      
      // Subtle spread of glow
      glowSpread.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: timing.slow + 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.95, { duration: timing.slow + 300, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      
      // Border glow animation
      borderGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: timing.slow * 1.5, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: timing.slow * 1.5, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [pulseGlow]);

  // Handle press/hover state
  const onPressIn = () => {
    if (animated) {
      scale.value = withTiming(0.98, { duration: timing.fast, easing: Easing.out(Easing.ease) });
      glowOpacity.value = withTiming(0.8, { duration: timing.fast });
    }
  };

  const onPressOut = () => {
    if (animated) {
      scale.value = withTiming(1, { duration: timing.normal, easing: Easing.elastic(1.1) });
      
      if (!pulseGlow) {
        glowOpacity.value = withTiming(0.4, { duration: timing.normal });
      }
    }
  };

  // Create animated styles
  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
      transform: [{ scale: glowSpread.value }],
    };
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    // Handle web compatibility with transform style
    if (Platform.OS === 'web') {
      return {
        transform: `scale(${scale.value})`,
        borderColor: interpolateColor(
          borderGlow.value,
          [0, 1],
          [`${colors.textPrimary}10`, `${glowColor}40`]
        ),
      };
    } else {
      return {
        transform: [{ scale: scale.value }],
        borderColor: interpolateColor(
          borderGlow.value,
          [0, 1],
          [`${colors.textPrimary}10`, `${glowColor}40`]
        ),
      };
    }
  });

  // Combine base styles with shadow and any custom styles
  const combinedStyles = [
    styles.card,
    {
      borderColor: `${colors.textPrimary}10`,
    },
    style,
  ];

  // Prepare content
  const cardContent = (
    <>
      {/* Animated glow effect under the card */}
      <Animated.View 
        style={[
          styles.glowEffect, 
          { backgroundColor: `${glowColor}20` },
          animatedGlowStyle
        ]} 
      />
      
      {/* Glass overlay for frosted effect */}
      <View style={styles.glassOverlay} />
      
      {/* Card's main content */}
      <View style={styles.content}>
        {children}
      </View>
      
      {/* Top highlight for 3D effect */}
      <View style={styles.topHighlight} />
    </>
  );

  // Handle web platform separately for better compatibility
  if (Platform.OS === 'web') {
    if (onPress) {
      return (
        <div 
          onClick={onPress}
          onMouseDown={onPressIn}
          onMouseUp={onPressOut}
          onMouseLeave={onPressOut}
          style={{ cursor: 'pointer' }}
        >
          <Animated.View style={[...combinedStyles, createShadow(elevation, glowColor), animatedCardStyle]}>
            {cardContent}
          </Animated.View>
        </div>
      );
    }
    
    return (
      <Animated.View style={[...combinedStyles, createShadow(elevation, glowColor), animatedCardStyle]}>
        {cardContent}
      </Animated.View>
    );
  }

  // For native platforms with press handling
  if (onPress) {
    return (
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View style={[...combinedStyles, createShadow(elevation, glowColor), animatedCardStyle]}>
          {cardContent}
        </Animated.View>
      </Pressable>
    );
  }

  // For non-interactive native cards
  return (
    <Animated.View style={[...combinedStyles, createShadow(elevation, glowColor), animatedCardStyle]}>
      {cardContent}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: components.card.borderRadius,
    padding: components.card.padding,
    backgroundColor: `${colors.backgroundMedium}85`, // More transparent
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    // borderColor handled by animated style
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${colors.textPrimary}08`, // Almost transparent white
    borderRadius: components.card.borderRadius - 1, // Slightly smaller than card
    backdropFilter: 'blur(10px)', // Will only work on web
  },
  content: {
    zIndex: 2, // Ensure content is above the glass overlay
  },
  glowEffect: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: components.card.borderRadius * 1.5,
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    zIndex: -1,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: `${colors.textPrimary}30`,
    borderTopLeftRadius: components.card.borderRadius,
    borderTopRightRadius: components.card.borderRadius,
    zIndex: 1,
  },
});

export default GlassCard;