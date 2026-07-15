#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const researchDate = '2026-07-13';
const targetCount = 100;
const facilityTargetCount = 48;
const accommodationTargetCount = targetCount - facilityTargetCount;
const outputDir = path.join(repoRoot, 'research', 'onsen-db-seed', 'decision-goal-2026-07-13-goal100');
const overridePath = path.join(outputDir, 'accommodation_day_use_official_checks_2026-07-13.json');
const excludedAccommodationSlugs = new Set([
  'echigo-yuzawa-quattro',
]);

const questionOrder = [
  'together_private_eligibility',
  'bath_layout_scope',
  'private_bath_booking_flow',
  'private_bath_terms_limits',
  'day_use_operation',
  'bath_experience_richness',
  'water_operation_method',
];

const questionLabels = {
  together_private_eligibility: '동반·프라이빗 이용',
  bath_layout_scope: '객실탕·대절탕·공용탕 구성',
  private_bath_booking_flow: '프라이빗탕 이용 방식',
  private_bath_terms_limits: '프라이빗탕 요금·시간·대상',
  day_use_operation: '당일입욕 운영',
  bath_experience_richness: '탕 경험의 밀도',
  water_operation_method: '온천수 방식·조건',
};

const mappingRoots = [
  'research/onsen-review-signals',
  'research/onsen-candidates',
  'research/onsen-deep-research',
];

const officialUrlKeys = new Set([
  'official_url',
  'official_site_url',
  'official_site',
  'official_spa_url',
  'official_onsen_url',
  'official_hotspring_url',
  'official_hot_spring_url',
  'official_room_url',
  'official_rooms_url',
  'rooms_url',
  'room_url',
  'hotspring_url',
  'hotsprings_url',
  'hotspa_url',
  'facilities_url',
  'faq_url',
  'official_current_url',
]);

function parseEnv(filePath) {
  if (!existsSync(filePath)) return {};
  return Object.fromEntries(readFileSync(filePath, 'utf8').split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (!match) return [];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    return [[match[1], value]];
  }));
}

function readConfig() {
  const env = { ...parseEnv(path.join(repoRoot, '.env.local')), ...process.env };
  const supabaseUrl = (env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
  const restUrl = (env.CONTENT_DB_REST_URL || (supabaseUrl ? `${supabaseUrl}/rest/v1` : '')).replace(/\/+$/, '');
  const apiKey = env.CONTENT_DB_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!restUrl || !apiKey) throw new Error('Supabase REST URL and service role key are required.');
  return { restUrl, apiKey };
}

async function readRows(config, table, select) {
  const url = new URL(`${config.restUrl}/${table}`);
  url.searchParams.set('select', select);
  url.searchParams.set('limit', '1000');
  const response = await fetch(url, {
    headers: { apikey: config.apiKey, authorization: `Bearer ${config.apiKey}` },
  });
  if (!response.ok) throw new Error(`${table} read failed: ${response.status} ${await response.text()}`);
  return response.json();
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function answer(status, answerKo, options = {}) {
  return {
    status,
    applicability: options.applicability ?? 'applicable',
    answer_ko: answerKo,
    check_what: options.checkWhat ?? null,
    official_source_url: options.url ?? null,
    official_source_checked_at: options.checkedAt ?? (options.url ? researchDate : null),
    official_original_text: options.original ?? null,
    source_file: options.sourceFile ?? null,
  };
}

function needsCheck(answerKo, checkWhat) {
  return answer('needs_check', answerKo, { checkWhat });
}

function indexBy(rows, key) {
  const result = new Map();
  for (const row of rows) result.set(row[key], [...(result.get(row[key]) ?? []), row]);
  return result;
}

function latestBy(rows, key) {
  return [...rows].sort((left, right) => String(right[key] ?? '').localeCompare(String(left[key] ?? '')))[0];
}

function listMappingFiles(directory, output = []) {
  if (!existsSync(directory)) return output;
  for (const name of readdirSync(directory)) {
    const filePath = path.join(directory, name);
    const stats = statSync(filePath);
    if (stats.isDirectory()) listMappingFiles(filePath, output);
    else if (name.includes('platform_mapping') && name.endsWith('.json') && stats.size < 8_000_000) output.push(filePath);
  }
  return output;
}

function collectOfficialUrls(value, output = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectOfficialUrls(item, output);
    return output;
  }
  if (!isRecord(value)) return output;
  for (const [key, child] of Object.entries(value)) {
    if (officialUrlKeys.has(key) && typeof child === 'string' && child.startsWith('http')) output.push(child);
    if ((key === 'official_source_urls' || key === 'official_urls') && Array.isArray(child)) {
      output.push(...child.filter((item) => typeof item === 'string' && item.startsWith('http')));
    }
    if (isRecord(child) || Array.isArray(child)) collectOfficialUrls(child, output);
  }
  return output;
}

function findResearchNode(value, slug, slugHint) {
  const candidates = [];
  function visit(node) {
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    if (!isRecord(node)) return;
    const nodeSlug = node.slug || node.candidate_slug || node.accommodation_slug || node.identity?.candidate_slug || slugHint;
    if (nodeSlug === slug && (isRecord(node.official_bath_facts_seen) || isRecord(node.identity))) candidates.push(node);
    for (const child of Object.values(node)) if (isRecord(child) || Array.isArray(child)) visit(child);
  }
  visit(value);
  return candidates.find((candidate) => isRecord(candidate.official_bath_facts_seen)) ?? candidates[0] ?? value;
}

