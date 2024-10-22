import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '~/providers/AuthProvider';
import { KeyboardProvider } from '~/providers/KeyboardProvider';
import { MapProvider } from '~/providers/MapProvider';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <AuthProvider>
            <MapProvider>
              <Stack>
                <Stack.Screen name="LoginScreen" options={{ title: 'Login', headerShown: false, animation: 'slide_from_left' }} />
                <Stack.Screen name="SignupScreen" options={{ title: 'Signup', headerShown: false }} />
                <Stack.Screen name="MainScreen" options={{ title: 'Home', headerShown: false, animation: 'slide_from_bottom' }} />
              </Stack>
            </MapProvider>
          </AuthProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
