import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const outputDir = path.join(repoRoot, 'research/onsen-db-seed');
const seedDate = '2026-07-08';
const isSecondPass = process.argv.includes('--second-pass');
const outputBase = isSecondPass ? `onsen_source_flow_reconciliation_2nd_${seedDate}` : `onsen_source_flow_reconciliation_${seedDate}`;
const outputJsonPath = path.join(outputDir, `${outputBase}.json`);
const outputSqlPath = path.join(outputDir, `${outputBase}.upsert.sql`);
const outputReportPath = path.join(outputDir, `${outputBase}_report.md`);
const shouldApply = process.argv.includes('--apply');

const firstPassConfirmedSourceRules = [
  {
    slug: 'hakone-byakudan',
    source_file: 'research/onsen-review-signals/hakone-byakudan/platform_mapping_2026-07-04.json',
    evidence_type: 'previous_reviewed_seed_and_platform_mapping',
    evidence_keyword: 'water_source_type=free_flowing_source / water_kakenagashi',
    fact_value: '전 객실 객실 노천탕과 공용탕에 자가 원천을 직수 방식으로 공급한다는 이전 검증 근거가 있습니다.',
    operation_note: '자가 원천을 흘려보내는 직수 방식으로 확인됩니다',
    validation: 'previous_seed_free_flowing_source',
  },
  {
    slug: 'tokachigawa-seijakubou',
    source_file: 'research/onsen-db-seed/hokkaido_reconciliation_seed_2026-07-08.json',
    evidence_type: 'official_name_surface',
    evidence_keyword: '全室源泉かけ流し露天風呂付きの宿',
    fact_value: '일본어 숙소명 표면에서 전 객실 원천가케나가시 노천탕 구성이 확인됩니다.',
    operation_note: '전 객실 노천탕이 원천가케나가시로 표기됩니다',
    validation: 'ja_name_contains_source_flow',
  },
  {
    slug: 'yunohira-gyounso',
    source_file: 'research/onsen-db-seed/kyushu_qa_seed_3rd_2026-07-08.json',
    evidence_type: 'official_name_surface',
    evidence_keyword: '源泉掛け流し大人限定宿',
    fact_value: '일본어 숙소명 표면에서 원천가케나가시 숙소임이 확인됩니다.',
    operation_note: '공식 표면에서 원천가케나가시 표기가 확인됩니다',
    validation: 'ja_name_contains_source_flow',
  },
  {
    slug: 'shirahama-yanagiya',
    source_file: 'research/onsen-deep-research/shirahama-yanagiya-2026-07-04/review_signal_summary_2026-07-04.md',
    evidence_type: 'official_facts_and_deep_research',
    evidence_keyword: '百割源泉 / 源泉百% 掛け流し',
    fact_value: '공식 표면에서 백할원천과 원천 100% 가케나가시가 확인됩니다. 일부 반노천 객실은 끓인 물 표기라 객실 타입 확인이 필요합니다.',
    operation_note: '원천 100% 직수 표기가 확인됩니다. 일부 반노천 객실은 끓인 물 표기라 객실 타입을 함께 확인하세요',
    validation: 'local_summary_contains_official_source_flow',
  },
];

