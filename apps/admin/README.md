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
```

Without those values, `/login` renders a configuration warning and the route guard stays open for local scaffold work.

## Scope

This scaffold is intentionally read-only. The next PRs should add:

- dashboard data source wiring
- product list table
- care routine list table
- trip routine and audio list tables
- admin authentication
- CRUD and publish workflow
