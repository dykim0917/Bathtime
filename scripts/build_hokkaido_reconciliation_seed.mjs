import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const researchDir = path.join(repoRoot, 'research/onsen-candidates/nationwide-2026-07-03');
const outputDir = path.join(repoRoot, 'research/onsen-db-seed');
const seedDate = '2026-07-08';
const outputBase = 'hokkaido_reconciliation_seed_2026-07-08';
const qualityPath = path.join(researchDir, 'hokkaido_ready_accommodation_quality_matrix_2026-07-04.csv');
const signalPath = path.join(researchDir, 'hokkaido_ready_accommodation_review_signal_rows_2026-07-03.csv');
const outputJsonPath = path.join(outputDir, `${outputBase}.json`);
const outputSqlPath = path.join(outputDir, `${outputBase}.upsert.sql`);
const outputReportPath = path.join(outputDir, `${outputBase}_report.md`);

const displayNameKo = {
  'jozankei-chalet-ivy': '샬레 아이비 조잔케이',
  'jozankei-grand-blissen': '그랜드 블리센 호텔 조잔케이',
  'jozankei-suizantei': '조잔케이 다이이치 호텔 스이잔테이',
  'noboribetsu-bourou-noguchi': '보로 노구치 노보리베츠',
  'noboribetsu-daiichi-takimotokan': '다이이치 타키모토칸',
  'noboribetsu-grand': '노보리베츠 그랜드 호텔',
  'noboribetsu-hanayura': '료테이 하나유라',
  'noboribetsu-mahoroba': '호텔 마호로바',
  'noboribetsu-manseikaku': '노보리베츠 만세이카쿠',
  'noboribetsu-takinoya': '노보리베츠 타키노야',
  'tokachigawa-seijakubou': '도카치가와 온천 세이자쿠보',
  'toyako-lake-suite-konosisu': '더 레이크 스위트 고노스미카',
  'yunokawa-hanabishi': '하코다테 유노카와 온천 하나비시 호텔',
  'yunokawa-heiseikan-hanatsuki': '헤이세이칸 시오사이테이 별관 하나츠키',
  'yunokawa-heiseikan-shiosaitei': '헤이세이칸 시오사이테이',
  'yunokawa-nagisatei': '유노카와 프린스 호텔 나기사테이',
};

const areaMeta = {
  jozankei: ['jozankei', '홋카이도 · 홋카이도 · 조잔케이', 'hokkaido', 'hokkaido', 'sapporo', 'jozankei'],
  noboribetsu: ['noboribetsu', '홋카이도 · 홋카이도 · 노보리베츠', 'hokkaido', 'hokkaido', 'noboribetsu', 'noboribetsu'],
  tokachigawa: ['tokachigawa', '홋카이도 · 홋카이도 · 도카치가와', 'hokkaido', 'hokkaido', 'otofuke', 'tokachigawa'],
  'hokkaido-toyako': ['hokkaido-toyako', '홋카이도 · 홋카이도 · 도야코', 'hokkaido', 'hokkaido', 'toyako', 'hokkaido-toyako'],
  'yunokawa-hakodate': ['yunokawa-hakodate', '홋카이도 · 홋카이도 · 유노카와', 'hokkaido', 'hokkaido', 'hakodate', 'yunokawa-hakodate'],
};

const signalLabels = {
  room_bath_hot_spring: '객실 내 프라이빗탕',
  public_bath_hot_spring: '공용 온천',
  private_bath_experience: '대절탕',
  water_texture: '수질 체감',
  weak_onsen_feeling: '온천감 약함',
  chlorine_smell: '염소 냄새',
  crowding: '혼잡',
  booking_confusion: '예약/운영 조건',
  operation_caution: '운영 조건',
  temperature_management: '수온 관리',
  temperature_control: '수온 조절',
};

const bathAreaLabels = {
  room_bath: '객실 내 프라이빗탕',
  room_open_air_bath: '객실 노천탕',
  public_bath: '대욕장',
  open_air_public_bath: '공용 노천탕',
  private_bath: '대절탕',
  family_bath: '가족탕',
  facility_wide: '시설 전반',
  unclear: '온천 이용',
};

const conditionalSignals = new Set([
  'weak_onsen_feeling',
  'chlorine_smell',
  'crowding',
  'booking_confusion',
  'operation_caution',
  'temperature_management',
  'temperature_control',
]);

