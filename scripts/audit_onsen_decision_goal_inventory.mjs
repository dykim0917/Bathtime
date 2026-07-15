#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const auditDate = process.argv.find((argument) => argument.startsWith('--date='))?.slice('--date='.length) ?? '2026-07-13';
const outputDir = path.join(repoRoot, 'research', 'onsen-db-seed', `decision-goal-${auditDate}`);

function parseEnv(filePath) {
  if (!existsSync(filePath)) return {};
  return Object.fromEntries(readFileSync(filePath, 'utf8').split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (!match) return [];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    return [[match[1], value]];
  }));
}

function readConfig() {
  const env = { ...parseEnv(path.join(repoRoot, '.env.local')), ...process.env };
  const supabaseUrl = (env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
  const restUrl = (env.CONTENT_DB_REST_URL || (supabaseUrl ? `${supabaseUrl}/rest/v1` : '')).replace(/\/+$/, '');
  const apiKey = env.CONTENT_DB_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!restUrl || !apiKey) throw new Error('Supabase REST URL과 API key가 필요합니다.');
  return { restUrl, apiKey };
}

async function readRows(config, table, select, filters = {}) {
  const url = new URL(`${config.restUrl}/${table}`);
  url.searchParams.set('select', select);
  url.searchParams.set('limit', '1000');
  for (const [key, value] of Object.entries(filters)) url.searchParams.set(key, value);
  const response = await fetch(url, { headers: { apikey: config.apiKey, authorization: `Bearer ${config.apiKey}` } });
  if (!response.ok) throw new Error(`${table} 읽기 실패: ${response.status} ${await response.text()}`);
  return response.json();
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function csvEscape(value) {
  const text = value === undefined || value === null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(filePath, rows, headers) {
  const lines = [headers.join(','), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(','))];
  writeFileSync(filePath, `${lines.join('\n')}\n`);
}

function indexBy(rows, key) {
  const map = new Map();
  for (const row of rows) {
    const value = row[key];
    if (!map.has(value)) map.set(value, []);
    map.get(value).push(row);
  }
  return map;
}

function readyFacts(facts) {
  return facts.filter((fact) => fact.filter_status === 'ready');
}

function factFor(facts, codes) {
  return facts.find((fact) => codes.includes(fact.filter_code));
}

function availabilityStatus(fact) {
  if (!fact) return 'needs_check';
  if (fact.availability === 'conditional') return 'conditional';
  return 'verified';
}

function factValue(fact) {
  return isRecord(fact?.filter_value) ? fact.filter_value : {};
}

function hasPrivateTerms(facts) {
  const fact = factFor(facts, ['private_bath', 'family_bath']);
  if (!fact) return 'needs_check';
  const value = factValue(fact);
  const keys = ['duration_minutes', 'minutes', 'usage_limit_minutes', 'room_fee_jpy', 'per_hour_jpy', 'price_jpy', 'capacity', 'max_people', 'uses_per_stay'];
  return keys.some((key) => value[key] !== undefined && value[key] !== null && value[key] !== '') ? availabilityStatus(fact) : 'needs_check';
}

function hasPrivateBookingFlow(facts) {
  const fact = factFor(facts, ['private_bath', 'family_bath']);
  if (!fact) return 'needs_check';
  const value = factValue(fact);
  const keys = ['reservation', 'reservation_required', 'same_day_reservation_only', 'vacancy_check_method', 'vacancy_check', 'booking_channel'];
  return keys.some((key) => value[key] !== undefined && value[key] !== null && value[key] !== '') ? availabilityStatus(fact) : 'needs_check';
}

function hasDayUseOperation(facts) {
  const fact = factFor(facts, ['day_use']);
  if (!fact) return 'needs_check';
  const value = factValue(fact);
  const hasOperation = ['hours', 'facility_hours', 'opens_at', 'closes_at', 'reception', 'last_entry', 'last_admission', 'final_reception']
    .some((key) => value[key] !== undefined && value[key] !== null && value[key] !== '');
  if (fact.availability === 'not_available') return 'verified';
  return hasOperation ? availabilityStatus(fact) : 'needs_check';
}

function hasBathRichness(facts, profile, legacyBath) {
  const areas = isRecord(profile) && Array.isArray(profile.bath_areas) ? profile.bath_areas : [];
  const featureCodes = ['open_air_bath', 'sauna', 'stone_sauna', 'sand_bath', 'steam_bath', 'jet_bath', 'sleeping_bath', 'water_bath', 'rest_area'];
  if (areas.length > 1 || facts.some((fact) => featureCodes.includes(fact.filter_code))) return 'verified';
  return legacyBath ? 'conditional' : 'needs_check';
}

function hasWaterFact(waterFacts) {
  return waterFacts.some((fact) => fact.official_original_text && fact.official_source_url && fact.official_source_checked_at)
    ? 'verified'
    : 'needs_check';
}

function countStatuses(questionStatuses) {
  const values = Object.values(questionStatuses);
  return {
    verified: values.filter((value) => value === 'verified').length,
    conditional: values.filter((value) => value === 'conditional').length,
    needs_check: values.filter((value) => value === 'needs_check').length,
    decision_answers: values.filter((value) => value === 'verified' || value === 'conditional').length,
  };
}

function accommodationAudit(row, facts) {
  const ready = readyFacts(facts);
  const privateFact = factFor(ready, ['private_bath', 'family_bath']);
  const publicFact = factFor(ready, ['open_air_bath']);
  const legacyBath = [row.primary_bath, row.bath_scope].filter(Boolean).join(' ');
  const questions = {
    together_private_eligibility: availabilityStatus(privateFact),
    bath_layout_scope: legacyBath ? 'conditional' : 'needs_check',
    private_bath_booking_flow: hasPrivateBookingFlow(ready),
    private_bath_terms_limits: hasPrivateTerms(ready),
    day_use_operation: hasDayUseOperation(ready),
    bath_experience_richness: hasBathRichness(ready, null, legacyBath),
    water_operation_method: row.water_use_status === 'official_confirmed' && row.water_source_type !== 'needs_check' ? 'conditional' : 'needs_check',
  };
  const counts = isRecord(row.evidence_counts) ? row.evidence_counts : {};
  return {
    target_type: 'accommodation',
    slug: row.slug,
    name_ko: row.display_name_ko || row.name,
    name_ja: row.name_ja || row.ja_name || '',
    region_group: row.region_group || '',
    prefecture: row.prefecture || '',
    onsen_area: row.onsen_area || row.region || '',
    status: row.status,
    direct_reviews: Number(counts.directReviewCount ?? 0),
    onsen_related_direct_reviews: Number(counts.onsenReviewCount ?? 0),
    official_fact_count: ready.length,
    water_fact_count: 0,
    official_url_count: new Set(ready.map((fact) => fact.official_source_url).filter(Boolean)).size,
    legacy_bath_scope: row.bath_scope || '',
    legacy_water_source_type: row.water_source_type || '',
    questions,
    ...countStatuses(questions),
  };
}

function facilityAudit(row, facts, waterFacts, evidenceRows) {
  const ready = readyFacts(facts);
  const privateFact = factFor(ready, ['private_bath', 'family_bath']);
  const profile = isRecord(row.official_profile) ? row.official_profile : {};
  const areas = Array.isArray(profile.bath_areas) ? profile.bath_areas : [];
  const evidence = [...evidenceRows].sort((a, b) => String(b.collected_on).localeCompare(String(a.collected_on)))[0];
  const questions = {
    together_private_eligibility: availabilityStatus(privateFact),
    bath_layout_scope: areas.length > 0 || ready.some((fact) => ['open_air_bath', 'private_bath', 'family_bath'].includes(fact.filter_code)) ? 'verified' : 'needs_check',
    private_bath_booking_flow: hasPrivateBookingFlow(ready),
    private_bath_terms_limits: hasPrivateTerms(ready),
    day_use_operation: hasDayUseOperation(ready),
    bath_experience_richness: hasBathRichness(ready, profile, ''),
    water_operation_method: hasWaterFact(waterFacts),
  };
  return {
    target_type: 'facility',
    slug: row.slug,
    name_ko: row.name_ko,
    name_ja: row.name_ja,
    region_group: row.region_group || '',
    prefecture: row.prefecture || '',
    onsen_area: row.onsen_area || '',
    status: row.status,
    direct_reviews: Number(evidence?.facility_related_direct_reviews ?? 0),
    onsen_related_direct_reviews: Number(evidence?.dayuse_only_direct_reviews ?? 0),
    official_fact_count: ready.length,
    water_fact_count: waterFacts.length,
    official_url_count: new Set([
      row.official_url,
      ...ready.map((fact) => fact.official_source_url),
      ...waterFacts.map((fact) => fact.official_source_url),
    ].filter(Boolean)).size,
    legacy_bath_scope: Array.isArray(areas) ? areas.join('|') : '',
    legacy_water_source_type: '',
    questions,
    ...countStatuses(questions),
  };
}

function markdownTable(rows, headers) {
  const line = (values) => `| ${values.map((value) => String(value ?? '').replaceAll('|', '\\|')).join(' | ')} |`;
  return [line(headers), line(headers.map(() => '---')), ...rows.map((row) => line(headers.map((header) => row[header])))].join('\n');
}

async function main() {
  const config = readConfig();
  const [accommodations, facilities, accommodationFacts, facilityFacts, facilityWaterFacts, facilityEvidence] = await Promise.all([
    readRows(config, 'onsen_accommodations', 'slug,name,ja_name,display_name_ko,name_ja,region,region_group,prefecture,onsen_area,primary_bath,bath_scope,water_use_status,water_source_type,evidence_counts,status', { status: 'eq.active' }),
    readRows(config, 'onsen_facilities', 'slug,name_ko,name_ja,region_group,prefecture,onsen_area,facility_type,facility_model,official_url,official_profile,status', { status: 'eq.active' }),
    readRows(config, 'onsen_accommodation_official_filter_facts', 'accommodation_slug,filter_code,scope_key,availability,filter_status,filter_value,official_source_url,official_source_checked_at'),
    readRows(config, 'onsen_facility_official_filter_facts', 'facility_slug,filter_code,scope_key,availability,filter_status,filter_value,official_source_url,official_source_checked_at'),
    readRows(config, 'onsen_facility_water_facts', 'facility_slug,scope_key,water_system,kasui,kaon,disinfection,method_render_status,official_original_text,official_source_url,official_source_checked_at'),
    readRows(config, 'onsen_facility_review_evidence', 'facility_slug,collected_on,facility_related_direct_reviews,dayuse_only_direct_reviews,direct_body_platform_count,evidence_grade,collection_readiness'),
  ]);

  const accommodationFactsBySlug = indexBy(accommodationFacts, 'accommodation_slug');
  const facilityFactsBySlug = indexBy(facilityFacts, 'facility_slug');
  const waterFactsBySlug = indexBy(facilityWaterFacts, 'facility_slug');
  const evidenceBySlug = indexBy(facilityEvidence, 'facility_slug');
  const rows = [
    ...accommodations.map((row) => accommodationAudit(row, accommodationFactsBySlug.get(row.slug) ?? [])),
    ...facilities.map((row) => facilityAudit(row, facilityFactsBySlug.get(row.slug) ?? [], waterFactsBySlug.get(row.slug) ?? [], evidenceBySlug.get(row.slug) ?? [])),
  ].sort((a, b) => b.decision_answers - a.decision_answers || b.official_fact_count - a.official_fact_count || a.slug.localeCompare(b.slug));

  const questionCodes = [
    'together_private_eligibility',
    'bath_layout_scope',
    'private_bath_booking_flow',
    'private_bath_terms_limits',
    'day_use_operation',
    'bath_experience_richness',
    'water_operation_method',
  ];
  const csvRows = rows.map((row) => ({
    ...row,
    questions: undefined,
    ...Object.fromEntries(questionCodes.map((code) => [code, row.questions[code]])),
  }));

  mkdirSync(outputDir, { recursive: true });
  const jsonPath = path.join(outputDir, `active_inventory_audit_${auditDate}.json`);
  const csvPath = path.join(outputDir, `active_inventory_audit_${auditDate}.csv`);
  const mdPath = path.join(outputDir, `active_inventory_audit_${auditDate}.md`);
  writeFileSync(jsonPath, `${JSON.stringify({ audit_date: auditDate, rows }, null, 2)}\n`);
  writeCsv(csvPath, csvRows, [
    'target_type', 'slug', 'name_ko', 'name_ja', 'region_group', 'prefecture', 'onsen_area', 'status',
    'direct_reviews', 'onsen_related_direct_reviews', 'official_fact_count', 'water_fact_count', 'official_url_count',
    'legacy_bath_scope', 'legacy_water_source_type', 'verified', 'conditional', 'needs_check', 'decision_answers', ...questionCodes,
  ]);

  const entitySummary = ['accommodation', 'facility'].map((targetType) => {
    const subset = rows.filter((row) => row.target_type === targetType);
    return {
      target_type: targetType === 'accommodation' ? '숙소' : '온천시설',
      active_rows: subset.length,
      average_decision_answers: (subset.reduce((sum, row) => sum + row.decision_answers, 0) / Math.max(subset.length, 1)).toFixed(1),
      rows_with_six_answers: subset.filter((row) => row.decision_answers >= 6).length,
      ready_official_facts: subset.reduce((sum, row) => sum + row.official_fact_count, 0),
    };
  });
  const topRows = rows.slice(0, 30).map((row) => ({
    target_type: row.target_type === 'accommodation' ? '숙소' : '시설',
    slug: `\`${row.slug}\``,
    name: row.name_ko,
    answers: `${row.decision_answers}/7`,
    official_facts: row.official_fact_count,
    direct_reviews: row.direct_reviews,
    gaps: questionCodes.filter((code) => row.questions[code] === 'needs_check').join(', ') || '없음',
  }));
  const markdown = `# 활성 온천 재고 결정 완성도 감사\n\n- 기준일: ${auditDate}\n- 범위: 운영 DB의 active 숙소·온천시설\n- 원칙: 플랫폼 노출 후기 수는 이 감사의 직접 후기 수에 넣지 않았습니다. 숙소와 시설은 각자의 공식 사실 테이블에서만 읽었습니다.\n\n## 재고 요약\n\n${markdownTable(entitySummary, ['target_type', 'active_rows', 'average_decision_answers', 'rows_with_six_answers', 'ready_official_facts'])}\n\n## 임시 상위 재고\n\n아래 순서는 한국 수요나 최종 선정 결과가 아니라, 이미 구조화된 결정 답변 수를 기준으로 한 감사용 정렬입니다.\n\n${markdownTable(topRows, ['target_type', 'slug', 'name', 'answers', 'official_facts', 'direct_reviews', 'gaps'])}\n\n## 다음 단계\n\n1. 이 감사에서 나온 재고를 한국 수요 근거와 결합해 40곳 longlist를 구성합니다.\n2. needs_check은 추정하지 않고 공식 원문·범위·확인일을 보강합니다.\n3. 최종 30곳은 7문항 중 최소 6개가 verified 또는 명확한 conditional일 때만 ready/conditional로 분류합니다.\n`;
  writeFileSync(mdPath, markdown);
  console.log(JSON.stringify({ json: path.relative(repoRoot, jsonPath), csv: path.relative(repoRoot, csvPath), md: path.relative(repoRoot, mdPath), rows: rows.length }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});
