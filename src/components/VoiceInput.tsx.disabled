import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import Voice, { 
  SpeechResultsEvent, 
  SpeechErrorEvent,
  SpeechStartEvent,
  SpeechEndEvent
} from '@react-native-voice/voice';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  withSpring,
  withDelay,
  Easing,
  FadeIn,
  ZoomIn,
  interpolateColor
} from 'react-native-reanimated';
import { Canvas, Circle, Paint } from '@shopify/react-native-skia';
import { colors, spacing, createShadow, timing } from '../utils/theme';

interface VoiceInputProps {
  onSpeechResult: (text: string) => void;
  isProcessing: boolean;
  locale?: string;
}

interface VoiceState {
  isAvailable: boolean;
  isListening: boolean;
  partialResults: string[];
  error: string | null;
}

/**
 * VoiceInput component for handling speech recognition.
 * Provides a microphone button UI with visual feedback for different states.
 */
const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onSpeechResult, 
  isProcessing, 
  locale = 'en-US' 
}) => {
  // Voice recognition state
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isAvailable: false,
    isListening: false,
    partialResults: [],
    error: null
  });

  // Animation values using Reanimated
  const scale = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0.7);
  const buttonBgColor = useSharedValue(0); // 0 = idle, 1 = listening, 2 = processing
  const waveAmplitude = useSharedValue(0);
  const waveFrequency = useSharedValue(0);
  
  // Control animations based on state
  useEffect(() => {
    // Update button color state
    if (isProcessing) {
      buttonBgColor.value = withTiming(2, { duration: timing.normal });
    } else if (voiceState.isListening) {
      buttonBgColor.value = withTiming(1, { duration: timing.normal });
      // Start wave animation
      waveAmplitude.value = withTiming(1, { duration: timing.normal });
      waveFrequency.value = withTiming(1, { duration: timing.normal });
    } else {
      buttonBgColor.value = withTiming(0, { duration: timing.normal });
      // Stop wave animation
      waveAmplitude.value = withTiming(0, { duration: timing.normal });
      waveFrequency.value = withTiming(0, { duration: timing.normal });
    }
    
    // Button scale animation when listening
    if (voiceState.isListening) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: timing.slow, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: timing.slow, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite repeat
        true // Reverse sequence
      );
      
      // Ripple effect animation
      rippleScale.value = 0;
      rippleOpacity.value = 0.7;
      
      // Create staggered ripple animations
      const createRipple = () => {
        rippleScale.value = withTiming(2.2, { duration: timing.slow * 2 });
        rippleOpacity.value = withTiming(0, { duration: timing.slow * 2 });
        
        // Reset for next ripple
        const timeout = setTimeout(() => {
          if (voiceState.isListening) {
            rippleScale.value = 0;
            rippleOpacity.value = 0.7;
            createRipple();
          }
        }, timing.slow * 1.5);
        
        return timeout;
      };
      
      const timeout = createRipple();
      
      // Cleanup
      return () => {
        clearTimeout(timeout);
        scale.value = withTiming(1, { duration: timing.normal });
      };
    } else {
      // Reset animations when not listening
      scale.value = withTiming(1, { duration: timing.normal });
    }
    
  }, [voiceState.isListening, isProcessing]);

  // Initialize voice recognition
  useEffect(() => {
    const setupVoice = async () => {
      try {
        // Set up event handlers
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;
        
        // Check if voice recognition is available on the device
        const available = await Voice.isAvailable();
        setVoiceState(prev => ({ ...prev, isAvailable: !!available }));
      } catch (error) {
        console.error('Voice recognition setup error:', error);
        setVoiceState(prev => ({ 
          ...prev, 
          isAvailable: false, 
          error: 'Voice recognition not available on this device' 
        }));
      }
    };

    setupVoice();

    // Cleanup when component unmounts
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // Event handlers
  const onSpeechStart = useCallback((_: SpeechStartEvent) => {
    setVoiceState(prev => ({ ...prev, isListening: true, error: null }));
  }, []);

  const onSpeechEnd = useCallback((_: SpeechEndEvent) => {
    setVoiceState(prev => ({ ...prev, isListening: false }));
  }, []);

  const onSpeechResults = useCallback((e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      const recognizedText = e.value[0];
      setVoiceState(prev => ({ 
        ...prev, 
        partialResults: e.value || [] 
      }));
      onSpeechResult(recognizedText);
    }
  }, [onSpeechResult]);

  const onSpeechError = useCallback((e: SpeechErrorEvent) => {
    let errorMessage = 'Unknown speech recognition error';
    
    // Handle specific error cases
    if (e.error) {
      if (e.error.code === 'permissions') {
        errorMessage = 'Please grant microphone permission to use voice input';
      } else if (e.error.code === 'not-available') {
        errorMessage = 'Speech recognition is not available on this device';
      } else if (e.error.message) {
        errorMessage = e.error.message;
      }
    }
    
    setVoiceState(prev => ({ 
      ...prev, 
      isListening: false, 
      error: errorMessage 
    }));
    
    console.error('Speech recognition error:', e.error);
  }, []);

  // Start listening for speech
  const startListening = useCallback(async () => {
    setVoiceState(prev => ({ ...prev, error: null, partialResults: [] }));
    
    try {
      // Check for the right platform-specific options
      if (Platform.OS === 'android') {
        // Android-specific options
        await Voice.start(locale, {
          EXTRA_LANGUAGE_MODEL: 'LANGUAGE_MODEL_FREE_FORM',
          EXTRA_MAX_RESULTS: 5,
          EXTRA_PARTIAL_RESULTS: true
        });
      } else {
        // iOS and other platforms
        await Voice.start(locale);
      }
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setVoiceState(prev => ({ 
        ...prev, 
        error: 'Failed to start voice recognition',
        isListening: false
      }));
    }
  }, [locale]);

  // Stop listening for speech
  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }, []);

  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (voiceState.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [voiceState.isListening, startListening, stopListening]);

  // Create animated styles with Reanimated
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    // Interpolate background color based on state
    const backgroundColor = interpolateColor(
      buttonBgColor.value,
      [0, 1, 2],
      [colors.primary, colors.accent, colors.info]
    );
    
    // Apply scale and color animations - handle web compatibility
    if (Platform.OS === 'web') {
      return {
        transform: `scale(${scale.value})`,
        backgroundColor: !voiceState.isAvailable ? `${colors.textMuted}80` : backgroundColor,
      };
    } else {
      return {
        transform: [{ scale: scale.value }],
        backgroundColor: !voiceState.isAvailable ? `${colors.textMuted}80` : backgroundColor,
      };
    }
  });
  
  // Ripple animated style
  const rippleAnimatedStyle = useAnimatedStyle(() => {
    // Handle web compatibility for transform styles
    if (Platform.OS === 'web') {
      return {
        opacity: rippleOpacity.value,
        transform: `scale(${rippleScale.value})`,
      };
    } else {
      return {
        opacity: rippleOpacity.value,
        transform: [{ scale: rippleScale.value }],
      };
    }
  });
  
  // Determine if voice input should be disabled
  const isDisabled = !voiceState.isAvailable || isProcessing;
  
  // Get status text based on current state
  const getStatusText = () => {
    if (!voiceState.isAvailable) return 'Voice recognition not available';
    if (isProcessing) return 'Processing...';
    if (voiceState.isListening) return 'Listening...';
    return 'Tap to speak';
  };

  return (
    <View style={styles.container}>
      {/* Error display with animated entry */}
      {voiceState.error && (
        <Animated.View entering={FadeIn.duration(300)}>
          <Surface style={styles.errorContainer} elevation={1}>
            <Text style={styles.errorText}>{voiceState.error}</Text>
            <IconButton 
              icon="close-circle" 
              size={16} 
              iconColor={colors.error}
              onPress={() => setVoiceState(prev => ({ ...prev, error: null }))}
              accessibilityLabel="Dismiss error"
            />
          </Surface>
        </Animated.View>
      )}
      
      <View style={styles.micContainer}>
        {/* Sound wave visualization using Skia (only visible when listening) */}
        {voiceState.isListening && (
          <View style={styles.waveContainer}>
            <Canvas style={styles.canvas}>
              <Circle cx={60} cy={60} r={50}>
                <Paint
                  color={`${colors.accent}15`}
                  style="fill"
                />
              </Circle>
            </Canvas>
          </View>
        )}
        
        {/* Animated ripple effect */}
        <Animated.View 
          style={[
            styles.ripple, 
            rippleAnimatedStyle, 
            { backgroundColor: colors.accent }
          ]} 
        />
        
        {/* Main microphone button with animations */}
        <Animated.View 
          style={[styles.voiceButton, buttonAnimatedStyle, createShadow(5, colors.primary)]}
          entering={ZoomIn.duration(400)}
        >
          <Animated.View>
            <View 
              style={styles.pressableArea}
              onTouchEnd={!isDisabled ? toggleListening : undefined}
              accessibilityLabel="Voice input button"
              accessibilityHint="Tap to start or stop voice recognition"
              accessibilityRole="button"
              accessibilityState={{ 
                disabled: isDisabled,
                busy: voiceState.isListening || isProcessing
              }}
          >
            {isProcessing ? (
              // Processing indicator - uses custom animated elements
              <View style={styles.processingContainer}>
                <View style={styles.dot} />
                <View style={[styles.dot, { marginHorizontal: 4 }]} />
                <View style={styles.dot} />
              </View>
            ) : (
              // Custom microphone icon with glowing effect
              <View style={styles.microphoneIcon}>
                <View style={styles.micTop} />
                <View style={styles.micBody} />
                <View style={styles.micBottom} />
              </View>
            )}
          </View>
          </Animated.View>
        </Animated.View>
      </View>
      
      {/* Status text with animated color changes */}
      <Animated.Text 
        style={[
          styles.statusText,
          { color: voiceState.isListening ? colors.accent : colors.textPrimary }
        ]}
      >
        {getStatusText()}
      </Animated.Text>
      
      {/* Partial results with animated entry */}
      {voiceState.isListening && voiceState.partialResults.length > 0 && (
        <Animated.Text 
          entering={FadeIn.duration(300)}
          style={styles.partialResultText} 
          numberOfLines={1} 
          ellipsizeMode="tail"
        >
          {voiceState.partialResults[0]}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
    width: '100%',
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    width: 120,
    marginBottom: spacing.md,
    position: 'relative',
  },
  waveContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    width: 120,
    height: 120,
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 1,
    borderColor: `${colors.textPrimary}20`,
  },
  pressableArea: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
  },
  ripple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.accent}40`,
    zIndex: 1,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  microphoneIcon: {
    width: 24,
    height: 36,
    alignItems: 'center',
  },
  micTop: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.textPrimary,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  micBody: {
    width: 8,
    height: 18,
    backgroundColor: colors.textPrimary,
  },
  micBottom: {
    width: 22,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textPrimary,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textPrimary,
  },
  statusText: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  partialResultText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.accent,
    maxWidth: '90%',
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    paddingRight: 0,
    borderRadius: 12,
    marginBottom: spacing.md,
    backgroundColor: `${colors.backgroundMedium}CC`,
    maxWidth: '90%',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    ...createShadow(3, `${colors.error}40`),
  },
  errorText: {
    color: colors.error,
    flex: 1,
    marginRight: 4,
    fontSize: 14,
  },
});

export default VoiceInput;