function buildAccommodationResearchIndex(accommodationSlugs) {
  const result = new Map();
  const mappingFiles = mappingRoots.flatMap((root) => listMappingFiles(path.join(repoRoot, root)));
  for (const filePath of mappingFiles) {
    let payload;
    try {
      payload = JSON.parse(readFileSync(filePath, 'utf8'));
    } catch {
      continue;
    }
    const parentSlug = path.basename(path.dirname(filePath));
    const slug = payload.candidate_slug
      || payload.slug
      || payload.identity?.candidate_slug
      || payload.lodgings?.[0]?.slug
      || payload.accommodations?.[0]?.slug
      || (accommodationSlugs.has(parentSlug) ? parentSlug : null);
    if (!slug || !accommodationSlugs.has(slug)) continue;
    const node = findResearchNode(payload, slug, parentSlug);
    const bathFacts = isRecord(node.official_bath_facts_seen) ? node.official_bath_facts_seen : {};
    const urls = [...new Set([...collectOfficialUrls(node), ...collectOfficialUrls(payload)])];
    const date = node.research_date || payload.research_date || filePath.match(/2026-07-\d{2}/)?.[0] || '';
    const record = {
      slug,
      research_date: date,
      official_url: urls[0] ?? null,
      official_urls: urls,
      bath_facts: bathFacts,
      source_file: path.relative(repoRoot, filePath),
    };
    const current = result.get(slug);
    if (!current || String(record.research_date).localeCompare(String(current.research_date)) >= 0) result.set(slug, record);
  }
  return result;
}

function flattenEvidence(value) {
  if (Array.isArray(value)) return value.flatMap(flattenEvidence);
  if (isRecord(value)) return Object.values(value).flatMap(flattenEvidence);
  return typeof value === 'string' ? [value.trim()] : [];
}

function fieldEvidence(record, expression) {
  return Object.entries(record ?? {})
    .filter(([key]) => expression.test(key))
    .flatMap(([, value]) => flattenEvidence(value))
    .filter(Boolean);
}

function isPositiveBathEvidence(value) {
  if (!value) return false;
  const normalized = value.toLowerCase().replaceAll('_', ' ');
  if (/not (confirmed|captured|found|checked|seen|available)|unclear|unknown|미확인|확정하지|未確認/.test(normalized)) return false;
  return /(客室|部屋|露天|貸切|家族|room|private|family|open.air|온천|객실|대절|가족탕)/i.test(value);
}

function summarize(values, fallback) {
  const text = values.filter(Boolean).join(' / ').replace(/\s+/g, ' ').trim();
  return text ? text.slice(0, 360) : fallback;
}

function bathFactText(record, key) {
  return flattenEvidence(record?.[key]).join(' ').replace(/\s+/g, ' ').trim();
}

function bathFactSeen(record, key) {
  const value = record?.[key];
  if (typeof value === 'boolean') return value;
  if (isRecord(value) && typeof value.seen === 'boolean') return value.seen;
  const text = bathFactText(record, key);
  if (!text) return null;
  if (/^not\b|^no (?:ordinary|official|clear|separate|shared|large|public|private|family|reservable)\b|not(?:[_ ]+(?:clearly|separately))?[_ ]?(?:confirmed|captured|found|checked|seen|available|claimed|emphasized)|not fully (?:locked|normalized|exposed|confirmed)|unclear|unknown|not found|미확인|확인하지|확인되지|확인하지 못|확정하지|전제로 하지|분리하지|없음|아님|일반화하지|ございません|確認できず|確認されず|未確認|なし/i.test(text)) return false;
  if (/private|family/i.test(key) && /(객실 안|객실탕|guest[- ]room|in[- ]room|room bath).*(문맥|context|refer|merge|전용)/i.test(text)) return false;
  return true;
}

function bathFactAllRooms(record, key) {
  const value = record?.[key];
  if (isRecord(value) && value.scope === 'all_rooms') return true;
  const text = bathFactText(record, key);
  if (!text || /some[_ ]rooms|일부|not all|전 객실 아님|객실별.*다르|not[_ ]?confirmed|확인하지/i.test(text)) return false;
  return /all(?:[_ ]+\d+)?[_ ]+(?:detached[_ ]+)?(?:guest[- _]?)?rooms|all_rooms|全(?:ての)?客室|全\d+室|전 객실/i.test(text);
}

function readOverrides() {
  if (!existsSync(overridePath)) return new Map();
  const payload = JSON.parse(readFileSync(overridePath, 'utf8'));
  return new Map(safeArray(payload.checks).map((row) => [row.slug, row]));
}

