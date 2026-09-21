import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Optional module path allows an isolated test-tool install without production dependencies.
const { PGlite } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '@electric-sql/pglite');
const db = new PGlite();
const users = {
  a: '11111111-1111-4111-8111-111111111111', b: '22222222-2222-4222-8222-222222222222',
  admin: '33333333-3333-4333-8333-333333333333',
};
let checks = 0;
function check(value, expected, label) { assert.deepEqual(value, expected, label); checks++; }
async function denied(sql, params, label) {
  await assert.rejects(db.query(sql, params), undefined, label); checks++;
}
async function session(user) {
  await db.exec('RESET ROLE');
  await db.query("SELECT set_config('request.jwt.claims', $1, false)", [JSON.stringify(user ? { sub: users[user], email: `${user}@example.test` } : {})]);
  await db.exec(`SET ROLE ${user ? 'authenticated' : 'anon'}`);
}
async function rows(sql, params = []) { return (await db.query(sql, params)).rows; }
const sourceUrl = 'https://www.youtube.com/watch?v=ZZdGwLauM00';
async function save(url = sourceUrl, key = 'youtube:ZZdGwLauM00', platform = 'youtube') {
  return (await rows('SELECT archive_save_link($1,$2,$3,$4) AS id', [url, key, platform, '공유 제목']))[0].id;
}

