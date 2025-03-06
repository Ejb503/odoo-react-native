import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated, Easing } from 'react-native';
import { IconButton } from 'react-native-paper';
import { colors, spacing, createShadow } from '../utils/theme';

export type RecordingState = 'idle' | 'listening' | 'processing';

interface MicrophoneButtonProps {
  recordingState?: RecordingState;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  theme?: {
    idleColor?: string;
    listeningColor?: string;
    processingColor?: string;
    backgroundColor?: string;
  };
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  recordingState = 'idle',
  onPress = () => {},
  size = 'medium',
  theme = {},
}) => {
  // Animation values
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const dot1Anim = React.useRef(new Animated.Value(0)).current;
  const dot2Anim = React.useRef(new Animated.Value(0)).current;
  const dot3Anim = React.useRef(new Animated.Value(0)).current;
  
  // Theme configuration with defaults
  const themeConfig = {
    idleColor: theme.idleColor || colors.textPrimary,
    listeningColor: theme.listeningColor || colors.accent,
    processingColor: theme.processingColor || colors.warning,
    backgroundColor: theme.backgroundColor || colors.backgroundLight,
  };

  // Size configuration
  const sizeConfig = {
    small: { button: 40, icon: 20, dot: 4 },
    medium: { button: 64, icon: 32, dot: 6 },
    large: { button: 72, icon: 36, dot: 8 },
  }[size];

  // Get color based on recording state
  const getMicrophoneColor = () => {
    switch(recordingState) {
      case 'listening':
        return themeConfig.listeningColor;
      case 'processing':
        return themeConfig.processingColor;
      default:
        return themeConfig.idleColor;
    }
  };

  // Animation effects
  React.useEffect(() => {
    if (recordingState === 'listening') {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (recordingState === 'processing') {
      // Dots animation
      const createDotAnimation = (dot: Animated.Value) => {
        return Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]);
      };

      Animated.loop(
        Animated.stagger(200, [
          createDotAnimation(dot1Anim),
          createDotAnimation(dot2Anim),
          createDotAnimation(dot3Anim),
        ])
      ).start();
    } else {
      // Reset animations
      pulseAnim.setValue(1);
      dot1Anim.setValue(0);
      dot2Anim.setValue(0);
      dot3Anim.setValue(0);
    }

    // Cleanup animations
    return () => {
      pulseAnim.stopAnimation();
      dot1Anim.stopAnimation();
      dot2Anim.stopAnimation();
      dot3Anim.stopAnimation();
    };
  }, [recordingState]);

  const renderProcessingDots = () => {
    const dotStyle = (anim: Animated.Value) => ({
      width: sizeConfig.dot,
      height: sizeConfig.dot,
      borderRadius: sizeConfig.dot / 2,
      backgroundColor: getMicrophoneColor(),
      marginHorizontal: 2,
      opacity: anim,
      transform: [{
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -sizeConfig.dot],
        }),
      }],
    });

    return (
      <View style={styles.dotsContainer}>
        <Animated.View style={dotStyle(dot1Anim)} />
        <Animated.View style={dotStyle(dot2Anim)} />
        <Animated.View style={dotStyle(dot3Anim)} />
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        {
          transform: [{ translateY: -sizeConfig.button / 4 }],
        }
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={[
        styles.microphoneContainer,
        {
          width: sizeConfig.button,
          height: sizeConfig.button,
          borderRadius: sizeConfig.button / 2,
          backgroundColor: recordingState === 'idle' 
            ? themeConfig.backgroundColor 
            : `${getMicrophoneColor()}15`,
          transform: [
            { scale: recordingState === 'listening' ? pulseAnim : 1 },
          ],
        },
      ]}>
        {recordingState === 'processing' ? (
          renderProcessingDots()
        ) : (
          <IconButton
            icon="microphone"
            iconColor={getMicrophoneColor()}
            size={sizeConfig.icon}
            style={styles.icon}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -8,
  },
  microphoneContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...createShadow(8, 'rgba(0,0,0,0.15)'),
  },
  icon: {
    margin: 0,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
});

export default MicrophoneButton; 