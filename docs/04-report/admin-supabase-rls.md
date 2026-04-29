# Admin Supabase RLS

The PC admin console uses Supabase Auth sessions for PostgREST reads and writes. Apply `db/migrations/2026-04-29_admin_content_rls.postgres.sql` after the content tables exist.

Add each operator email to the DB allowlist with a service role connection:

```sql
INSERT INTO admin_user_allowlist (email)
VALUES ('admin@example.com')
ON CONFLICT (email) DO NOTHING;
```

The migration grants authenticated users read access to content tables only when `is_content_admin()` returns true. The current write surface is intentionally narrow: authenticated content admins can update `canonical_product.status`.

Keep `ADMIN_ALLOWED_EMAILS` in the admin app as the UI route guard. The DB allowlist is the source of truth for PostgREST access.