const secondPassConfirmedSourceRules = [
  {
    slug: 'yufuin-wazanho',
    source_file: 'research/onsen-review-signals/yufuin-wazanho/platform_mapping_2026-07-08.json',
    evidence_type: 'official_bath_facts',
    evidence_keyword: '대욕장과 객실탕 모두 源泉100%掛け流し',
    fact_value: '공식 온천 표면에서 대욕장과 객실탕 모두 원천 100% 가케나가시로 표기됩니다.',
    operation_note: '대욕장과 객실탕 모두 원천 100% 가케나가시로 표기됩니다',
    validation: 'source_file_contains_patterns',
    required_patterns: ['源泉100%掛け流し'],
  },
  {
    slug: 'beppu-yunosato-hayama',
    source_file: 'research/onsen-review-signals/beppu-yunosato-hayama/review_signal_summary_2026-07-07.md',
    evidence_type: 'official_bath_facts',
    evidence_keyword: '天然温泉かけ流し / 源泉かけ流し',
    fact_value: '공식 표면에서 천연온천 가케나가시와 원천가케나가시가 확인됩니다. 객실탕은 일부 객실 타입 중심입니다.',
    operation_note: '공식 표면에서 원천가케나가시가 확인됩니다. 객실탕은 일부 객실 타입 중심입니다',
    validation: 'source_file_contains_patterns',
    required_patterns: ['天然温泉かけ流し', '源泉かけ流し'],
  },
  {
    slug: 'ibusuki-ginsyo',
    source_file: 'research/onsen-review-signals/ibusuki-ginsyo/platform_mapping_2026-07-04.json',
    evidence_type: 'official_bath_facts',
    evidence_keyword: '대욕장 내탕/노천 + 객실 노천 源泉かけ流し',
    fact_value: '공식 표면에서 대욕장 내탕/노천과 객실 노천탕의 원천가케나가시 표기가 확인됩니다. 객실 노천탕은 공급 시간 조건을 함께 봐야 합니다.',
    operation_note: '대욕장과 객실 노천탕에 원천가케나가시 표기가 확인됩니다. 객실 노천탕은 공급 시간 조건을 함께 확인하세요',
    validation: 'source_file_contains_patterns',
    required_patterns: ['source_claim', '源泉かけ流し'],
  },
  {
    slug: 'yufuin-warabino',
    source_file: 'research/onsen-review-signals/yufuin-tier2-deep-research/yufuin-warabino/review_signal_summary_curated_2026-07-02.json',
    evidence_type: 'official_or_ota_facility_facts',
    evidence_keyword: '전 객실 원천가케나가시 온천 포함',
    fact_value: '공식/OTA 시설 정보 기준 전 객실 원천가케나가시 온천 포함 숙소로 정리된 근거가 있습니다.',
    operation_note: '전 객실 원천가케나가시 온천 포함 숙소로 정리된 근거가 있습니다',
    validation: 'source_file_contains_patterns',
    required_patterns: ['전 객실 원천가케나가시'],
  },
  {
    slug: 'yufuin-konjakuan',
    source_file: 'research/onsen-review-signals/yufuin-konjakuan/platform_mapping_2026-07-08.json',
    evidence_type: 'official_or_ota_facility_facts',
    evidence_keyword: '天然温泉100% / 温泉掛け流し / 모든 목욕탕 가족탕',
    fact_value: '공식/Jalan 표면에서 천연온천 100%, 온천 가케나가시, 가족탕 중심 구성이 확인됩니다.',
    operation_note: '천연온천 100%와 온천 가케나가시 표기가 확인됩니다. 객실탕과 대절 가족탕 구성을 분리해서 확인하세요',
    validation: 'source_file_contains_patterns',
    required_patterns: ['천연온천100%', '温泉掛け流し'],
  },
  {
    slug: 'unzen-fukudaya',
    source_file: 'research/onsen-review-signals/unzen-fukudaya/platform_mapping_2026-07-04.json',
    evidence_type: 'official_or_ota_facility_facts',
    evidence_keyword: '源泉かけ流し / 白濁温泉',
    fact_value: '공식 메타/객실 페이지와 라쿠텐 온천 표면에서 원천가케나가시 백탁온천 표기가 확인됩니다.',
    operation_note: '공식/OTA 표면에서 원천가케나가시 백탁온천 표기가 확인됩니다',
    validation: 'source_file_contains_patterns',
    required_patterns: ['source_claim', '源泉かけ流し'],
  },
  {
    slug: 'hakone-gen-gora',
    source_file: 'research/onsen-review-signals/hakone-gen-gora/review_signal_summary_2026-07-04.md',
    evidence_type: 'official_facility_facts',
    evidence_keyword: '전 18실 원천가케나가시 객실 노천탕',
    fact_value: '공식/시설 표면 기준 전 18실 원천가케나가시 객실 노천탕과 원천가케나가시 대욕장 표기가 확인됩니다.',
    operation_note: '전 객실 원천가케나가시 객실 노천탕으로 정리된 공식/시설 근거가 있습니다',
    validation: 'source_file_contains_patterns',
    required_patterns: ['전 18실', '원천가케나가시'],
  },
  {
    slug: 'yufuin-sakuratei',
    source_file: 'research/onsen-review-signals/yufuin-sakuratei/review_signal_summary_2026-07-08.md',
    evidence_type: 'official_or_ota_facility_facts',
    evidence_keyword: '전 10동 별채 원천가케나가시 노천탕',
    fact_value: 'Jalan/Rakuten/Yahoo/Ikkyu 표면에서 전 10동 별채 원천가케나가시 노천탕 숙소로 소개됩니다.',
    operation_note: '전 10동 별채 원천가케나가시 노천탕 숙소로 소개되는 근거가 있습니다',
    validation: 'source_file_contains_patterns',
    required_patterns: ['전 10동', '원천가케나가시'],
  },
  {
    slug: 'yufuin-baien',
    source_file: 'research/onsen-review-signals/yufuin-baien/review_signal_summary_curated_2026-07-01.json',
    evidence_type: 'official_bath_facts',
    evidence_keyword: '공식 온천 페이지 원천가케나가시',
    fact_value: '공식 온천 페이지에서 원천가케나가시 표기가 확인됩니다. 객실 노천/반노천은 별채 객실 타입별로 확인해야 합니다.',
    operation_note: '공식 온천 페이지에서 원천가케나가시 표기가 확인됩니다. 객실 노천/반노천은 객실 타입별로 확인하세요',
    validation: 'source_file_contains_patterns',
    required_patterns: ['원천가케나가시'],
  },
  {
    slug: 'hakone-yuyado-zen',
    source_file: 'research/onsen-review-signals/hakone-yuyado-zen/platform_mapping_2026-07-04.json',
    evidence_type: 'official_bath_facts_with_temperature_caution',
    evidence_keyword: 'all rooms 掛け流し / 天然掛け流しにごり湯',
    fact_value: '공식 객실 페이지는 전 객실 가케나가시 온천, TOP 표면은 천연 가케나가시 니고리유로 설명합니다. 온도 조절 신호는 별도 확인이 필요합니다.',
    operation_note: '전 객실 가케나가시 온천 표기가 확인됩니다. 뜨거운 원천과 온도 조절 신호를 함께 확인하세요',
    validation: 'source_file_contains_patterns',
    required_patterns: ['all rooms', '掛け流し'],
  },
  {
    slug: 'beppu-yutorelo',
    source_file: 'research/onsen-review-signals/beppu-yutorelo/platform_mapping_2026-07-08.json',
    evidence_type: 'official_series_facility_facts',
    evidence_keyword: '自家源泉かけ流し / 自家源泉',
    fact_value: '공식 계열 설명에서 자가 원천가케나가시와 자가 원천 온천 신호가 확인됩니다.',
    operation_note: '공식 계열 설명에서 자가 원천가케나가시 표기가 확인됩니다',
    validation: 'source_file_contains_patterns',
    required_patterns: ['source_flow_claim', '自家源泉'],
  },
];