function selectCandidates({ accommodations, facilities, verdicts, decisionAnswers, researchIndex }) {
  const verdictReady = new Set(verdicts
    .filter((row) => row.status === 'published' && safeArray(row.items).length >= 2)
    .map((row) => `${row.target_type}:${row.target_slug}`));
  const currentAnswerGroups = indexBy(decisionAnswers, 'target_slug');
  const selectedFacilities = facilities
    .filter((row) => verdictReady.has(`facility:${row.slug}`))
    .sort((left, right) => Number(right.status === 'active') - Number(left.status === 'active') || left.slug.localeCompare(right.slug));
  if (selectedFacilities.length !== facilityTargetCount) {
    throw new Error(`Expected ${facilityTargetCount} verdict-ready facilities, received ${selectedFacilities.length}.`);
  }

  const rankedAccommodations = accommodations
    .filter((row) => verdictReady.has(`accommodation:${row.slug}`) && !excludedAccommodationSlugs.has(row.slug))
    .map((row) => {
      const research = researchIndex.get(row.slug);
      const bathEvidence = fieldEvidence(research?.bath_facts, /(room.*bath|room_open|private_bath|family_bath|all_rooms)/i);
      const evidenceCounts = isRecord(row.evidence_counts) ? row.evidence_counts : {};
      const privateMentions = Number(evidenceCounts.privateBathMentionCount ?? 0);
      const roomMentions = Number(evidenceCounts.roomBathMentionCount ?? 0);
      const currentRows = (currentAnswerGroups.get(row.slug) ?? []).filter((answerRow) => answerRow.target_type === 'accommodation');
      const currentReady = currentRows.length === questionOrder.length
        && currentRows.every((answerRow) => answerRow.target_readiness !== 'hold');
      const hasOfficialPrivateBath = bathEvidence.some(isPositiveBathEvidence)
        || currentReady;
      return {
        ...row,
        research,
        currentReady,
        hasOfficialPrivateBath,
        score: Number(currentReady) * 10_000_000
          + (roomMentions + privateMentions) * 1_000
          + Number(evidenceCounts.onsenReviewCount ?? 0) * 10
          + Number(evidenceCounts.directReviewCount ?? 0),
      };
    })
    .filter((row) => row.currentReady || (row.research?.official_url && row.hasOfficialPrivateBath))
    .sort((left, right) => right.score - left.score || left.slug.localeCompare(right.slug));

  const selectedAccommodations = [];
  const areaCounts = new Map();
  for (const row of rankedAccommodations) {
    const area = row.onsen_area || row.region || 'other';
    if (!row.currentReady && (areaCounts.get(area) ?? 0) >= 10) continue;
    selectedAccommodations.push(row);
    areaCounts.set(area, (areaCounts.get(area) ?? 0) + 1);
    if (selectedAccommodations.length === accommodationTargetCount) break;
  }
  if (selectedAccommodations.length !== accommodationTargetCount) {
    throw new Error(`Expected ${accommodationTargetCount} accommodations, received ${selectedAccommodations.length}.`);
  }
  return { selectedAccommodations, selectedFacilities, verdictReady, currentAnswerGroups };
}

function normalizeExistingAnswers(candidate, rows) {
  return rows.map((row) => ({
    target_type: row.target_type,
    slug: row.target_slug,
    name_ko: candidate.display_name_ko || candidate.name || candidate.name_ko,
    journey: row.journey,
    question_code: row.question_code,
    question_ko: questionLabels[row.question_code],
    status: row.answer_status,
    applicability: row.applicability,
    answer_ko: row.answer_ko,
    check_what: row.check_what,
    official_source_url: row.official_source_url,
    official_source_checked_at: row.official_source_checked_at,
    official_original_text: null,
    target_readiness: row.target_readiness,
    source_file: row.source_file,
  }));
}

const facilityBathAreaLabels = Object.freeze({
  public_bath: '공용탕',
  indoor_public_bath: '내탕',
  open_air_public_bath: '노천탕',
  private_bath: '대절탕',
  family_bath: '대절탕',
  sauna: '사우나',
  stone_sauna: '암반욕',
  sand_bath: '모래찜질',
  steam_bath: '증기탕',
  footbath: '족욕',
  jet_bath: '제트탕',
  sleeping_bath: '침탕',
  water_bath: '냉탕',
  pottery_bath: '항아리탕',
  carbonated_bath: '탄산탕',
  electric_bath: '전기탕',
  silk_bath: '실크탕',
  temperature_separated_indoor_tubs: '온도별 내탕',
  kaburiyu: '가부리유',
  utaseyu_or_kabuseyu_review_confirmed: '타격탕',
  drinking_spring: '음천장',
});

function facilityBathLabels(candidate, facts) {
  const profile = isRecord(candidate.official_profile) ? candidate.official_profile : {};
  const codes = [
    ...safeArray(profile.bath_areas),
    ...facts
      .filter((row) => row.filter_status === 'ready' && row.availability !== 'not_available')
      .map((row) => row.filter_code),
  ];
  const labels = codes
    .map((code) => facilityBathAreaLabels[String(code).trim().toLowerCase()] ?? null)
    .filter(Boolean);
  return [...new Set(labels.length > 0 ? labels : ['공용 온천탕'])];
}

function normalizeExistingFacilityAnswers(candidate, rows, facts) {
  const labels = facilityBathLabels(candidate, facts);
  const composition = labels.join(' · ');
  return normalizeExistingAnswers(candidate, rows).map((row) => {
    const hasInternalWording = /\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b| \/ |후보|신호|비교 축|기대차|공식 원장|성인형 휴식 수요/i.test(row.answer_ko);
    if (row.question_code === 'bath_layout_scope' && hasInternalWording) {
      return { ...row, answer_ko: `공식 안내 기준 욕장 구성은 ${composition}입니다.` };
    }
    if (row.question_code === 'bath_experience_richness') {
      return { ...row, answer_ko: `확인된 목욕 선택지는 ${composition}입니다.` };
    }
    if (row.question_code === 'water_operation_method') {
      return {
        ...row,
        answer_ko: row.answer_ko
          .replace(/\bsource[_ ]?100[_ ]?kakenagashi\b/gi, '순수직수')
          .replace(/\bkakenagashi\b/gi, '직수')
          .replace(/\bcirculation\b/gi, '순환식'),
      };
    }
    return row;
  });
}

function currentOfficialSource(facts, fallbackUrl, fallbackDate) {
  const source = facts.find((row) => row.official_source_url) ?? null;
  return {
    url: source?.official_source_url ?? fallbackUrl,
    checkedAt: source?.official_source_checked_at ?? fallbackDate ?? researchDate,
    original: source?.official_original_text ?? null,
    sourceFile: source?.source_file ?? null,
  };
}

