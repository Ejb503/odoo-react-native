import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Surface, 
  Snackbar,
  HelperText,
  Chip,
  Avatar
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../App';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { login, clearError } from '../state/slices/authSlice';
import { AuthError } from '../api/authService';
import { colors } from '../utils/theme';
import { PROXY_URL as PROXY_SERVER_URL, DEFAULT_ODOO_URL } from '../utils/config';

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
      {/* Remove TouchableWithoutFeedback that was causing focus issues */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled" // This is important for maintaining focus
        >
          <Surface style={styles.surface} elevation={4}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Odoo</Text>
              <Text style={styles.logoSubtext}>Voice Assistant</Text>
            </View>

            <View style={styles.formContainer}>
              <TextInput
                mode="outlined"
                label="Username"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setUsernameError('');
                }}
                autoCapitalize="none"
                style={styles.input}
                disabled={loading}
                error={!!usernameError}
                accessibilityLabel="Username input"
                placeholder="Enter your username"
                returnKeyType="next"
                left={<TextInput.Icon icon="account" />}
                blurOnSubmit={false} // Prevents auto-blur on submit
              />
              {usernameError ? (
                <HelperText type="error" visible={!!usernameError}>
                  {usernameError}
                </HelperText>
              ) : null}

              <TextInput
                mode="outlined"
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                secureTextEntry={!showPassword}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowPassword(!showPassword)}
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    forceTextInputFocus={false} // Prevent stealing focus
                  />
                }
                left={<TextInput.Icon icon="lock" />}
                style={styles.input}
                disabled={loading}
                error={!!passwordError}
                accessibilityLabel="Password input"
                placeholder="Enter your password"
                returnKeyType="next"
                blurOnSubmit={false} // Prevents auto-blur on submit
              />
              {passwordError ? (
                <HelperText type="error" visible={!!passwordError}>
                  {passwordError}
                </HelperText>
              ) : null}

              <TextInput
                mode="outlined"
                label="Odoo Server URL"
                value={serverUrl}
                onChangeText={(text) => {
                  setServerUrl(text);
                  setServerUrlError('');
                }}
                autoCapitalize="none"
                keyboardType="url"
                placeholder="https://example.odoo.com"
                left={<TextInput.Icon icon="web" />}
                style={styles.input}
                disabled={loading}
                error={!!serverUrlError}
                accessibilityLabel="Odoo Server URL input"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                blurOnSubmit={true} // This can be true for the last field
              />
              {serverUrlError ? (
                <HelperText type="error" visible={!!serverUrlError}>
                  {serverUrlError}
                </HelperText>
              ) : null}

              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.button}
                disabled={loading}
                loading={loading}
                accessibilityLabel="Login button"
                contentStyle={styles.buttonContent}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              
              <Text style={styles.noteText}>
                Connecting via proxy at {PROXY_SERVER_URL}
              </Text>
            </View>
          </Surface>
        </ScrollView>

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
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    padding: 24,
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 1,
  },
  logoSubtext: {
    fontSize: 18,
    color: colors.accent,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  serverModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  serverChip: {
    marginHorizontal: 8,
  },
  activeChip: {
    backgroundColor: colors.primary + '20',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
    justifyContent: 'center',
  },
  demoButtonContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  demoButton: {
    width: '70%',
  },
  snackbar: {
    backgroundColor: colors.error,
  },
  noteText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.text + '80',
    marginTop: 16,
    fontStyle: 'italic',
  }
});

export default LoginScreen;