'use client';

import type { User } from '@supabase/supabase-js';
import type { Submission } from '@/src/archive/types';
import { getSupabaseClient } from './auth';
import type {
  OnsenPassportEntry,
  OnsenReviewBathArea,
  OnsenReviewCleanliness,
  OnsenReviewCrowding,
  OnsenReviewRevisitIntent,
  OnsenReviewTargetType,
  OnsenReviewTemperature,
  OnsenReviewWaterColor,
  OnsenReviewWaterTexture,
} from './onsenPassport';

export class AuthRequiredError extends Error {
  constructor(message = 'Login is required') {
    super(message);
    this.name = 'AuthRequiredError';
  }
}

type SubmissionInput = Omit<Submission, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'userId'>;
export type ContentFeedbackType = 'helpful' | 'needs_improvement';
export type ContentFeedbackReason =
  | 'missing_info'
  | 'needs_images'
  | 'conditions_unclear'
  | 'needs_more_candidates'
  | 'tone_unclear'
  | 'other';
export type OnsenReviewWaterFeel = 'clear' | 'soft' | 'strong' | 'unclear';

type OnsenPassportRow = {
  id: string;
  target_type: OnsenPassportEntry['targetType'];
  target_slug: string;
  target_name: string | null;
  bath_areas: OnsenPassportEntry['bathAreas'];
  visited_on: string | null;
  water_texture: OnsenPassportEntry['waterTexture'];
  water_color: OnsenPassportEntry['waterColor'];
  temperature_experience: OnsenPassportEntry['temperatureExperience'];
  crowding_level: OnsenPassportEntry['crowdingLevel'];
  cleanliness_level: OnsenPassportEntry['cleanlinessLevel'];
  revisit_intent: OnsenPassportEntry['revisitIntent'];
  caution_text: string | null;
  body: string;
  status: OnsenPassportEntry['status'];
  visit_verification_status: OnsenPassportEntry['verificationStatus'];
  created_at: string;
};

type SubmissionRow = {
  id: string;
  user_id: string | null;
  type: Submission['type'];
  link_or_image: string | null;
  comment: string;
  nickname: string | null;
  can_publish: boolean | null;
  status: Submission['status'];
  created_at: string;
  updated_at: string;
};

function requireClient() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

function providerUserId(user: User): string {
  return user.identities?.[0]?.id ?? user.user_metadata.provider_id ?? user.id;
}

async function getAuthenticatedUser(options: { ensureProfile?: boolean } = {}): Promise<User> {
  const supabase = requireClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new AuthRequiredError();

  if (options.ensureProfile) {
    const metadata = user.user_metadata;
    const { error: profileError } = await supabase.from('user_profiles').upsert({
      id: user.id,
      provider: user.app_metadata.provider ?? user.identities?.[0]?.provider ?? 'google',
      provider_user_id: providerUserId(user),
      email: user.email ?? null,
      nickname: metadata.nickname ?? metadata.name ?? metadata.full_name ?? null,
      profile_image_url: metadata.profile_image_url ?? metadata.avatar_url ?? metadata.picture ?? null,
      updated_at: new Date().toISOString(),
    });

    if (profileError) throw profileError;
  }

  return user;
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === '23505';
}

function getOrCreateVisitorKey(): string {
  const key = 'bathtime:visitor-key';
  try {
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const next = crypto.randomUUID();
    window.localStorage.setItem(key, next);
    return next;
  } catch {
    return crypto.randomUUID();
  }
}

export async function getSavedContentIds(): Promise<string[]> {
  const user = await getAuthenticatedUser();
  const supabase = requireClient();
  const { data, error } = await supabase
    .from('saved_items')
    .select('target_id')
    .eq('user_id', user.id)
    .eq('target_type', 'content')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((item) => item.target_id as string);
}

export async function getSavedOnsenSlugs(): Promise<string[]> {
  const user = await getAuthenticatedUser();
  const supabase = requireClient();
  const { data, error } = await supabase
    .from('saved_items')
    .select('target_id')
    .eq('user_id', user.id)
    .eq('target_type', 'place')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((item) => item.target_id as string);
}

export async function getNotificationPreference(): Promise<boolean> {
  const user = await getAuthenticatedUser();
  const supabase = requireClient();
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('push_enabled')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data?.push_enabled);
}