try {
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS
      $$ SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT (auth.jwt()->>'sub')::uuid $$;
    GRANT USAGE ON SCHEMA auth, public TO anon, authenticated;
    CREATE FUNCTION public.is_content_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS
      $$ SELECT coalesce(auth.jwt()->>'email' = 'admin@example.test', false) $$;
    CREATE TABLE public.saved_items(id text PRIMARY KEY);
    INSERT INTO public.saved_items VALUES ('legacy-bookmark');
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
  `);
  for (const id of Object.values(users)) await db.query('INSERT INTO auth.users VALUES ($1)', [id]);
  await db.exec(await readFile(new URL('../supabase/migrations/20260922000000_saved_archive_pivot.sql', import.meta.url), 'utf8'));
  await db.exec(await readFile(new URL('../supabase/migrations/20260922001000_archive_request_receipts.sql', import.meta.url), 'utf8'));
  check((await rows('SELECT id FROM saved_items'))[0].id, 'legacy-bookmark', 'legacy saved data survives');

  await session();
  await denied('SELECT * FROM archive_sources', [], 'anonymous source access denied');
  await denied('SELECT archive_save_link($1,$2,$3,$4)', [sourceUrl, 'youtube:ZZdGwLauM00', 'youtube', ''], 'anonymous intake denied');
  await session('a');
  const sourceA = await save();
  check(await save(), sourceA, 'retry returns same source');
  check((await rows('SELECT * FROM archive_saves')).length, 1, 'retry keeps one save');
  await denied('SELECT archive_save_link($1,$2,$3,$4)', [sourceUrl, 'youtube:another', 'youtube', ''], 'forged identity rejected');
  await denied('INSERT INTO archive_sources(owner_id,canonical_key,platform,url) VALUES ($1,$2,$3,$4)',
    [users.b, 'forged', 'web', 'https://example.com'], 'direct inserts cannot bypass intake');
  await denied('UPDATE archive_sources SET status = $1 WHERE id = $2', ['ready', sourceA], 'users cannot approve themselves');
  await denied('SELECT archive_claim_job($1)', [sourceA], 'users cannot claim jobs');

  await session('b');
  check((await rows('SELECT * FROM archive_sources')).length, 0, 'B cannot see A source');
  check((await rows('SELECT * FROM archive_saves')).length, 0, 'B cannot see A save');
  check((await rows('DELETE FROM archive_saves WHERE source_id=$1 RETURNING id', [sourceA])).length, 0, 'B cannot remove A save');
  const sourceB = await save();
  check(sourceA === sourceB, false, 'unreviewed private sources stay separate');
  await denied('INSERT INTO archive_events(user_id,event,source_id) VALUES($1,$2,$3)',
    [users.b, 'detail_opened', sourceA], 'events cannot reference another private source');

  const review = {
    version: 1, sourceId: sourceA, expectedRevision: 0, title: '허심청', summary: '게시물 요약', creator: '작성자',
    checkedAt: '2026-09-22', status: 'ready', entities: [
      { kind: 'place', name: '허심청', location: '부산', summary: '큰 온천', tags: ['온천'],
        facts: [{ label: '지역', value: '부산', sourceUrl, basis: 'post', checkedAt: '2026-09-22' }] },
      { kind: 'product', name: '입욕제 테스트', location: '테스트 브랜드', summary: '', tags: [], facts: [] },
    ],
  };
  await denied('SELECT archive_apply_review($1)', [JSON.stringify(review)], 'non-admin review denied');
  await session('admin');
  await db.query('SELECT archive_claim_job($1)', [sourceA]);
  check((await rows('SELECT status FROM archive_jobs WHERE source_id=$1', [sourceA]))[0].status, 'processing', 'claim tracked');
  check((await rows('SELECT archive_apply_review($1) AS revision', [JSON.stringify(review)]))[0].revision, 1, 'review applied');
  await denied('SELECT archive_apply_review($1)', [JSON.stringify(review)], 'stale review cannot overwrite');
  const history = (await rows('SELECT payload FROM archive_review_history WHERE source_id=$1', [sourceA]))[0].payload;
  check(history.entities.every((entity) => Boolean(entity.id)), true, 'history includes generated entity IDs');
  const placeId = history.entities[0].id;
  await denied('SELECT archive_apply_review($1)', [JSON.stringify({ ...review, sourceId: sourceB, entities: [{ ...review.entities[0], id: placeId }] })], 'private cross-user identity linking denied');
  await denied('SELECT archive_apply_review($1)', [JSON.stringify({ ...review, expectedRevision: 1, checkedAt: '2026-02-30' })], 'invalid dates rollback the entire review');
  check((await rows('SELECT revision FROM archive_sources WHERE id=$1', [sourceA]))[0].revision, 1, 'failed review leaves previous revision');

  await session('a');
  check((await rows('SELECT * FROM archive_source_entities')).length, 2, 'one source supports two entities');
  check((await rows('SELECT * FROM archive_entities')).length, 2, 'owner sees linked entities');
  await session('b');
  check((await rows('SELECT * FROM archive_entities')).length, 0, 'other user cannot see private entities');
  check((await rows('SELECT * FROM archive_source_entities')).length, 0, 'other user cannot see facts');

  await session('a');
  await db.query('DELETE FROM archive_saves WHERE source_id=$1', [sourceA]);
  await session('admin');
  await db.query('SELECT archive_apply_review($1)', [JSON.stringify({ ...history, expectedRevision: 1, entities: [history.entities[0]] })]);
  await session('a');
  check((await rows('SELECT * FROM archive_saves')).length, 0, 'review never resurrects deleted saves');
  check((await rows('SELECT * FROM archive_entities')).length, 0, 'removed save no longer grants entity access');
  await save();
  check((await rows('SELECT * FROM archive_source_entities')).length, 1, 'corrected entity connections persist');

  await session('admin');
  await db.query('SELECT archive_apply_review($1)', [JSON.stringify({ ...history, expectedRevision: 2 })]);
  check((await rows('SELECT * FROM archive_source_entities WHERE source_id=$1', [sourceA])).length, 2, 'history can restore an entity removed by a later review');
  await db.query('SELECT archive_apply_review($1)', [JSON.stringify({ ...history, expectedRevision: 3, entities: [history.entities[0]] })]);
  await session('a');

  const secondSource = await save('https://shop.example.com/bath', 'web:https://shop.example.com/bath', 'web');
  await session('admin');
  await db.query('SELECT archive_apply_review($1)', [JSON.stringify({ ...review, sourceId: secondSource, entities: [history.entities[0]] })]);
  await session('a');
  check((await rows('SELECT * FROM archive_entities')).length, 1, 'multiple sources can share one place');
  check((await rows('SELECT * FROM archive_source_entities')).length, 2, 'both source relationships retained');

  for (let i = 0; i < 28; i++) await save(`https://shop.example.com/item/${i}`, `web:https://shop.example.com/item/${i}`, 'web');
  await denied('SELECT archive_save_link($1,$2,$3,$4)', ['https://shop.example.com/over', 'web:https://shop.example.com/over', 'web', ''], 'new-link intake limit enforced');
  check(await save(), sourceA, 'duplicates still work when daily intake limit reached');

  // Treat every RPC response as potentially lost. A retry uses the same receipt.
  await session('b');
  const request = async (id, operation) => (await rows('SELECT archive_request_link($1,$2,$3,$4,$5,$6) AS result',
    [id, operation, sourceUrl, 'youtube:ZZdGwLauM00', 'youtube', '']))[0].result;
  const accepted = await request('request-one', 'save');
  check(accepted.sourceId, sourceB, 'receipt resolves the existing canonical source');
  await request('request-one', 'cancel');
  check((await rows('SELECT * FROM archive_saves')).length, 0, 'cancel succeeds without client knowing the source ID');
  check((await request('request-one', 'save')).cancelled, true, 'late original save cannot resurrect cancelled request');
  await request('request-two', 'cancel');
  check((await request('request-two', 'save')).cancelled, true, 'cancel can arrive before save');
  await request('request-three', 'save');
  await request('request-one', 'cancel');
  check((await rows('SELECT * FROM archive_saves')).length, 1, 'old cancel cannot delete a newer explicit save');
  await denied('SELECT * FROM archive_requests', [], 'receipt contents cannot be read directly');
  await session('a');
  await request('request-three', 'cancel');
  await session('b');
  check((await rows('SELECT * FROM archive_saves')).length, 1, 'same request ID from another owner cannot delete B save');
  await session('admin');
  const report = await db.exec(await readFile(new URL('./sql/archive_operations_report.sql', import.meta.url), 'utf8'));
  check(report.length, 4, 'operator report runs all four read-only aggregates');
  // Apply the retention migration after exercising upgrade compatibility above.
  await db.exec('RESET ROLE');
  await db.exec(await readFile(new URL('../supabase/migrations/20260922002000_archive_delete_private_source.sql', import.meta.url), 'utf8'));
  check((await rows('SELECT canonical_key FROM archive_requests LIMIT 1'))[0].canonical_key.length, 64, 'receipts retain a hash instead of the original link');
  await session('admin');
  await db.query('SELECT archive_apply_review($1)', [JSON.stringify({ ...review, sourceId: sourceB })]);
  const privateIds = (await rows('SELECT entity_id FROM archive_source_entities WHERE source_id=$1', [sourceB])).map((r) => r.entity_id);
  await session('b');
  await request('request-three', 'cancel');
  await session('admin');
  for (const table of ['archive_sources', 'archive_jobs', 'archive_review_history', 'archive_source_entities']) {
    const column = table === 'archive_sources' ? 'id' : 'source_id';
    check((await rows(`SELECT count(*)::int AS n FROM ${table} WHERE ${column}=$1`, [sourceB]))[0].n, 0, `${table} purged with removed save`);
  }
  check((await rows('SELECT count(*)::int AS n FROM archive_entities WHERE id = ANY($1::uuid[])', [privateIds]))[0].n, 0, 'unshared private entities purged');
  await session('b');
  check((await request('request-three', 'save')).cancelled, true, 'purge does not allow late replay');
  const fresh = await request('request-four', 'save');
  check(fresh.sourceId !== sourceB, true, 'explicit resave starts a fresh private source');
  await session('admin');
  await db.query('SELECT archive_apply_review($1)', [JSON.stringify({ ...review, sourceId: fresh.sourceId })]);
  const accountIds = (await rows('SELECT entity_id FROM archive_source_entities WHERE source_id=$1', [fresh.sourceId])).map((r) => r.entity_id);
  await db.exec('RESET ROLE');
  await db.query('DELETE FROM auth.users WHERE id=$1', [users.b]);
  check((await rows('SELECT count(*)::int AS n FROM archive_entities WHERE id = ANY($1::uuid[])', [accountIds]))[0].n, 0, 'account deletion purges private entity details');
  check((await rows('SELECT count(*)::int AS n FROM archive_requests WHERE user_id=$1', [users.b]))[0].n, 0, 'account deletion removes receipts');
  console.log(`Archive database: ${checks} assertions passed (real PostgreSQL engine / isolated PGlite).`);
} catch (error) {
  console.error('Archive database test failed:', error.message, error.detail ?? '', error.where ?? '', error.position ?? '');
  process.exitCode = 1;
} finally {
  await db.close();
}
