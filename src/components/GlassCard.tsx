import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, Platform } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, components, createShadow } from '../utils/theme';

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: number;
  glowColor?: string;
  animated?: boolean;
  onPress?: () => void;
}

/**
 * GlassCard component provides a modern, glass-morphism style card with optional
 * animation effects. It creates a frosted glass effect with a subtle glow.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  elevation = 4,
  glowColor = colors.primary,
  animated = false,
  onPress,
}) => {
  // Create animated style for hover/press effects if animated is true
  const animatedStyle = useAnimatedStyle(() => {
    if (!animated) return {};
    
    // Handle web compatibility with transform style
    if (Platform.OS === 'web') {
      return {
        transform: `scale(${withTiming(1.0, { duration: 200 })})`,
      };
    } else {
      return {
        transform: [
          { scale: withTiming(1.0, { duration: 200 }) },
        ],
      };
    }
  });

  // Combine base styles with shadow and any custom styles
  const combinedStyles = [
    styles.card,
    createShadow(elevation, glowColor),
    style,
  ];

  // Handle web platform separately for better compatibility
  if (Platform.OS === 'web') {
    return (
      <View style={combinedStyles}>
        <View style={styles.glassOverlay} />
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  // For native platforms, use all animations
  if (animated) {
    return (
      <Animated.View style={[...combinedStyles, animatedStyle]}>
        <View style={styles.glassOverlay} />
        <View style={styles.content}>{children}</View>
      </Animated.View>
    );
  }

  // For non-animated native
  return (
    <View style={combinedStyles}>
      <View style={styles.glassOverlay} />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: components.card.borderRadius,
    padding: components.card.padding,
    backgroundColor: `${colors.backgroundMedium}99`, // Semi-transparent
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: `${colors.textPrimary}10`, // Very subtle border
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${colors.textPrimary}05`, // Almost transparent white
    borderRadius: components.card.borderRadius - 1, // Slightly smaller than card
  },
  content: {
    zIndex: 1, // Ensure content is above the glass overlay
  },
});

export default GlassCard;