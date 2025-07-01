// App.js
import React from 'react';
import { PaperProvider, configureFonts, DefaultTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';
import { SafeAreaProvider } from 'react-native-safe-area-context';


const fontConfig = {
  // You can uncomment and configure your fonts here if needed.
  // Even if it's empty, it needs to be defined.
  // web: {
  //   regular: {
  //     fontFamily: 'sans-serif',
  //     fontWeight: 'normal',
  //   },
  // },
  ios: {
    regular: {
      fontFamily: 'System',
      fontWeight: 'normal',
    },
  },
};


const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    placeholder: colors.placeholder,
    error: colors.error,
  },
  fonts: configureFonts(fontConfig), // Use configureFonts with your fontConfig
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}