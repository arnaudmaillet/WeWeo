import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="SignInScreen" options={{ title: 'SignIn', headerShown: false }} />
          <Stack.Screen name="MainScreen" options={{ title: 'Home', headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
