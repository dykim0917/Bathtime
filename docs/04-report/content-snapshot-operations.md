# Content Snapshot Operations

This document covers the first operational path for serving bath content from an external database.

## Runtime Shape

The app reads one public snapshot endpoint:

```txt
GET /api/content-snapshot
```

The endpoint returns `content.v1`, including catalog, care, trip, and audio sections. The app still keeps bundled static content as fallback when remote hydration fails.

## Required Server Environment

Set these only in the server/API hosting environment. Do not expose them with `EXPO_PUBLIC_`.

```txt
CONTENT_DB_REST_URL=https://<project>.supabase.co/rest/v1
CONTENT_DB_SERVICE_ROLE_KEY=<service-role-key>
```

The public app may point to the API route with:

```txt
EXPO_PUBLIC_CONTENT_API_URL=https://<host>/api/content-snapshot
```

## Database Setup

Apply the schema migrations in order:

```sh
psql "$DATABASE_URL" -f db/migrations/2026-04-07_real_product_catalog.postgres.sql
psql "$DATABASE_URL" -f db/migrations/2026-04-29_content_management.postgres.sql
```

Then generate and apply the seed upserts:

```sh
npm run content:seed:export:postgres
psql "$DATABASE_URL" -f output/content-seed.v1.postgres.upserts.sql
```

## API Smoke Test

After deployment, run:

```sh
CONTENT_SNAPSHOT_API_URL=https://<host>/api/content-snapshot npm run content:api:smoke
```

Or pass the URL directly:

```sh
npm run content:api:smoke -- https://<host>/api/content-snapshot
```

The smoke test checks:

- `schema_version` is `content.v1`
- required catalog, care, trip, and audio arrays exist
- active care/trip intents have active default subprotocols
- active trip themes reference active audio tracks

## Deployment Note

This repo currently has static web export settings. Serving `app/api/content-snapshot+api.ts` requires an API-capable host such as EAS Hosting with Expo API routes, or an equivalent server deployment that can run the route module.

If keeping Vercel static export for the marketing/app shell, deploy the content snapshot API separately and set `EXPO_PUBLIC_CONTENT_API_URL` to that server URL.

## First Production Checklist

- Supabase or compatible PostgREST project exists.
- Migrations have been applied.
- Seed upserts have been applied.
- `CONTENT_DB_REST_URL` and `CONTENT_DB_SERVICE_ROLE_KEY` are set on the API host.
- `GET /api/content-snapshot` returns HTTP 200.
- `npm run content:api:smoke` passes against the deployed endpoint.
- The app build has `EXPO_PUBLIC_CONTENT_API_URL` pointing at the deployed endpoint.
