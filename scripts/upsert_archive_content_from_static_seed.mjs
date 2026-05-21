import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const outputDir = path.join(rootDir, 'output', 'archive-content-static');
const seedPath = path.join(rootDir, 'src', 'archive', 'seed.ts');

function parseEnvFile(source) {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .reduce((acc, line) => {
      const separatorIndex = line.indexOf('=');
      const key = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();
      acc[key] = rawValue.replace(/^['"]|['"]$/g, '');
      return acc;
    }, {});
}

async function loadLocalEnv() {
  for (const fileName of ['.env.local', '.env']) {
    try {
      const values = parseEnvFile(await readFile(path.join(rootDir, fileName), 'utf8'));
      for (const [key, value] of Object.entries(values)) {
        if (process.env[key] === undefined) process.env[key] = value;
      }
    } catch (error) {
      if (error && error.code === 'ENOENT') continue;
      throw error;
    }
  }
}

function usage() {
  return `Usage: node scripts/upsert_archive_content_from_static_seed.mjs <content-id...> [--apply]

Creates:
  output/archive-content-static/<content-id>.db-row.json
  output/archive-content-static/<content-id>.upsert.sql

With --apply, upserts to PostgREST using:
  CONTENT_DB_REST_URL or EXPO_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
  CONTENT_DB_SERVICE_ROLE_KEY`;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const apply = args.includes('--apply');
  const ids = args.filter((arg) => !arg.startsWith('--'));

  if (ids.length === 0) {
    throw new Error(usage());
  }

  return { apply, ids };
}

function escapeSqlString(value) {
  return String(value).replace(/'/g, "''");
}

function toSqlString(value) {
  return `'${escapeSqlString(value)}'`;
}

function nullableSql(value) {
  return value === undefined || value === null ? 'NULL' : toSqlString(value);
}

function toJsonb(value) {
  if (value === undefined || value === null) return 'NULL';
  return `${toSqlString(JSON.stringify(value))}::jsonb`;
}

function toSqlBool(value) {
  return value ? 'TRUE' : 'FALSE';
}

function stripImports(source) {
  return source.replace(/^import\s+[^;]+;\s*$/gm, '');
}

function toCommonJs(source) {
  return ts.transpileModule(stripImports(source), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
}

async function loadStaticArchiveContents() {
  const source = await readFile(seedPath, 'utf8');
  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    require: () => ({}),
  });

  new vm.Script(toCommonJs(source), { filename: seedPath }).runInContext(context);
  const contents = module.exports.archiveContents;
  if (!Array.isArray(contents)) {
    throw new Error(`Expected archiveContents export in ${path.relative(rootDir, seedPath)}`);
  }

  return contents;
}

function normalizeJsonArray(value) {
  return Array.isArray(value) ? value : [];
}

function toDbRow(content) {
  return {
    id: content.id,
    title: content.title,
    subtitle: content.subtitle ?? null,
    summary: content.summary,
    category: content.category,
    content_type: content.contentType,
    tags: normalizeJsonArray(content.tags),
    hero_image: content.heroImage ?? null,
    body: normalizeJsonArray(content.body),
    structured_info: content.structuredInfo ?? {},
    related_routine_ids: normalizeJsonArray(content.relatedRoutineIds),
    related_item_ids: normalizeJsonArray(content.relatedItemIds),
    related_place_ids: normalizeJsonArray(content.relatedPlaceIds),
    seo: content.seo ?? {},
    is_published: Boolean(content.isPublished),
    status: content.isPublished ? 'active' : 'draft',
    content_created_at: content.createdAt,
    content_updated_at: content.updatedAt,
    source_canonical: content.careArchive ? { careArchive: content.careArchive } : null,
    quality: null,
    audit: null,
    web_content_plan: null,
  };
}

function toUpsertSql(row) {
  return `INSERT INTO archive_content (
  id, title, subtitle, summary, category, content_type, tags, hero_image, body,
  structured_info, related_routine_ids, related_item_ids, related_place_ids, seo,
  is_published, status, content_created_at, content_updated_at, source_canonical,
  quality, audit, web_content_plan
) VALUES (
  ${toSqlString(row.id)},
  ${toSqlString(row.title)},
  ${nullableSql(row.subtitle)},
  ${toSqlString(row.summary)},
  ${toSqlString(row.category)},
  ${toSqlString(row.content_type)},
  ${toJsonb(row.tags)},
  ${toJsonb(row.hero_image)},
  ${toJsonb(row.body)},
  ${toJsonb(row.structured_info)},
  ${toJsonb(row.related_routine_ids)},
  ${toJsonb(row.related_item_ids)},
  ${toJsonb(row.related_place_ids)},
  ${toJsonb(row.seo)},
  ${toSqlBool(row.is_published)},
  ${toSqlString(row.status)},
  ${toSqlString(row.content_created_at)},
  ${toSqlString(row.content_updated_at)},
  ${toJsonb(row.source_canonical)},
  ${toJsonb(row.quality)},
  ${toJsonb(row.audit)},
  ${nullableSql(row.web_content_plan)}
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  summary = EXCLUDED.summary,
  category = EXCLUDED.category,
  content_type = EXCLUDED.content_type,
  tags = EXCLUDED.tags,
  hero_image = EXCLUDED.hero_image,
  body = EXCLUDED.body,
  structured_info = EXCLUDED.structured_info,
  related_routine_ids = EXCLUDED.related_routine_ids,
  related_item_ids = EXCLUDED.related_item_ids,
  related_place_ids = EXCLUDED.related_place_ids,
  seo = EXCLUDED.seo,
  is_published = EXCLUDED.is_published,
  status = EXCLUDED.status,
  content_created_at = EXCLUDED.content_created_at,
  content_updated_at = EXCLUDED.content_updated_at,
  source_canonical = EXCLUDED.source_canonical,
  quality = EXCLUDED.quality,
  audit = EXCLUDED.audit,
  web_content_plan = EXCLUDED.web_content_plan,
  updated_at = NOW();`;
}

function readPostgrestConfig(env = process.env) {
  const explicitRestUrl = env.CONTENT_DB_REST_URL?.trim();
  const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const restUrl = explicitRestUrl || (supabaseUrl ? `${supabaseUrl.replace(/\/+$/, '')}/rest/v1` : '');
  const serviceRoleKey = env.CONTENT_DB_SERVICE_ROLE_KEY?.trim();
  if (!restUrl || !serviceRoleKey) return null;

  return {
    restUrl: restUrl.replace(/\/+$/, ''),
    serviceRoleKey,
  };
}

async function applyPostgrestUpsert(row) {
  const config = readPostgrestConfig();
  if (!config) {
    throw new Error('Missing CONTENT_DB_SERVICE_ROLE_KEY or Supabase URL env');
  }

  const url = new URL(`${config.restUrl}/archive_content`);
  url.searchParams.set('on_conflict', 'id');

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      apikey: config.serviceRoleKey,
      authorization: `Bearer ${config.serviceRoleKey}`,
      'content-type': 'application/json',
      prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`PostgREST archive_content upsert failed with status ${response.status}: ${detail}`);
  }

  return response.json();
}

