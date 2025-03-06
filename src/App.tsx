import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { store } from './state/store';
import LoginScreen from './screens/LoginScreen';
import MainScreen from './screens/MainScreen';
import { theme, colors } from './utils/theme';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ReduxProvider store={store}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <StatusBar
            backgroundColor={colors.backgroundDark}
            barStyle="light-content"
          />
          <NavigationContainer
            theme={{
              dark: true,
              colors: {
                primary: colors.primary,
                background: colors.backgroundDark,
                card: colors.backgroundMedium,
                text: colors.textPrimary,
                border: colors.backgroundLight,
                notification: colors.accent,
              },
            }}
          >
            <Stack.Navigator 
              initialRouteName="Login" 
              screenOptions={{ 
                headerShown: false,
                animation: 'fade_from_bottom',
                contentStyle: { backgroundColor: colors.backgroundDark }
              }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Main" component={MainScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </ReduxProvider>
  );
}