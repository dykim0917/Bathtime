import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const seedDate = '2026-07-08';
const outputDir = path.join(repoRoot, 'research/onsen-db-seed');
const currentBatchPath = path.join(outputDir, 'kansai_sanin_setouchi_qa_seed_2026-07-08.json');
const outputCsvPath = path.join(outputDir, 'onsen_db_reconciliation_audit_2026-07-08.csv');
const outputReportPath = path.join(outputDir, 'onsen_db_reconciliation_audit_2026-07-08.md');

const allowedRegionGroups = new Set(['kyushu', 'kanto', 'kansai', 'hokkaido', 'tohoku', 'chubu', 'chugoku_shikoku']);
const bannedCopyPatterns = [/후기/, /리뷰/, /신호/, /보는 편/, /확인 필요/, /조건 확인/, /확인 중(?:입니다|$)/];

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

function readConfig() {
  const env = {
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
    ...parseEnvFile(path.join(repoRoot, 'apps/web/.env.local')),
    ...parseEnvFile(path.join(repoRoot, 'apps/admin/.env.local')),
    ...process.env,
  };
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL;
  const restUrl = (env.CONTENT_DB_REST_URL || (supabaseUrl ? `${supabaseUrl}/rest/v1` : '')).replace(/\/+$/, '');
  const apiKey = env.CONTENT_DB_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!restUrl || !apiKey) throw new Error('Missing CONTENT_DB_REST_URL/SUPABASE_URL or CONTENT_DB_SERVICE_ROLE_KEY.');
  return { restUrl, apiKey };
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function readPostgrestRows(config, table, params) {
  const url = new URL(`${config.restUrl}/${table}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    headers: {
      apikey: config.apiKey,
      authorization: `Bearer ${config.apiKey}`,
      accept: 'application/json',
    },
  });
  if (!response.ok) throw new Error(`${table} read failed: ${response.status} ${await response.text()}`);
  return response.json();
}

function loadCurrentBatchSlugs() {
  if (!existsSync(currentBatchPath)) return new Set();
  const parsed = JSON.parse(readFileSync(currentBatchPath, 'utf8'));
  return new Set((parsed.accommodations ?? []).map((row) => row.slug).filter(Boolean));
}

function collectText(row, verdict) {
  return [
    row.summary,
    row.primary_bath,
    ...(Array.isArray(row.operation_notes) ? row.operation_notes : []),
    verdict?.headline,
    ...(Array.isArray(verdict?.items)
      ? verdict.items.flatMap((item) => [item.headline, item.body, item.verdict, item.chip_label])
      : []),
  ].filter((value) => typeof value === 'string' && value.trim().length > 0);
}

function briefingPlatformCount(briefing) {
  const explicit = toNumber(briefing?.platform_count ?? briefing?.platformCount);
  if (explicit !== null) return explicit;
  return Array.isArray(briefing?.platforms) ? briefing.platforms.length : 0;
}

function sourceFamily(accommodation, verdict) {
  const source = `${verdict?.source_file ?? ''} ${accommodation.source_file ?? ''}`;
  if (/kansai_sanin_setouchi_db_seed_qa_2026-07-07/.test(source)) return 'regional_pipeline_current_batch';
  if (/kyushu_deep_research_qa_matrix_2026-07-08|yufuin_tier1_ready_after_reqa_2026-07-06/.test(source)) return 'regional_pipeline_kyushu';
  if (/hakone_kanagawa_yamanashi_db_seed_qa_2026-07-06/.test(source)) return 'regional_pipeline_kanto';
  if (/hokkaido/.test(source) && /platform_mapping|quality_matrix|db_seed|mvp/i.test(source)) return 'regional_pipeline_hokkaido';
  if (/onsen_accommodation_copy_qa_reviewed/.test(source)) return 'copy_qa_only';
  if (/onsen_reviewed_seed/.test(source)) return 'legacy_reviewed_seed';
  if (!source.trim()) return 'missing_source_file';
  return 'other';
}

function validateAccommodation(accommodation, verdict) {
  const issues = [];
  if (!/[가-힣]/.test(accommodation.display_name_ko ?? accommodation.name ?? '')) issues.push('name_no_hangul');
  if (!allowedRegionGroups.has(accommodation.region_group)) issues.push('unknown_region_group');
  if (accommodation.status !== 'active') issues.push('accommodation_not_active');

  for (const text of collectText(accommodation, verdict)) {
    for (const pattern of bannedCopyPatterns) {
      if (pattern.test(text)) {
        issues.push('banned_copy');
        break;
      }
    }
  }

  return issues;
}

function validateVerdict(verdict) {
  const issues = [];
  if (!verdict) return ['missing_verdict'];
  if (verdict.status !== 'published') issues.push('verdict_not_published');
  if (verdict.level !== 'full' && verdict.level !== 'lite') issues.push('invalid_verdict_level');

  const briefing = verdict.briefing ?? {};
  const experiencesRead = toNumber(briefing.experiences_read ?? briefing.experiencesRead) ?? 0;
  const onsenRelated = toNumber(briefing.onsen_related ?? briefing.onsenRelated) ?? 0;
  const platformCount = briefingPlatformCount(briefing);
  const items = Array.isArray(verdict.items) ? verdict.items : [];

  if (verdict.level === 'full') {
    if (experiencesRead < 300) issues.push('full_direct_below_300');
    if (onsenRelated < 200) issues.push('full_onsen_below_200');
    if (platformCount < 3) issues.push('full_platform_below_3');
    if (items.length < 3) issues.push('full_items_below_3');
  }
  if (verdict.level === 'lite' && items.length > 2) issues.push('lite_items_above_2');

  for (const item of items) {
    const mentions = toNumber(item?.counts?.mentions);
    const negative = toNumber(item?.counts?.negative ?? 0);
    const denominatorKey = item?.counts?.denominator === 'experiences_read' ? 'experiences_read' : 'onsen_related';
    const denominator = denominatorKey === 'experiences_read' ? experiencesRead : onsenRelated;
    const itemPlatformCount = toNumber(item?.counts?.platform_count);
    const directionCounts = item?.counts?.direction_counts;
    const directionKeys = ['positive', 'mixed', 'negative', 'neutral'];

    if (mentions === null) issues.push('item_mentions_missing');
    else {
      if (mentions < 10) issues.push('item_mentions_below_10');
      if (denominator > 0 && mentions / denominator < 0.02) issues.push('item_share_below_2pct');
      if (mentions > denominator) issues.push('item_mentions_exceed_denominator');
    }
    if (negative !== null && mentions !== null && negative > mentions) issues.push('item_negative_exceed_mentions');
    if (itemPlatformCount === null) issues.push('item_platform_count_missing');
    else if (itemPlatformCount < 2) issues.push('item_platform_below_2');
    if (!directionCounts || typeof directionCounts !== 'object') {
      issues.push('direction_counts_missing');
    } else {
      const values = directionKeys.map((key) => toNumber(directionCounts[key]));
      if (values.some((value) => value === null)) issues.push('direction_counts_incomplete');
      const directionalMentionSum = (values[0] ?? 0) + (values[1] ?? 0) + (values[2] ?? 0);
      if (mentions !== null && directionalMentionSum !== mentions) issues.push('direction_counts_sum_mismatch');
    }
    if (!item.signal_key) issues.push('item_signal_key_missing');
    if (!item.bath_area) issues.push('item_bath_area_missing');
  }

  return issues;
}

function issueSeverity(issues) {
  if (issues.some((issue) => issue.startsWith('full_') || issue === 'missing_verdict' || issue === 'direction_counts_missing')) return 'high';
  if (issues.some((issue) => issue.includes('missing') || issue === 'banned_copy' || issue === 'copy_qa_only')) return 'medium';
  return issues.length > 0 ? 'low' : 'none';
}

function recommendedStatus({ isCurrentBatch, family, verdict, issues }) {
  if (isCurrentBatch) return 'pass_current_batch';
  const level = verdict?.level ?? 'missing';
  if (family === 'copy_qa_only' || family === 'legacy_reviewed_seed' || family === 'missing_source_file') return 'needs_pipeline_rebuild';
  const hasStructuralIssue = issues.some((issue) =>
    [
      'missing_verdict',
      'verdict_not_published',
      'full_direct_below_300',
      'full_onsen_below_200',
      'full_platform_below_3',
      'full_items_below_3',
      'item_mentions_exceed_denominator',
      'direction_counts_missing',
      'direction_counts_incomplete',
      'direction_counts_sum_mismatch',
    ].includes(issue)
  );
  if (level === 'full' && issues.some((issue) => issue.startsWith('full_'))) return 'downgrade_or_rebuild_full';
  if (hasStructuralIssue) return 'needs_verdict_rebuild';
  if (issues.includes('banned_copy') || issues.includes('name_no_hangul') || issues.includes('unknown_region_group')) return 'manual_copy_qa';
  return 'keep_as_is';
}

function nextAction(status, issues) {
  if (status === 'pass_current_batch') return '이번 간사이/산인/세토우치 1차 파이프라인 통과분이므로 재작업하지 않습니다.';
  if (status === 'keep_as_is') return '현재 파이프라인 기준을 통과합니다. 다음 전면 재생성 전까지 유지합니다.';
  if (status === 'downgrade_or_rebuild_full') return 'full 기준 미달 항목을 lite로 낮추거나 원천 row-level 표본에서 full verdict를 재생성합니다.';
  if (status === 'needs_verdict_rebuild') return 'items, platform_count, direction_counts를 현재 스키마로 재생성합니다.';
  if (status === 'needs_pipeline_rebuild') return '문구 QA 결과가 아니라 지역별 QA/원천 표본 파일을 기준으로 seed를 다시 생성합니다.';
  if (status === 'manual_copy_qa') return '한글명, 지역 taxonomy, 사용자 노출 문구를 먼저 교정합니다.';
  if (issues.length > 0) return '이슈 코드를 기준으로 수동 검수합니다.';
  return '유지합니다.';
}

function countBy(rows, key) {
  const counts = new Map();
  for (const row of rows) counts.set(row[key], (counts.get(row[key]) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]), 'ko'));
}

function createCsv(rows) {
  const headers = [
    'slug',
    'region_group',
    'display_name_ko',
    'level',
    'direct',
    'onsen_related',
    'platform_count',
    'item_count',
    'source_family',
    'recommended_status',
    'severity',
    'issue_count',
    'issue_codes',
    'next_action',
    'accommodation_source_file',
    'verdict_source_file',
  ];
  return `${headers.join(',')}\n${rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')).join('\n')}\n`;
}

function createReport(rows, targetRows) {
  const lines = [
    '# 기적재 온천 데이터 리컨실리에이션 Audit',
    '',
    `작성일: ${seedDate}`,
    '',
    '## 요약',
    '',
    `- DB active 숙소: ${rows.length}곳`,
    `- 이번 간사이/산인/세토우치 통과 제외: ${rows.filter((row) => row.recommended_status === 'pass_current_batch').length}곳`,
    `- 리컨실리에이션 대상: ${targetRows.length}곳`,
    '',
    '## 조치 분포',
    '',
    '| status | count |',
    '|---|---:|',
    ...countBy(targetRows, 'recommended_status').map(([status, count]) => `| ${status} | ${count} |`),
    '',
    '## 지역 분포',
    '',
    '| region_group | count |',
    '|---|---:|',
    ...countBy(targetRows, 'region_group').map(([region, count]) => `| ${region} | ${count} |`),
    '',
    '## High Severity',
    '',
    '| slug | level | direct | onsen | platforms | issues | next_action |',
    '|---|---|---:|---:|---:|---|---|',
    ...targetRows
      .filter((row) => row.severity === 'high')
      .map((row) => `| ${row.slug} | ${row.level} | ${row.direct} | ${row.onsen_related} | ${row.platform_count} | ${row.issue_codes} | ${row.next_action} |`),
    '',
    '## Source Family',
    '',
    '| source_family | count |',
    '|---|---:|',
    ...countBy(targetRows, 'source_family').map(([family, count]) => `| ${family} | ${count} |`),
    '',
    '## 산출물',
    '',
    `- \`${path.relative(repoRoot, outputCsvPath)}\``,
    '',
  ];
  return `${lines.join('\n')}\n`;
}

async function main() {
  const config = readConfig();
  const currentBatchSlugs = loadCurrentBatchSlugs();
  const accommodations = await readPostgrestRows(config, 'onsen_accommodations', {
    select:
      'slug,name,display_name_ko,region_group,prefecture,city,onsen_area,summary,primary_bath,operation_notes,evidence_grade,evidence_counts,evidence_note,status,source_file',
    status: 'eq.active',
    order: 'region_group.asc,slug.asc',
  });
  const verdicts = await readPostgrestRows(config, 'onsen_verdicts', {
    select: 'target_slug,level,headline,briefing,items,fact_statuses,status,verified_at,source_file',
    target_type: 'eq.accommodation',
    status: 'eq.published',
    order: 'target_slug.asc',
  });
  const verdictBySlug = new Map(verdicts.map((row) => [row.target_slug, row]));

  const rows = accommodations.map((accommodation) => {
    const verdict = verdictBySlug.get(accommodation.slug);
    const family = sourceFamily(accommodation, verdict);
    const issues = [...new Set([...validateAccommodation(accommodation, verdict), ...validateVerdict(verdict)])];
    const isCurrentBatch = currentBatchSlugs.has(accommodation.slug);
    const status = recommendedStatus({ isCurrentBatch, family, verdict, issues });
    const briefing = verdict?.briefing ?? {};
    return {
      slug: accommodation.slug,
      region_group: accommodation.region_group,
      display_name_ko: accommodation.display_name_ko ?? accommodation.name,
      level: verdict?.level ?? 'missing',
      direct: toNumber(briefing.experiences_read ?? briefing.experiencesRead) ?? '',
      onsen_related: toNumber(briefing.onsen_related ?? briefing.onsenRelated) ?? '',
      platform_count: briefingPlatformCount(briefing),
      item_count: Array.isArray(verdict?.items) ? verdict.items.length : 0,
      source_family: family,
      recommended_status: status,
      severity: issueSeverity(issues),
      issue_count: issues.length,
      issue_codes: issues.join('|') || 'none',
      next_action: nextAction(status, issues),
      accommodation_source_file: accommodation.source_file ?? '',
      verdict_source_file: verdict?.source_file ?? '',
    };
  });

  const targetRows = rows.filter((row) => row.recommended_status !== 'pass_current_batch');

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputCsvPath, createCsv(rows));
  await writeFile(outputReportPath, createReport(rows, targetRows));

  console.log(`Audited ${rows.length} active accommodations.`);
  console.log(`Pass current batch: ${rows.length - targetRows.length}`);
  console.log(`Reconciliation targets: ${targetRows.length}`);
  console.log(outputCsvPath);
  console.log(outputReportPath);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
