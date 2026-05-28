# Bathtime Public Web

Next.js public web app for `www.getbathtime.com`.

## Local

```bash
npm --prefix apps/web install
npm run public-web:dev
```

The app runs on `http://localhost:3200`.

## Deployment

Create or update the public web Vercel project with:

- Root Directory: `apps/web`
- Include files outside the root directory in the Build Step: enabled
- Framework Preset: Next.js
- Build Command: `npm run build`
- Install Command: `npm install`

Required environment variables:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WEB_URL=https://www.getbathtime.com`
- `ARCHIVE_PREVIEW_API_BASE=https://admin.getbathtime.com`

Optional server-side variable:

- `CONTENT_DB_SERVICE_ROLE_KEY`

The public pages only render published content unless a valid admin preview token is passed through `previewToken`.
