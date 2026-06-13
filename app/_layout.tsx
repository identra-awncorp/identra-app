import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStoreProvider } from '@/store';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppStoreProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}
