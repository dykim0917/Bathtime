import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { AuthProvider } from '@/src/auth/AuthProvider';
import { archiveColors } from '@/src/theme/archiveTheme';

export { ErrorBoundary } from 'expo-router';
export const unstable_settings = { initialRouteName: Platform.OS === 'web' ? 'index' : '(tabs)' };
SplashScreen.preventAutoHideAsync();

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: archiveColors.canvas,
    card: archiveColors.surface,
    text: archiveColors.ink,
    border: archiveColors.hairline,
    primary: archiveColors.primary,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    void NavigationBar.setBackgroundColorAsync(archiveColors.surface);
    void NavigationBar.setBorderColorAsync(archiveColors.hairline);
    void NavigationBar.setButtonStyleAsync('dark');
    void NavigationBar.setPositionAsync('relative');
  }, []);

  if (!loaded) return null;

  const stack = Platform.OS === 'web' ? (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(web)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="routine/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="legal/privacy" options={{ title: '개인정보 처리방침', headerShown: false }} />
      <Stack.Screen name="legal/terms" options={{ title: '이용약관', headerShown: false }} />
      <Stack.Screen name="result/recipe/[id]" options={{ headerShown: false, presentation: 'modal', gestureEnabled: true }} />
      <Stack.Screen name="result/timer/[id]" options={{ headerShown: false, presentation: 'modal', gestureEnabled: false }} />
      <Stack.Screen name="result/completion/[id]" options={{ headerShown: false, presentation: 'modal', gestureEnabled: false }} />
    </Stack>
  ) : (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(web)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="routine/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="legal/privacy" options={{ title: '개인정보 처리방침', headerShown: true }} />
      <Stack.Screen name="legal/terms" options={{ title: '이용약관', headerShown: true }} />
      <Stack.Screen name="result/recipe/[id]" options={{ headerShown: false, presentation: 'modal', gestureEnabled: true }} />
      <Stack.Screen name="result/timer/[id]" options={{ headerShown: false, presentation: 'modal', gestureEnabled: false }} />
      <Stack.Screen name="result/completion/[id]" options={{ headerShown: false, presentation: 'modal', gestureEnabled: false }} />
    </Stack>
  );

  return (
    <SafeAreaProvider>
      <ThemeProvider value={AppTheme}>
        <AuthProvider>
          <StatusBar style="dark" />
          {stack}
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
