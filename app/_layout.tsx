import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { CookieBanner } from '@/src/components/legal/CookieBanner';
import { V2_ACCENT, V2_BG_BASE, V2_BORDER, V2_SURFACE, V2_TEXT_PRIMARY } from '@/src/data/colors';

export { ErrorBoundary } from 'expo-router';
export const unstable_settings = { initialRouteName: '(tabs)' };
SplashScreen.preventAutoHideAsync();

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: V2_BG_BASE,
    card: V2_SURFACE,
    text: V2_TEXT_PRIMARY,
    border: V2_BORDER,
    primary: V2_ACCENT,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);
  if (!loaded) return null;

  return (
    <ThemeProvider value={AppTheme}>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="legal/privacy" options={{ title: '개인정보 처리방침', headerShown: true }} />
        <Stack.Screen name="legal/terms" options={{ title: '이용약관', headerShown: true }} />
        <Stack.Screen name="result/recipe/[id]" options={{ headerShown: false, presentation: 'modal', gestureEnabled: true }} />
        <Stack.Screen name="result/timer/[id]" options={{ headerShown: false, presentation: 'modal', gestureEnabled: false }} />
        <Stack.Screen name="result/completion/[id]" options={{ headerShown: false, presentation: 'modal', gestureEnabled: false }} />
      </Stack>
      <CookieBanner />
    </ThemeProvider>
  );
}
