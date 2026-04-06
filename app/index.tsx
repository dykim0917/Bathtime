import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { loadProfile } from '@/src/storage/profile';
import { V2_ACCENT, V2_BG_BASE } from '@/src/data/colors';

export default function Index() {
  const [ready, setReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    loadProfile().then((p) => {
      setHasProfile(!!p?.onboardingComplete);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={V2_ACCENT} />
      </View>
    );
  }

  if (hasProfile) return <Redirect href="/(tabs)" />;
  return <Redirect href="/onboarding" />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_BG_BASE, justifyContent: 'center', alignItems: 'center' },
});
