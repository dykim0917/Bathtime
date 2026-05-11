import AsyncStorage from '@react-native-async-storage/async-storage';
import { requireSupabaseClient } from '@/src/auth/supabase';
import { mapSupabaseUser, upsertCurrentUserProfile } from '@/src/auth/session';
import { STORAGE_KEYS } from '@/src/storage/keys';

export interface SavedContentStorage {
  getSavedIds(): Promise<string[]>;
  save(id: string): Promise<void>;
  remove(id: string): Promise<void>;
  isSaved(id: string): Promise<boolean>;
}

export class AuthRequiredError extends Error {
  constructor(message = 'Login is required') {
    super(message);
    this.name = 'AuthRequiredError';
  }
}

export function getStorageErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error !== null) {
    const item = error as { code?: unknown; message?: unknown; details?: unknown };
    const parts = [item.code, item.message, item.details].filter(Boolean).map(String);
    if (parts.length > 0) return parts.join(' · ');
  }
  return 'unknown_error';
}

export async function getAuthenticatedUserId(options: { ensureProfile?: boolean } = {}): Promise<string> {
  const supabase = requireSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new AuthRequiredError();
  if (options.ensureProfile) {
    await upsertCurrentUserProfile(mapSupabaseUser(user));
  }
  return user.id;
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === '23505';
}

export const webSavedContentStorage: SavedContentStorage = {
  async getSavedIds() {
    const userId = await getAuthenticatedUserId();
    const supabase = requireSupabaseClient();
    const { data, error } = await supabase
      .from('saved_items')
      .select('target_id')
      .eq('user_id', userId)
      .eq('target_type', 'content')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map((item) => item.target_id as string);
  },
  async save(id) {
    const userId = await getAuthenticatedUserId({ ensureProfile: true });
    const supabase = requireSupabaseClient();
    const { error } = await supabase.from('saved_items').insert({
      user_id: userId,
      target_type: 'content',
      target_id: id,
    });

    if (error && !isUniqueViolation(error)) throw error;
  },
  async remove(id) {
    const userId = await getAuthenticatedUserId();
    const supabase = requireSupabaseClient();
    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('user_id', userId)
      .eq('target_type', 'content')
      .eq('target_id', id);

    if (error) throw error;
  },
  async isSaved(id) {
    const userId = await getAuthenticatedUserId();
    const supabase = requireSupabaseClient();
    const { data, error } = await supabase
      .from('saved_items')
      .select('id')
      .eq('user_id', userId)
      .eq('target_type', 'content')
      .eq('target_id', id)
      .maybeSingle();

    if (error) throw error;
    return Boolean(data);
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
  return webSavedContentStorage;
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