const firstPassManualReviewCandidates = [
  {
    slug: 'misasa-izanro-iwasaki',
    status: 'hold_partial_scope',
    reason: '일부 욕장/객실 단위 원천가케나가시 표면은 있으나 숙소 전체 배지로 승격할 범위 검산이 필요합니다.',
  },
  {
    slug: 'misasa-mansuirou',
    status: 'hold_partial_or_mixed_operation',
    reason: '자가원천 100%와 가온/가수 표면이 함께 있어 직수 배지보다 수동 판정이 먼저 필요합니다.',
  },
  {
    slug: 'shirahama-kaishu',
    status: 'hold_partial_room_type',
    reason: '일부 객실/이탈 객실은 원천가케나가시이나 다른 객실은 끓인 물 표기가 있어 자동 승격하지 않습니다.',
  },
  {
    slug: 'shirahama-key-terrace',
    status: 'hold_partial_public_bath',
    reason: '특정 공용탕 원천가케나가시 표면으로 보여 숙소 전체 직수 배지 전 범위 검산이 필요합니다.',
  },
  {
    slug: 'shirahama-sanrakuso',
    status: 'hold_partial_room_type',
    reason: '원천가케나가시 객실 표면은 있으나 일부 객실/욕장 범위 분리가 필요합니다.',
  },
  {
    slug: 'kaike-yugetsu',
    status: 'exclude_conflict',
    reason: '로컬 조사에서 가케나가시가 아니라는 표면이 확인되어 직수 후보에서 제외합니다.',
  },
  {
    slug: 'toba-kisara-bettei-toki',
    status: 'exclude_conflict',
    reason: '로컬 조사에서 가케나가시가 아니라는 표면이 확인되어 직수 후보에서 제외합니다.',
  },
  {
    slug: 'yufuin_previous_copy_candidates',
    status: 'hold_previous_copy_only',
    reason: '과거 문구에 직수 표현이 있던 유후인 숙소군은 원문 공식/후기 근거를 다시 묶기 전까지 자동 복원하지 않습니다.',
  },
];