export async function setNotificationPreference(pushEnabled: boolean): Promise<void> {
  const user = await getAuthenticatedUser({ ensureProfile: true });
  const supabase = requireClient();
  const { error } = await supabase.from('notification_preferences').upsert({
    user_id: user.id,
    push_enabled: pushEnabled,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function upsertPushToken(input: { token: string; platform: 'android' | 'ios' }): Promise<void> {
  const user = await getAuthenticatedUser({ ensureProfile: true });
  const supabase = requireClient();
  const now = new Date().toISOString();
  const { error } = await supabase.from('push_tokens').upsert(
    {
      user_id: user.id,
      expo_push_token: input.token,
      platform: input.platform,
      status: 'active',
      disabled_at: null,
      last_registered_at: now,
      updated_at: now,
    },
    { onConflict: 'expo_push_token' }
  );

  if (error) throw error;
}

export async function deactivatePushTokens(): Promise<void> {
  const user = await getAuthenticatedUser();
  const supabase = requireClient();
  const now = new Date().toISOString();

  const { error: tokenError } = await supabase
    .from('push_tokens')
    .update({ status: 'inactive', disabled_at: now, updated_at: now })
    .eq('user_id', user.id);
  if (tokenError) throw tokenError;

  await setNotificationPreference(false);
}

export async function sendTestPushNotification(): Promise<void> {
  const supabase = requireClient();
  const { error } = await supabase.functions.invoke('send-test-push');
  if (error) throw error;
}

export async function isContentSaved(id: string): Promise<boolean> {
  const user = await getAuthenticatedUser();
  const supabase = requireClient();
  const { data, error } = await supabase
    .from('saved_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('target_type', 'content')
    .eq('target_id', id)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function isOnsenSaved(slug: string): Promise<boolean> {
  const user = await getAuthenticatedUser();
  const supabase = requireClient();
  const { data, error } = await supabase
    .from('saved_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('target_type', 'place')
    .eq('target_id', slug)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function saveContent(id: string): Promise<void> {
  const user = await getAuthenticatedUser({ ensureProfile: true });
  const supabase = requireClient();
  const { error } = await supabase.from('saved_items').insert({
    user_id: user.id,
    target_type: 'content',
    target_id: id,
  });

  if (error && !isUniqueViolation(error)) throw error;
}

export async function saveOnsen(slug: string): Promise<void> {
  const user = await getAuthenticatedUser({ ensureProfile: true });
  const supabase = requireClient();
  const { error } = await supabase.from('saved_items').insert({
    user_id: user.id,
    target_type: 'place',
    target_id: slug,
  });

  if (error && !isUniqueViolation(error)) throw error;
}

export async function removeSavedContent(id: string): Promise<void> {
  const user = await getAuthenticatedUser();
  const supabase = requireClient();
  const { error } = await supabase
    .from('saved_items')
    .delete()
    .eq('user_id', user.id)
    .eq('target_type', 'content')
    .eq('target_id', id);

  if (error) throw error;
}

export async function removeSavedOnsen(slug: string): Promise<void> {
  const user = await getAuthenticatedUser();
  const supabase = requireClient();
  const { error } = await supabase
    .from('saved_items')
    .delete()
    .eq('user_id', user.id)
    .eq('target_type', 'place')
    .eq('target_id', slug);

  if (error) throw error;
}

export async function toggleSavedContent(id: string): Promise<boolean> {
  const saved = await isContentSaved(id);
  if (saved) {
    await removeSavedContent(id);
    return false;
  }

  await saveContent(id);
  return true;
}

export async function toggleSavedOnsen(slug: string): Promise<boolean> {
  const saved = await isOnsenSaved(slug);
  if (saved) {
    await removeSavedOnsen(slug);
    return false;
  }

  await saveOnsen(slug);
  return true;
}

export async function saveContentFeedback(input: {
  contentId: string;
  type: ContentFeedbackType;
  reason?: ContentFeedbackReason;
}): Promise<void> {
  const supabase = requireClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await getAuthenticatedUser({ ensureProfile: true });
  }

  const { error } = await supabase.from('content_feedback').insert({
    content_id: input.contentId,
    user_id: user?.id ?? null,
    visitor_key: getOrCreateVisitorKey(),
    feedback_type: input.type,
    reason: input.type === 'needs_improvement' ? input.reason ?? 'other' : null,
  });

  if (error) throw error;
}

export async function removeContentFeedback(contentId: string): Promise<void> {
  const supabase = requireClient();
  const { error } = await supabase.rpc('delete_content_feedback', {
    p_content_id: contentId,
    p_visitor_key: getOrCreateVisitorKey(),
  });

  if (error) throw error;
}

export async function saveOnsenReview(input: {
  targetType: OnsenReviewTargetType;
  targetSlug: string;
  targetName: string;
  bathAreas: OnsenReviewBathArea[];
  visitedOn?: string;
  waterTexture: OnsenReviewWaterTexture[];
  waterColor: OnsenReviewWaterColor;
  temperatureExperience: OnsenReviewTemperature;
  crowdingLevel: OnsenReviewCrowding;
  cleanlinessLevel: OnsenReviewCleanliness;
  revisitIntent: OnsenReviewRevisitIntent;
  cautionText?: string;
  body: string;
}): Promise<OnsenPassportEntry> {
  const user = await getAuthenticatedUser({ ensureProfile: true });
  const supabase = requireClient();
  const waterFeel: OnsenReviewWaterFeel = input.waterTexture.includes('distinctive')
    ? 'strong'
    : input.waterTexture.some((value) => value === 'slippery' || value === 'soft')
      ? 'soft'
      : input.waterTexture.includes('unclear')
        ? 'unclear'
        : 'clear';
  const { data, error } = await supabase
    .from('onsen_reviews')
    .insert({
      accommodation_slug: input.targetType === 'accommodation' ? input.targetSlug : null,
      target_type: input.targetType,
      target_slug: input.targetSlug,
      target_name: input.targetName,
      evidence_origin: 'first_party',
      user_id: user.id,
      bath_type: input.bathAreas[0],
      bath_areas: input.bathAreas,
      water_feel: waterFeel,
      water_texture: input.waterTexture,
      water_color: input.waterColor,
      temperature_experience: input.temperatureExperience,
      crowding_level: input.crowdingLevel,
      cleanliness_level: input.cleanlinessLevel,
      revisit_intent: input.revisitIntent,
      visited_on: input.visitedOn || null,
      visit_season: null,
      caution_text: input.cautionText?.trim() || null,
      body: input.body.trim(),
    })
    .select('id,target_type,target_slug,target_name,bath_areas,visited_on,water_texture,water_color,temperature_experience,crowding_level,cleanliness_level,revisit_intent,caution_text,body,status,visit_verification_status,created_at')
    .single();

  if (error) throw error;
  return mapOnsenPassportRow(data as OnsenPassportRow);
}

function mapOnsenPassportRow(row: OnsenPassportRow): OnsenPassportEntry {
  return {
    id: row.id,
    targetType: row.target_type,
    targetSlug: row.target_slug,
    targetName: row.target_name?.trim() || row.target_slug,
    bathAreas: row.bath_areas,
    visitedOn: row.visited_on,
    waterTexture: row.water_texture,
    waterColor: row.water_color,
    temperatureExperience: row.temperature_experience,
    crowdingLevel: row.crowding_level,
    cleanlinessLevel: row.cleanliness_level,
    revisitIntent: row.revisit_intent,
    cautionText: row.caution_text,
    body: row.body,
    status: row.status,
    verificationStatus: row.visit_verification_status,
    createdAt: row.created_at,
  };
}

export async function getMyOnsenPassportEntries(): Promise<OnsenPassportEntry[]> {
  const user = await getAuthenticatedUser();
  const supabase = requireClient();
  const { data, error } = await supabase
    .from('onsen_reviews')
    .select('id,target_type,target_slug,target_name,bath_areas,visited_on,water_texture,water_color,temperature_experience,crowding_level,cleanliness_level,revisit_intent,caution_text,body,status,visit_verification_status,created_at')
    .eq('user_id', user.id)
    .order('visited_on', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as OnsenPassportRow[] | null ?? []).map(mapOnsenPassportRow);
}

function mapSubmissionRow(row: SubmissionRow): Submission {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    type: row.type,
    linkOrImage: row.link_or_image ?? undefined,
    comment: row.comment,
    nickname: row.nickname ?? undefined,
    canPublish: row.can_publish ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function saveSubmission(input: SubmissionInput): Promise<Submission> {
  const supabase = requireClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await getAuthenticatedUser({ ensureProfile: true });
  }

  const now = new Date().toISOString();
  const submissionPayload = {
    user_id: user?.id ?? null,
    type: input.type,
    link_or_image: input.linkOrImage ?? null,
    comment: input.comment,
    nickname: input.nickname ?? null,
    can_publish: input.canPublish ?? null,
  };

  if (!user) {
    const { error } = await supabase.from('submissions').insert(submissionPayload);
    if (error) throw error;
    return {
      id: 'anonymous-submission',
      type: input.type,
      linkOrImage: input.linkOrImage,
      comment: input.comment,
      nickname: input.nickname,
      canPublish: input.canPublish,
      status: 'new',
      createdAt: now,
      updatedAt: now,
    };
  }

  const { data, error } = await supabase
    .from('submissions')
    .insert(submissionPayload)
    .select('*')
    .single();

  if (error) throw error;
  return mapSubmissionRow(data as SubmissionRow);
}

export function redirectToLogin(source: string): void {
  const next = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`/auth/login?source=${encodeURIComponent(source)}&next=${encodeURIComponent(next)}`);
}
