import { Redirect } from 'expo-router';
import { Platform } from 'react-native';

export default function RoutineDeepLinkRedirect() {
  if (Platform.OS === 'web') {
    return <Redirect href="/app" />;
  }

  return <Redirect href={'/(tabs)/routines' as any} />;
}