const signalScope = {
  booking_confusion: 'experiences_read',
  operation_caution: 'experiences_read',
  crowding: 'experiences_read',
};

const knownBathAreas = new Set([
  'room_bath',
  'room_open_air_bath',
  'public_bath',
  'open_air_public_bath',
  'private_bath',
  'family_bath',
  'facility_wide',
  'unclear',
]);

function parseCsv(source) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [headerRow, ...bodyRows] = rows.filter((items) => items.some((item) => item.trim().length > 0));
  if (!headerRow) return [];
  const headers = headerRow.map((header) => header.replace(/^\uFEFF/, ''));
  return bodyRows.map((items) => Object.fromEntries(headers.map((header, index) => [header, items[index] ?? ''])));
}

function readCsv(filePath) {
  return parseCsv(readFileSync(filePath, 'utf8'));
}

function toInt(value) {
  const parsed = Number.parseInt(String(value ?? '').replace(/,/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sqlString(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

function sqlTextArray(values) {
  if (!Array.isArray(values) || values.length === 0) return "'{}'::text[]";
  return `ARRAY[${values.map(sqlString).join(', ')}]::text[]`;
}

function splitList(value) {
  return String(value ?? '')
    .split(/\s*[|;,]\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePlatform(value) {
  const raw = String(value ?? '').trim();
  const lower = raw.toLowerCase();
  if (!raw) return '';
  if (lower.includes('snippet')) return '';
  if (lower.includes('jalan')) return '자란';
  if (lower.includes('rakuten')) return '라쿠텐';
  if (lower.includes('google')) return '구글 지도';
  if (lower.includes('jtb') || lower.includes('rurubu')) return 'JTB';
  if (lower.includes('yahoo')) return '야후 트래블';
  if (lower.includes('naver') || lower.includes('hotelpass')) return '한국어 리뷰';
  if (lower.includes('tripadvisor')) return '트립어드바이저';
  if (lower.includes('agoda')) return '아고다';
  if (lower.includes('booking')) return '부킹닷컴';
  if (lower.includes('trip')) return '트립닷컴';
  if (lower.includes('ikkyu') || lower.includes('一休')) return '잇큐';
  if (lower.includes('hotels.com')) return '호텔스닷컴';
  if (lower.includes('expedia')) return '익스피디아';
  if (lower.includes('relux')) return '리럭스';
  return raw;
}

function normalizeDirection(value) {
  const lower = String(value ?? '').trim().toLowerCase();
  if (lower === 'positive' || lower === 'mixed' || lower === 'negative' || lower === 'neutral') return lower;
  if (lower.includes('negative')) return 'negative';
  if (lower.includes('mixed')) return 'mixed';
  if (lower.includes('positive')) return 'positive';
  return 'neutral';
}

function normalizeSignal(value) {
  const lower = String(value ?? '').trim().toLowerCase();
  if (!lower || lower === 'neutral') return '';
  if (lower.includes('room_bath_hot_spring')) return 'room_bath_hot_spring';
  if (lower.includes('public_bath_hot_spring')) return 'public_bath_hot_spring';
  if (lower.includes('private_bath_experience')) return 'private_bath_experience';
  if (lower.includes('water_texture')) return 'water_texture';
  if (lower.includes('weak_onsen_feeling')) return 'weak_onsen_feeling';
  if (lower.includes('chlorine')) return 'chlorine_smell';
  if (lower.includes('crowding')) return 'crowding';
  if (lower.includes('booking')) return 'booking_confusion';
  if (lower.includes('operation')) return 'operation_caution';
  if (lower.includes('temperature_control')) return 'temperature_control';
  if (lower.includes('temperature')) return 'temperature_management';
  return lower;
}

function normalizeBathArea(value) {
  const lower = String(value ?? '').trim().toLowerCase();
  if (!lower) return 'facility_wide';
  if (lower.includes('room_open_air')) return 'room_open_air_bath';
  if (lower.includes('room_bath')) return 'room_bath';
  if (lower.includes('open_air_public')) return 'open_air_public_bath';
  if (lower.includes('public_bath')) return 'public_bath';
  if (lower.includes('private_bath')) return 'private_bath';
  if (lower.includes('family_bath')) return 'family_bath';
  if (lower.includes('facility')) return 'facility_wide';
  if (lower.includes('unclear')) return 'unclear';
  return lower;
}

function isSignalBathCompatible(signal, bathArea) {
  if (signal === 'room_bath_hot_spring') return bathArea === 'room_bath' || bathArea === 'room_open_air_bath';
  if (signal === 'public_bath_hot_spring') return bathArea === 'public_bath' || bathArea === 'open_air_public_bath' || bathArea === 'facility_wide';
  if (signal === 'private_bath_experience') return bathArea === 'private_bath' || bathArea === 'family_bath' || bathArea === 'facility_wide';
  return true;
}

function rowsBySlug(rows) {
  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.slug)) grouped.set(row.slug, []);
    grouped.get(row.slug).push(row);
  }
  return grouped;
}

function aggregateItems(qualityRow, signalRows) {
  const directCount = toInt(qualityRow.direct_reviews_checked);
  const onsenCount = toInt(qualityRow.onsen_related_direct_reviews_checked);
  const platformCount = toInt(qualityRow.direct_body_platform_count);

  const items = signalRows
    .map((row) => {
      const signal = normalizeSignal(row.signal_type);
      const bathArea = normalizeBathArea(row.bath_area);
      const direction = normalizeDirection(row.signal_direction);
      const mentions = toInt(row.mention_count);
      const rowPlatformCount = Math.min(toInt(row.platform_count), platformCount || toInt(row.platform_count));
      const denominator = signalScope[signal] ?? 'onsen_related';
      const denominatorValue = denominator === 'experiences_read' ? directCount : onsenCount;
      const directionCounts = {
        positive: direction === 'positive' ? mentions : 0,
        mixed: direction === 'mixed' ? mentions : 0,
        negative: direction === 'negative' ? mentions : 0,
        neutral: direction === 'neutral' ? mentions : 0,
      };
      return {
        signal,
        bathArea,
        direction,
        denominator,
        denominatorValue,
        mentions,
        negative: direction === 'negative' ? mentions : 0,
        directionCounts,
        platformCount: rowPlatformCount,
        platforms: [],
      };
    })
    .filter((item) => item.signal && item.direction !== 'neutral')
    .filter((item) => item.mentions >= 10)
    .filter((item) => knownBathAreas.has(item.bathArea))
    .filter((item) => isSignalBathCompatible(item.signal, item.bathArea))
    .filter((item) => item.denominatorValue > 0 && item.mentions / item.denominatorValue >= 0.02)
    .filter((item) => item.platformCount >= 2)
    .filter((item) => item.mentions <= item.denominatorValue)
    .sort((a, b) => b.mentions - a.mentions || b.platformCount - a.platformCount);

  return dedupeItems(items).slice(0, 5);
}

function dedupeItems(items) {
  const selected = [];
  const seen = new Set();
  for (const item of items) {
    const key = `${item.bathArea}:${item.signal}:${item.direction}`;
    if (seen.has(key)) continue;
    selected.push(item);
    seen.add(key);
    if (selected.length >= 5) break;
  }
  return selected;
}

function hasFullThreshold(row, items) {
  return (
    toInt(row.direct_reviews_checked) >= 300 &&
    toInt(row.onsen_related_direct_reviews_checked) >= 200 &&
    toInt(row.direct_body_platform_count) >= 3 &&
    items.length >= 3
  );
}

function itemLabel(item) {
  const bathLabel = bathAreaLabels[item.bathArea] ?? '온천 이용';
  const signalLabel = signalLabels[item.signal] ?? '온천 이용';
  if (item.signal === 'room_bath_hot_spring') return bathLabel.includes('객실') ? bathLabel : signalLabel;
  if (item.signal === 'public_bath_hot_spring') return bathLabel.includes('공용') || bathLabel.includes('대욕장') ? bathLabel : signalLabel;
  if (item.signal === 'private_bath_experience') return bathLabel.includes('탕') ? bathLabel : signalLabel;
  return signalLabel;
}

function itemType(item) {
  if (conditionalSignals.has(item.signal)) return 'conditional';
  if (item.direction === 'mixed') return 'conditional';
  if (item.mentions / item.denominatorValue < 0.08) return 'minor';
  return 'positive';
}

function itemHeadline(item) {
  const label = itemLabel(item);
  if (item.signal === 'weak_onsen_feeling') return `${label}은 조건부로 확인해야 합니다.`;
  if (item.signal === 'chlorine_smell') return `${label}은 민감한 여행자에게 변수입니다.`;
  if (item.signal === 'crowding') return '혼잡은 시간대에 따라 갈립니다.';
  if (item.signal === 'booking_confusion') return '예약 조건은 미리 분리해 확인해야 합니다.';
  if (item.signal === 'operation_caution') return '운영 조건은 예약 전에 확인해야 합니다.';
  if (item.signal === 'temperature_management' || item.signal === 'temperature_control') return '수온은 이용 조건에 따라 체감이 갈립니다.';
  if (item.signal === 'water_texture') return '수질 체감이 선택 기준으로 잡힙니다.';
  return `${label}이 이 숙소의 주요 판단 기준입니다.`;
}

function itemBody(item) {
  const label = itemLabel(item);
  if (item.type === 'conditional') {
    return `${label} 관련 평가는 장점과 주의점이 함께 잡힙니다. 여러 플랫폼에서 같은 항목이 반복되므로 예약 조건과 계절 변수를 같이 확인하시기 바랍니다.`;
  }
  if (item.type === 'minor') {
    return `${label}은 중심 경험은 아니지만 선택 전에 함께 볼 만한 항목입니다. 다른 핵심 욕장 경험과 나란히 비교하면 숙소의 성격이 더 분명해집니다.`;
  }
  return `${label} 관련 평가는 플랫폼을 나눠 봐도 안정적으로 반복됩니다. 이 숙소를 고를 때 먼저 확인할 핵심 온천 경험으로 볼 수 있습니다.`;
}

function itemVerdict(item) {
  const label = itemLabel(item);
  if (item.signal === 'booking_confusion') return '예약 단계에서 객실 타입과 온천 이용 조건을 따로 확인하시기 바랍니다.';
  if (item.signal === 'temperature_management' || item.signal === 'temperature_control') return '겨울이나 야간 이용이 중요하다면 수온 조절 조건을 먼저 확인하시기 바랍니다.';
  if (item.signal === 'weak_onsen_feeling' || item.signal === 'chlorine_smell') return '진한 온천감이 최우선이라면 다른 후보와 함께 비교하시기 바랍니다.';
  if (item.signal === 'crowding') return '조용한 이용을 원하면 시간대와 공용탕 동선을 먼저 확인하시기 바랍니다.';
  return `${label}을 우선순위에 두는 여행자라면 비교 가치가 높습니다.`;
}

function bathPrimaryLabel(bathArea) {
  if (bathArea === 'room_open_air_bath') return '객실 노천탕 중심';
  if (bathArea === 'room_bath') return '객실 내 프라이빗탕 중심';
  if (bathArea === 'private_bath' || bathArea === 'family_bath') return '대절탕/가족탕 중심';
  if (bathArea === 'open_air_public_bath') return '공용 노천탕 중심';
  if (bathArea === 'public_bath' || bathArea === 'facility_wide') return '대욕장/공용 온천 중심';
  return '온천 구성 확인형';
}

function primaryBathFromItems(items) {
  const bathItems = items
    .filter((item) => item.signal === 'room_bath_hot_spring' || item.signal === 'public_bath_hot_spring' || item.signal === 'private_bath_experience')
    .sort((a, b) => b.mentions - a.mentions || b.platformCount - a.platformCount);
  if (bathItems[0]) return bathPrimaryLabel(bathItems[0].bathArea);
  if (items.some((item) => item.signal === 'water_texture')) return '수질 체감 중심';
  return '온천 구성 확인형';
}

function deriveBathScope(primaryBath, items) {
  const bathAreas = new Set(items.map((item) => item.bathArea));
  const hasRoom = /객실/.test(primaryBath) || bathAreas.has('room_bath') || bathAreas.has('room_open_air_bath');
  const hasPublic = /대욕장|공용/.test(primaryBath) || bathAreas.has('public_bath') || bathAreas.has('open_air_public_bath');
  if (hasRoom && hasPublic) return 'some_rooms';
  if (hasRoom) return 'room_signal_only';
  if (hasPublic) return 'public_bath_only';
  return 'unclear';
}

function deriveBathContexts(primaryBath, items) {
  const values = new Set();
  const text = `${primaryBath} ${items.map((item) => item.bathArea).join(' ')}`;
  if (/room_bath|room_open_air|객실/.test(text)) values.add('room_bath');
  if (/private_bath|family_bath|대절|가족/.test(text)) values.add('private_bath');
  if (/public_bath|open_air_public|대욕장|공용/.test(text)) values.add('public_bath');
  return values.size > 0 ? [...values] : ['public_bath'];
}

function deriveWaterCriteria(items) {
  const values = new Set(['spring_confirmed']);
  if (items.some((item) => item.signal === 'water_texture')) values.add('water_texture');
  if (items.some((item) => item.signal === 'temperature_management' || item.signal === 'temperature_control')) values.add('temperature_adjustment');
  return [...values];
}

function evidenceCounts(row, items) {
  const countBy = (predicate) => items.filter(predicate).reduce((sum, item) => sum + item.mentions, 0);
  return {
    directReviewCount: toInt(row.direct_reviews_checked),
    onsenReviewCount: toInt(row.onsen_related_direct_reviews_checked),
    directBodyPlatformCount: toInt(row.direct_body_platform_count),
    roomBathMentionCount: countBy((item) => /room_bath|room_open_air_bath/.test(item.bathArea)),
    publicBathMentionCount: countBy((item) => /public_bath|open_air_public_bath/.test(item.bathArea)),
    privateBathMentionCount: countBy((item) => /private_bath|family_bath/.test(item.bathArea)),
    waterTextureMentionCount: countBy((item) => item.signal === 'water_texture'),
    cautionMentionCount: countBy((item) => itemType(item) === 'conditional'),
  };
}

function createAccommodation(row, items, level) {
  const meta = areaMeta[row.area_slug] ?? areaMeta.jozankei;
  const [region, area, regionGroup, prefecture, city, onsenArea] = meta;
  const primaryBath = primaryBathFromItems(items);
  const displayName = displayNameKo[row.slug] ?? row.name_ja ?? row.slug;
  const summary =
    level === 'full'
      ? `${area}의 온천 숙소입니다. ${primaryBath}을 기준으로 이용 경험이 반복되며, 객실 타입과 공용탕 운영 조건을 함께 확인하시기 바랍니다.`
      : `${area}의 온천 숙소입니다. 직접 읽은 이용 경험 수는 확보했지만, 현재 full 판정 기준에는 일부 항목이 모자랍니다. 객실 타입과 온천 이용 조건을 예약 전에 확인하시기 바랍니다.`;
  const operationNotes = [`${primaryBath}으로 정리했습니다`];
  if (items.some((item) => item.signal === 'booking_confusion' || item.signal === 'operation_caution')) {
    operationNotes.push('예약 조건과 운영 시간을 함께 확인하시기 바랍니다');
  }
  if (items.some((item) => item.signal === 'temperature_management' || item.signal === 'temperature_control')) {
    operationNotes.push('수온 체감은 계절과 시간대에 따라 달라질 수 있습니다');
  }

  return {
    slug: row.slug,
    name: displayName,
    ja_name: row.name_ja || null,
    display_name_ko: displayName,
    name_ja: row.name_ja || null,
    name_en: null,
    aliases_ko: [displayName],
    aliases_ja: row.name_ja ? [row.name_ja] : [],
    aliases_en: [],
    name_verification_status: 'verified',
    name_source_note: '홋카이도 리컨실리에이션 seed 생성 과정에서 한국어 서비스명을 보정',
    region,
    area,
    country: 'JP',
    region_group: regionGroup,
    prefecture,
    city,
    onsen_area: onsenArea,
    travel_contexts: ['ryokan_stay'],
    bath_contexts: deriveBathContexts(primaryBath, items),
    water_criteria: deriveWaterCriteria(items),
    summary,
    primary_bath: primaryBath,
    water_use_status: 'review_supported',
    water_source_type: 'hot_spring_confirmed',
    bath_scope: deriveBathScope(primaryBath, items),
    operation_notes: operationNotes,
    evidence_counts: evidenceCounts(row, items),
    evidence_grade: toInt(row.direct_reviews_checked) >= 300 ? 'A' : toInt(row.direct_reviews_checked) >= 100 ? 'B' : 'C',
    evidence_note: `직접 읽은 이용 경험 ${toInt(row.direct_reviews_checked).toLocaleString('ko-KR')}건, 온천 관련 ${toInt(row.onsen_related_direct_reviews_checked).toLocaleString('ko-KR')}건, 본문 확인 플랫폼 ${toInt(row.direct_body_platform_count)}개`,
    status: 'active',
    source_file: 'research/onsen-candidates/nationwide-2026-07-03/hokkaido_ready_accommodation_quality_matrix_2026-07-04.csv',
    content_updated_at: seedDate,
  };
}

function createVerdictItems(items) {
  return items.map((item, index) => {
    const typed = { ...item, type: itemType(item) };
    return {
      order: index + 1,
      type: typed.type,
      headline: itemHeadline(typed),
      counts: {
        mentions: item.mentions,
        negative: item.negative,
        denominator: item.denominator,
        platform_count: item.platformCount,
        direction_counts: item.directionCounts,
      },
      body: itemBody(typed),
      verdict: itemVerdict(item),
      chip_label: itemLabel(item),
      adoption_status: 'verdict_basis',
      signal_key: item.signal,
      bath_area: item.bathArea,
      platforms: item.platforms,
      season_months:
        item.signal === 'temperature_management' || item.signal === 'temperature_control'
          ? [11, 12, 1, 2, 3]
          : null,
    };
  });
}

function createVerdict(row, accommodation, items, level) {
  const platforms = [...new Set(splitList(row.direct_body_platforms).map(normalizePlatform).filter(Boolean))];
  const briefing = {
    experiences_read: toInt(row.direct_reviews_checked),
    onsen_related: toInt(row.onsen_related_direct_reviews_checked),
    platform_count: toInt(row.direct_body_platform_count),
    platforms: platforms.length > 0 ? platforms : [`본문 확인 플랫폼 ${toInt(row.direct_body_platform_count)}개`],
  };
  return {
    target_type: 'accommodation',
    target_slug: row.slug,
    level,
    headline: `${accommodation.primary_bath} 숙소입니다.`,
    briefing,
    items: level === 'full' ? createVerdictItems(items) : [],
    fact_statuses: [],
    status: 'published',
    verified_at: seedDate,
    source_file: 'research/onsen-candidates/nationwide-2026-07-03/hokkaido_ready_accommodation_review_signal_rows_2026-07-03.csv',
  };
}

function validateRows(accommodations, verdicts) {
  const errors = [];
  const banned = [/후기/, /리뷰/, /신호/, /보는 편/, /확인 필요/, /조건 확인/, /확인 중(?:입니다|$)/];
  for (const row of accommodations) {
    if (!row.display_name_ko || !/[가-힣]/.test(row.display_name_ko)) errors.push(`${row.slug}: Korean display name missing`);
    for (const field of [row.summary, row.primary_bath, ...row.operation_notes]) {
      for (const pattern of banned) {
        if (pattern.test(field)) errors.push(`${row.slug}: banned copy "${pattern.source}" in "${field}"`);
      }
    }
  }
  for (const verdict of verdicts) {
    if (verdict.level === 'full') {
      if (verdict.briefing.experiences_read < 300) errors.push(`${verdict.target_slug}: full direct below 300`);
      if (verdict.briefing.onsen_related < 200) errors.push(`${verdict.target_slug}: full onsen below 200`);
      if (verdict.briefing.platform_count < 3) errors.push(`${verdict.target_slug}: full platform count below 3`);
      if (verdict.items.length < 3) errors.push(`${verdict.target_slug}: full item count below 3`);
    }
    for (const item of verdict.items) {
      const denominator = item.counts.denominator === 'experiences_read' ? verdict.briefing.experiences_read : verdict.briefing.onsen_related;
      const dc = item.counts.direction_counts ?? {};
      const directionSum = (dc.positive ?? 0) + (dc.mixed ?? 0) + (dc.negative ?? 0);
      if (item.counts.mentions > denominator) errors.push(`${verdict.target_slug}: item mentions exceed denominator`);
      if (item.counts.negative > item.counts.mentions) errors.push(`${verdict.target_slug}: item negative exceed mentions`);
      if (item.counts.platform_count < 2) errors.push(`${verdict.target_slug}: item platform count below 2`);
      if (directionSum !== item.counts.mentions) errors.push(`${verdict.target_slug}: direction count sum mismatch`);
    }
  }
  return errors;
}

function createSql(accommodations, verdicts) {
  const lines = [
    '-- Generated by scripts/build_hokkaido_reconciliation_seed.mjs',
    `-- Sources: ${path.relative(repoRoot, qualityPath)}, ${path.relative(repoRoot, signalPath)}`,
    '',
  ];
  for (const row of accommodations) {
    lines.push(`INSERT INTO public.onsen_accommodations (
  slug, name, ja_name, display_name_ko, name_ja, name_en, aliases_ko, aliases_ja, aliases_en, name_verification_status, name_source_note,
  region, area, country, region_group, prefecture, city, onsen_area,
  travel_contexts, bath_contexts, water_criteria,
  summary, primary_bath, water_use_status, water_source_type, bath_scope,
  operation_notes, evidence_counts, evidence_grade, evidence_note, status, source_file, content_updated_at
) VALUES (
  ${sqlString(row.slug)}, ${sqlString(row.name)}, ${sqlString(row.ja_name)}, ${sqlString(row.display_name_ko)}, ${sqlString(row.name_ja)}, ${sqlString(row.name_en)}, ${sqlTextArray(row.aliases_ko)}, ${sqlTextArray(row.aliases_ja)}, ${sqlTextArray(row.aliases_en)}, ${sqlString(row.name_verification_status)}, ${sqlString(row.name_source_note)},
  ${sqlString(row.region)}, ${sqlString(row.area)}, ${sqlString(row.country)}, ${sqlString(row.region_group)}, ${sqlString(row.prefecture)}, ${sqlString(row.city)}, ${sqlString(row.onsen_area)},
  ${sqlJson(row.travel_contexts)}, ${sqlJson(row.bath_contexts)}, ${sqlJson(row.water_criteria)},
  ${sqlString(row.summary)}, ${sqlString(row.primary_bath)}, ${sqlString(row.water_use_status)}, ${sqlString(row.water_source_type)}, ${sqlString(row.bath_scope)},
  ${sqlJson(row.operation_notes)}, ${sqlJson(row.evidence_counts)}, ${sqlString(row.evidence_grade)}, ${sqlString(row.evidence_note)}, ${sqlString(row.status)}, ${sqlString(row.source_file)}, ${sqlString(row.content_updated_at)}
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  ja_name = EXCLUDED.ja_name,
  display_name_ko = EXCLUDED.display_name_ko,
  name_ja = EXCLUDED.name_ja,
  name_en = EXCLUDED.name_en,
  aliases_ko = EXCLUDED.aliases_ko,
  aliases_ja = EXCLUDED.aliases_ja,
  aliases_en = EXCLUDED.aliases_en,
  name_verification_status = EXCLUDED.name_verification_status,
  name_source_note = EXCLUDED.name_source_note,
  region = EXCLUDED.region,
  area = EXCLUDED.area,
  country = EXCLUDED.country,
  region_group = EXCLUDED.region_group,
  prefecture = EXCLUDED.prefecture,
  city = EXCLUDED.city,
  onsen_area = EXCLUDED.onsen_area,
  travel_contexts = EXCLUDED.travel_contexts,
  bath_contexts = EXCLUDED.bath_contexts,
  water_criteria = EXCLUDED.water_criteria,
  summary = EXCLUDED.summary,
  primary_bath = EXCLUDED.primary_bath,
  water_use_status = EXCLUDED.water_use_status,
  water_source_type = EXCLUDED.water_source_type,
  bath_scope = EXCLUDED.bath_scope,
  operation_notes = EXCLUDED.operation_notes,
  evidence_counts = EXCLUDED.evidence_counts,
  evidence_grade = EXCLUDED.evidence_grade,
  evidence_note = EXCLUDED.evidence_note,
  status = EXCLUDED.status,
  source_file = EXCLUDED.source_file,
  content_updated_at = EXCLUDED.content_updated_at,
  updated_at = NOW();`);
  }
  lines.push('');
  for (const row of verdicts) {
    lines.push(`INSERT INTO public.onsen_verdicts (
  target_type, target_slug, level, headline, briefing, items, fact_statuses, status, verified_at, source_file
) VALUES (
  ${sqlString(row.target_type)}, ${sqlString(row.target_slug)}, ${sqlString(row.level)}, ${sqlString(row.headline)}, ${sqlJson(row.briefing)}, ${sqlJson(row.items)}, ${sqlJson(row.fact_statuses)}, ${sqlString(row.status)}, ${sqlString(row.verified_at)}, ${sqlString(row.source_file)}
) ON CONFLICT (target_type, target_slug) DO UPDATE SET
  level = EXCLUDED.level,
  headline = EXCLUDED.headline,
  briefing = EXCLUDED.briefing,
  items = EXCLUDED.items,
  fact_statuses = EXCLUDED.fact_statuses,
  status = EXCLUDED.status,
  verified_at = EXCLUDED.verified_at,
  source_file = EXCLUDED.source_file,
  updated_at = NOW()
WHERE public.onsen_verdicts.level <> 'full' OR EXCLUDED.level = 'full';`);
  }
  return `${lines.join('\n\n')}\n`;
}

function createReport(accommodations, verdicts, qualityRows, itemCounts) {
  const full = verdicts.filter((row) => row.level === 'full');
  const lite = verdicts.filter((row) => row.level === 'lite');
  const lines = [
    '# 홋카이도 리컨실리에이션 Seed 생성 리포트',
    '',
    `작성일: ${seedDate}`,
    '',
    '## 요약',
    '',
    `- 대상 숙소: ${qualityRows.length}곳`,
    `- 생성 숙소 row: ${accommodations.length}곳`,
    `- full verdict: ${full.length}곳`,
    `- lite verdict: ${lite.length}곳`,
    '',
    '## Full Verdict',
    '',
    '| slug | 숙소명 | 직접 | 온천 | 플랫폼 | items |',
    '|---|---|---:|---:|---:|---:|',
    ...full.map((row) => {
      const accommodation = accommodations.find((item) => item.slug === row.target_slug);
      return `| ${row.target_slug} | ${accommodation?.name ?? ''} | ${row.briefing.experiences_read} | ${row.briefing.onsen_related} | ${row.briefing.platform_count} | ${row.items.length} |`;
    }),
    '',
    '## Lite Verdict',
    '',
    '| slug | 숙소명 | 직접 | 온천 | 플랫폼 | adopted_items | 이유 |',
    '|---|---|---:|---:|---:|---:|---|',
    ...lite.map((row) => {
      const accommodation = accommodations.find((item) => item.slug === row.target_slug);
      const itemCount = itemCounts.get(row.target_slug) ?? 0;
      const reason = row.briefing.onsen_related < 200 ? '온천 관련 직접 표본 200건 미만' : itemCount < 3 ? '판정 채택 item 3개 미만' : 'lite 유지';
      return `| ${row.target_slug} | ${accommodation?.name ?? ''} | ${row.briefing.experiences_read} | ${row.briefing.onsen_related} | ${row.briefing.platform_count} | ${itemCount} | ${reason} |`;
    }),
    '',
    '## 산출물',
    '',
    `- \`${path.relative(repoRoot, outputJsonPath)}\``,
    `- \`${path.relative(repoRoot, outputSqlPath)}\``,
    '',
  ];
  return `${lines.join('\n')}\n`;
}

async function main() {
  const qualityRows = readCsv(qualityPath);
  const signalRowsBySlug = rowsBySlug(readCsv(signalPath));
  const accommodations = [];
  const verdicts = [];
  const itemCounts = new Map();

  for (const row of qualityRows) {
    const items = aggregateItems(row, signalRowsBySlug.get(row.slug) ?? []);
    const level = hasFullThreshold(row, items) ? 'full' : 'lite';
    const accommodation = createAccommodation(row, items, level);
    const verdict = createVerdict(row, accommodation, items, level);
    accommodations.push(accommodation);
    verdicts.push(verdict);
    itemCounts.set(row.slug, items.length);
  }

  const errors = validateRows(accommodations, verdicts);
  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputJsonPath, JSON.stringify({ accommodations, verdicts }, null, 2));
  await writeFile(outputSqlPath, createSql(accommodations, verdicts));
  await writeFile(outputReportPath, createReport(accommodations, verdicts, qualityRows, itemCounts));

  console.log(`Generated ${accommodations.length} accommodations.`);
  console.log(`Full verdicts: ${verdicts.filter((row) => row.level === 'full').length}`);
  console.log(`Lite verdicts: ${verdicts.filter((row) => row.level === 'lite').length}`);
  console.log(outputJsonPath);
  console.log(outputSqlPath);
  console.log(outputReportPath);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
