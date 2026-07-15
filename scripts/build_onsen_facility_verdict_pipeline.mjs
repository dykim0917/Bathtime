import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { validateEditorialCardSummary } from './lib/onsen_card_summary_contract.mjs';

const repoRoot = process.cwd();
const runDate = process.argv.find((argument) => argument.startsWith('--run-date='))?.split('=')[1] ?? '2026-07-10';
const pipelineVersion = 'facility_verdict_v2';
const shouldApply = process.argv.includes('--apply');
const requireCardSummary = shouldApply || process.argv.includes('--require-card-summary');
const cardSummaryInput = process.argv
  .find((argument) => argument.startsWith('--card-summary-input='))
  ?.slice('--card-summary-input='.length) ?? '';
const regionGroups = process.argv
  .find((argument) => argument.startsWith('--region-groups='))
  ?.split('=')[1]
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean) ?? [];
const targetSlugs = process.argv
  .find((argument) => argument.startsWith('--target-slugs='))
  ?.split('=')[1]
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean) ?? [];
const outputKey = process.argv
  .find((argument) => argument.startsWith('--output-key='))
  ?.split('=')[1]
  .trim()
  .replace(/[^a-z0-9_-]+/gi, '_') ?? '';
const outputDir = path.join(repoRoot, 'research', 'onsen-db-seed');
const outputBase = path.join(outputDir, `onsen_facility_verdict_pipeline${outputKey ? `_${outputKey}` : ''}_${runDate}`);
const paths = {
  json: `${outputBase}.json`,
  csv: `${outputBase}.csv`,
  report: `${outputBase}.md`,
  sql: `${outputBase}.upsert.sql`,
  loadReport: `${outputBase}_load_report.md`,
};

function readCardSummarySeed() {
  if (!cardSummaryInput) return new Map();
  const inputPath = path.resolve(repoRoot, cardSummaryInput);
  const payload = JSON.parse(readFileSync(inputPath, 'utf8'));
  const records = Array.isArray(payload.records) ? payload.records : [];
  const bySlug = new Map();
  for (const record of records) {
    if (!record?.slug || !record.editorialCardSummary) throw new Error(`Invalid facility card summary record in ${cardSummaryInput}.`);
    if (bySlug.has(record.slug)) throw new Error(`Duplicate facility card summary slug: ${record.slug}`);
    bySlug.set(record.slug, record.editorialCardSummary);
  }
  return bySlug;
}

const signalLabels = {
  water_texture: '물의 감촉',
  distinctive_spring_character: '온천감',
  chlorine_smell: '소독 냄새',
  weak_onsen_feeling: '온천감 아쉬움',
  temperature_experience: '탕 온도',
  weather_season: '계절 영향',
  historic_bath_context: '역사적 목욕 공간',
  bath_variety: '탕 구성',
  sand_or_steam_experience: '특화 목욕 경험',
  family_private_bath_experience: '가족탕·대절탕',
  crowding_or_wait: '혼잡·대기',
  reservation_or_queue_confusion: '예약·입장 방식',
  cleanliness_amenities: '청결·비품',
  price_payment_value: '요금·결제',
  accessibility: '접근성',
  tourist_expectation_gap: '방문 기대 차이',
  local_user_culture: '현지 이용 분위기',
  eligibility_or_use_scope: '이용 대상·범위',
  operation_volatility: '운영 변동',
};

const areaLabels = {
  public_bath: '공용탕',
  open_air_public_bath: '노천 공용탕',
  family_bath: '가족탕',
  private_bath: '대절탕',
  sand_bath: '모래찜질',
  steam_bath: '증기탕',
  footbath: '족욕',
  drinking_spring: '음천',
  inhalation: '흡입 시설',
  sauna: '사우나',
  stone_sauna: '암반욕',
  rest_area: '휴게 공간',
  food_area: '식음 공간',
  food_steam: '온천 증기 조리',
  overnight_rest: '심야 휴식',
  route_or_pass: '온천 순례 동선',
  area_cluster: '온천 권역',
  facility_wide: '시설 전체',
  unclear: '시설 범위 미확정',
};

const archetypeLabels = {
  public_bathing: '공용 온천시설',
  experience_led: '체험형 온천시설',
  private_use: '대절 온천시설',
  mixed: '복합형 당일온천',
  route_or_pass: '온천 순례형 시설',
};

const strengthPriority = {
  historic_bath_context: 12,
  distinctive_spring_character: 11,
  water_texture: 10,
  sand_or_steam_experience: 10,
  family_private_bath_experience: 10,
  bath_variety: 9,
  cleanliness_amenities: 7,
  accessibility: 5,
  local_user_culture: 4,
};

