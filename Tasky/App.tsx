import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { TaskProvider } from './src/context/TaskContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TaskProvider>
          <StatusBar style="dark" backgroundColor="#F8FAFC" />
          <AppNavigator />
        </TaskProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
