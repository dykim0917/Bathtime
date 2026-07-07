import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const bannedCopyPatterns = [
  /보는 편이 (맞|정확|자연스럽)습니다/,
  /확인하는 편이 (좋|안전|필요|낫)습니다/,
];

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};

  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split(/\n/)
      .map((line) => line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/))
      .filter(Boolean)
      .map((match) => {
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        return [match[1], value];
      })
  );
}

function readConfig() {
  const env = {
    ...parseEnvFile(path.join(process.cwd(), '.env.local')),
    ...process.env,
  };
  const supabaseUrl = (env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
  const restUrl = env.CONTENT_DB_REST_URL || (supabaseUrl ? `${supabaseUrl}/rest/v1` : '');
  const apiKey = env.CONTENT_DB_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!restUrl || !apiKey) {
    throw new Error('Missing Supabase REST URL or API key for verdict quality check.');
  }

  return { restUrl, apiKey };
}

function denominatorFor(item, briefing) {
  const denominatorKey = item?.counts?.denominator === 'experiences_read' ? 'experiences_read' : 'onsen_related';
  const denominator = Number(briefing?.[denominatorKey]);
  return Number.isFinite(denominator) ? { denominatorKey, denominator } : null;
}

function collectTextValues(row) {
  return [
    row.headline,
    ...(Array.isArray(row.items)
      ? row.items.flatMap((item) => [item.headline, item.body, item.verdict, item.chip_label])
      : []),
  ].filter((value) => typeof value === 'string' && value.trim().length > 0);
}

function validateRow(row) {
  const errors = [];
  const briefing = row.briefing ?? {};
  const items = Array.isArray(row.items) ? row.items : [];

  for (const item of items) {
    const label = `${row.target_slug} 근거 ${item?.order ?? '?'}`;
    const mentions = Number(item?.counts?.mentions);
    const negative = Number(item?.counts?.negative ?? 0);
    const denominatorInfo = denominatorFor(item, briefing);

    if (!Number.isFinite(mentions)) {
      errors.push(`${label}: mentions is missing.`);
      continue;
    }
    if (!Number.isFinite(negative)) {
      errors.push(`${label}: negative count is missing.`);
    }
    if (Number.isFinite(negative) && negative > mentions) {
      errors.push(`${label}: negative count ${negative} exceeds mentions ${mentions}.`);
    }
    if (!denominatorInfo) {
      errors.push(`${label}: denominator is missing.`);
      continue;
    }
    if (mentions > denominatorInfo.denominator) {
      errors.push(`${label}: mentions ${mentions} exceeds ${denominatorInfo.denominatorKey} ${denominatorInfo.denominator}.`);
    }
  }

  for (const text of collectTextValues(row)) {
    for (const pattern of bannedCopyPatterns) {
      if (pattern.test(text)) {
        errors.push(`${row.target_slug}: banned weak wording "${text.match(pattern)?.[0] ?? pattern.source}".`);
      }
    }
  }

  return errors;
}

async function main() {
  const { restUrl, apiKey } = readConfig();
  const url = new URL(`${restUrl.replace(/\/+$/, '')}/onsen_verdicts`);
  url.searchParams.set('select', 'target_slug,headline,briefing,items,status');
  url.searchParams.set('status', 'eq.published');

  const response = await fetch(url, {
    headers: {
      apikey: apiKey,
      authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to read onsen verdicts: ${response.status} ${await response.text()}`);
  }

  const rows = await response.json();
  const errors = rows.flatMap(validateRow);

  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  console.log(`Onsen verdict quality check passed: ${rows.length} published rows.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
