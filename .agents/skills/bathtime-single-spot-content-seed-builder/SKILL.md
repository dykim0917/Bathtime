---
name: bathtime-single-spot-content-seed-builder
description: Convert Bathtime single spot content research outputs into database-ready seed artifacts. Use when the user provides or references bathtime-single-spot-content-researcher files such as archive_record.json, content_draft.md, sns_summary.md, research_sources.md, missing_fields.md, or verification_checklist.md and wants canonical seed JSON, Prisma seed code, SQL/Postgres/Supabase seed files, or CMS import JSON for one bath/spa/sauna place.
---

# Bathtime Single Spot Content Seed Builder

## Purpose

Turn `bathtime-single-spot-content-researcher` outputs into insertion-ready seed artifacts without inventing facts or hiding uncertainty.

The pipeline is:

1. Research output files
2. Canonical seed JSON
3. Requested delivery format: Prisma seed, SQL/Postgres seed, Supabase seed, CMS import JSON, or app archive seed

## Input Files

Accept a folder or individual files. Prefer reading all available files:

- `archive_record.json` as the source of structured facts
- `content_draft.md` as the source of body copy
- `sns_summary.md` as optional distribution copy
- `research_sources.md` as source/provenance data
- `missing_fields.md` as unresolved data
- `verification_checklist.md` as operator QA requirements

If `archive_record.json` is missing, stop and ask for it unless the user explicitly wants a best-effort draft from markdown only.

## Core Workflow

1. Inspect the target repository before choosing a seed format.
   - Look for existing schemas, migrations, Prisma files, seed scripts, content types, and static archive seed files.
   - In this repo, check `src/archive/types.ts`, `src/archive/seed.ts`, `db/migrations/`, `scripts/*seed*`, and `output/*seed*` when relevant.

2. Build canonical seed JSON first.
   - Use `references/canonical_seed_schema.md`.
   - Preserve source uncertainty from the research output.
   - Keep unknown fields as `null`, `"unknown"`, or explicit review notes rather than guessing.

3. Validate the canonical seed.
   - Confirm required identifiers, title, category, content type, tags, body blocks, structured place info, source records, and verification notes.
   - Check dates use ISO `YYYY-MM-DD` when day precision is available.
   - Check enum values match the target app or DB schema.
   - For Korean output on Windows/PowerShell, verify generated files with UTF-8 reads. Avoid embedding Korean literals in shell-piped scripts unless using UTF-8-safe execution or Unicode escapes.

4. Convert to the requested output format.
   - Use `references/output_formats.md`.
   - If no output format is specified, produce canonical seed JSON plus the most repo-native format.
   - For Bathtime app archive content, prefer an `ArchiveContent`-compatible object unless a DB schema says otherwise.

5. Report mapping decisions.
   - Include a concise mapping summary: source field -> canonical field -> target field.
   - List skipped fields and why.
   - List unresolved fields that block publishing or DB insertion.
   - Re-open generated JSON/TS/SQL/CMS files and check for replacement characters or mojibake before reporting success.

## Guardrails

- Do not add new factual claims beyond the research artifacts.
- Do not turn review signals into verified facts.
- Do not mark content as published unless the user asks or the verification checklist is complete.
- Do not discard `missing_fields.md`; carry it into `quality.missing_fields` and target review notes.
- Do not silently choose a destructive SQL operation. Prefer upserts or draft inserts.
- Do not write directly to production DBs. Generate files for review unless the user explicitly asks for execution.

## Output Expectations

When creating files, use a clear output folder near the research folder or under `output/` if the repo already does so. Common filenames:

- `spot-seed.canonical.json`
- `spot-seed.prisma.ts`
- `spot-seed.postgres.sql`
- `spot-seed.supabase.json`
- `spot-seed.cms-import.json`
- `spot-seed.mapping.md`

For multiple spots, produce an array in canonical JSON and deterministic IDs for each spot.

## References

- Read `references/canonical_seed_schema.md` before writing canonical JSON.
- Read `references/output_formats.md` before producing Prisma, SQL, Supabase, CMS, or static app seed output.
