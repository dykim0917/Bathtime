import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type PushTokenRow = {
  expo_push_token: string;
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const authorization = request.headers.get('Authorization');

  if (!supabaseUrl || !supabaseAnonKey || !authorization) {
    return jsonResponse({ error: 'Missing Supabase function configuration.' }, 401);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: 'Authentication required.' }, 401);
  }

  const { data, error } = await supabase
    .from('push_tokens')
    .select('expo_push_token')
    .eq('user_id', user.id)
    .eq('status', 'active');

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  const tokens = ((data ?? []) as PushTokenRow[])
    .map((row) => row.expo_push_token)
    .filter((token) => token.startsWith('ExponentPushToken['));

  if (tokens.length === 0) {
    return jsonResponse({ error: 'No active push tokens.' }, 404);
  }

  const messages = tokens.map((to) => ({
    to,
    sound: 'default',
    title: '바스타임 알림 테스트',
    body: '앱 푸시 알림이 정상적으로 연결됐어요.',
    data: { source: 'bathtime', kind: 'test' },
  }));

  const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  const result = await expoResponse.json().catch(() => null);

  if (!expoResponse.ok) {
    return jsonResponse({ error: 'Expo push request failed.', result }, 502);
  }

  return jsonResponse({ sent: tokens.length, result });
});

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
