import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

interface PocketNative {
  addListener(event: 'onOutboxChange', listener: () => void): { remove(): void };
  configure(url: string, apiKey: string): Promise<void>;
  getEntries(owner: string): Promise<string>;
  enqueue(url: string, title: string): Promise<string>;
  remove(id: string): Promise<void>;
  retry(): Promise<void>;
  authGet(key: string): Promise<string | null>;
  authSet(key: string, value: string): Promise<void>;
  authRemove(key: string): Promise<void>;
}

export const pocketNative = Platform.OS === 'android' ? requireOptionalNativeModule<PocketNative>('BathtimePocket') : null;
