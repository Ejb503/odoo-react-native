import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable, Platform, Animated, Easing } from 'react-native';
import { Text, ActivityIndicator, Surface, IconButton } from 'react-native-paper';
import Voice, { 
  SpeechResultsEvent, 
  SpeechErrorEvent,
  SpeechStartEvent,
  SpeechEndEvent
} from '@react-native-voice/voice';
import { colors } from '../utils/theme';

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

  // Animation values
  const pulseAnim = useMemo(() => new Animated.Value(1), []);
  const rippleAnim = useMemo(() => new Animated.Value(0), []);
  
  // Start pulse animation when listening
  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation;
    let rippleAnimation: Animated.CompositeAnimation;
    
    if (voiceState.isListening) {
      // Pulse animation for the mic button
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      );
      
      // Ripple animation for the listening effect
      rippleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(rippleAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(rippleAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true
          })
        ])
      );
      
      pulseAnimation.start();
      rippleAnimation.start();
    }
    
    return () => {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
      if (rippleAnimation) {
        rippleAnimation.stop();
      }
    };
  }, [voiceState.isListening, pulseAnim, rippleAnim]);

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

  // Calculate ripple styles based on animation
  const rippleStyle = {
    transform: [
      { scale: rippleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 2]
      })},
    ],
    opacity: rippleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0]
    })
  };

  // Disable the voice input if not available or currently processing
  const isDisabled = !voiceState.isAvailable || isProcessing;
  
  // Get status text based on current state
  const getStatusText = () => {
    if (!voiceState.isAvailable) return 'Voice recognition not available';
    if (isProcessing) return 'Processing...';
    if (voiceState.isListening) return 'Listening...';
    return 'Tap to speak';
  };

  // Get button color based on current state
  const getButtonColor = () => {
    if (!voiceState.isAvailable) return colors.text;
    if (isProcessing) return colors.info;
    if (voiceState.isListening) return colors.accent;
    return colors.primary;
  };

  return (
    <View style={styles.container}>
      {voiceState.error && (
        <Surface style={styles.errorContainer} elevation={1}>
          <Text style={styles.errorText}>{voiceState.error}</Text>
          <IconButton 
            icon="close-circle" 
            size={16} 
            onPress={() => setVoiceState(prev => ({ ...prev, error: null }))}
            accessibilityLabel="Dismiss error"
          />
        </Surface>
      )}
      
      <View style={styles.micContainer}>
        {/* Ripple effect when listening */}
        {voiceState.isListening && (
          <Animated.View 
            style={[styles.ripple, rippleStyle, { backgroundColor: getButtonColor() }]} 
          />
        )}
        
        {/* Main microphone button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable
            style={({ pressed }) => [
              styles.voiceButton,
              { backgroundColor: getButtonColor() },
              isDisabled && styles.disabled,
              pressed && styles.pressed
            ]}
            onPress={toggleListening}
            disabled={isDisabled}
            accessibilityLabel="Voice input button"
            accessibilityHint="Tap to start or stop voice recognition"
            accessibilityRole="button"
            accessibilityState={{ 
              disabled: isDisabled,
              busy: voiceState.isListening || isProcessing
            }}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" size={30} />
            ) : (
              <View style={styles.microphoneIcon}>
                <View style={styles.micTop} />
                <View style={styles.micBody} />
                <View style={styles.micBottom} />
              </View>
            )}
          </Pressable>
        </Animated.View>
      </View>
      
      <Text style={styles.statusText}>{getStatusText()}</Text>
      
      {/* Show partial results while listening */}
      {voiceState.isListening && voiceState.partialResults.length > 0 && (
        <Text style={styles.partialResultText} numberOfLines={1} ellipsizeMode="tail">
          {voiceState.partialResults[0]}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    width: '100%',
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 110,
    width: 110,
    marginBottom: 8,
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 2,
  },
  ripple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    opacity: 0.3,
    zIndex: 1,
  },
  disabled: {
    backgroundColor: colors.text + '80', // Add transparency
    elevation: 2,
  },
  pressed: {
    opacity: 0.7,
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
    backgroundColor: '#fff',
  },
  micBody: {
    width: 8,
    height: 18,
    backgroundColor: '#fff',
  },
  micBottom: {
    width: 22,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  statusText: {
    marginTop: 8,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  partialResultText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.accent,
    maxWidth: '90%',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingRight: 0,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#ffebee',
    maxWidth: '90%',
  },
  errorText: {
    color: colors.error,
    flex: 1,
    marginRight: 4,
    fontSize: 14,
  },
});

export default VoiceInput;