function facilityQuestions(candidate, facts, waterFacts) {
  const readyFacts = facts.filter((row) => row.filter_status === 'ready');
  const privateFact = readyFacts.find((row) => ['private_bath', 'family_bath'].includes(row.filter_code));
  const dayUseFact = readyFacts.find((row) => row.filter_code === 'day_use');
  const priceFact = readyFacts.find((row) => row.filter_code === 'adult_day_use_price');
  const featureFacts = readyFacts.filter((row) => [
    'open_air_bath', 'sauna', 'stone_sauna', 'sand_bath', 'steam_bath', 'jet_bath', 'sleeping_bath', 'water_bath', 'rest_area',
  ].includes(row.filter_code));
  const profile = isRecord(candidate.official_profile) ? candidate.official_profile : {};
  const profileFacts = safeArray(profile.official_facts);
  const profileSource = profileFacts.find((row) => row.source_url)?.source_url ?? candidate.official_url;
  const sourceDate = candidate.official_checked_at ?? researchDate;
  const privateSource = currentOfficialSource(privateFact ? [privateFact] : [], profileSource, sourceDate);
  const daySource = currentOfficialSource(dayUseFact ? [dayUseFact] : [], candidate.official_url, sourceDate);
  const layoutSource = profileFacts.find((row) => row.source_url) ?? null;
  const privateValue = isRecord(privateFact?.filter_value) ? privateFact.filter_value : {};
  const privateNotAvailable = privateFact?.availability === 'not_available';
  const hasPrivate = Boolean(privateFact && !privateNotAvailable);
  const bookingDetails = [
    privateValue.booking_channel_ko,
    privateValue.reservation,
    typeof privateValue.reservation_required === 'boolean'
      ? (privateValue.reservation_required ? '예약 필요' : '사전예약 불필요')
      : null,
    privateValue.vacancy_check_method,
  ].filter(Boolean);
  const termDetails = [
    privateValue.duration_minutes ? `${privateValue.duration_minutes}분` : null,
    privateValue.minimum_minutes ? `${privateValue.minimum_minutes}분부터` : null,
    privateValue.room_fee_jpy ? `${privateValue.room_fee_jpy}엔` : null,
    privateValue.price_jpy ? `${privateValue.price_jpy}엔` : null,
    privateValue.capacity ? `${privateValue.capacity}명` : null,
  ].filter(Boolean);
  const dayValue = isRecord(dayUseFact?.filter_value) ? dayUseFact.filter_value : {};
  const priceValue = isRecord(priceFact?.filter_value) ? priceFact.filter_value : {};
  const dayDetails = [
    dayValue.hours || dayValue.facility_hours || dayValue.reception,
    dayValue.last_admission ? `최종 입장 ${dayValue.last_admission}` : null,
    priceValue.amount_jpy ? `성인 ${priceValue.amount_jpy}엔` : null,
  ].filter(Boolean);
  const bathAreas = safeArray(profile.bath_areas);
  const richness = profile.product_strength
    || [...bathAreas, ...featureFacts.map((row) => row.scope_label_ko || row.filter_code)].join('·')
    || candidate.facility_type;
  const water = waterFacts.find((row) => row.official_source_url && row.official_original_text);
  const noPrivateCopy = '공식 욕장 안내에서 가족탕·대절탕을 별도 이용 상품으로 확인하지 못했습니다. 이 시설은 공용 입욕을 전제로 비교합니다.';

  return {
    together_private_eligibility: privateNotAvailable
      ? answer('verified', '공식 안내상 가족탕·대절탕을 제공하지 않아 동행인만 쓰는 프라이빗 입욕은 적용되지 않습니다.', { ...privateSource, applicability: 'not_applicable' })
      : hasPrivate
        ? answer(privateFact.availability === 'conditional' ? 'conditional' : 'verified', '공식 안내된 가족탕·대절탕을 동행인과 프라이빗하게 이용할 수 있습니다.', privateSource)
        : answer('conditional', noPrivateCopy, { url: profileSource, checkedAt: sourceDate, checkWhat: '신규 가족탕·대절탕 운영 여부는 방문 전 공식 안내에서 다시 확인합니다.' }),
    bath_layout_scope: answer('verified', `공식 안내 기준 ${summarize([profile.product_strength, ...bathAreas], '공용 입욕 중심의 욕장 구성')}입니다.`, {
      url: layoutSource?.source_url ?? profileSource,
      checkedAt: String(layoutSource?.checked_at ?? sourceDate).slice(0, 10),
      original: layoutSource?.fact ?? null,
      sourceFile: candidate.source_file,
    }),
    private_bath_booking_flow: privateNotAvailable
      ? answer('verified', '가족탕·대절탕이 없어 별도 예약 절차는 적용되지 않습니다.', { ...privateSource, applicability: 'not_applicable' })
      : hasPrivate
        ? answer(bookingDetails.length > 0 ? 'verified' : 'conditional', bookingDetails.length > 0 ? `이용 방식은 ${bookingDetails.join(', ')}입니다.` : '가족탕·대절탕은 확인되지만 예약 채널과 당일 접수 방식은 방문 전 확인해야 합니다.', { ...privateSource, checkWhat: bookingDetails.length > 0 ? null : '사전예약·현장접수·빈 탕 이용 중 어떤 방식인지 확인합니다.' })
        : answer('conditional', '현재 공식 욕장 안내에 가족탕·대절탕 예약 상품이 보이지 않아 별도 예약 절차를 전제로 하지 않습니다.', { url: profileSource, checkedAt: sourceDate, checkWhat: '운영 변경 여부는 공식 안내에서 재확인합니다.' }),
    private_bath_terms_limits: privateNotAvailable
      ? answer('verified', '가족탕·대절탕이 없어 별도 요금·시간·정원 조건은 적용되지 않습니다.', { ...privateSource, applicability: 'not_applicable' })
      : hasPrivate
        ? answer(termDetails.length > 0 ? 'verified' : 'conditional', termDetails.length > 0 ? `확인된 이용 조건은 ${termDetails.join(', ')}입니다.` : '가족탕·대절탕의 최신 요금·시간·정원은 예약 전에 확인해야 합니다.', { ...privateSource, checkWhat: termDetails.length > 0 ? null : '최신 요금·이용 시간·정원을 확인합니다.' })
        : answer('conditional', '현재 공식 욕장 안내에 가족탕·대절탕 별도 요금·시간 항목이 보이지 않습니다.', { url: profileSource, checkedAt: sourceDate, checkWhat: '운영 변경 여부는 공식 안내에서 재확인합니다.' }),
    day_use_operation: dayUseFact
      ? answer(dayUseFact.availability === 'conditional' ? 'conditional' : 'verified', dayUseFact.availability === 'not_available' ? '공식 안내상 당일입욕을 제공하지 않습니다.' : `당일입욕은 ${dayDetails.length > 0 ? dayDetails.join(', ') : '공식 운영 안내 기준'}으로 이용합니다.`, { ...daySource, checkWhat: dayUseFact.availability === 'conditional' ? '방문일의 영업시간·요금·입장 제한을 다시 확인합니다.' : null })
      : answer('conditional', '비숙박 온천시설로 현장 입욕을 운영하지만, 최신 영업시간·입장료는 공식 페이지에서 방문일 기준으로 확인해야 합니다.', { url: candidate.official_url, checkedAt: sourceDate, checkWhat: '방문일의 영업시간·마지막 입장·휴관일·요금을 확인합니다.' }),
    bath_experience_richness: answer('verified', `이 시설의 핵심 목욕 경험은 ${richness}입니다.`, {
      url: layoutSource?.source_url ?? profileSource,
      checkedAt: String(layoutSource?.checked_at ?? sourceDate).slice(0, 10),
      original: layoutSource?.fact ?? featureFacts[0]?.official_original_text ?? null,
      sourceFile: candidate.source_file,
    }),
    water_operation_method: water
      ? answer(water.method_render_status === 'ready' ? 'verified' : 'conditional', water.method_render_status === 'ready' && water.water_system ? `공식 원문 기준 ${water.water_system} 방식입니다.` : '공식 수질·운용 원문은 확인했지만 욕장별 가수·가온·순환·소독 범위가 완결되지 않아 방식 배지는 보류합니다.', {
        url: water.official_source_url,
        checkedAt: water.official_source_checked_at,
        original: water.official_original_text,
        sourceFile: water.source_file,
        checkWhat: water.method_render_status === 'ready' ? null : '욕장별 가수·가온·순환·소독 조건을 확인합니다.',
      })
      : needsCheck('온천수 방식은 공식 원문과 욕장 범위가 충분하지 않아 배지를 공개하지 않습니다.', '직수·순환·가수·가온·소독 조건을 욕장별 공식 원문으로 확인합니다.'),
  };
}

