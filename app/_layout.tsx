import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <Stack />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
