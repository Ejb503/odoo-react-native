import React from "react";
import { StyleSheet, useWindowDimensions, Platform, View } from "react-native";
import {
  Canvas,
  Skia,
  Path,
  vec,
  useClock,
  Shadow,
  SkPath,
} from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  SharedValue,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../utils/theme";

/**
 * AnimatedBackground component creates a fluid, animated background with flowing
 * gradient-like patterns using React Native Skia.
 *
 * It renders multiple animated paths with subtle movement to create a futuristic,
 * premium look that responds to time-based animation.
 */
export const AnimatedBackground: React.FC = () => {
  // For web platform, return a simple colored background
  if (Platform.OS === "web") {
    return <View style={styles.canvas} />;
  }

  // Below code will only run on native platforms
  const { width, height } = useWindowDimensions();
  const time = useClock();

  // Create 3 animated values for different wave patterns
  const wave1 = useSharedValue(0);
  const wave2 = useSharedValue(0);
  const wave3 = useSharedValue(0);

  // Animate the waves with different speeds
  useDerivedValue(() => {
    const t = Number(time) / 1000; // Convert to seconds
    wave1.value = Math.sin(t * 1.5) * 0.5 + 0.5;
    wave2.value = Math.sin(t * 2.0) * 0.5 + 0.5;
    wave3.value = Math.sin(t * 2.5) * 0.5 + 0.5;
  }, [time]);

  // Primary blob path computation
  const path1 = useDerivedValue<SkPath>(() => {
    const size = Math.min(width, height) * 1.5;

    // Create a path for the first blob
    const path = Skia.Path.Make();

    // Calculate control points with animation
    const centerX = width * 0.5;
    const centerY = height * 0.5;
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
        centerX + radius * 1.2 * Math.cos(prevAngle + 0.2 + wave1.value * 0.5),
        centerY + radius * 1.2 * Math.sin(prevAngle + 0.2 + wave1.value * 0.5)
      );

      const cp2 = vec(
        centerX + radius * 1.2 * Math.cos(angle - 0.2 - wave1.value * 0.5),
        centerY + radius * 1.2 * Math.sin(angle - 0.2 - wave1.value * 0.5)
      );

      path.cubicTo(cp1.x, cp1.y, cp2.x, cp2.y, point.x, point.y);
    }

    path.close();
    return path;
  }, [width, height, wave1]);

  // Secondary blob path computation
  const path2 = useDerivedValue<SkPath>(() => {
    const size = Math.min(width, height) * 1.2;

    // Create a path for the second blob (smaller)
    const path = Skia.Path.Make();

    // Calculate control points with animation
    const centerX = width * 0.7;
    const centerY = height * 0.3;
    const radius = size * 0.3;

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
        centerX + radius * 1.3 * Math.cos(prevAngle + 0.3 - wave2.value * 0.6),
        centerY + radius * 1.3 * Math.sin(prevAngle + 0.3 - wave2.value * 0.6)
      );

      const cp2 = vec(
        centerX + radius * 1.3 * Math.cos(angle - 0.3 + wave2.value * 0.6),
        centerY + radius * 1.3 * Math.sin(angle - 0.3 + wave2.value * 0.6)
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
    const centerY = height * 0.8;
    const radius = size * 0.25;

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
        centerX + radius * 1.4 * Math.cos(prevAngle + 0.4 + wave3.value * 0.7),
        centerY + radius * 1.4 * Math.sin(prevAngle + 0.4 + wave3.value * 0.7)
      );

      const cp2 = vec(
        centerX + radius * 1.4 * Math.cos(angle - 0.4 - wave3.value * 0.7),
        centerY + radius * 1.4 * Math.sin(angle - 0.4 - wave3.value * 0.7)
      );

      path.cubicTo(cp1.x, cp1.y, cp2.x, cp2.y, point.x, point.y);
    }

    path.close();
    return path;
  }, [width, height, wave3]);

  return (
    <Canvas style={styles.canvas}>
      {/* Primary blob - purple */}
      <Path
        path={path1}
        color={`${colors.primary}15`} // Very transparent primary color
        style="fill"
      >
        <Shadow
          dx={0}
          dy={0}
          blur={20}
          color={`${colors.primary}20`} // Subtle shadow
        />
      </Path>

      {/* Secondary blob - blue */}
      <Path
        path={path2}
        color={`${colors.secondary}15`} // Very transparent secondary color
        style="fill"
      >
        <Shadow
          dx={0}
          dy={0}
          blur={15}
          color={`${colors.secondary}20`} // Subtle shadow
        />
      </Path>

      {/* Tertiary blob - accent */}
      <Path
        path={path3}
        color={`${colors.accent}15`} // Very transparent accent color
        style="fill"
      >
        <Shadow
          dx={0}
          dy={0}
          blur={15}
          color={`${colors.accent}20`} // Subtle shadow
        />
      </Path>
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
});

export default AnimatedBackground;
