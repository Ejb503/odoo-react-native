import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar
} from 'react-native';
import { 
  Text, 
  Snackbar,
  HelperText,
  IconButton
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { RootStackParamList } from '../App';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { login, clearError } from '../state/slices/authSlice';
import { AuthError } from '../api/authService';
import { colors, spacing, createShadow } from '../utils/theme';
import { PROXY_URL as PROXY_SERVER_URL, DEFAULT_ODOO_URL } from '../utils/config';

// Import new components
import AnimatedBackground from '../components/AnimatedBackground';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundDark} />
      
      {/* Animated Background */}
      <AnimatedBackground />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* App Logo - Animated */}
          <Animated.View 
            style={styles.logoContainer}
            entering={FadeInDown.duration(800).delay(200)}
          >
            <Text style={styles.logoText}>Odoo</Text>
            <Text style={styles.logoSubtext}>Voice Assistant</Text>
          </Animated.View>
          
          {/* Main Glass Card - Animated */}
          <Animated.View 
            entering={FadeInUp.duration(1000).delay(300)}
            style={styles.cardContainer}
          >
            <GlassCard elevation={6} glowColor={colors.primary}>
              <Text style={styles.loginTitle}>Welcome</Text>
              <Text style={styles.loginSubtitle}>Sign in to continue</Text>
              
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
                  hint={usernameError ? undefined : "Enter your Odoo username"}
                  leftIcon={
                    <IconButton
                      icon="account"
                      size={20}
                      iconColor={colors.primary}
                    />
                  }
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
                  hint={passwordError ? undefined : "Enter your password"}
                  leftIcon={
                    <IconButton
                      icon="lock"
                      size={20}
                      iconColor={colors.primary}
                    />
                  }
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
                  hint={serverUrlError ? undefined : "https://example.odoo.com"}
                  leftIcon={
                    <IconButton
                      icon="web"
                      size={20}
                      iconColor={colors.primary}
                    />
                  }
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  blurOnSubmit={true}
                />
                
                {/* Login Button */}
                <View style={styles.buttonContainer}>
                  <AnimatedButton
                    onPress={handleLogin}
                    title={loading ? "Logging in..." : "Login"}
                    variant="primary"
                    disabled={loading}
                    loading={loading}
                  />
                </View>
                
                {/* Proxy Info */}
                <Animated.Text 
                  style={styles.noteText}
                  entering={FadeIn.duration(800).delay(600)}
                >
                  Connecting via proxy at {PROXY_SERVER_URL}
                </Animated.Text>
              </View>
            </GlassCard>
          </Animated.View>
        </ScrollView>

        {/* Error Snackbar */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={dismissSnackbar}
          action={{
            label: 'OK',
            onPress: dismissSnackbar,
          }}
          duration={4000}
          style={styles.snackbar}
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
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1.5,
    textShadowColor: `${colors.primary}90`,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  logoSubtext: {
    fontSize: 20,
    color: colors.secondary,
    marginTop: spacing.sm,
    letterSpacing: 1,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    marginTop: spacing.md,
  },
  buttonContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  snackbar: {
    backgroundColor: colors.backgroundMedium,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: 8,
  },
  noteText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    fontStyle: 'italic',
  }
});

export default LoginScreen;