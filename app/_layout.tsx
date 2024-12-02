import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '~/contexts/AuthProvider';
import { KeyboardProvider } from '~/contexts/KeyboardProvider';
import { WindowProvider } from '~/contexts/window/Context';
import { MapProvider } from '~/contexts/MapProvider';
import { MarkerProvider as Deprecated } from '~/contexts/MarkerProvider';
import { MarkerProvider } from '~/contexts/marker/Context'

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <AuthProvider>
            <WindowProvider>
              <MapProvider>
                <Deprecated>
                  <MarkerProvider>
                    <Stack>
                      <Stack.Screen name="Login" options={{ title: 'Login', headerShown: false, animation: 'slide_from_left' }} />
                      <Stack.Screen name="Signup" options={{ title: 'Signup', headerShown: false }} />
                      <Stack.Screen name="Home" options={{ title: 'Home', headerShown: false, animation: 'slide_from_bottom' }} />
                    </Stack>
                  </MarkerProvider>
                </Deprecated>
              </MapProvider>
            </WindowProvider>
          </AuthProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}