const secondPassManualReviewCandidates = [
  {
    slug: 'hakone-fontainebleau',
    status: 'hold_review_heavy',
    reason: '가케나가시 리뷰 신호는 많지만 이번 스캔에서 공식 표면 문장이 충분히 분리되지 않아 보류합니다.',
  },
  {
    slug: 'beppu-kannawa-bettei',
    status: 'hold_review_heavy',
    reason: 'Jalan 직접 리뷰에 원천가케나가시가 반복되지만 공식 표면 근거를 더 분리해야 합니다.',
  },
  {
    slug: 'yufuin-kounokura',
    status: 'hold_review_heavy',
    reason: '리뷰/플랜명 신호는 강하지만 공식 시설 표면 검산 후 승격하는 편이 안전합니다.',
  },
  {
    slug: 'ureshino-shiibasanso',
    status: 'hold_room_type_specific',
    reason: '源泉100%かけ流し 표기가 객실 타입/플랜명 중심으로 보여 객실 타입 caveat를 더 정리해야 합니다.',
  },
  {
    slug: 'beppu-bettei-haruki',
    status: 'hold_review_or_plan_signal',
    reason: '리뷰와 일부 표면 신호는 있으나 공식 전 범위 근거가 부족합니다.',
  },
  {
    slug: 'misasa-izanro-iwasaki',
    status: 'hold_partial_scope',
    reason: '일부 욕장/객실 단위 원천가케나가시 표면은 있으나 숙소 전체 배지로 승격할 범위 검산이 필요합니다.',
  },
  {
    slug: 'shirahama-sanrakuso',
    status: 'hold_partial_room_type',
    reason: '원천가케나가시 객실 표면은 있으나 일부 객실/욕장 범위 분리가 필요합니다.',
  },
  {
    slug: 'shirahama-kaishu',
    status: 'hold_partial_room_type',
    reason: '일부 객실/이탈 객실은 원천가케나가시이나 다른 객실은 끓인 물 표기가 있어 자동 승격하지 않습니다.',
  },
  {
    slug: 'misasa-mansuirou',
    status: 'hold_partial_or_mixed_operation',
    reason: '자가원천 100%와 가온/가수 표면이 함께 있어 직수 배지보다 수동 판정이 먼저 필요합니다.',
  },
  {
    slug: 'tamatsukuri-konya',
    status: 'exclude_conflict',
    reason: 'Yukoyuko와 Japan Onsen Association 표면이 충돌하여 직수 후보에서 제외합니다.',
  },
];

const confirmedSourceRules = isSecondPass ? secondPassConfirmedSourceRules : firstPassConfirmedSourceRules;
const manualReviewCandidates = isSecondPass ? secondPassManualReviewCandidates : firstPassManualReviewCandidates;

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

function readEnv() {
  return {
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
    ...parseEnvFile(path.join(repoRoot, 'apps/web/.env.local')),
    ...parseEnvFile(path.join(repoRoot, 'apps/admin/.env.local')),
    ...process.env,
  };
}