function accommodationQuestions(candidate, research, facts, dayUseOverride) {
  const bathFacts = research?.bath_facts ?? {};
  const privateEvidence = fieldEvidence(bathFacts, /(room.*bath|room_open|private_bath|family_bath|all_rooms)/i).filter(isPositiveBathEvidence);
  const layoutEvidence = fieldEvidence(bathFacts, /(room.*bath|room_open|private_bath|family_bath|public_bath|open_air_public|all_rooms)/i);
  const waterEvidence = fieldEvidence(bathFacts, /(source.flow|water.handl|water.treat|circulation|add.water|add.*heat|源泉|かけ流し)/i)
    .filter((value) => !/not[_ ](?:confirmed|captured|found|checked|seen)|unknown|unclear/i.test(value));
  const sourceUrl = research?.official_url;
  const sourceDate = research?.research_date || researchDate;
  const sourceFile = research?.source_file;
  const roomFact = facts.find((row) => row.filter_status === 'ready' && row.filter_code === 'private_bath');
  const familyFact = facts.find((row) => row.filter_status === 'ready' && row.filter_code === 'family_bath');
  const dayUseFact = facts.find((row) => row.filter_status === 'ready' && row.filter_code === 'day_use');
  const bathFact = roomFact ?? familyFact;
  const factSource = currentOfficialSource(bathFact ? [bathFact] : [], sourceUrl, sourceDate);
  const roomStates = ['room_bath', 'room_open_air_bath'].map((key) => bathFactSeen(bathFacts, key));
  const sharedStates = ['private_bath', 'family_bath', 'private_bath_or_family_bath'].map((key) => bathFactSeen(bathFacts, key));
  const publicStates = ['public_bath', 'open_air_public_bath'].map((key) => bathFactSeen(bathFacts, key));
  const hasRoomBath = roomStates.some(Boolean)
    || (roomStates.every((value) => value === null) && Boolean(roomFact || privateEvidence.some((value) => /(객실|客室|room|部屋)/i.test(value))));
  const hasSharedPrivateBath = sharedStates.some(Boolean)
    || (sharedStates.every((value) => value === null) && Boolean(familyFact || privateEvidence.some((value) => /(대절|가족|貸切|家族|private|family)/i.test(value))));
  const hasPublicBath = publicStates.some(Boolean)
    || (publicStates.every((value) => value === null) && /대욕장|공용/.test(candidate.primary_bath || ''));
  const allRooms = hasRoomBath && (
    bathFacts.all_rooms_room_bath === true
    || bathFacts.all_rooms_room_open_air === true
    || ['room_bath', 'room_open_air_bath'].some((key) => bathFactAllRooms(bathFacts, key))
  );
  const fallbackBathLabel = /객실/.test(candidate.primary_bath || '')
    ? '객실탕'
    : /대절|가족/.test(candidate.primary_bath || '')
      ? '대절탕'
      : /대욕장|공용/.test(candidate.primary_bath || '')
        ? '대욕장'
        : '온천 욕장';
  const bathLabels = [...new Set([
    hasRoomBath ? (allRooms ? '전 객실 객실탕' : '일부 객실 객실탕') : null,
    hasSharedPrivateBath ? '대절탕' : null,
    hasPublicBath ? '대욕장' : null,
  ].filter(Boolean))];
  if (bathLabels.length === 0) bathLabels.push(fallbackBathLabel);
  const layoutCopy = bathLabels.join(' · ');
  const journey = hasRoomBath || hasSharedPrivateBath ? '연인과 함께 쓰는 프라이빗 온천' : '탕 자체가 목적인 온천 숙소';
  const daySource = dayUseFact ? currentOfficialSource([dayUseFact], sourceUrl, sourceDate) : null;
  const override = dayUseOverride;
  const dayUseAnswer = dayUseFact
    ? answer(dayUseFact.availability === 'conditional' ? 'conditional' : 'verified', dayUseFact.availability === 'not_available' ? '공식 안내상 당일입욕을 제공하지 않습니다.' : '공식 안내에서 당일입욕 또는 당일 플랜 운영을 확인했습니다.', { ...daySource, checkWhat: dayUseFact.availability === 'conditional' ? '현재 판매일·시간·요금을 공식 예약 화면에서 확인합니다.' : null })
    : override
      ? answer(override.status || 'conditional', override.answer_ko, {
        url: override.official_source_url,
        checkedAt: override.official_source_checked_at,
        original: override.official_original_text,
        sourceFile: path.relative(repoRoot, overridePath),
        checkWhat: override.check_what,
      })
      : needsCheck('당일입욕 또는 당일 플랜의 현재 운영 여부를 아직 공식 판매·FAQ 표면에서 잠그지 못했습니다.', '공식 FAQ·예약 페이지에서 당일입욕 제공 여부와 판매 조건을 확인합니다.');

  return {
    journey,
    questions: {
      together_private_eligibility: answer(allRooms ? 'verified' : 'conditional', hasRoomBath ? `${allRooms ? '전 객실' : '해당 객실 타입'}의 객실탕을 예약하면 동행인과 객실 안에서 프라이빗하게 이용할 수 있습니다.` : '공식 안내된 가족탕·대절탕을 동행인과 프라이빗하게 이용할 수 있습니다.', { ...factSource, original: factSource.original ?? privateEvidence[0], checkWhat: allRooms ? null : '예약하려는 객실 타입 또는 대절탕 이용 대상을 확인합니다.', sourceFile }),
      bath_layout_scope: answer('verified', `공식 안내 기준 목욕 구성은 ${layoutCopy}입니다.`, { url: sourceUrl, checkedAt: sourceDate, original: layoutEvidence[0], sourceFile }),
      private_bath_booking_flow: answer(hasRoomBath && !hasSharedPrivateBath ? 'verified' : 'conditional', hasRoomBath && hasSharedPrivateBath ? '객실탕은 온천탕이 포함된 객실 타입을 예약해 이용합니다. 대절탕은 별도 예약·접수 방식이 적용될 수 있습니다.' : hasRoomBath ? '객실탕은 온천탕이 포함된 객실 타입을 예약하면 함께 제공됩니다.' : '가족탕·대절탕 운영은 확인되지만 예약 시점·채널은 예약 전에 다시 확인해야 합니다.', { ...factSource, original: factSource.original ?? privateEvidence[0], checkWhat: hasRoomBath && !hasSharedPrivateBath ? '예약 화면에서 선택한 객실에 온천탕이 포함되는지 확인합니다.' : '대절탕의 사전예약·현장접수·빈 탕 이용 방식을 확인합니다.', sourceFile }),
      private_bath_terms_limits: answer('conditional', hasRoomBath && hasSharedPrivateBath ? '객실탕은 해당 객실의 숙박 조건에 포함됩니다. 대절탕의 요금·시간·정원은 별도로 확인해야 합니다.' : hasRoomBath ? '객실탕은 해당 객실의 숙박 조건에 포함됩니다. 실제 요금과 이용 시간은 객실 타입·플랜에 따라 달라집니다.' : '가족탕·대절탕의 최신 요금·시간·정원은 예약 전에 확인해야 합니다.', { ...factSource, original: factSource.original ?? privateEvidence[0], checkWhat: hasRoomBath && hasSharedPrivateBath ? '객실별 온천탕 포함 여부와 대절탕 요금·이용 시간·정원을 확인합니다.' : hasRoomBath ? '객실별 온천탕 포함 여부와 체크인·체크아웃 기준 이용 시간을 확인합니다.' : '요금·이용 시간·정원을 확인합니다.', sourceFile }),
      day_use_operation: dayUseAnswer,
      bath_experience_richness: answer('verified', `확인된 목욕 선택지는 ${layoutCopy}입니다.`, { url: sourceUrl, checkedAt: sourceDate, original: layoutEvidence[0], sourceFile }),
      water_operation_method: waterEvidence.length > 0
        ? answer('conditional', '공식 조사 원문에서 온천수 운용 표기는 확인했지만, 욕장별 가수·가온·순환·소독 범위가 완결되지 않아 방식 배지는 보류합니다.', { url: sourceUrl, checkedAt: sourceDate, original: waterEvidence[0], sourceFile, checkWhat: '가수·가온·순환·소독 조건과 적용 욕장을 확인합니다.' })
        : needsCheck('온천수 방식은 공식 원문과 욕장 범위가 충분하지 않아 배지를 공개하지 않습니다.', '직수·순환·가수·가온·소독 조건을 욕장별 공식 원문으로 확인합니다.'),
    },
  };
}

