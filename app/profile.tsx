import { Redirect, useLocalSearchParams } from 'expo-router';
import { Platform } from 'react-native';

export default function ProfileDeepLinkRedirect() {
  const params = useLocalSearchParams<{ saved?: string }>();
  if (Platform.OS === 'web') {
    return <Redirect href="/saved" />;
  }

  return <Redirect href={`/(tabs)/my${params.saved ? `?saved=${params.saved}` : ''}` as any} />;
}