function dbConfig() {
  const env = readEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL;
  const restUrl = (env.CONTENT_DB_REST_URL || (supabaseUrl ? `${supabaseUrl}/rest/v1` : '')).replace(/\/+$/, '');
  const serviceKey = env.CONTENT_DB_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!restUrl || !serviceKey) throw new Error('Missing CONTENT_DB_REST_URL/SUPABASE_URL or CONTENT_DB_SERVICE_ROLE_KEY.');
  return { restUrl, serviceKey };
}

async function requestJson(config, table, params = {}) {
  const url = new URL(`${config.restUrl}/${table}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    headers: {
      apikey: config.serviceKey,
      authorization: `Bearer ${config.serviceKey}`,
      accept: 'application/json',
    },
  });
  if (!response.ok) throw new Error(`${table} read failed: ${response.status} ${await response.text()}`);
  return response.json();
}

async function patchRows(config, table, filters, body) {
  const url = new URL(`${config.restUrl}/${table}`);
  for (const [key, value] of Object.entries(filters)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: config.serviceKey,
      authorization: `Bearer ${config.serviceKey}`,
      accept: 'application/json',
      'content-type': 'application/json',
      prefer: 'return=representation',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${table} patch failed: ${response.status} ${await response.text()}`);
  return response.json();
}