function readiness(questions) {
  const answered = questionOrder.filter((code) => questions[code]?.status !== 'needs_check').length;
  const p0Codes = ['private_bath_booking_flow', 'private_bath_terms_limits', 'day_use_operation'];
  const p0NeedsCheck = p0Codes.filter((code) => questions[code]?.applicability !== 'not_applicable' && questions[code]?.status === 'needs_check');
  const conditional = questionOrder.filter((code) => questions[code]?.status === 'conditional').length;
  return {
    answered,
    p0_needs_check: p0NeedsCheck,
    target_readiness: answered >= 6 && p0NeedsCheck.length === 0 ? (conditional > 0 ? 'conditional' : 'ready') : 'hold',
  };
}

function rowsForCandidate(candidate, targetType, journey, questions) {
  const qa = readiness(questions);
  return questionOrder.map((code) => ({
    target_type: targetType,
    slug: candidate.slug,
    name_ko: candidate.display_name_ko || candidate.name || candidate.name_ko,
    journey,
    question_code: code,
    question_ko: questionLabels[code],
    ...questions[code],
    target_readiness: qa.target_readiness,
  }));
}

function markdownTable(rows, headers) {
  const line = (values) => `| ${values.map((value) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', '<br>')).join(' | ')} |`;
  return [line(headers), line(headers.map(() => '---')), ...rows.map((row) => line(headers.map((header) => row[header])))].join('\n');
}

