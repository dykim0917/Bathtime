import { createClient } from 'npm:@supabase/supabase-js@2.105.4';
import { normalizeArchiveLink } from '../../../src/pocket/contracts.ts';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
function response(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (request.method !== 'POST') return response(405, { error: 'method_not_allowed' });
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return response(401, { error: 'sign_in_required' });
  const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: user, error: authError } = await client.auth.getUser(authorization.slice(7));
  if (authError || !user.user) return response(401, { error: 'sign_in_required' });
  try {
    const reader = request.body?.getReader();
    if (!reader) return response(400, { error: 'invalid_link' });
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 20000) { await reader.cancel(); return response(413, { error: 'link_too_long' }); }
      chunks.push(value);
    }
    const buffer = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
    const input = JSON.parse(new TextDecoder().decode(buffer));
    if (typeof input.url !== 'string') return response(400, { error: 'invalid_link' });
    if (typeof input.requestId !== 'string' || !input.requestId || input.requestId.length > 100 ||
      !['save', 'cancel'].includes(input.operation ?? 'save')) return response(400, { error: 'invalid_request' });
    const link = normalizeArchiveLink(input.url);
    const { data, error } = await client.rpc('archive_request_link', {
      p_request: input.requestId, p_operation: input.operation ?? 'save',
      p_url: link.url, p_key: link.canonicalKey, p_platform: link.platform,
      p_title: typeof input.title === 'string' ? input.title.slice(0, 200) : '',
    });
    if (error) {
      if (error.message.includes('Daily ')) return response(429, { error: 'daily_limit' });
      console.error('archive_save_failed', { code: error.code });
      return response(503, { error: 'save_unavailable' });
    }
    return response(200, { ...data, canonicalKey: link.canonicalKey });
  } catch {
    return response(400, { error: 'invalid_link' });
  }
});
