import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);

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
  return `Usage: node scripts/upsert_archive_content_from_spot_seed.mjs <seed-dir> [--apply]

Creates:
  <seed-dir>/spot-seed.archive-content.db-row.json
  <seed-dir>/spot-seed.archive-content.upsert.sql

With --apply, upserts to PostgREST using:
  CONTENT_DB_REST_URL
  CONTENT_DB_SERVICE_ROLE_KEY`;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const apply = args.includes('--apply');
  const seedDirArg = args.find((arg) => !arg.startsWith('--'));

  if (!seedDirArg) {
    throw new Error(usage());
  }

  return {
    apply,
    seedDir: path.resolve(process.cwd(), seedDirArg),
  };
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

async function loadArchiveContent(filePath) {
  const source = await readFile(filePath, 'utf8');
  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    require: () => ({}),
  });

  new vm.Script(toCommonJs(source), { filename: filePath }).runInContext(context);

  const candidates = Object.values(module.exports).filter(
    (value) => value && typeof value === 'object' && typeof value.id === 'string'
  );

  if (candidates.length !== 1) {
    throw new Error(`Expected exactly one ArchiveContent export in ${filePath}`);
  }

  return candidates[0];
}

function normalizeJsonArray(value) {
  return Array.isArray(value) ? value : [];
}

function toDbRow(content, canonical, webContentPlan) {
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
    source_canonical: canonical,
    quality: canonical?.quality ?? null,
    audit: canonical?.audit ?? null,
    web_content_plan: webContentPlan,
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

async function readOptionalText(filePath) {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    if (error && error.code === 'ENOENT') return null;
    throw error;
  }
}

async function main() {
  await loadLocalEnv();
  const { seedDir, apply } = parseArgs(process.argv);
  const archiveContentPath = path.join(seedDir, 'spot-seed.archive-content.ts');
  const canonicalPath = path.join(seedDir, 'spot-seed.canonical.json');
  const webContentPath = path.join(seedDir, 'spot-seed.web-content.md');
  const dbRowOutputPath = path.join(seedDir, 'spot-seed.archive-content.db-row.json');
  const sqlOutputPath = path.join(seedDir, 'spot-seed.archive-content.upsert.sql');

  const content = await loadArchiveContent(archiveContentPath);
  const canonical = JSON.parse(await readFile(canonicalPath, 'utf8'));
  const webContentPlan = await readOptionalText(webContentPath);
  const row = toDbRow(content, canonical, webContentPlan);
  const sql = [
    '-- Generated by scripts/upsert_archive_content_from_spot_seed.mjs',
    `-- Source: ${path.relative(rootDir, seedDir)}`,
    'BEGIN;',
    toUpsertSql(row),
    'COMMIT;',
    '',
  ].join('\n');

  await mkdir(seedDir, { recursive: true });
  await writeFile(dbRowOutputPath, `${JSON.stringify(row, null, 2)}\n`, 'utf8');
  await writeFile(sqlOutputPath, sql, 'utf8');

  let applied = false;
  if (apply) {
    await applyPostgrestUpsert(row);
    applied = true;
  }

  console.log(
    JSON.stringify(
      {
        id: row.id,
        status: row.status,
        isPublished: row.is_published,
        dbRowOutputPath,
        sqlOutputPath,
        applied,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