const cautionPriority = {
  eligibility_or_use_scope: 12,
  reservation_or_queue_confusion: 11,
  crowding_or_wait: 10,
  operation_volatility: 10,
  tourist_expectation_gap: 9,
  price_payment_value: 8,
  accessibility: 7,
  cleanliness_amenities: 6,
  temperature_experience: 5,
  weather_season: 5,
  chlorine_smell: 5,
  weak_onsen_feeling: 5,
};

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split(/\n/)
      .map((line) => line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/))
      .filter(Boolean)
      .map((match) => {
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
        return [match[1], value];
      })
  );
}

function readConfig() {
  const env = { ...parseEnvFile(path.join(repoRoot, '.env.local')), ...process.env };
  const supabaseUrl = String(env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
  const restUrl = String(env.CONTENT_DB_REST_URL || (supabaseUrl ? `${supabaseUrl}/rest/v1` : '')).replace(/\/+$/, '');
  const apiKey = env.CONTENT_DB_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!restUrl || !apiKey) throw new Error('Missing Supabase REST URL or API key.');
  return { restUrl, apiKey };
}

async function request(config, table, params = {}, options = {}) {
  const url = new URL(`${config.restUrl}/${table}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      apikey: config.apiKey,
      authorization: `Bearer ${config.apiKey}`,
      accept: 'application/json',
      'content-type': 'application/json',
      ...(options.prefer ? { prefer: options.prefer } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (!response.ok) throw new Error(`${table} ${response.status}: ${await response.text()}`);
  const text = await response.text();
  return text ? JSON.parse(text) : [];
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function hasFinalConsonant(value) {
  const match = [...String(value)].reverse().find((character) => /[가-힣]/.test(character));
  if (!match) return false;
  return (match.charCodeAt(0) - 0xac00) % 28 !== 0;
}

function withTopic(value) {
  return `${value}${hasFinalConsonant(value) ? '은' : '는'}`;
}

function withSubject(value) {
  return `${value}${hasFinalConsonant(value) ? '이' : '가'}`;
}

function withObject(value) {
  return `${value}${hasFinalConsonant(value) ? '을' : '를'}`;
}

function platformLabel(value) {
  const key = String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9가-힣]+/g, '_');
  if (!key) return null;
  if (key.includes('google')) return '구글 지도';
  if (key.includes('nifty')) return '니프티온천';
  if (key.includes('jalan')) return '자란';
  if (key.includes('asoview')) return '아소뷰';
  if (key.includes('tripadvisor')) return '트립어드바이저';
  if (key.includes('fourtravel') || key.includes('4travel')) return '포트래블';
  if (key.includes('yahoo_map')) return '야후 지도';
  if (key.includes('yahoo_travel')) return '야후 트래블';
  if (key.includes('rakuten')) return '라쿠텐 트래블';
  if (key.includes('booking')) return '부킹닷컴';
  if (key.includes('sauna_ikitai')) return '사우나이키타이';
  if (key.includes('trip_com')) return '트립닷컴';
  if (key.includes('naver')) return '네이버';
  if (key.includes('tistory')) return '티스토리';
  if (key.includes('triple')) return '트리플';
  if (key.includes('waug')) return '와그';
  if (key.includes('ekiten')) return '에키텐';
  if (key.includes('gunlabo')) return '군라보';
  if (key.includes('tabelog')) return '타베로그';
  if (key.includes('japanese_blog')) return '일본 블로그';
  if (key.includes('korean_blog') || key.includes('open_web_blog')) return '한국어 블로그';
  return String(value).trim();
}

function directPlatforms(manifest) {
  return unique((Array.isArray(manifest) ? manifest : [])
    .filter((item) => Number(item?.dayuse_direct_reviews ?? item?.facility_related_direct_reviews ?? item?.direct_full_reviews ?? 0) > 0)
    .map((item) => platformLabel(item?.platform_label ?? item?.platform ?? item?.source)));
}

function latestBySlug(rows) {
  const result = new Map();
  for (const row of [...rows].sort((a, b) => String(b.collected_on).localeCompare(String(a.collected_on)))) {
    if (!result.has(row.facility_slug)) result.set(row.facility_slug, row);
  }
  return result;
}

function directionCounts(direction, count) {
  return {
    positive: direction === 'positive' ? count : 0,
    mixed: direction === 'mixed' ? count : 0,
    negative: direction === 'negative' ? count : 0,
    neutral: 0,
  };
}

function signalRank(signal) {
  const priority = signal.signal_direction === 'positive'
    ? strengthPriority[signal.signal_type] ?? 0
    : cautionPriority[signal.signal_type] ?? 0;
  return priority * 1_000_000 + signal.source_count * 100 + signal.platform_count;
}

function dedupeSignals(signals) {
  const byType = new Map();
  for (const signal of signals) {
    const current = byType.get(signal.signal_type);
    if (!current || signalRank(signal) > signalRank(current)) byType.set(signal.signal_type, signal);
  }
  return [...byType.values()];
}

function itemThreshold(level, denominator) {
  return {
    minimum: level === 'full' ? 10 : 5,
    ratio: denominator * 0.02,
  };
}

function isEligibleSignal(signal, level, denominator, directPlatformCount) {
  const count = Number(signal.source_count ?? 0);
  const thresholds = itemThreshold(level, denominator);
  return signal.signal_direction !== 'neutral'
    && ['strong_signal', 'moderate_signal', 'conflicting'].includes(signal.review_signal_status)
    && count >= thresholds.minimum
    && count >= thresholds.ratio
    && Number(signal.platform_count ?? 0) >= 2
    && Number(signal.platform_count ?? 0) <= directPlatformCount
    && count <= denominator;
}

function selectSignals(signals, level, denominator, directPlatformCount) {
  const eligible = dedupeSignals(signals.filter((signal) => isEligibleSignal(signal, level, denominator, directPlatformCount)));
  const positives = eligible.filter((signal) => signal.signal_direction === 'positive').sort((a, b) => signalRank(b) - signalRank(a));
  const cautions = eligible.filter((signal) => signal.signal_direction !== 'positive').sort((a, b) => signalRank(b) - signalRank(a));
  const targetCount = level === 'full' ? 4 : 2;
  const selected = [];
  selected.push(...positives.slice(0, level === 'full' ? 2 : 1));
  if (cautions.length > 0) selected.push(cautions[0]);
  for (const signal of [...positives.slice(level === 'full' ? 2 : 1), ...cautions.slice(1)].sort((a, b) => signalRank(b) - signalRank(a))) {
    if (selected.length >= targetCount) break;
    if (!selected.some((item) => item.signal_type === signal.signal_type)) selected.push(signal);
  }
  return selected.slice(0, targetCount);
}

function conclusionFor(signal) {
  const conditional = signal.signal_direction !== 'positive';
  const map = {
    water_texture: conditional ? '물의 감촉만으로 선택하지 말고 온도와 욕장 범위를 함께 확인하시기 바랍니다.' : '물의 감촉을 우선한다면 선택 우선순위를 높일 수 있습니다.',
    distinctive_spring_character: conditional ? '온천수의 개성과 자극 정도를 함께 고려하시기 바랍니다.' : '온천수의 개성을 우선하는 선택에 맞습니다.',
    historic_bath_context: conditional ? '현대식 편의보다 역사적 목욕 공간의 조건을 먼저 이해하시기 바랍니다.' : '역사적 목욕 공간 자체가 방문 목적이라면 우선순위를 높일 수 있습니다.',
    bath_variety: conditional ? '이용 가능한 탕 범위와 운영 시간을 먼저 확인하시기 바랍니다.' : '여러 탕을 비교해 이용하는 경험을 원할 때 맞습니다.',
    sand_or_steam_experience: conditional ? '특화 체험의 운영 시간과 이용 절차를 먼저 확인하시기 바랍니다.' : '일반 입욕과 다른 특화 목욕 경험이 목적일 때 맞습니다.',
    family_private_bath_experience: conditional ? '예약 방식과 이용 시간을 확정한 뒤 방문하시기 바랍니다.' : '동행끼리 독립된 탕을 쓰는 경험을 우선할 때 맞습니다.',
    crowding_or_wait: '혼잡을 피하려면 평일·비혼잡 시간대와 입장 현황을 확인하시기 바랍니다.',
    reservation_or_queue_confusion: '현장 방문 전에 예약·번호표·입장 절차를 공식 안내에서 확인하시기 바랍니다.',
    price_payment_value: '요금에 포함되는 목욕·휴게 범위를 확인한 뒤 선택하시기 바랍니다.',
    accessibility: conditional ? '교통편과 마지막 도보 동선을 방문 전에 확인하시기 바랍니다.' : '대중교통과 도보 접근을 우선하는 일정에 맞습니다.',
    cleanliness_amenities: conditional ? '비품 제공 범위와 시설 상태를 기대치에 맞춰 확인하시기 바랍니다.' : '목욕 전후 편의와 관리 상태를 함께 보는 선택에 맞습니다.',
    tourist_expectation_gap: '관광 명소 이미지보다 실제 목욕 범위와 운영 규칙을 먼저 확인하시기 바랍니다.',
    local_user_culture: conditional ? '현지 이용 방식과 공중목욕 예절을 확인하고 방문하시기 바랍니다.' : '지역 목욕 문화를 함께 경험하려는 일정에 맞습니다.',
    eligibility_or_use_scope: '당일입욕 대상·시간·성별 운영 조건을 공식 안내에서 확인하시기 바랍니다.',
    operation_volatility: '휴무·단축 운영·입장 마감은 방문 당일 공식 안내를 다시 확인하시기 바랍니다.',
    temperature_experience: '선호 수온과 이용 가능한 탕 구성을 함께 확인하시기 바랍니다.',
    weather_season: '계절과 날씨에 따른 노천탕 동선을 고려하시기 바랍니다.',
    chlorine_smell: '소독 냄새에 민감하다면 다른 수질 근거와 함께 판단하시기 바랍니다.',
    weak_onsen_feeling: '강한 온천감을 원한다면 공식 수질 정보와 다른 시설도 함께 비교하시기 바랍니다.',
  };
  return map[signal.signal_type] ?? '이 항목을 중요하게 본다면 방문 전에 운영 조건을 함께 확인하시기 바랍니다.';
}

function createVerdictItem(signal, order, denominator) {
  const label = signalLabels[signal.signal_type] ?? signal.signal_type;
  const area = areaLabels[signal.facility_area] ?? '시설 범위';
  const count = Number(signal.source_count);
  const direction = signal.signal_direction;
  const directionText = direction === 'positive'
    ? '긍정적으로 평가한 후기입니다.'
    : direction === 'mixed'
      ? '장점과 이용 조건이 함께 담긴 후기입니다.'
      : '불편이나 주의할 점을 담은 후기입니다.';
  const headline = direction === 'positive'
    ? `${area}의 ${withTopic(label)} 이 시설의 선택 이유입니다.`
    : direction === 'mixed'
      ? `${area}의 ${withTopic(label)} 장점과 조건을 함께 봐야 합니다.`
      : `${area}의 ${withTopic(label)} 방문 전 확인할 조건입니다.`;

  return {
    order,
    type: direction === 'positive' ? 'positive' : direction === 'mixed' ? 'conditional' : 'minor',
    headline,
    counts: {
      mentions: count,
      negative: direction === 'negative' ? count : 0,
      denominator: 'experiences_read',
      platform_count: Number(signal.platform_count),
      direction_counts: directionCounts(direction, count),
      raw_mention_count: Number(signal.mention_count),
    },
    body: `직접 읽은 시설 후기 ${denominator}건 중 ${area}의 ${withObject(label)} 다룬 후기 ${count}건이 ${signal.platform_count}개 플랫폼에 분산됩니다. ${directionText}`,
    verdict: conclusionFor(signal),
    chip_label: label,
    signal_key: signal.signal_type,
    signal_direction: direction,
    bath_area: signal.facility_area,
    adoption_status: 'adopted',
  };
}

function headlineFor(facility, items, draftReason) {
  if (draftReason) return `시설 이용 범위와 직접 근거가 공개 기준을 통과하기 전까지 판정을 보류합니다.`;
  const positive = items.find((item) => item.type === 'positive');
  const caution = items.find((item) => item.type !== 'positive');
  const archetype = archetypeLabels[facility.primary_archetype] ?? '당일온천 시설';
  if (positive && caution) return `${withSubject(positive.chip_label)} 선택 이유이고, ${withTopic(caution.chip_label)} 방문 조건인 ${archetype}입니다.`;
  if (positive) return `${positive.chip_label} 경험이 선택 이유인 ${archetype}입니다.`;
  return `${withObject(caution?.chip_label ?? '이용 조건')} 방문 전에 따져볼 ${archetype}입니다.`;
}

function draftReasonFor(facility, evidence, platformCount) {
  if (facility.official_profile?.operation_status === 'temporarily_closed_pending_reopening_notice') return 'temporarily_closed_reopening_unconfirmed';
  if (!evidence) return 'latest_review_evidence_missing';
  if (facility.cleanup_status === 'split_needed' || evidence.collection_readiness === 'scope_split') return 'dayuse_lodging_scope_split_required';
  if (evidence.collection_readiness === 'hold') return 'collection_hold';
  if (evidence.evidence_grade === 'D') return 'evidence_grade_d';
  if (Number(evidence.dayuse_only_direct_reviews ?? evidence.facility_related_direct_reviews) < 50) return 'facility_direct_reviews_below_50';
  if (platformCount < 2) return 'direct_body_platforms_below_2';
  return null;
}

function initialLevel(evidence, platformCount, draftReason) {
  if (draftReason) return 'draft';
  if (Number(evidence.dayuse_only_direct_reviews ?? evidence.facility_related_direct_reviews) >= 300 && platformCount >= 3) return 'full';
  return 'lite';
}

function createFactStatuses(facility, evidence, filterFacts, waterFacts, published) {
  const readyOfficialFacts = filterFacts.filter((fact) => fact.availability === 'confirmed' && fact.filter_status === 'ready');
  const readyWater = waterFacts.find((fact) => fact.method_render_status === 'ready' && fact.water_system);
  return [
    { code: 'facility_identity', label: '시설 정체성', status: 'confirmed', value: `${facility.facility_type} · ${facility.facility_model}`, source: facility.official_url ?? 'onsen_facilities' },
    {
      code: 'day_use_scope',
      label: '당일입욕 범위',
      status: facility.cleanup_status === 'split_needed' || evidence?.collection_readiness === 'scope_split' ? 'needs_check' : 'confirmed',
      value: facility.cleanup_status === 'split_needed' ? '숙박 공용탕 표본과 분리 필요' : '시설 단위 판독',
      source: evidence?.source_file ?? 'onsen_facility_review_evidence',
    },
    {
      code: 'official_filter_facts',
      label: '공식 시설 사실',
      status: readyOfficialFacts.length > 0 ? 'confirmed' : 'needs_check',
      value: `공식 원문·범위 확인 ${readyOfficialFacts.length}건`,
      source: 'onsen_facility_official_filter_facts',
    },
    {
      code: 'water_method',
      label: '온천수 방식',
      status: readyWater ? 'confirmed' : 'needs_check',
      value: readyWater?.water_system ?? '공식 원문·욕장 범위 재확인 필요',
      source: readyWater?.official_source_url ?? 'onsen_facility_water_facts',
    },
    {
      code: 'review_evidence',
      label: '직접 후기 근거',
      status: published ? 'confirmed' : 'needs_check',
      value: `${evidence?.dayuse_only_direct_reviews ?? evidence?.facility_related_direct_reviews ?? 0}건 · ${evidence?.evidence_grade ?? 'D'}등급`,
      source: evidence?.source_file ?? 'onsen_facility_review_evidence',
    },
  ];
}

function createVerdict(facility, evidence, signals, filterFacts, waterFacts, editorialCardSummary) {
  const platforms = directPlatforms(evidence?.direct_review_manifest);
  const directPlatformCount = platforms.length;
  const denominator = Number(evidence?.dayuse_only_direct_reviews ?? evidence?.facility_related_direct_reviews ?? 0);
  let draftReason = draftReasonFor(facility, evidence, directPlatformCount);
  let level = initialLevel(evidence, directPlatformCount, draftReason);
  let selected = evidence ? selectSignals(signals, level === 'draft' ? 'lite' : level, denominator, directPlatformCount) : [];

  if (!draftReason && level === 'full' && selected.length < 3) {
    level = 'lite';
    selected = selectSignals(signals, 'lite', denominator, directPlatformCount).slice(0, 2);
  }
  if (!draftReason && level === 'lite' && selected.length < 2) {
    draftReason = 'adoptable_signal_items_below_2';
    level = 'draft';
  }

  const published = level !== 'draft';
  const itemLimit = level === 'full' ? 4 : 2;
  const items = selected.slice(0, itemLimit).map((signal, index) => createVerdictItem(signal, index + 1, denominator));
  const readyOfficialFacts = filterFacts.filter((fact) => fact.availability === 'confirmed' && fact.filter_status === 'ready');
  const readyWater = waterFacts.find((fact) => fact.method_render_status === 'ready' && fact.water_system);

  return {
    target_type: 'facility',
    target_slug: facility.slug,
    level,
    headline: headlineFor(facility, items, draftReason),
    briefing: {
      experiences_read: denominator,
      platform_count: directPlatformCount,
      platforms,
      evidence_grade: evidence?.evidence_grade ?? 'D',
      collection_readiness: evidence?.collection_readiness ?? 'hold',
      facility_model: facility.facility_model,
      primary_archetype: facility.primary_archetype,
      cleanup_status: facility.cleanup_status,
      official_fact_count: readyOfficialFacts.length,
      official_filter_codes: unique(readyOfficialFacts.map((fact) => fact.filter_code)),
      decision_scope: 'day_use_facility',
      draft_reason: draftReason,
      water_judgment: {
        method: readyWater?.water_system ?? null,
        status: readyWater ? 'confirmed' : 'needs_official_recheck',
        review_used_for_method: false,
      },
      visible_review_count_used: false,
      editorial_card_summary: editorialCardSummary ?? null,
      pipeline_version: pipelineVersion,
    },
    items,
    fact_statuses: createFactStatuses(facility, evidence, filterFacts, waterFacts, published),
    status: published ? 'published' : 'draft',
    verified_at: runDate,
    source_file: path.relative(repoRoot, paths.json),
  };
}

function validateVerdicts(verdicts, evidenceBySlug) {
  const errors = [];
  for (const verdict of verdicts) {
    const evidence = evidenceBySlug.get(verdict.target_slug);
    const denominator = verdict.briefing.experiences_read;
    if (verdict.target_type !== 'facility') errors.push(`${verdict.target_slug}: invalid target_type`);
    if (denominator !== Number(evidence?.dayuse_only_direct_reviews ?? evidence?.facility_related_direct_reviews ?? 0)) errors.push(`${verdict.target_slug}: direct denominator mismatch`);
    if (verdict.briefing.visible_review_count_used !== false) errors.push(`${verdict.target_slug}: visible review count gate missing`);
    if (verdict.briefing.water_judgment.review_used_for_method !== false) errors.push(`${verdict.target_slug}: review leaked into method judgment`);
    if (verdict.status === 'published' && verdict.level === 'draft') errors.push(`${verdict.target_slug}: published draft`);
    if (verdict.status === 'published' && verdict.briefing.cleanup_status === 'split_needed') errors.push(`${verdict.target_slug}: scope split published`);
    if (verdict.level === 'full' && (denominator < 300 || verdict.briefing.platform_count < 3 || verdict.items.length < 3)) errors.push(`${verdict.target_slug}: full gate failed`);
    if (verdict.level === 'lite' && (denominator < 50 || verdict.briefing.platform_count < 2 || verdict.items.length !== 2)) errors.push(`${verdict.target_slug}: lite gate failed`);
    const cardSummary = verdict.briefing.editorial_card_summary;
    if (requireCardSummary && verdict.status === 'published' && cardSummary?.status !== 'published') {
      errors.push(`${verdict.target_slug}: published 시설 판정에 published 카드 요약이 없습니다.`);
    }
    if (cardSummary) {
      errors.push(...validateEditorialCardSummary(cardSummary, {
        repoRoot,
        slug: verdict.target_slug,
        targetType: 'facility',
        canonicalCounts: { directReviewCount: denominator },
      }));
    }
    for (const item of verdict.items) {
      const threshold = itemThreshold(verdict.level === 'full' ? 'full' : 'lite', denominator);
      if (item.counts.mentions > denominator) errors.push(`${verdict.target_slug}: mentions exceed denominator`);
      if (verdict.status === 'published' && (item.counts.mentions < threshold.minimum || item.counts.mentions < threshold.ratio)) errors.push(`${verdict.target_slug}: item threshold failed`);
      if (verdict.status === 'published' && item.counts.platform_count < 2) errors.push(`${verdict.target_slug}: item platform threshold failed`);
      const directions = item.counts.direction_counts;
      if (directions.positive + directions.mixed + directions.negative !== item.counts.mentions) errors.push(`${verdict.target_slug}: direction count mismatch`);
    }
  }
  if (errors.length > 0) throw new Error(`Facility verdict QA failed:\n${errors.join('\n')}`);
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(filePath, rows) {
  const columns = ['target_slug', 'name_ko', 'level', 'status', 'experiences_read', 'platform_count', 'item_count', 'evidence_grade', 'collection_readiness', 'cleanup_status', 'draft_reason', 'card_summary_status', 'card_summary', 'headline'];
  const lines = [columns.join(','), ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(','))];
  writeFileSync(filePath, `${lines.join('\n')}\n`);
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replaceAll("'", "''")}'`;
}

function jsonbLiteral(value) {
  return `${sqlLiteral(JSON.stringify(value))}::jsonb`;
}

function buildSql(verdicts) {
  const lines = ['BEGIN;', ''];
  for (const verdict of verdicts) {
    lines.push(`INSERT INTO public.onsen_verdicts (target_type, target_slug, level, headline, briefing, items, fact_statuses, status, verified_at, source_file)`);
    lines.push(`VALUES (${sqlLiteral(verdict.target_type)}, ${sqlLiteral(verdict.target_slug)}, ${sqlLiteral(verdict.level)}, ${sqlLiteral(verdict.headline)}, ${jsonbLiteral(verdict.briefing)}, ${jsonbLiteral(verdict.items)}, ${jsonbLiteral(verdict.fact_statuses)}, ${sqlLiteral(verdict.status)}, ${sqlLiteral(verdict.verified_at)}, ${sqlLiteral(verdict.source_file)})`);
    lines.push('ON CONFLICT (target_type, target_slug) DO UPDATE SET');
    lines.push('  level = EXCLUDED.level, headline = EXCLUDED.headline, briefing = EXCLUDED.briefing, items = EXCLUDED.items,');
    lines.push('  fact_statuses = EXCLUDED.fact_statuses, status = EXCLUDED.status, verified_at = EXCLUDED.verified_at,');
    lines.push('  source_file = EXCLUDED.source_file, updated_at = NOW();', '');
  }
  lines.push('COMMIT;', '');
  return lines.join('\n');
}

function markdownTable(rows, columns) {
  const escape = (value) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', '<br>');
  return [
    `| ${columns.join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${columns.map((column) => escape(row[column])).join(' | ')} |`),
  ].join('\n');
}

