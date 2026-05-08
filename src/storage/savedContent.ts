import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '@/src/storage/keys';

export interface SavedContentStorage {
  getSavedIds(): Promise<string[]>;
  save(id: string): Promise<void>;
  remove(id: string): Promise<void>;
  isSaved(id: string): Promise<boolean>;
}

const WEB_KEY = '@bath_time/saved_content';

function readWebIds(): string[] {
  if (typeof window === 'undefined') return [];
  const data = window.localStorage.getItem(WEB_KEY);
  if (!data) return [];
  return JSON.parse(data) as string[];
}

function writeWebIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(WEB_KEY, JSON.stringify(ids));
}

export const webSavedContentStorage: SavedContentStorage = {
  async getSavedIds() {
    return readWebIds();
  },
  async save(id) {
    const ids = readWebIds();
    if (!ids.includes(id)) writeWebIds([id, ...ids]);
  },
  async remove(id) {
    writeWebIds(readWebIds().filter((item) => item !== id));
  },
  async isSaved(id) {
    return readWebIds().includes(id);
  },
};

async function readNativeIds(): Promise<string[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_ARCHIVE_CONTENT);
  if (!data) return [];
  return JSON.parse(data) as string[];
}

async function writeNativeIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.SAVED_ARCHIVE_CONTENT, JSON.stringify(ids));
}

export const nativeSavedContentStorage: SavedContentStorage = {
  async getSavedIds() {
    return readNativeIds();
  },
  async save(id) {
    const ids = await readNativeIds();
    if (!ids.includes(id)) await writeNativeIds([id, ...ids]);
  },
  async remove(id) {
    await writeNativeIds((await readNativeIds()).filter((item) => item !== id));
  },
  async isSaved(id) {
    return (await readNativeIds()).includes(id);
  },
};

export function getSavedContentStorage(): SavedContentStorage {
  return Platform.OS === 'web' ? webSavedContentStorage : nativeSavedContentStorage;
}

export async function toggleSavedContent(id: string): Promise<string[]> {
  const storage = getSavedContentStorage();
  if (await storage.isSaved(id)) {
    await storage.remove(id);
  } else {
    await storage.save(id);
  }
  return storage.getSavedIds();
}
