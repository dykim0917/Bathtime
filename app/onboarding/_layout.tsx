import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="index" />
      <Stack.Screen name="health" />
      <Stack.Screen name="greeting" />
    </Stack>
  );
}