function writeArtifacts(payload) {
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(paths.json, `${JSON.stringify(payload, null, 2)}\n`);
  const summaryRows = payload.verdicts.map((verdict) => ({
    target_slug: verdict.target_slug,
    name_ko: payload.facility_names[verdict.target_slug],
    level: verdict.level,
    status: verdict.status,
    experiences_read: verdict.briefing.experiences_read,
    platform_count: verdict.briefing.platform_count,
    item_count: verdict.items.length,
    evidence_grade: verdict.briefing.evidence_grade,
    collection_readiness: verdict.briefing.collection_readiness,
    cleanup_status: verdict.briefing.cleanup_status,
    draft_reason: verdict.briefing.draft_reason ?? '',
    card_summary_status: verdict.briefing.editorial_card_summary?.status ?? '',
    card_summary: verdict.briefing.editorial_card_summary?.text ?? '',
    headline: verdict.headline,
  }));
  writeCsv(paths.csv, summaryRows);
  writeFileSync(paths.sql, buildSql(payload.verdicts));
  const counts = payload.verdicts.reduce((result, verdict) => {
    result[`${verdict.status}_${verdict.level}`] = (result[`${verdict.status}_${verdict.level}`] ?? 0) + 1;
    return result;
  }, {});
  const report = `# 온천시설 판정 데이터 파이프라인\n\n- 생성일: ${runDate}\n- 파이프라인: \`${pipelineVersion}\`\n- 대상: active 온천시설 ${payload.verdicts.length}곳\n- 공개 full: ${counts.published_full ?? 0}곳\n- 공개 lite: ${counts.published_lite ?? 0}곳\n- 내부 draft: ${counts.draft_draft ?? 0}곳\n\n## 공개 게이트\n\n- full: 직접 읽은 당일입욕 후기 300건 이상, 직접 본문 플랫폼 3개 이상, 채택 근거 3개 이상\n- lite: 직접 읽은 당일입욕 후기 50건 이상, 직접 본문 플랫폼 2개 이상, 채택 근거 2개\n- 항목: full 10건 / lite 5건 이상이면서 분모의 2% 이상, 2플랫폼 이상\n- DB 적용 시 공식 사실과 후기 근거를 분리한 published 카드 요약이 반드시 필요합니다.\n- \`scope_split\`, D등급, 단일 플랫폼은 사용자에게 판정을 공개하지 않습니다.\n- 플랫폼 노출 후기 수는 분모와 항목 집계에 사용하지 않았습니다.\n- 물의 감촉·색 후기는 온천수 방식 판정에 사용하지 않았습니다.\n\n## 시설별 결과\n\n${markdownTable(summaryRows, ['target_slug', 'name_ko', 'level', 'status', 'experiences_read', 'platform_count', 'item_count', 'card_summary_status', 'draft_reason'])}\n\n## 후속 보강\n\n${summaryRows.filter((row) => row.status === 'draft').map((row) => `- \`${row.target_slug}\`: ${row.draft_reason}`).join('\n') || '- 없음'}\n`;
  writeFileSync(paths.report, report);
}

async function readSourceData(config) {
  const facilityFilters = {
    select: 'slug,name_ko,facility_type,facility_model,primary_archetype,cleanup_status,official_url,official_profile,status,region_group',
    status: 'eq.active',
    order: 'slug.asc',
  };
  if (regionGroups.length > 0) facilityFilters.region_group = `in.(${regionGroups.join(',')})`;
  if (targetSlugs.length > 0) facilityFilters.slug = `in.(${targetSlugs.map((slug) => `"${slug}"`).join(',')})`;
  const facilities = await request(config, 'onsen_facilities', {
    ...facilityFilters,
  });
  if (facilities.length === 0) throw new Error(`No active facilities found${regionGroups.length > 0 ? ` for ${regionGroups.join(', ')}` : ''}.`);
  const slugs = facilities.map((row) => row.slug);
  const inSlugs = `in.(${slugs.map((slug) => `"${slug}"`).join(',')})`;
  const [evidenceRows, filterFacts, waterFacts] = await Promise.all([
    request(config, 'onsen_facility_review_evidence', {
      select: 'id,facility_slug,collected_on,direct_review_manifest,facility_related_direct_reviews,dayuse_only_direct_reviews,direct_body_platform_count,evidence_grade,collection_readiness,source_file',
      facility_slug: inSlugs,
      order: 'facility_slug.asc,collected_on.desc',
    }),
    request(config, 'onsen_facility_official_filter_facts', {
      select: 'facility_slug,filter_code,availability,filter_status,official_source_url',
      facility_slug: inSlugs,
    }),
    request(config, 'onsen_facility_water_facts', {
      select: 'facility_slug,water_system,method_render_status,official_source_url',
      facility_slug: inSlugs,
    }),
  ]);
  const evidenceBySlug = latestBySlug(evidenceRows);
  const evidenceIds = [...evidenceBySlug.values()].map((row) => row.id);
  const signals = evidenceIds.length === 0 ? [] : await request(config, 'onsen_facility_review_signals', {
    select: 'evidence_id,facility_area,signal_type,signal_direction,mention_count,source_count,platform_count,review_signal_status',
    evidence_id: `in.(${evidenceIds.map((id) => `"${id}"`).join(',')})`,
  });
  return { facilities, evidenceBySlug, filterFacts, waterFacts, signals };
}

async function applyVerdicts(config, verdicts) {
  const loaded = await request(config, 'onsen_verdicts', { on_conflict: 'target_type,target_slug' }, {
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=representation',
    body: verdicts,
  });
  const verified = await request(config, 'onsen_verdicts', {
    select: 'target_slug,level,status,briefing,items,verified_at',
    target_type: 'eq.facility',
    target_slug: `in.(${verdicts.map((row) => `"${row.target_slug}"`).join(',')})`,
    order: 'target_slug.asc',
  });
  if (loaded.length !== verdicts.length || verified.length !== verdicts.length) throw new Error(`DB verification count mismatch: loaded=${loaded.length}, verified=${verified.length}`);
  for (const expected of verdicts) {
    const actual = verified.find((row) => row.target_slug === expected.target_slug);
    if (!actual || actual.level !== expected.level || actual.status !== expected.status || actual.items.length !== expected.items.length) {
      throw new Error(`DB verification mismatch: ${expected.target_slug}`);
    }
  }
  return {
    loaded: loaded.length,
    verified: verified.length,
    published: verified.filter((row) => row.status === 'published').length,
    draft: verified.filter((row) => row.status === 'draft').length,
  };
}

async function main() {
  const config = readConfig();
  const cardSummaryBySlug = readCardSummarySeed();
  const { facilities, evidenceBySlug, filterFacts, waterFacts, signals } = await readSourceData(config);
  const signalsByEvidence = new Map();
  for (const signal of signals) {
    const rows = signalsByEvidence.get(signal.evidence_id) ?? [];
    rows.push(signal);
    signalsByEvidence.set(signal.evidence_id, rows);
  }
  const verdicts = facilities.map((facility) => {
    const evidence = evidenceBySlug.get(facility.slug);
    return createVerdict(
      facility,
      evidence,
      evidence ? signalsByEvidence.get(evidence.id) ?? [] : [],
      filterFacts.filter((fact) => fact.facility_slug === facility.slug),
      waterFacts.filter((fact) => fact.facility_slug === facility.slug),
      cardSummaryBySlug.get(facility.slug)
    );
  });
  const unknownSummarySlugs = [...cardSummaryBySlug.keys()].filter((slug) => !facilities.some((facility) => facility.slug === slug));
  if (unknownSummarySlugs.length > 0) throw new Error(`Card summary target is not in this facility run: ${unknownSummarySlugs.join(', ')}`);
  validateVerdicts(verdicts, evidenceBySlug);
  const payload = {
    generated_at: runDate,
    pipeline_version: pipelineVersion,
    region_groups: regionGroups,
    target_slugs: targetSlugs,
    count_policy: 'Visible review pools are excluded. experiences_read equals dayuse_only_direct_reviews when available, with facility_related_direct_reviews used only for legacy evidence. Item mentions use source_count, while raw mention_count is preserved separately.',
    water_policy: 'Reviews may support texture and color signals but never water method classification.',
    facility_names: Object.fromEntries(facilities.map((row) => [row.slug, row.name_ko])),
    verdicts,
  };
  writeArtifacts(payload);
  let verification = null;
  if (shouldApply) {
    verification = await applyVerdicts(config, verdicts);
    writeFileSync(paths.loadReport, `# 온천시설 판정 DB 적재 리포트\n\n- 적재일: ${runDate}\n- 적재·검증 시설: ${verification.verified}곳\n- 공개 판정: ${verification.published}곳\n- 내부 draft: ${verification.draft}곳\n- 플랫폼 노출 후기 수는 분모에 사용하지 않았습니다.\n- 후기 신호는 온천수 방식 판정에 사용하지 않았습니다.\n`);
  }
  console.log(JSON.stringify({
    facilities: verdicts.length,
    published_full: verdicts.filter((row) => row.status === 'published' && row.level === 'full').length,
    published_lite: verdicts.filter((row) => row.status === 'published' && row.level === 'lite').length,
    draft: verdicts.filter((row) => row.status === 'draft').length,
    outputs: Object.fromEntries(Object.entries(paths).filter(([key]) => key !== 'loadReport' || shouldApply).map(([key, value]) => [key, path.relative(repoRoot, value)])),
    verification,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});