function readJson(filePath) {
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function readText(filePath) {
  if (!existsSync(filePath)) return '';
  return readFileSync(filePath, 'utf8');
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim()) : [];
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function sqlString(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

function buildSlugsParam(slugs) {
  return `in.(${slugs.join(',')})`;
}

function sourceFlowFact(rule) {
  return {
    code: 'water_kakenagashi',
    label: '원천 100% 직수',
    status: 'confirmed',
    value: rule.fact_value,
    source: rule.source_file,
  };
}

function mergeFactStatuses(existing, fact) {
  const values = Array.isArray(existing) ? existing.filter((item) => item && typeof item === 'object') : [];
  return [fact, ...values.filter((item) => item.code !== fact.code)];
}

function addOperationNote(notes, nextNote) {
  const values = normalizeArray(notes);
  if (values.some((note) => note.includes('직수') || note.includes('가케나가시') || note.includes('掛け流し'))) return values;
  return unique([...values, nextNote]);
}

function validateRule(rule, row) {
  if (!row) return { ok: false, reason: 'DB active row not found.' };
  const sourcePath = path.join(repoRoot, rule.source_file);
  if (!existsSync(sourcePath)) return { ok: false, reason: `Source file not found: ${rule.source_file}` };

  if (rule.validation === 'previous_seed_free_flowing_source') {
    const seed = readJson(path.join(repoRoot, 'research/onsen-db-seed/onsen_reviewed_seed_2026-07-07.json'));
    const previous = seed?.accommodations?.find((item) => item.slug === rule.slug);
    if (previous?.water_source_type === 'free_flowing_source' && normalizeArray(previous.water_criteria).includes('direct_source')) return { ok: true };
    return { ok: false, reason: 'Previous reviewed seed does not contain free_flowing_source + direct_source.' };
  }

  if (rule.validation === 'ja_name_contains_source_flow') {
    const jaName = `${row.ja_name ?? ''} ${row.name_ja ?? ''}`;
    if (/源泉.*(?:かけ流し|掛け流し|掛流)|(?:かけ流し|掛け流し|掛流).*源泉/.test(jaName)) return { ok: true };
    return { ok: false, reason: 'Japanese name does not contain source-flow wording.' };
  }

  if (rule.validation === 'local_summary_contains_official_source_flow') {
    const sourceText = readText(sourcePath);
    if (/百割源泉/.test(sourceText) && /源泉百%|源泉100%|掛け流し|かけ流し/.test(sourceText)) return { ok: true };
    return { ok: false, reason: 'Local summary does not contain official source-flow wording.' };
  }

  if (rule.validation === 'source_file_contains_patterns') {
    const sourceText = readText(sourcePath);
    const missing = normalizeArray(rule.required_patterns).filter((pattern) => !sourceText.includes(pattern));
    if (missing.length === 0) return { ok: true };
    return { ok: false, reason: `Source file is missing required patterns: ${missing.join(', ')}` };
  }

  return { ok: false, reason: `Unknown validation: ${rule.validation}` };
}

function buildUpdates(rule, accommodation, verdict) {
  const criteria = unique(['spring_confirmed', 'direct_source', ...normalizeArray(accommodation.water_criteria)]);
  const operationNotes = addOperationNote(accommodation.operation_notes, rule.operation_note);
  const factStatuses = mergeFactStatuses(verdict?.fact_statuses, sourceFlowFact(rule));

  return {
    slug: rule.slug,
    name: accommodation.display_name_ko || accommodation.name,
    ja_name: accommodation.ja_name,
    evidence_type: rule.evidence_type,
    evidence_keyword: rule.evidence_keyword,
    source_file: rule.source_file,
    previous: {
      water_use_status: accommodation.water_use_status,
      water_source_type: accommodation.water_source_type,
      water_criteria: normalizeArray(accommodation.water_criteria),
      operation_notes: normalizeArray(accommodation.operation_notes),
      fact_statuses: Array.isArray(verdict?.fact_statuses) ? verdict.fact_statuses : [],
    },
    next: {
      accommodation_patch: {
        water_use_status: 'official_confirmed',
        water_source_type: 'free_flowing_source',
        water_criteria: criteria,
        operation_notes: operationNotes,
        content_updated_at: seedDate,
      },
      verdict_patch: {
        fact_statuses: factStatuses,
      },
    },
  };
}

function buildSql(updates) {
  const lines = ['BEGIN;'];

  for (const update of updates) {
    const accommodation = update.next.accommodation_patch;
    const verdict = update.next.verdict_patch;
    lines.push('');
    lines.push(`-- ${update.slug}: ${update.evidence_keyword}`);
    lines.push(`UPDATE public.onsen_accommodations`);
    lines.push(`SET water_use_status = ${sqlString(accommodation.water_use_status)},`);
    lines.push(`    water_source_type = ${sqlString(accommodation.water_source_type)},`);
    lines.push(`    water_criteria = ${sqlJson(accommodation.water_criteria)},`);
    lines.push(`    operation_notes = ${sqlJson(accommodation.operation_notes)},`);
    lines.push(`    content_updated_at = ${sqlString(accommodation.content_updated_at)},`);
    lines.push(`    updated_at = NOW()`);
    lines.push(`WHERE slug = ${sqlString(update.slug)};`);
    lines.push('');
    lines.push(`UPDATE public.onsen_verdicts`);
    lines.push(`SET fact_statuses = ${sqlJson(verdict.fact_statuses)},`);
    lines.push(`    updated_at = NOW()`);
    lines.push(`WHERE target_type = 'accommodation' AND target_slug = ${sqlString(update.slug)};`);
  }

  lines.push('');
  lines.push('COMMIT;');
  lines.push('');
  return lines.join('\n');
}

function buildReport(result) {
  const lines = [
    '# 원천 방식 리컨실리에이션 리포트',
    '',
    `작성일: ${seedDate}`,
    '',
    '## 요약',
    '',
    `- DB 반영 모드: ${result.apply_mode ? '적용 완료' : '드라이런'}`,
    `- 자동 확정 업데이트: ${result.confirmed_updates.length}곳`,
    `- 수동 검토 후보: ${result.manual_review_candidates.length}건`,
    `- 원칙: 원천가케나가시/직수는 공식 표면 또는 이전 검증 seed가 있는 경우만 배지로 복원합니다.`,
    '',
    '## 자동 확정 업데이트',
    '',
    '| slug | 숙소명 | 이전 | 변경 | 근거 |',
    '|---|---|---|---|---|',
    ...result.confirmed_updates.map((item) =>
      [
        item.slug,
        item.name,
        `${item.previous.water_source_type} / ${item.previous.water_criteria.join(', ')}`,
        `${item.next.accommodation_patch.water_source_type} / ${item.next.accommodation_patch.water_criteria.join(', ')}`,
        `${item.evidence_keyword} (${item.source_file})`,
      ]
        .map((value) => String(value).replace(/\|/g, '/'))
        .join(' | ')
        .replace(/^/, '| ')
        .replace(/$/, ' |')
    ),
    '',
    '## 수동 검토 후보',
    '',
    '| slug | status | reason |',
    '|---|---|---|',
    ...result.manual_review_candidates.map((item) => `| ${item.slug} | ${item.status} | ${item.reason} |`),
    '',
    '## 적용 메모',
    '',
    '- `100% 천연온천`은 변별력이 약한 마케팅 표기가 될 수 있어 이번 복원 대상에서 제외했습니다.',
    '- `원천 100% 직수` 배지는 숙소 전체 모든 욕조가 직수라는 뜻이 아니라, 확인된 온천수 운용 축에 대한 강한 근거가 있다는 뜻으로 사용합니다.',
    '- 객실 타입별로 끓인 물/온천/직수가 섞인 숙소는 operation_notes에 조건을 남기고, 다음 QA에서 bath_area 단위 판정을 분리해야 합니다.',
    '',
  ];
  return lines.join('\n');
}

async function main() {
  const config = dbConfig();
  const slugs = confirmedSourceRules.map((rule) => rule.slug);
  const accommodations = await requestJson(config, 'onsen_accommodations', {
    select: 'slug,name,display_name_ko,ja_name,name_ja,water_use_status,water_source_type,water_criteria,operation_notes,status',
    status: 'eq.active',
    slug: buildSlugsParam(slugs),
  });
  const verdicts = await requestJson(config, 'onsen_verdicts', {
    select: 'target_slug,level,status,fact_statuses,source_file',
    target_type: 'eq.accommodation',
    status: 'eq.published',
    target_slug: buildSlugsParam(slugs),
  });
  const accommodationBySlug = new Map(accommodations.map((row) => [row.slug, row]));
  const verdictBySlug = new Map(verdicts.map((row) => [row.target_slug, row]));
  const validationFailures = [];
  const updates = [];

  for (const rule of confirmedSourceRules) {
    const accommodation = accommodationBySlug.get(rule.slug);
    const validation = validateRule(rule, accommodation);
    if (!validation.ok) {
      validationFailures.push({ slug: rule.slug, reason: validation.reason });
      continue;
    }
    updates.push(buildUpdates(rule, accommodation, verdictBySlug.get(rule.slug)));
  }

  if (validationFailures.length > 0) {
    throw new Error(`Source-flow validation failed: ${JSON.stringify(validationFailures, null, 2)}`);
  }

  const applied = [];
  if (shouldApply) {
    for (const update of updates) {
      const accommodationRows = await patchRows(config, 'onsen_accommodations', { slug: `eq.${update.slug}` }, update.next.accommodation_patch);
      const verdictRows = await patchRows(
        config,
        'onsen_verdicts',
        { target_type: 'eq.accommodation', target_slug: `eq.${update.slug}` },
        update.next.verdict_patch
      );
      applied.push({
        slug: update.slug,
        accommodation_rows: accommodationRows.length,
        verdict_rows: verdictRows.length,
      });
    }
  }

  const result = {
    generated_at: new Date().toISOString(),
    apply_mode: shouldApply,
    seed_date: seedDate,
    confirmed_updates: updates,
    manual_review_candidates: manualReviewCandidates,
    applied,
  };

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputJsonPath, `${JSON.stringify(result, null, 2)}\n`);
  await writeFile(outputSqlPath, buildSql(updates));
  await writeFile(outputReportPath, buildReport(result));

  console.log(`Generated: ${path.relative(repoRoot, outputJsonPath)}`);
  console.log(`Generated: ${path.relative(repoRoot, outputSqlPath)}`);
  console.log(`Generated: ${path.relative(repoRoot, outputReportPath)}`);
  console.log(`Confirmed updates: ${updates.length}`);
  if (shouldApply) console.log(`Applied rows: ${JSON.stringify(applied)}`);
  else console.log('Dry run only. Re-run with --apply to patch DB.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
