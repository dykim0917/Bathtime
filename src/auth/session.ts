import { User } from '@supabase/supabase-js';
import { AuthProvider, BathtimeUser } from '@/src/auth/types';
import { getSupabaseClient, requireSupabaseClient } from '@/src/auth/supabase';

function isAuthProvider(value: string | undefined): value is AuthProvider {
  return value === 'google';
}

function readProvider(user: User): AuthProvider {
  const provider = user.app_metadata.provider;
  if (isAuthProvider(provider)) return provider;

  const identityProvider = user.identities?.[0]?.provider;
  if (isAuthProvider(identityProvider)) return identityProvider;

  return 'google';
}

function readProviderUserId(user: User): string {
  return user.identities?.[0]?.id ?? user.user_metadata.provider_id ?? user.id;
}

export function mapSupabaseUser(user: User): BathtimeUser {
  const metadata = user.user_metadata;

  return {
    id: user.id,
    provider: readProvider(user),
    providerUserId: readProviderUserId(user),
    email: user.email ?? undefined,
    nickname: metadata.nickname ?? metadata.name ?? metadata.full_name ?? undefined,
    profileImageUrl: metadata.profile_image_url ?? metadata.avatar_url ?? metadata.picture ?? undefined,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export async function getCurrentUser(): Promise<BathtimeUser | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? mapSupabaseUser(user) : null;
}

export async function upsertCurrentUserProfile(user: BathtimeUser): Promise<void> {
  const supabase = requireSupabaseClient();

  const { error } = await supabase.from('user_profiles').upsert({
    id: user.id,
    provider: user.provider,
    provider_user_id: user.providerUserId,
    email: user.email ?? null,
    nickname: user.nickname ?? null,
    profile_image_url: user.profileImageUrl ?? null,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}
