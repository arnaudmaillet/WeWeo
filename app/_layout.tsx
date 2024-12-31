import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '~/contexts/AuthProvider';
import { KeyboardProvider } from '~/contexts/KeyboardProvider';
import { WindowProvider } from '~/contexts/windows/Context';
import { MapProvider } from '~/contexts/MapProvider';
import { MarkerProvider as Deprecated } from '~/contexts/MarkerProvider';
import { MarkerProvider } from '~/contexts/markers/Context'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import '../global.css'

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
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
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}