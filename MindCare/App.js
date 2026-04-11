import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AppStateProvider } from './src/context/AppStateContext';

LogBox.ignoreLogs(['Warning:']);

const App = () => {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AppStateProvider>
    </SafeAreaProvider>
  );
};

export default App;
