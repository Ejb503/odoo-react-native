import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Keyboard,
  StatusBar,
  TouchableOpacity,
  Text as RNText,
  ImageBackground
} from 'react-native';
import { 
  Text, 
  Snackbar,
  IconButton,
  Button
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';

import { RootStackParamList } from '../App';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { login, clearError } from '../state/slices/authSlice';
import { AuthError } from '../api/authService';
import { colors, spacing } from '../utils/theme';
import { PROXY_URL as PROXY_SERVER_URL, DEFAULT_ODOO_URL, SKIP_AUTH_ENABLED } from '../utils/config';

// Import components
import FloatingInput from '../components/FloatingInput';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serverUrl, setServerUrl] = useState(DEFAULT_ODOO_URL);
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation state
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverUrlError, setServerUrlError] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Show error snackbar instead of alert for better UX
  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
    }
  }, [error]);

  // Form validation
  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setUsernameError('');
    setPasswordError('');
    setServerUrlError('');

    // Validate username
    if (!username.trim()) {
      setUsernameError('Username is required');
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    }

    // Validate server URL
    if (!serverUrl.trim()) {
      setServerUrlError('Server URL is required');
      isValid = false;
    } else if (!/^https?:\/\/.+/i.test(serverUrl)) {
      setServerUrlError('URL must start with http:// or https://');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = useCallback(async () => {
    // Dismiss keyboard
    Keyboard.dismiss();
    
    // Validate form first
    if (!validateForm()) {
      return;
    }

    try {
      // We're using the proxy server as the middleman between our app and Odoo
      // While the user enters the actual Odoo server URL, we send our request
      // to the proxy server with the Odoo server URL as a parameter
      
      console.log(`Authenticating with proxy at ${PROXY_SERVER_URL}`);
      console.log(`Username: ${username}, Target Odoo server: ${serverUrl}`);
      
      // Use the login thunk action
      const resultAction = await dispatch(login({
        username,
        password,
        serverUrl  // This is the actual Odoo server the user wants to connect to
      }));
      
      // Check if the login was successful
      if (login.fulfilled.match(resultAction)) {
        console.log('Authentication successful');
        // Navigate to main screen
        navigation.replace('Main');
      } else if (login.rejected.match(resultAction) && resultAction.payload) {
        // Handle field-specific errors
        const errorMsg = resultAction.payload as string;
        console.error('Authentication failed:', errorMsg);
        
        if (errorMsg.includes('Username')) {
          setUsernameError(errorMsg);
        } else if (errorMsg.includes('Password')) {
          setPasswordError(errorMsg);
        } else if (errorMsg.includes('Server') || errorMsg.includes('URL')) {
          setServerUrlError(errorMsg);
        } else if (errorMsg.includes('Network') || errorMsg.includes('connect')) {
          // Connection issues
          setSnackbarMessage(errorMsg);
          setSnackbarVisible(true);
        } else {
          // General error
          setSnackbarMessage(errorMsg);
          setSnackbarVisible(true);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle typed errors
      if (err instanceof Error) {
        const authError = err as AuthError;
        
        // Show field-specific errors
        if (authError.code === 'INVALID_INPUT') {
          if (authError.message.includes('Username')) {
            setUsernameError(authError.message);
          } else if (authError.message.includes('Password')) {
            setPasswordError(authError.message);
          } else if (authError.message.includes('Server')) {
            setServerUrlError(authError.message);
          }
        }
      }
    }
  }, [username, password, serverUrl, dispatch, navigation]);

  // Dismiss error snackbar
  const dismissSnackbar = () => {
    setSnackbarVisible(false);
    dispatch(clearError());
  };

  // Render logo without animation
  const renderLogo = () => {
    return (
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Odoo</Text>
        <Text style={styles.logoSubtext}>Voice Assistant</Text>
      </View>
    );
  };

  // Render the entire login form
  const renderForm = () => {
    return (
      <View style={styles.formWrapper}>
        <View style={styles.formBackground} />
        <View style={styles.formContainer}>
        {/* Username Input */}
        <FloatingInput 
          label="Username"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setUsernameError('');
          }}
          autoCapitalize="none"
          error={usernameError}
          returnKeyType="next"
          blurOnSubmit={false}
        />
        
        {/* Password Input */}
        <FloatingInput 
          label="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError('');
          }}
          secureTextEntry={!showPassword}
          error={passwordError}
          rightIcon={
            <IconButton
              icon={showPassword ? "eye-off" : "eye"}
              size={20}
              iconColor={colors.textSecondary}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          returnKeyType="next"
          blurOnSubmit={false}
        />
        
        {/* Server URL Input */}
        <FloatingInput 
          label="Odoo Server URL"
          value={serverUrl}
          onChangeText={(text) => {
            setServerUrl(text);
            setServerUrlError('');
          }}
          autoCapitalize="none"
          keyboardType="url"
          error={serverUrlError}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          blurOnSubmit={true}
        />
        
        {/* Login Button */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </View>
        
        {/* Proxy Info */}
        <TouchableOpacity>
          <Text style={styles.noteText}>
            Connecting via proxy at {PROXY_SERVER_URL}
          </Text>
        </TouchableOpacity>
      </View>
      </View>
    );
  };

  // Development mode
  const handleSkipAuth = () => {
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundDark} />
      
      {/* Background Video */}
      <View style={styles.videoBackground}>
        <Video
          source={require('../../assets/video.mp4')}
          style={styles.backgroundVideo}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
          positionMillis={0}
          onError={(error) => console.log('Video Error:', error)}
        />
        {/* Semi-transparent overlay for better text visibility */}
        <View style={styles.gradientOverlay} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderLogo()}
          {renderForm()}
          
          {SKIP_AUTH_ENABLED && (
            <View style={styles.devContainer}>
              <Button
                mode="contained"
                onPress={handleSkipAuth}
                style={styles.devButton}
                labelStyle={styles.devButtonLabel}
              >
                Skip Login (Dev Mode)
              </Button>
            </View>
          )}
        </ScrollView>

        {/* Error Snackbar */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={dismissSnackbar}
          action={{
            label: 'Dismiss',
            onPress: dismissSnackbar,
            labelStyle: { color: colors.primary }
          }}
          duration={4000}
          style={styles.errorSnackbar}
        >
          {snackbarMessage}
        </Snackbar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  videoBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
    backgroundColor: colors.backgroundDark,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.3)', // Very light dark blue transparent overlay
  },
  container: {
    flex: 1,
    zIndex: 2,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
    textShadowColor: `${colors.primary}90`,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  logoSubtext: {
    fontSize: 16,
    color: colors.secondary,
    marginTop: spacing.xs,
    letterSpacing: 0.5,
  },
  formWrapper: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  formBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 16,
    backdropFilter: 'blur(12px)',
  },
  formContainer: {
    width: '100%',
    padding: spacing.md,
  },
  buttonContainer: {
    marginTop: spacing.md,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
  },
  errorSnackbar: {
    backgroundColor: colors.backgroundMedium,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },
  noteText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  devContainer: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  devButton: {
    backgroundColor: colors.warning,
  },
  devButtonLabel: {
    color: colors.textPrimary,
  },
});

export default LoginScreen;