import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { colors } from '../utils/theme';

interface VoiceInputProps {
  onSpeechResult: (text: string) => void;
  isProcessing: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onSpeechResult, isProcessing }) => {
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize voice recognition
    const setupVoice = async () => {
      Voice.onSpeechStart = () => setIsListening(true);
      Voice.onSpeechEnd = () => setIsListening(false);
      Voice.onSpeechResults = onSpeechResults;
      Voice.onSpeechError = onSpeechError;
      
      try {
        await Voice.isAvailable();
      } catch (e) {
        console.error('Voice recognition not available', e);
      }
    };

    setupVoice();

    // Cleanup
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      const recognizedText = e.value[0];
      onSpeechResult(recognizedText);
    }
  };

  const onSpeechError = (e: SpeechErrorEvent) => {
    setSpeechError(e.error?.message || 'Unknown speech recognition error');
    setIsListening(false);
  };

  const startListening = async () => {
    setSpeechError(null);
    
    try {
      await Voice.start('en-US');
    } catch (e) {
      console.error('Error starting voice recognition', e);
      setSpeechError('Failed to start voice recognition');
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error('Error stopping voice recognition', e);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <View style={styles.container}>
      {speechError && (
        <Text style={styles.errorText}>{speechError}</Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.voiceButton,
          isListening && styles.listening,
          isProcessing && styles.processing
        ]}
        onPress={toggleListening}
        disabled={isProcessing}
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
      </TouchableOpacity>
      
      <Text style={styles.statusText}>
        {isProcessing ? 'Processing...' : isListening ? 'Listening...' : 'Tap to speak'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  voiceButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  listening: {
    backgroundColor: colors.accent,
    transform: [{ scale: 1.1 }],
  },
  processing: {
    backgroundColor: colors.info,
  },
  microphoneIcon: {
    width: 20,
    height: 30,
    alignItems: 'center',
  },
  micTop: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
  },
  micBody: {
    width: 6,
    height: 15,
    backgroundColor: '#fff',
  },
  micBottom: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
  },
  errorText: {
    color: colors.error,
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});

export default VoiceInput;