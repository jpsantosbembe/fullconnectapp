import React from 'react';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { useFonts } from 'expo-font';
import AppNavigator from './navigation/AppNavigator';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3578E5',
    secondary: '#4ECDC4',
    background: '#F9FAFB',
    surface: '#FFFFFF',
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
      <PaperProvider theme={theme}>
        <AppNavigator />
      </PaperProvider>
  );
}