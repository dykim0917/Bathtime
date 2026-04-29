'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from './server';
import { isAllowedAdminEmail, requireAdminAuthConfig } from './config';

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/login?error=missing_credentials');
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect('/login?error=invalid_credentials');
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const config = requireAdminAuthConfig();
  if (!isAllowedAdminEmail(user?.email, config.allowedEmails)) {
    await supabase.auth.signOut();
    redirect('/login?error=not_allowed');
  }

  redirect('/');
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}
