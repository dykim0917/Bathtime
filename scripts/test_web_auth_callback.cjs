const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('../node_modules/typescript');
let configuredAuth;
const source = fs.readFileSync(path.join(__dirname, '../apps/web/lib/auth.ts'), 'utf8');
const sandbox = {
  exports: {}, process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.invalid', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'fixture-key' } },
  require(name) {
    assert.equal(name, '@supabase/supabase-js');
    return { createClient(_url, _key, options) { configuredAuth = options.auth; return {}; } };
  },
};
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, sandbox);
sandbox.exports.getSupabaseClient();
global.BroadcastChannel = undefined;
global.window = { location: { href: 'https://www.getbathtime.com/auth/callback?code=fixture-code' },
  history: { state: null, replaceState(_s, _t, url) { window.location.href = String(url); } },
  addEventListener() {}, removeEventListener() {} };
global.document = { visibilityState: 'visible', addEventListener() {}, removeEventListener() {} };
const { GoTrueClient } = require('../apps/web/node_modules/@supabase/auth-js');
async function attempt(detectSessionInUrl) {
  window.location.href = 'https://www.getbathtime.com/auth/callback?code=fixture-code';
  const values = new Map([['fixture-code-verifier', JSON.stringify('fixture-verifier')]]);
  let exchanges = 0;
  const client = new GoTrueClient({ url: 'https://example.invalid/auth/v1', storageKey: 'fixture',
    flowType: 'pkce', detectSessionInUrl, autoRefreshToken: false, persistSession: true,
    storage: { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,v), removeItem: k => values.delete(k) },
    fetch: async () => {
      exchanges++;
      return new Response(JSON.stringify(exchanges === 1 ? {
        access_token: 'fixture-access-token', refresh_token: 'fixture-refresh-token', token_type: 'bearer',
        expires_in: 3600, user: { id: 'fixture-user', aud: 'authenticated' }
      } : { error: 'invalid_grant', error_description: 'Code already used' }),
      { status: exchanges === 1 ? 200 : 400, headers: { 'content-type': 'application/json' } });
    } });
  const { error } = await client.exchangeCodeForSession('fixture-code');
  await client.stopAutoRefresh();
  client.broadcastChannel?.close();
  return { exchanges, failed: Boolean(error) };
}
(async () => {
  const before = await attempt(true);
  const after = await attempt(configuredAuth.detectSessionInUrl);
  console.log({ before, after });
  assert.deepEqual(before, { exchanges: 1, failed: true });
  assert.deepEqual(after, { exchanges: 1, failed: false });
  console.log('Actual Supabase SDK duplicate callback reproduced and fix verified');
  process.exit(0);
})().catch(e => { console.error(e.message); process.exitCode = 1; });