async function writeArtifacts(row) {
  await mkdir(outputDir, { recursive: true });
  const dbRowOutputPath = path.join(outputDir, `${row.id}.db-row.json`);
  const sqlOutputPath = path.join(outputDir, `${row.id}.upsert.sql`);
  const sql = [
    '-- Generated by scripts/upsert_archive_content_from_static_seed.mjs',
    `-- Source: ${path.relative(rootDir, seedPath)}`,
    'BEGIN;',
    toUpsertSql(row),
    'COMMIT;',
    '',
  ].join('\n');

  await writeFile(dbRowOutputPath, `${JSON.stringify(row, null, 2)}\n`, 'utf8');
  await writeFile(sqlOutputPath, sql, 'utf8');

  return { dbRowOutputPath, sqlOutputPath };
}

async function main() {
  await loadLocalEnv();
  const { apply, ids } = parseArgs(process.argv);
  const contents = await loadStaticArchiveContents();
  const rows = [];

  for (const id of ids) {
    const content = contents.find((item) => item.id === id);
    if (!content) throw new Error(`ArchiveContent not found in static seed: ${id}`);
    rows.push(toDbRow(content));
  }

  const results = [];
  for (const row of rows) {
    const artifacts = await writeArtifacts(row);
    if (apply) await applyPostgrestUpsert(row);
    results.push({
      id: row.id,
      status: row.status,
      isPublished: row.is_published,
      bodyBlocks: row.body.length,
      applied: apply,
      ...artifacts,
    });
  }

  console.log(JSON.stringify({ results }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