async function main() {
  const config = readConfig();
  const [
    accommodations,
    facilities,
    verdicts,
    decisionAnswers,
    accommodationFacts,
    facilityFacts,
    facilityWaterFacts,
  ] = await Promise.all([
    readRows(config, 'onsen_accommodations', 'slug,name,display_name_ko,status,region,region_group,prefecture,onsen_area,primary_bath,bath_scope,water_use_status,water_source_type,evidence_counts,evidence_grade,source_file'),
    readRows(config, 'onsen_facilities', 'slug,name_ko,status,region_group,prefecture,onsen_area,facility_type,facility_model,official_url,official_profile,official_checked_at,source_file'),
    readRows(config, 'onsen_verdicts', 'target_type,target_slug,status,level,items'),
    readRows(config, 'onsen_decision_answers', 'target_type,target_slug,journey,question_code,answer_status,applicability,answer_ko,check_what,official_source_url,official_source_checked_at,target_readiness,source_file'),
    readRows(config, 'onsen_accommodation_official_filter_facts', 'accommodation_slug,filter_code,scope_key,scope_label_ko,availability,filter_status,filter_value,official_original_text,official_source_url,official_source_checked_at,source_file'),
    readRows(config, 'onsen_facility_official_filter_facts', 'facility_slug,filter_code,scope_key,scope_label_ko,availability,filter_status,filter_value,official_original_text,official_source_url,official_source_checked_at,source_file'),
    readRows(config, 'onsen_facility_water_facts', 'facility_slug,scope_key,scope_label_ko,water_system,kasui,kaon,disinfection,method_render_status,official_original_text,official_source_url,official_source_checked_at,source_file'),
  ]);

  const researchIndex = buildAccommodationResearchIndex(new Set(accommodations.map((row) => row.slug)));
  const overrides = readOverrides();
  const selected = selectCandidates({ accommodations, facilities, verdicts, decisionAnswers, researchIndex });
  const accommodationFactsBySlug = indexBy(accommodationFacts, 'accommodation_slug');
  const facilityFactsBySlug = indexBy(facilityFacts, 'facility_slug');
  const waterFactsBySlug = indexBy(facilityWaterFacts, 'facility_slug');
  const matrix = [];

  for (const candidate of selected.selectedAccommodations) {
    const existingRows = (selected.currentAnswerGroups.get(candidate.slug) ?? [])
      .filter((row) => row.target_type === 'accommodation');
    if (candidate.currentReady && existingRows.length === questionOrder.length && !overrides.has(candidate.slug)) {
      matrix.push(...normalizeExistingAnswers(candidate, existingRows));
      continue;
    }
    const generated = accommodationQuestions(
      candidate,
      researchIndex.get(candidate.slug),
      accommodationFactsBySlug.get(candidate.slug) ?? [],
      overrides.get(candidate.slug),
    );
    matrix.push(...rowsForCandidate(candidate, 'accommodation', generated.journey, generated.questions));
  }

  for (const candidate of selected.selectedFacilities) {
    const existingRows = (selected.currentAnswerGroups.get(candidate.slug) ?? [])
      .filter((row) => row.target_type === 'facility');
    if (existingRows.length === questionOrder.length && existingRows.every((row) => row.target_readiness !== 'hold')) {
      matrix.push(...normalizeExistingFacilityAnswers(
        candidate,
        existingRows,
        facilityFactsBySlug.get(candidate.slug) ?? [],
      ));
      continue;
    }
    const questions = facilityQuestions(
      candidate,
      facilityFactsBySlug.get(candidate.slug) ?? [],
      waterFactsBySlug.get(candidate.slug) ?? [],
    );
    matrix.push(...rowsForCandidate(candidate, 'facility', '여행 중 몇 시간 들르는 온천시설', questions));
  }

  const grouped = indexBy(matrix.map((row) => ({ ...row, target_key: `${row.target_type}:${row.slug}` })), 'target_key');
  const qaRows = [...grouped].map(([target, rows]) => {
    const questions = Object.fromEntries(rows.map((row) => [row.question_code, row]));
    const qa = readiness(questions);
    return {
      target,
      target_type: rows[0].target_type,
      slug: rows[0].slug,
      name_ko: rows[0].name_ko,
      answered: qa.answered,
      p0_needs_check: qa.p0_needs_check.join(', '),
      readiness: qa.target_readiness,
      source_count: new Set(rows.map((row) => row.official_source_url).filter(Boolean)).size,
    };
  });
  const readyRows = qaRows.filter((row) => row.readiness !== 'hold');
  const researchQueue = matrix
    .filter((row) => row.target_type === 'accommodation' && row.question_code === 'day_use_operation' && row.status === 'needs_check')
    .map((row) => ({
      slug: row.slug,
      name_ko: row.name_ko,
      official_url: researchIndex.get(row.slug)?.official_url ?? null,
      query: `${row.name_ko} 日帰り入浴 デイユース 公式`,
      required_evidence: '공식 FAQ·당일 플랜·예약 페이지 또는 현재 공식 판매 표면의 미등재 확인',
      source_file: researchIndex.get(row.slug)?.source_file ?? null,
    }));

  const verdictReadyKeys = new Set(verdicts
    .filter((row) => row.status === 'published' && safeArray(row.items).length >= 2)
    .map((row) => `${row.target_type}:${row.target_slug}`));
  const findings = [];
  if (grouped.size !== targetCount) findings.push(`target_count=${grouped.size}`);
  if (matrix.length !== targetCount * questionOrder.length) findings.push(`matrix_rows=${matrix.length}`);
  if (qaRows.some((row) => !verdictReadyKeys.has(row.target))) findings.push('verdict_not_ready_target');
  for (const [target, rows] of grouped) {
    const codes = new Set(rows.map((row) => row.question_code));
    if (rows.length !== questionOrder.length || questionOrder.some((code) => !codes.has(code))) findings.push(`incomplete_questions:${target}`);
    for (const row of rows) {
      if (row.status !== 'needs_check' && (!row.official_source_url || !row.official_source_checked_at)) findings.push(`missing_official_source:${target}:${row.question_code}`);
    }
  }

  mkdirSync(outputDir, { recursive: true });
  const selectedTargets = qaRows.map((row) => ({
    target_type: row.target_type,
    slug: row.slug,
    name_ko: row.name_ko,
    readiness: row.readiness,
    answered: `${row.answered}/7`,
    source_count: row.source_count,
  }));
  writeFileSync(path.join(outputDir, 'goal100_candidate_selection_2026-07-13.json'), `${JSON.stringify({
    research_date: researchDate,
    public_ready_definition: '7-question set complete; at least 6 answered; no P0 needs_check; published verdict with at least 2 items',
    target_count: targetCount,
    accommodation_count: accommodationTargetCount,
    facility_count: facilityTargetCount,
    targets: selectedTargets,
  }, null, 2)}\n`);
  writeFileSync(path.join(outputDir, 'goal100_research_queue_2026-07-13.json'), `${JSON.stringify({ research_date: researchDate, queue: researchQueue }, null, 2)}\n`);
  writeFileSync(path.join(outputDir, 'decision_completeness_goal100_2026-07-13.json'), `${JSON.stringify({ research_date: researchDate, matrix }, null, 2)}\n`);
  writeFileSync(path.join(outputDir, 'goal100_qa_2026-07-13.json'), `${JSON.stringify({
    research_date: researchDate,
    passed: findings.length === 0 && readyRows.length === targetCount,
    target_count: qaRows.length,
    public_ready_count: readyRows.length,
    hold_count: qaRows.length - readyRows.length,
    pending_day_use_checks: researchQueue.length,
    findings,
    targets: qaRows,
  }, null, 2)}\n`);
  writeFileSync(path.join(outputDir, 'goal100_report_2026-07-13.md'), `# 온천 결정 완성도 100곳 진행 보고서\n\n- 기준일: ${researchDate}\n- 후보: ${qaRows.length}곳 (숙소 ${accommodationTargetCount}, 시설 ${facilityTargetCount})\n- 현재 공개 ready: ${readyRows.length}곳\n- 공식 당일 이용 재확인 대기: ${researchQueue.length}곳\n- QA finding: ${findings.length}건\n\n## 후보 상태\n\n${markdownTable(selectedTargets, ['target_type', 'slug', 'name_ko', 'readiness', 'answered', 'source_count'])}\n\n## 남은 공식 확인\n\n${researchQueue.length === 0 ? '남은 당일 이용 확인이 없습니다.' : markdownTable(researchQueue, ['slug', 'name_ko', 'official_url', 'required_evidence'])}\n`);

  console.log(JSON.stringify({
    selected: qaRows.length,
    accommodations: selected.selectedAccommodations.length,
    facilities: selected.selectedFacilities.length,
    publicReady: readyRows.length,
    hold: qaRows.length - readyRows.length,
    pendingDayUseChecks: researchQueue.length,
    findings,
    outputDir: path.relative(repoRoot, outputDir),
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});
