-- Bathtime Supabase RLS audit
-- Run this in the Supabase SQL Editor as a project owner after each schema change.
-- The queries are read-only. The role simulation blocks are wrapped in transactions.

-- 1. Public tables where Row Level Security is off.
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'p')
ORDER BY c.relrowsecurity ASC, c.relname ASC;

-- Expected: every application table has rls_enabled = true.

-- 2. Policies by table. Review anon policies first.
SELECT
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected:
-- - public verdict reads only allow published rows.
-- - insert/update/delete on editorial tables require is_content_admin().
-- - user-owned tables compare user_id/id with auth.uid().

-- 3. Direct grants to browser-facing roles.
SELECT
  table_schema,
  table_name,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

-- Expected:
-- - anon has only intentional public SELECT grants.
-- - authenticated write grants are still protected by RLS policies.

-- 4. Verdict draft exposure check as anon.
BEGIN;
SET LOCAL ROLE anon;

SELECT
  COUNT(*) AS anon_visible_unpublished_verdicts
FROM public.onsen_verdicts
WHERE status <> 'published' OR level = 'draft';

SELECT
  COUNT(*) AS anon_visible_published_verdicts
FROM public.onsen_verdicts
WHERE status = 'published';

ROLLBACK;

-- Expected:
-- - anon_visible_unpublished_verdicts = 0
-- - anon_visible_published_verdicts equals the published public verdict count.

-- 5. Non-admin authenticated exposure check.
BEGIN;
SET LOCAL ROLE authenticated;

SELECT public.is_content_admin() AS simulated_user_is_content_admin;

SELECT
  COUNT(*) AS authenticated_visible_unpublished_verdicts
FROM public.onsen_verdicts
WHERE status <> 'published' OR level = 'draft';

ROLLBACK;

-- Expected:
-- - simulated_user_is_content_admin = false
-- - authenticated_visible_unpublished_verdicts = 0 for non-admin users.

-- 6. Service-role hygiene. This cannot be proven from SQL.
-- Confirm in Vercel/Supabase settings that service-role keys exist only in server-side
-- environments or local untracked .env files, never NEXT_PUBLIC_* variables.
