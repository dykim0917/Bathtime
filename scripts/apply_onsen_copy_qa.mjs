import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  applyOnsenCopyQa,
  findForbiddenOnsenCopyTerms,
  normalizeOnsenTermGuideCopy,
  onsenCopyQaSnapshotDate,
} from './onsen_copy_qa_overrides.mjs';

const repoRoot = process.cwd();
const outputDir = path.join(repoRoot, 'research', 'onsen-copy-qa');
const outputCsvPath = path.join(outputDir, 'onsen_accommodation_copy_qa_reviewed_2026-07-07.csv');
const outputJsonPath = path.join(outputDir, 'onsen_accommodation_copy_qa_reviewed_2026-07-07.json');
const reportPath = path.join(outputDir, 'onsen_accommodation_copy_qa_report_2026-07-07.md');

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const line of readFileSync(filePath, 'utf8').split(/\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
}

function readLocalEnv() {
  return {
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
    ...parseEnvFile(path.join(repoRoot, 'apps/admin/.env.local')),
    ...process.env,
  };
}

function dbConfig() {
  const env = readLocalEnv();
  const restUrl = (env.CONTENT_DB_REST_URL || `${env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1`).replace(/\/+$/, '');
  const serviceKey = env.CONTENT_DB_SERVICE_ROLE_KEY;
  if (!restUrl || !serviceKey || restUrl.startsWith('undefined')) {
    throw new Error('Missing CONTENT_DB_REST_URL/SUPABASE_URL or CONTENT_DB_SERVICE_ROLE_KEY.');
  }
  return { restUrl, serviceKey };
}

async function fetchActiveRows() {
  const { restUrl, serviceKey } = dbConfig();
  const url = new URL(`${restUrl}/onsen_accommodations`);
  url.searchParams.set(
    'select',
    'slug,display_name_ko,name,region_group,summary,primary_bath,operation_notes,evidence_counts,evidence_note,status'
  );
  url.searchParams.set('status', 'eq.active');
  url.searchParams.set('order', 'region_group.asc,slug.asc');
  const response = await fetch(url, {
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Fetch onsen_accommodations failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

async function patchRow(slug, fields) {
  const { restUrl, serviceKey } = dbConfig();
  const url = new URL(`${restUrl}/onsen_accommodations`);
  url.searchParams.set('slug', `eq.${slug}`);
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      'content-type': 'application/json',
      prefer: 'return=minimal',
    },
    body: JSON.stringify(fields),
  });
  if (!response.ok) {
    throw new Error(`Patch ${slug} failed: ${response.status} ${await response.text()}`);
  }
}

function changed(before, after) {
  return (
    normalizeOnsenTermGuideCopy(before.summary) !== after.summary ||
    normalizeOnsenTermGuideCopy(before.primary_bath) !== after.primary_bath ||
    JSON.stringify((before.operation_notes ?? []).map(normalizeOnsenTermGuideCopy)) !== JSON.stringify(after.operation_notes ?? [])
  );
}

function stringifyCsv(rows, headers) {
  const escape = (value) => {
    const text = value == null ? '' : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(',')),
  ].join('\n') + '\n';
}

async function main() {
  const shouldApply = process.argv.includes('--apply');
  const rows = await fetchActiveRows();
  const reviewed = rows.map((row) => {
    const after = applyOnsenCopyQa(row);
    const forbidden_terms = findForbiddenOnsenCopyTerms(after);
    return {
      slug: row.slug,
      display_name_ko: row.display_name_ko ?? row.name,
      region_group: row.region_group,
      changed: changed(row, after),
      forbidden_terms,
      before_summary: row.summary,
      after_summary: after.summary,
      before_primary_bath: row.primary_bath,
      after_primary_bath: after.primary_bath,
      before_operation_notes: row.operation_notes ?? [],
      after_operation_notes: after.operation_notes ?? [],
      evidence_note: after.evidence_note,
    };
  });

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputJsonPath, `${JSON.stringify(reviewed, null, 2)}\n`);
  await writeFile(
    outputCsvPath,
    stringifyCsv(reviewed, [
      'slug',
      'display_name_ko',
      'region_group',
      'changed',
      'forbidden_terms',
      'before_summary',
      'after_summary',
      'before_primary_bath',
      'after_primary_bath',
      'before_operation_notes',
      'after_operation_notes',
      'evidence_note',
    ])
  );

  const blocked = reviewed.filter((row) => row.forbidden_terms.length > 0);
  if (blocked.length > 0) {
    const detail = blocked.map((row) => `${row.slug}: ${row.forbidden_terms.join(', ')}`).join('\n');
    throw new Error(`Copy QA blocked by forbidden terms:\n${detail}`);
  }

  if (shouldApply) {
    for (const row of reviewed) {
      await patchRow(row.slug, {
        summary: row.after_summary,
        primary_bath: row.after_primary_bath,
        operation_notes: row.after_operation_notes,
        evidence_note: row.evidence_note,
        content_updated_at: onsenCopyQaSnapshotDate,
      });
    }
  }

  const changedRows = reviewed.filter((row) => row.changed);
  const report = [
    '# 온천 숙소 문구 QA 리포트',
    '',
    `- 생성일: ${onsenCopyQaSnapshotDate}`,
    `- 기준 문서: \`docs/03-content/onsen-term-guide.md\``,
    `- 대상 active 숙소: ${reviewed.length}곳`,
    `- 문구 변경 대상: ${changedRows.length}곳`,
    `- 금지/구용어 잔존: ${blocked.length}곳`,
    `- DB 적용 여부: ${shouldApply ? 'applied via PostgREST PATCH' : 'dry run only'}`,
    '',
    '## 주요 기준',
    '',
    '- `객실탕`은 노출 문구에서 `객실 내 프라이빗탕` 또는 더 구체적인 `객실 노천탕`으로 정리한다.',
    '- `원천가케나가시`는 사용자용 문구에서 `직수 온천`으로 정리한다.',
    '- `물성`은 `수질`로 정리한다.',
    '- `가족탕`, `대여탕`은 예약 혼동을 줄이기 위해 `대절탕`으로 정리한다.',
    '- 숙소 요약과 운영 메모는 `~입니다`, `~합니다` 중심의 존댓말로 정리한다.',
    '',
  ].join('\n');
  await writeFile(reportPath, report);

  console.log(`Reviewed ${reviewed.length} active rows`);
  console.log(`Changed ${changedRows.length} rows`);
  if (shouldApply) console.log(`Patched ${reviewed.length} rows`);
  console.log(outputCsvPath);
  console.log(reportPath);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
