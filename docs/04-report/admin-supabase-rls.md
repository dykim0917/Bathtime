# Admin Supabase RLS

The PC admin console uses Supabase Auth sessions for PostgREST reads and writes. Apply `db/migrations/2026-04-29_admin_content_rls.postgres.sql` after the content tables exist.

Add each operator email to the DB allowlist with a service role connection:

```sql
INSERT INTO admin_user_allowlist (email)
VALUES ('admin@example.com')
ON CONFLICT (email) DO NOTHING;
```

The migration grants authenticated users read access to content tables only when `is_content_admin()` returns true. Additional narrow migrations grant each write surface separately.

Apply `db/migrations/2026-04-29_admin_audit_log.postgres.sql` before wiring action logging. It creates `admin_action_log`, where future admin writes can store:

- actor email
- action name
- target table and row id
- before/after JSON snapshots
- created timestamp

Authenticated content admins can read audit logs and insert rows only for their own Supabase Auth email.

Keep `ADMIN_ALLOWED_EMAILS` in the admin app as the UI route guard. The DB allowlist is the source of truth for PostgREST access.
