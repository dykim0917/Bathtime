import { Redirect } from 'expo-router';

export default function WebRoutinesRedirect() {
  return <Redirect href="/app?from=routines" />;
}
