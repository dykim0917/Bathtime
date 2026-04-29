import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { requireAdminAuthConfig } from './config';

export async function createSupabaseServerClient() {
  const config = requireAdminAuthConfig();
  const cookieStore = await cookies();

  return createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies; middleware refreshes sessions.
        }
      },
    },
  });
}
