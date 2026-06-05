import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import LoadingScreen from './loading';
import { runMigrations } from '../lib/migrations';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const minDelay = new Promise(resolve => setTimeout(resolve, 1600));
    const migrations = runMigrations();
    const dataLoad = AsyncStorage.getItem('elevo_onboarding_done');
    Promise.all([minDelay, migrations, dataLoad])
      .then(([, , onboardingDone]) => {
        if (!onboardingDone) setNeedsOnboarding(true);
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready && needsOnboarding) router.replace('/onboarding/welcome');
  }, [ready, needsOnboarding]);

  if (!ready) return <LoadingScreen />;

  return (
    <>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="achievements" options={{ headerShown: false }} />
          <Stack.Screen name="calendar" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </>
  );
}
