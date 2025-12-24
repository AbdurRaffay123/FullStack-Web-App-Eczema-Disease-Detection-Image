import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  OpenSans_400Regular,
  OpenSans_600SemiBold,
  OpenSans_700Bold
} from '@expo-google-fonts/open-sans';
import { SplashScreen } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { NotificationProvider } from '@/context/NotificationContext';
import { DrawerProvider } from '@/context/DrawerContext';
import { ModalProvider } from '@/context/ModalContext';
import DrawerModal from '@/components/DrawerModal';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'OpenSans-Regular': OpenSans_400Regular,
    'OpenSans-SemiBold': OpenSans_600SemiBold,
    'OpenSans-Bold': OpenSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ModalProvider>
        <NotificationProvider>
          <DrawerProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="auth" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="consult" />
              <Stack.Screen name="progress" />
              <Stack.Screen name="reminders" />
              <Stack.Screen name="notifications" />
              <Stack.Screen name="tips" />
              <Stack.Screen name="images" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <DrawerModal />
            <StatusBar style="light" />
          </DrawerProvider>
        </NotificationProvider>
      </ModalProvider>
    </GestureHandlerRootView>
  );
}