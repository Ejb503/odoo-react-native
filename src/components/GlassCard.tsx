import React, { ReactNode, useEffect } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, Platform, Pressable } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withRepeat,
  withSequence,
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
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);
  const glowSpread = useSharedValue(1);
  const borderGlow = useSharedValue(0);
  
  useEffect(() => {
    if (pulseGlow && Platform.OS !== 'web') {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: timing.slow }),
          withTiming(0.3, { duration: timing.slow })
        ),
        -1,
        true
      );
      
      glowSpread.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: timing.slow + 300 }),
          withTiming(0.95, { duration: timing.slow + 300 })
        ),
        -1,
        true
      );
      
      borderGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: timing.slow * 1.5 }),
          withTiming(0, { duration: timing.slow * 1.5 })
        ),
        -1,
        true
      );
    }
  }, [pulseGlow]);

  const onPressIn = () => {
    if (animated && Platform.OS !== 'web') {
      scale.value = withTiming(0.98, { duration: timing.fast });
      glowOpacity.value = withTiming(0.8, { duration: timing.fast });
    }
  };

  const onPressOut = () => {
    if (animated && Platform.OS !== 'web') {
      scale.value = withTiming(1, { duration: timing.normal });
      if (!pulseGlow) {
        glowOpacity.value = withTiming(0.4, { duration: timing.normal });
      }
    }
  };

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowSpread.value }],
  }));

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: interpolateColor(
      borderGlow.value,
      [0, 1],
      [`${colors.textPrimary}10`, `${glowColor}40`]
    ),
  }));

  const combinedStyles = [
    styles.card,
    {
      borderColor: `${colors.textPrimary}10`,
    },
    style,
  ];

  const cardContent = (
    <>
      {Platform.OS !== 'web' && (
        <Animated.View 
          style={[
            styles.glowEffect, 
            { backgroundColor: `${glowColor}20` },
            animatedGlowStyle
          ]} 
        />
      )}
      
      {Platform.OS === 'web' ? (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: `${colors.textPrimary}08`,
            borderRadius: components.card.borderRadius - 1,
            backdropFilter: 'blur(10px)',
          }}
        />
      ) : (
        <View style={styles.glassOverlay} />
      )}
      
      <View style={styles.content}>
        {children}
      </View>
      
      <View style={styles.topHighlight} />
    </>
  );

  if (Platform.OS === 'web') {
    return (
      <div 
        onClick={onPress}
        style={{
          ...StyleSheet.flatten(combinedStyles),
          ...createShadow(elevation, glowColor),
          transition: 'all 0.2s ease-out',
          cursor: onPress ? 'pointer' : 'default',
          transform: 'scale(1)',
          '&:hover': {
            transform: onPress ? 'scale(0.98)' : 'none',
          },
          '&:active': {
            transform: onPress ? 'scale(0.96)' : 'none',
          },
        } as any}
      >
        {cardContent}
      </div>
    );
  }

  if (onPress) {
    return (
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View style={[...combinedStyles, createShadow(elevation, glowColor), animatedCardStyle]}>
          {cardContent}
        </Animated.View>
      </Pressable>
    );
  }

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
    backgroundColor: `${colors.backgroundMedium}85`,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${colors.textPrimary}08`,
    borderRadius: components.card.borderRadius - 1,
  },
  content: {
    zIndex: 2,
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