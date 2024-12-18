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
import { UserProvider } from '~/contexts/user/Context';
import { MenuProvider } from '~/contexts/menu/Context';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <UserProvider>
            <AuthProvider>
              <MenuProvider>
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
              </MenuProvider>
            </AuthProvider>
          </UserProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}