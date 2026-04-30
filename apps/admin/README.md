# Bath Sommelier Admin

PC-first content operations console for Bath Sommelier.

## Run Locally

```sh
cd apps/admin
npm install
npm run dev
```

The local admin app runs on:

```txt
http://localhost:3100
```

## Supabase Auth

Set these environment variables before enabling login:

```txt
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
ADMIN_ALLOWED_EMAILS=owner@example.com,ops@example.com
```

Without Supabase values, `/login` renders a configuration warning and protected routes redirect back to login.

`ADMIN_ALLOWED_EMAILS` is optional for local development. It is required in production so only approved Supabase users can enter the console.

Content tables are read through the signed-in Supabase Auth session and Supabase RLS. If `CONTENT_DB_REST_URL` is absent, the admin app uses `NEXT_PUBLIC_SUPABASE_URL/rest/v1`. Do not configure `CONTENT_DB_SERVICE_ROLE_KEY` in the admin Vercel project.

Admin updates are audited in Postgres through `admin_action_log` triggers. Apply the audit log schema and update trigger migrations before enabling production edits.

## Publish Validation

Set this to let the `/publish` page validate a deployed snapshot endpoint:

```txt
CONTENT_SNAPSHOT_API_URL=https://<host>/api/content-snapshot
```

## Scope

This scaffold is intentionally read-only. The next PRs should add:

- dashboard data source wiring
- product list table
- care routine list table
- trip routine and audio list tables
- admin authentication
- CRUD and publish workflow
