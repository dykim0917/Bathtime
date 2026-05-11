# Output Formats

Generate canonical JSON first, then convert to the requested format.

## Bathtime Static Archive Seed

Use when the repo uses `src/archive/types.ts` and `src/archive/seed.ts`.

Map canonical fields to `ArchiveContent`:

- `id` -> `ArchiveContent.id`
- `content.title` -> `title`
- `content.subtitle` -> `subtitle`
- `content.category` -> `category`
- `content.content_type` -> `contentType`
- `content.tags` -> `tags`
- `content.hero_image` -> `heroImage`
- `content.body_blocks` -> `body`
- `content.seo` -> `seo`
- `content.is_published` -> `isPublished`
- `created_at` / `updated_at` -> ISO dates

Map canonical `spot` to `PlaceStructuredInfo`:

- `spot.access.public_access` -> `publicAccess`
- `spot.price.summary` -> `priceRange`
- `spot.access.reservation_required` -> `reservationRequired`
- `spot.location.region_label` -> `region`
- `spot.experience_fit.solo_fit` -> `suitableForSolo`
- `spot.experience_fit.couple_fit` -> `suitableForCouple`
- `spot.experience_fit.privacy_level` -> `privateLevel`
- `spot.facilities.facility_types` -> `facilityTypes`
- `audit.last_researched_at` -> `lastCheckedAt`

Keep fuller canonical details in a separate JSON artifact if the static type cannot represent them.

## Prisma Seed

Use when `schema.prisma` exists or the user asks for Prisma.

Rules:

- Inspect model names and unique constraints before writing.
- Prefer `upsert` when the model has a stable unique `id`.
- Use `create` only for one-time local seed drafts.
- Store nested canonical fields as JSON columns only if the Prisma schema supports JSON.
- Include review comments for fields with no model mapping.

Output pattern:

```ts
await prisma.content.upsert({
  where: { id: seed.id },
  update: { /* mapped fields */ },
  create: { /* mapped fields */ },
});
```

## Postgres or SQL Seed

Use when the user asks for SQL, Postgres, Supabase SQL, or the repo has SQL migrations.

Rules:

- Inspect table names and columns first.
- Wrap multi-row seeds in `BEGIN;` and `COMMIT;`.
- Prefer `INSERT ... ON CONFLICT (id) DO UPDATE`.
- Escape strings safely.
- Use `jsonb` casts for JSON columns.
- Keep destructive deletes out of generated SQL unless explicitly requested.

For an unknown target table, generate canonical JSON and a commented SQL skeleton rather than pretending a schema exists.

## Supabase Seed

Supabase can mean SQL or JSON import. Ask only if the user did not specify and both are plausible.

For Supabase SQL:

- Follow the Postgres rules.
- Avoid requiring service-role execution unless the target table has RLS restrictions documented by the user.

For Supabase table editor JSON:

- Produce an array of row objects.
- Match table columns exactly.
- Keep nested JSON as objects, not stringified JSON.

## CMS Import JSON

Use when the target is an admin CMS, headless CMS, or import tool.

Default shape:

```json
{
  "collection": "spots",
  "schema_version": "bathtime.cms_import.v1",
  "records": []
}
```

Each record should include:

- `id`
- `status`
- `title`
- `slug`
- `locale`
- `content`
- `spot`
- `seo`
- `sources`
- `quality`

Default `locale` to `ko-KR` for Korean Bathtime content unless the user specifies otherwise.

## Mapping Report

Always create or include a mapping report for non-trivial conversions:

```md
# Spot Seed Mapping

## Target
- Format:
- Target files/tables:

## Field Mapping
| Source | Canonical | Target | Notes |
| --- | --- | --- | --- |

## Skipped Fields

## Publish Blockers

## Verification Needed
```
