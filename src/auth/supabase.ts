import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { pocketNative } from '@/src/pocket/native';

let client: SupabaseClient | null = null;

export function getSupabaseConfig() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) return null;

  if (!client) {
    const native = pocketNative;
    if (native) void native.configure(config.url, config.anonKey).catch(() => undefined);
    client = createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: !native,
        detectSessionInUrl: Platform.OS === 'web',
        persistSession: true,
        storage: Platform.OS === 'web' ? undefined : native ? {
          async getItem(key: string) {
            const current = await native.authGet(key);
            if (current !== null) return current;
            const legacy = await AsyncStorage.getItem(key);
            if (legacy !== null) {
              await native.authSet(key, legacy);
              await AsyncStorage.removeItem(key);
            }
            return legacy;
          },
          async setItem(key: string, value: string) { await native.authSet(key, value); },
          async removeItem(key: string) {
            await native.authRemove(key);
            await AsyncStorage.removeItem(key);
          },
        } : AsyncStorage,
        flowType: 'pkce',
      },
    });
  }

  return client;
}

export function requireSupabaseClient(): SupabaseClient {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
  }
  return supabase;
}
