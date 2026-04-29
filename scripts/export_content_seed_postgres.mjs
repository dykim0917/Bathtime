import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const outputDir = path.join(rootDir, 'output');
const sqlOutputPath = path.join(outputDir, 'content-seed.v1.postgres.upserts.sql');

const modulePaths = {
  catalog: path.join(rootDir, 'src', 'data', 'catalog.ts'),
  intents: path.join(rootDir, 'src', 'data', 'intents.ts'),
  music: path.join(rootDir, 'src', 'data', 'music.ts'),
  themes: path.join(rootDir, 'src', 'data', 'themes.ts'),
  generatedTripCatalog: path.join(rootDir, 'src', 'data', 'generatedTripCatalog.ts'),
  catalogResearchSeed: path.join(rootDir, 'src', 'data', 'catalogResearchSeed.ts'),
  ingredients: path.join(rootDir, 'src', 'data', 'ingredients.ts'),
  productImages: path.join(rootDir, 'src', 'data', 'productImages.ts'),
  copy: path.join(rootDir, 'src', 'content', 'copy.ts'),
  brand: path.join(rootDir, 'src', 'content', 'brand.ts'),
};

function escapeSqlString(value) {
  return String(value).replace(/'/g, "''");
}

function toSqlString(value) {
  return `'${escapeSqlString(value)}'`;
}

function nullableSql(value) {
  return value === undefined || value === null ? 'NULL' : toSqlString(value);
}

function nullableNumber(value) {
  return value === undefined || value === null ? 'NULL' : String(value);
}

function toJsonb(value) {
  return `${toSqlString(JSON.stringify(value))}::jsonb`;
}

function toSqlBool(value) {
  return value ? 'TRUE' : 'FALSE';
}

function stripTypeOnlyImports(source) {
  return source.replace(/import\s+type\s+[^;]+;\n?/g, '');
}

function toCommonJs(source) {
  return ts.transpileModule(stripTypeOnlyImports(source), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
}

async function createLocalModuleLoader() {
  const cache = new Map();

  async function loadModule(filePath) {
    if (cache.has(filePath)) return cache.get(filePath).exports;

    const source = await readFile(filePath, 'utf8');
    const module = { exports: {} };
    cache.set(filePath, module);

    const dirname = path.dirname(filePath);
    const requireLocal = (specifier) => {
      if (specifier.endsWith('.jpg') || specifier.endsWith('.png') || specifier.endsWith('.m4a')) {
        return specifier;
      }

      if (specifier.startsWith('@/')) {
        const next = path.join(rootDir, specifier.slice(2));
        return loadKnownModule(next);
      }

      if (specifier.startsWith('.')) {
        return loadKnownModule(path.resolve(dirname, specifier));
      }

      if (specifier === 'react-native') {
        return { Image: { resolveAssetSource: () => ({ uri: '' }) } };
      }

      throw new Error(`Unsupported import in seed export: ${specifier}`);
    };

    const context = vm.createContext({
      module,
      exports: module.exports,
      require: requireLocal,
      console,
    });

    new vm.Script(toCommonJs(source), { filename: filePath }).runInContext(context);
    return module.exports;
  }

  function loadKnownModule(basePath) {
    const candidates = [basePath, `${basePath}.ts`, `${basePath}.tsx`, `${basePath}.js`];
    const found = candidates.find((candidate) => Object.values(modulePaths).includes(candidate));
    if (!found) {
      throw new Error(`Unsupported local import in seed export: ${basePath}`);
    }

    const cached = cache.get(found);
    if (cached) return cached.exports;

    throw new Error(`Module must be preloaded before use: ${found}`);
  }

  for (const filePath of [
    modulePaths.brand,
    modulePaths.copy,
    modulePaths.generatedTripCatalog,
    modulePaths.catalogResearchSeed,
    modulePaths.ingredients,
    modulePaths.productImages,
    modulePaths.music,
    modulePaths.themes,
    modulePaths.intents,
    modulePaths.catalog,
  ]) {
    await loadModule(filePath);
  }

  return {
    catalog: cache.get(modulePaths.catalog).exports,
    intents: cache.get(modulePaths.intents).exports,
    music: cache.get(modulePaths.music).exports,
    themes: cache.get(modulePaths.themes).exports,
  };
}

function upsertProductPresentation(item) {
  return `INSERT INTO product_presentation (
  canonical_product_id, tags, emoji, bg_color, safety_flags, status
) VALUES (
  ${toSqlString(item.id)},
  ${toJsonb(item.tags)},
  ${toSqlString(item.emoji)},
  ${toSqlString(item.bgColor)},
  ${toJsonb(item.safetyFlags ?? [])},
  'active'
)
ON CONFLICT (canonical_product_id) DO UPDATE SET
  tags = EXCLUDED.tags,
  emoji = EXCLUDED.emoji,
  bg_color = EXCLUDED.bg_color,
  safety_flags = EXCLUDED.safety_flags,
  status = EXCLUDED.status,
  updated_at = NOW();`;
}

function upsertIntent(tableName, item) {
  return `INSERT INTO ${tableName} (
  id, intent_id, mapped_mode, allowed_environments, copy_title,
  copy_subtitle_by_environment, default_subprotocol_id, card_position, status
) VALUES (
  ${toSqlString(item.id)},
  ${toSqlString(item.intent_id)},
  ${toSqlString(item.mapped_mode)},
  ${toJsonb(item.allowed_environments)},
  ${toSqlString(item.copy_title)},
  ${toJsonb(item.copy_subtitle_by_environment)},
  ${toSqlString(item.default_subprotocol_id)},
  ${String(item.card_position)},
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  intent_id = EXCLUDED.intent_id,
  mapped_mode = EXCLUDED.mapped_mode,
  allowed_environments = EXCLUDED.allowed_environments,
  copy_title = EXCLUDED.copy_title,
  copy_subtitle_by_environment = EXCLUDED.copy_subtitle_by_environment,
  default_subprotocol_id = EXCLUDED.default_subprotocol_id,
  card_position = EXCLUDED.card_position,
  status = EXCLUDED.status,
  updated_at = NOW();`;
}

function upsertSubprotocol(tableName, item) {
  return `INSERT INTO ${tableName} (
  id, intent_id, label, hint, is_default, partial_overrides, status
) VALUES (
  ${toSqlString(item.id)},
  ${toSqlString(item.intent_id)},
  ${toSqlString(item.label)},
  ${toSqlString(item.hint)},
  ${toSqlBool(item.is_default)},
  ${toJsonb(item.partialOverrides)},
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  intent_id = EXCLUDED.intent_id,
  label = EXCLUDED.label,
  hint = EXCLUDED.hint,
  is_default = EXCLUDED.is_default,
  partial_overrides = EXCLUDED.partial_overrides,
  status = EXCLUDED.status,
  updated_at = NOW();`;
}

function upsertAudioTrack(item, type) {
  return `INSERT INTO audio_track (
  id, type, title, filename, remote_url, duration_seconds, persona_codes,
  license_note, status
) VALUES (
  ${toSqlString(item.id)},
  ${toSqlString(type)},
  ${toSqlString(item.title)},
  ${nullableSql(item.filename)},
  NULL,
  ${String(item.durationSeconds)},
  ${toJsonb(item.persona)},
  NULL,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  title = EXCLUDED.title,
  filename = EXCLUDED.filename,
  remote_url = EXCLUDED.remote_url,
  duration_seconds = EXCLUDED.duration_seconds,
  persona_codes = EXCLUDED.persona_codes,
  license_note = EXCLUDED.license_note,
  status = EXCLUDED.status,
  updated_at = NOW();`;
}

function upsertTripTheme(item) {
  return `INSERT INTO trip_theme (
  id, cover_style_id, title, subtitle, base_temp, color_hex, rec_scent,
  music_id, ambience_id, default_bath_type, recommended_environment,
  duration_minutes, lighting, status
) VALUES (
  ${toSqlString(item.id)},
  ${toSqlString(item.coverStyleId)},
  ${toSqlString(item.title)},
  ${toSqlString(item.subtitle)},
  ${String(item.baseTemp)},
  ${toSqlString(item.colorHex)},
  ${toSqlString(item.recScent)},
  ${toSqlString(item.musicId)},
  ${toSqlString(item.ambienceId)},
  ${toSqlString(item.defaultBathType)},
  ${toSqlString(item.recommendedEnvironment)},
  ${nullableNumber(item.durationMinutes)},
  ${toSqlString(item.lighting)},
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  cover_style_id = EXCLUDED.cover_style_id,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  base_temp = EXCLUDED.base_temp,
  color_hex = EXCLUDED.color_hex,
  rec_scent = EXCLUDED.rec_scent,
  music_id = EXCLUDED.music_id,
  ambience_id = EXCLUDED.ambience_id,
  default_bath_type = EXCLUDED.default_bath_type,
  recommended_environment = EXCLUDED.recommended_environment,
  duration_minutes = EXCLUDED.duration_minutes,
  lighting = EXCLUDED.lighting,
  status = EXCLUDED.status,
  updated_at = NOW();`;
}

function flattenSubprotocols(groups) {
  return Object.values(groups).flat();
}

async function main() {
  const modules = await createLocalModuleLoader();
  const products = modules.catalog.PRODUCT_CATALOG;
  const careIntents = modules.intents.CARE_INTENT_CARDS;
  const careSubprotocols = flattenSubprotocols(modules.intents.CARE_SUBPROTOCOL_OPTIONS);
  const musicTracks = modules.music.MUSIC_TRACKS;
  const ambienceTracks = modules.music.AMBIENCE_TRACKS;
  const tripThemes = modules.themes.THEMES;
  const tripIntents = modules.intents.TRIP_INTENT_CARDS;
  const tripSubprotocols = flattenSubprotocols(modules.intents.TRIP_SUBPROTOCOL_OPTIONS);

  const lines = [
    '-- Generated by scripts/export_content_seed_postgres.mjs',
    '-- Source: current static app content seed',
    'BEGIN;',
    ...products.map(upsertProductPresentation),
    ...careIntents.map((item) => upsertIntent('care_intent', item)),
    ...careSubprotocols.map((item) => upsertSubprotocol('care_subprotocol', item)),
    ...musicTracks.map((item) => upsertAudioTrack(item, 'music')),
    ...ambienceTracks.map((item) => upsertAudioTrack(item, 'ambience')),
    ...tripThemes.map(upsertTripTheme),
    ...tripIntents.map((item) => upsertIntent('trip_intent', item)),
    ...tripSubprotocols.map((item) => upsertSubprotocol('trip_subprotocol', item)),
    'COMMIT;',
    '',
  ];

  await mkdir(outputDir, { recursive: true });
  await writeFile(sqlOutputPath, lines.join('\n'), 'utf8');

  console.log(
    JSON.stringify(
      {
        sqlOutputPath,
        counts: {
          productPresentations: products.length,
          careIntents: careIntents.length,
          careSubprotocols: careSubprotocols.length,
          musicTracks: musicTracks.length,
          ambienceTracks: ambienceTracks.length,
          tripThemes: tripThemes.length,
          tripIntents: tripIntents.length,
          tripSubprotocols: tripSubprotocols.length,
        },
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
