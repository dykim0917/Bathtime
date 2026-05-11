import { Stack } from 'expo-router';

export default function WebLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="explore" />
      <Stack.Screen name="submit" />
      <Stack.Screen name="saved" />
      <Stack.Screen name="app" />
      <Stack.Screen name="content/[id]" />
    </Stack>
  );
}
