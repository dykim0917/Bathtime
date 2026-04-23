import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './keys';

export async function loadCookieNoticeAck(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.COOKIE_NOTICE_ACK);
  return value === 'true';
}

export async function saveCookieNoticeAck(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.COOKIE_NOTICE_ACK, 'true');
}
