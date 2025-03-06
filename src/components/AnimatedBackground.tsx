import React, { useEffect } from "react";
import { StyleSheet, useWindowDimensions, Platform, View } from "react-native";
import {
  Canvas,
  Skia,
  Path,
  vec,
  useClock,
  Shadow,
  SkPath,
  BlurMask,
  SweepGradient,
  LinearGradient,
  Circle,
  Group,
  mix,
} from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  SharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { colors } from "../utils/theme";

/**
 * Enhanced AnimatedBackground component creates a fluid, animated background with flowing
 * gradient-like patterns using React Native Skia.
 *
 * It renders multiple animated paths with subtle movement to create a futuristic,
 * premium look that responds to time-based animation, with additional visual effects.
 */
export const AnimatedBackground: React.FC = () => {
  // For web platform, return a simple colored background with gradient
  if (Platform.OS === "web") {
    return (
      <View style={[styles.canvas, styles.webGradient]}>
        <View style={styles.webOverlay} />
      </View>
    );
  }

  // Below code will only run on native platforms
  const { width, height } = useWindowDimensions();
  const time = useClock();

  // Create animated values for different elements
  const wave1 = useSharedValue(0);
  const wave2 = useSharedValue(0);
  const wave3 = useSharedValue(0);
  const rotationAngle = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);
  const glowScale = useSharedValue(1);

  // Setup initial animations
  useEffect(() => {
    // Animate glow effect
    glowOpacity.value = withRepeat(
      withTiming(0.7, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    glowScale.value = withRepeat(
      withTiming(1.2, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    // Animate rotation for gradients
    rotationAngle.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  // Animate the waves with different speeds
  useDerivedValue(() => {
    const t = Number(time) / 1000; // Convert to seconds
    wave1.value = Math.sin(t * 1.2) * 0.5 + 0.5;
    wave2.value = Math.sin(t * 1.7) * 0.5 + 0.5;
    wave3.value = Math.sin(t * 2.2) * 0.5 + 0.5;
  }, [time]);

  // Primary blob path computation
  const path1 = useDerivedValue<SkPath>(() => {
    const size = Math.min(width, height) * 1.5;

    // Create a path for the first blob
    const path = Skia.Path.Make();

    // Calculate control points with animation
    const centerX = width * 0.5;
    const centerY = height * 0.4; // Positioned slightly higher
    const radius = size * 0.5;

    // Start point
    path.moveTo(centerX + radius * Math.cos(0), centerY + radius * Math.sin(0));

    // Draw the blob with animated control points
    for (let i = 1; i <= 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const prevAngle = ((i - 1) / 8) * Math.PI * 2;

      const point = vec(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      );

      const cp1 = vec(
        centerX + radius * 1.3 * Math.cos(prevAngle + 0.3 + wave1.value * 0.6),
        centerY + radius * 1.3 * Math.sin(prevAngle + 0.3 + wave1.value * 0.6)
      );

      const cp2 = vec(
        centerX + radius * 1.3 * Math.cos(angle - 0.3 - wave1.value * 0.6),
        centerY + radius * 1.3 * Math.sin(angle - 0.3 - wave1.value * 0.6)
      );

      path.cubicTo(cp1.x, cp1.y, cp2.x, cp2.y, point.x, point.y);
    }

    path.close();
    return path;
  }, [width, height, wave1]);

  // Secondary blob path computation
  const path2 = useDerivedValue<SkPath>(() => {
    const size = Math.min(width, height) * 1.2;

    // Create a path for the second blob (larger)
    const path = Skia.Path.Make();

    // Calculate control points with animation
    const centerX = width * 0.8;
    const centerY = height * 0.3;
    const radius = size * 0.4;

    // Start point
    path.moveTo(centerX + radius * Math.cos(0), centerY + radius * Math.sin(0));

    // Draw the blob with animated control points
    for (let i = 1; i <= 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const prevAngle = ((i - 1) / 6) * Math.PI * 2;

      const point = vec(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      );

      const cp1 = vec(
        centerX + radius * 1.4 * Math.cos(prevAngle + 0.4 - wave2.value * 0.7),
        centerY + radius * 1.4 * Math.sin(prevAngle + 0.4 - wave2.value * 0.7)
      );

      const cp2 = vec(
        centerX + radius * 1.4 * Math.cos(angle - 0.4 + wave2.value * 0.7),
        centerY + radius * 1.4 * Math.sin(angle - 0.4 + wave2.value * 0.7)
      );

      path.cubicTo(cp1.x, cp1.y, cp2.x, cp2.y, point.x, point.y);
    }

    path.close();
    return path;
  }, [width, height, wave2]);

  // Tertiary blob path computation
  const path3 = useDerivedValue<SkPath>(() => {
    const size = Math.min(width, height) * 1.3;

    // Create a path for the third blob (positioned differently)
    const path = Skia.Path.Make();

    // Calculate control points with animation
    const centerX = width * 0.2;
    const centerY = height * 0.7;
    const radius = size * 0.35;

    // Start point
    path.moveTo(centerX + radius * Math.cos(0), centerY + radius * Math.sin(0));

    // Draw the blob with animated control points
    for (let i = 1; i <= 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const prevAngle = ((i - 1) / 7) * Math.PI * 2;

      const point = vec(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      );

      const cp1 = vec(
        centerX + radius * 1.5 * Math.cos(prevAngle + 0.5 + wave3.value * 0.8),
        centerY + radius * 1.5 * Math.sin(prevAngle + 0.5 + wave3.value * 0.8)
      );

      const cp2 = vec(
        centerX + radius * 1.5 * Math.cos(angle - 0.5 - wave3.value * 0.8),
        centerY + radius * 1.5 * Math.sin(angle - 0.5 - wave3.value * 0.8)
      );

      path.cubicTo(cp1.x, cp1.y, cp2.x, cp2.y, point.x, point.y);
    }

    path.close();
    return path;
  }, [width, height, wave3]);

  // Additional decorative glow circle
  const glowCircleOpacity = useDerivedValue(() => {
    return mix(glowOpacity.value, 0.3, 0.7);
  }, [glowOpacity]);

  const glowCircleScale = useDerivedValue(() => {
    return mix(glowScale.value, 1, 1.2);
  }, [glowScale]);

  // Rotation for gradients
  const rotation = useDerivedValue(() => {
    return rotationAngle.value;
  }, [rotationAngle]);

  return (
    <Canvas style={styles.canvas}>
      {/* Background overlay with animated gradient */}
      <Group>
        <SweepGradient
          c={{ x: width / 2, y: height / 2 }}
          colors={[
            `${colors.backgroundDark}`,
            `${colors.backgroundMedium}`,
            `${colors.primary}10`,
            `${colors.secondary}10`,
            `${colors.backgroundDark}`,
          ]}
          start={0}
          end={Math.PI * 2}
          transform={[{ rotate: rotation.value }]}
        />
      </Group>

      {/* Decorative glow circle in the center */}
      <Group
        transform={[
          { translateX: width * 0.5 },
          { translateY: height * 0.3 },
          { scale: glowCircleScale.value }
        ]}
      >
        <Circle r={Math.min(width, height) * 0.2} opacity={glowCircleOpacity.value}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width, height)}
            colors={[
              `${colors.primary}10`,
              `${colors.secondary}10`,
              `${colors.accent}10`
            ]}
          />
          <BlurMask blur={40} style="normal" />
        </Circle>
      </Group>
      
      {/* Primary blob - purple with enhanced opacity and effects */}
      <Path
        path={path1}
        color={`${colors.primary}20`}
        style="fill"
      >
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={[
            `${colors.primary}20`,
            `${colors.secondary}15`,
          ]}
          transform={[{ rotate: rotation.value * 0.5 }]}
        />
        <Shadow
          dx={0}
          dy={0}
          blur={30}
          color={`${colors.primary}25`}
        />
        <BlurMask blur={20} style="normal" />
      </Path>

      {/* Secondary blob - blue with enhanced effects */}
      <Path
        path={path2}
        style="fill"
      >
        <LinearGradient
          start={vec(width, 0)}
          end={vec(0, height)}
          colors={[
            `${colors.secondary}20`,
            `${colors.accent}15`,
          ]}
          transform={[{ rotate: -rotation.value * 0.3 }]}
        />
        <Shadow
          dx={0}
          dy={0}
          blur={25}
          color={`${colors.secondary}25`}
        />
        <BlurMask blur={15} style="normal" />
      </Path>

      {/* Tertiary blob - accent with enhanced effects */}
      <Path
        path={path3}
        style="fill"
      >
        <LinearGradient
          start={vec(0, height)}
          end={vec(width, 0)}
          colors={[
            `${colors.accent}20`,
            `${colors.primary}15`,
          ]}
          transform={[{ rotate: rotation.value * 0.7 }]}
        />
        <Shadow
          dx={0}
          dy={0}
          blur={25}
          color={`${colors.accent}25`}
        />
        <BlurMask blur={15} style="normal" />
      </Path>
      
      {/* Overlay to add depth */}
      <Group>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={[
            `${colors.backgroundDark}40`,
            `${colors.backgroundDark}00`,
            `${colors.backgroundDark}60`,
          ]}
        />
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: colors.backgroundDark,
  },
  webGradient: {
    backgroundImage: `linear-gradient(to bottom right, ${colors.backgroundDark}, ${colors.backgroundMedium}, ${colors.backgroundDark})`,
  },
  webOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundImage: `radial-gradient(circle at 30% 40%, ${colors.primary}10 0%, transparent 60%), 
                     radial-gradient(circle at 70% 30%, ${colors.secondary}10 0%, transparent 60%),
                     radial-gradient(circle at 20% 70%, ${colors.accent}10 0%, transparent 60%)`,
  }
});

export default AnimatedBackground;
