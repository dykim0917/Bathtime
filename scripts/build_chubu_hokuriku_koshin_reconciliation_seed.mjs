import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const reviewRoot = path.join(repoRoot, 'research/onsen-review-signals');
const candidatePath = path.join(
  repoRoot,
  'research/onsen-candidates/nationwide-2026-07-03/chubu_hokuriku_koshin_accommodation_candidate_status_2026-07-03.csv'
);
const outputDir = path.join(repoRoot, 'research/onsen-db-seed');
const seedDate = '2026-07-08';
const outputBase = 'chubu_hokuriku_koshin_reconciliation_seed_2026-07-08';
const outputJsonPath = path.join(outputDir, `${outputBase}.json`);
const outputSqlPath = path.join(outputDir, `${outputBase}.upsert.sql`);
const outputReportPath = path.join(outputDir, `${outputBase}_report.md`);
const outputBacklogPath = path.join(outputDir, `${outputBase}_backlog.csv`);

const targetSlugPattern = /^(matsumoto-jujo|gero-|yamanaka-|echigo-yuzawa-)/;

const displayNameKo = {
  'matsumoto-jujo': '마쓰모토 주조',
  'gero-kawakamiya': '가와카미야 가스이테이',
  'gero-miyako': '미야코',
  'gero-shogetsu': '쇼게츠',
  'gero-suihoen': '가이세키야도 스이호엔',
  'gero-tsukinoakari': '하나레노야도 츠키노아카리',
  'gero-yunoshimakan': '유노시마칸',
  'gero-ogawaya': '오가와야',
  'gero-suimeikan': '스이메이칸',
  'echigo-yuzawa-nakaya': '오유야도 나카야',
  'echigo-yuzawa-quattro': '시키 유자와 콰트로',
  'echigo-yuzawa-ryugon': '류곤',
  'echigo-yuzawa-takahan': '유키구니노야도 다카한',
  'yamanaka-kagari-kisshotei': '가가리 킷쇼테이',
  'yamanaka-kayotei': '하나무라사키',
  'yamanaka-kissho-yamanaka': '킷쇼 야마나카',
};

const areaMeta = {
  matsumoto: ['matsumoto', '주부 · 나가노현 · 마쓰모토', 'chubu', 'nagano', 'matsumoto', 'matsumoto'],
  gero: ['gero', '주부 · 기후현 · 게로', 'chubu', 'gifu', 'gero', 'gero'],
  yamanaka: ['yamanaka', '주부 · 이시카와현 · 야마나카', 'chubu', 'ishikawa', 'kaga', 'yamanaka'],
  'echigo-yuzawa': ['echigo-yuzawa', '주부 · 니가타현 · 에치고유자와', 'chubu', 'niigata', 'yuzawa', 'echigo-yuzawa'],
};

const signalLabels = {
  room_bath_hot_spring: '객실 내 프라이빗탕',
  public_bath_hot_spring: '대욕장/공용 온천',
  private_bath_experience: '대절탕',
  water_texture: '수질 체감',
  weak_onsen_feeling: '온천감 약함',
  chlorine_smell: '염소 냄새',
  crowding: '혼잡',
  booking_confusion: '예약/운영 조건',
  temperature_control: '수온 조절',
  temperature_management: '수온 관리',
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
  'temperature_control',
  'temperature_management',
]);

const signalScope = {
  booking_confusion: 'experiences_read',
  crowding: 'experiences_read',
  temperature_control: 'experiences_read',
  temperature_management: 'experiences_read',
};

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

function asNumber(...values) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return undefined;
}

function newest(files, regex) {
  return files.filter((file) => regex.test(file)).sort().at(-1) ?? null;
}

function splitList(value) {
  return String(value ?? '')
    .split(/\s*[;|,/]\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isTruthy(value) {
  return /^(true|1|yes|y)$/i.test(String(value ?? '').trim());
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

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function normalizePlatform(value) {
  const raw = String(value ?? '').trim();
  const lower = raw.toLowerCase();
  if (!raw || lower.includes('snippet') || lower.includes('provider card')) return '';
  if (lower.includes('jalan')) return '자란';
  if (lower.includes('rakuten')) return '라쿠텐';
  if (lower.includes('google')) return '구글 지도';
  if (lower.includes('booking')) return '부킹닷컴';
  if (lower.includes('agoda')) return '아고다';
  if (lower.includes('tripadvisor')) return '트립어드바이저';
  if (lower.includes('trip.com') || lower === 'trip.com' || lower.includes('tripcom')) return '트립닷컴';
  if (lower.includes('naver')) return '한국어 블로그/카페';
  if (lower.includes('ikkyu') || lower.includes('一休')) return '잇큐';
  if (lower.includes('yahoo')) return '야후 트래블';
  if (lower.includes('rurubu')) return '루루부';
  if (lower.includes('jtb')) return 'JTB';
  if (lower.includes('hotels.com')) return '호텔스닷컴';
  if (lower.includes('nol') || lower.includes('yanolja')) return '놀/야놀자';
  return raw;
}

function normalizeBathArea(value) {
  const lower = String(value ?? '').trim().toLowerCase();
  if (!lower) return '';
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

function normalizeSignal(value) {
  const lower = String(value ?? '').trim().toLowerCase();
  if (!lower || lower === 'neutral' || lower === 'food' || lower === 'service' || lower === 'room' || lower === 'facility_wide') return '';
  if (lower.includes('room_bath_hot_spring')) return 'room_bath_hot_spring';
  if (lower.includes('public_bath_hot_spring')) return 'public_bath_hot_spring';
  if (lower.includes('private_bath_experience')) return 'private_bath_experience';
  if (lower.includes('water_texture')) return 'water_texture';
  if (lower.includes('weak_onsen_feeling')) return 'weak_onsen_feeling';
  if (lower.includes('chlorine')) return 'chlorine_smell';
  if (lower.includes('crowding')) return 'crowding';
  if (lower.includes('booking')) return 'booking_confusion';
  if (lower.includes('temperature_control')) return 'temperature_control';
  if (lower.includes('temperature')) return 'temperature_management';
  if (lower.includes('bath_experience') || lower.includes('positive_bath')) return 'public_bath_hot_spring';
  return lower;
}

function normalizeDirection(value, signal, rating) {
  const lower = String(value ?? '').trim().toLowerCase();
  if (lower === 'positive' || lower === 'mixed' || lower === 'negative') return lower;
  if (lower.includes('negative')) return 'negative';
  if (lower.includes('mixed')) return 'mixed';
  if (lower.includes('positive')) return 'positive';
  if (signal === 'weak_onsen_feeling' || signal === 'chlorine_smell') return 'negative';
  if (signal === 'crowding' || signal === 'booking_confusion' || signal === 'temperature_control' || signal === 'temperature_management') return 'mixed';
  const numericRating = Number.parseFloat(String(rating ?? ''));
  if (Number.isFinite(numericRating) && numericRating > 0 && numericRating <= 2) return 'mixed';
  return 'positive';
}

function selectBathArea(signal, rawAreas) {
  const areas = rawAreas.map(normalizeBathArea).filter(Boolean);
  const has = (values) => values.find((value) => areas.includes(value));
  if (signal === 'room_bath_hot_spring') return has(['room_open_air_bath', 'room_bath']) ?? 'room_bath';
  if (signal === 'public_bath_hot_spring') return has(['open_air_public_bath', 'public_bath', 'facility_wide']) ?? 'public_bath';
  if (signal === 'private_bath_experience') return has(['private_bath', 'family_bath']) ?? 'private_bath';
  return has(['room_open_air_bath', 'room_bath', 'open_air_public_bath', 'public_bath', 'private_bath', 'family_bath', 'facility_wide', 'unclear']) ?? 'facility_wide';
}

function deriveSignalsFromBathAreas(rawAreas) {
  const areas = rawAreas.map(normalizeBathArea).filter(Boolean);
  if (areas.some((area) => area === 'room_bath' || area === 'room_open_air_bath')) return ['room_bath_hot_spring'];
  if (areas.some((area) => area === 'private_bath' || area === 'family_bath')) return ['private_bath_experience'];
  if (areas.some((area) => area === 'public_bath' || area === 'open_air_public_bath' || area === 'facility_wide')) return ['public_bath_hot_spring'];
  return [];
}

function statsFromObject(stats) {
  const direct =
    asNumber(stats.directly_read_reviews, stats.direct_read_reviews, stats.direct_review_total, stats.direct_reviews_total) ??
    asNumber(stats.total_direct_read_reviews_counted) ??
    (Number.isFinite(stats.rakuten_unique_direct_reviews + stats.manual_web_evidence_direct_reviews)
      ? stats.rakuten_unique_direct_reviews + stats.manual_web_evidence_direct_reviews
      : undefined);
  const onsen =
    asNumber(stats.onsen_related_direct_reviews, stats.onsen_related_reviews, stats.total_onsen_related_direct_reviews_counted) ??
    (Number.isFinite(stats.rakuten_onsen_related_direct_reviews + stats.manual_web_onsen_related_direct_reviews)
      ? stats.rakuten_onsen_related_direct_reviews + stats.manual_web_onsen_related_direct_reviews
      : undefined);
  const platformCount =
    asNumber(stats.direct_body_platform_count) ??
    (Array.isArray(stats.platforms_with_direct_body) ? stats.platforms_with_direct_body.length : undefined) ??
    (stats.direct_body_platforms && typeof stats.direct_body_platforms === 'object' ? Object.keys(stats.direct_body_platforms).length : undefined) ??
    (stats.direct_reviews_by_platform && typeof stats.direct_reviews_by_platform === 'object' ? Object.keys(stats.direct_reviews_by_platform).length : undefined) ??
    (stats.platform_counts && typeof stats.platform_counts === 'object' ? Object.keys(stats.platform_counts).length : undefined) ??
    (stats.by_platform && typeof stats.by_platform === 'object' ? Object.keys(stats.by_platform).length : undefined);
  const platforms =
    stats.direct_body_platforms ??
    stats.platforms_with_direct_body ??
    stats.platform_counts ??
    stats.direct_reviews_by_platform ??
    stats.by_platform ??
    {};
  return {
    direct,
    onsen,
    platformCount,
    platforms,
    visibleReviewPool: stats.visible_review_pool ?? stats.visible_review_pool_note ?? stats.visible_review_pool_sum_with_overlap ?? null,
    grade: stats.data_quality_grade ?? stats.grade ?? '',
  };
}

function loadReviewBundle(slug) {
  const dir = path.join(reviewRoot, slug);
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir);
  const statsFile = newest(files, /^(collection_stats|review_sample_stats)_.*\.json$/);
  const sampleFile =
    newest(files, /^direct_review_tags_.*\.csv$/) ??
    newest(files, /^combined_review_sample_2026-.*\.csv$/) ??
    newest(files, /^direct_review_sample_index_.*\.csv$/);
  if (!statsFile || !sampleFile) return null;
  const stats = JSON.parse(readFileSync(path.join(dir, statsFile), 'utf8'));
  const rows = readCsv(path.join(dir, sampleFile));
  const manualFile = newest(files, /^manual_web_evidence_.*\.csv$/);
  const manualRows = manualFile ? readCsv(path.join(dir, manualFile)) : [];
  rows.push(...manualRows);
  const samplePlatforms = [...new Set(rows.map((row) => normalizePlatform(row.platform)).filter(Boolean))];
  const parsedStats = statsFromObject(stats);
  const onsenCountFromRows = rows.filter((row) => isTruthy(row.onsen_related ?? row.is_onsen_related ?? row.onsen_related_direct_review)).length;
  return {
    slug,
    dir,
    statsFile,
    sampleFile,
    manualFile,
    rows,
    directCount: parsedStats.direct ?? rows.length,
    onsenCount: parsedStats.onsen ?? onsenCountFromRows,
    platformCount: Math.max(parsedStats.platformCount ?? 0, samplePlatforms.length),
    platforms: platformList(parsedStats.platforms, samplePlatforms),
    visibleReviewPool: parsedStats.visibleReviewPool,
    grade: parsedStats.grade,
  };
}

function platformList(platformsValue, fallback) {
  const raw = [];
  if (Array.isArray(platformsValue)) raw.push(...platformsValue);
  else if (platformsValue && typeof platformsValue === 'object') raw.push(...Object.keys(platformsValue));
  const normalized = [...raw, ...fallback].map(normalizePlatform).filter(Boolean);
  return [...new Set(normalized)];
}

function aggregateItems(bundle) {
  const map = new Map();

  for (const row of bundle.rows) {
    const platform = normalizePlatform(row.platform);
    const rawAreas = splitList(row.bath_areas ?? row.bath_area ?? row.bath_area_guess);
    let signals = splitList(row.signals ?? row.signal_tags ?? row.signal_types ?? row.signal_type ?? row.signal_guess).map(normalizeSignal).filter(Boolean);
    if (signals.length === 0 && isTruthy(row.onsen_related ?? row.is_onsen_related ?? row.onsen_related_direct_review)) {
      signals = deriveSignalsFromBathAreas(rawAreas);
    }

    for (const signal of signals) {
      const bathArea = selectBathArea(signal, rawAreas);
      const direction = normalizeDirection(row.direction ?? row.signal_directions ?? row.signal_direction, signal, row.rating);
      const denominator = signalScope[signal] ?? 'onsen_related';
      const denominatorValue = denominator === 'experiences_read' ? bundle.directCount : bundle.onsenCount;
      const key = `${bathArea}:${signal}`;
      if (!map.has(key)) {
        map.set(key, {
          bathArea,
          signal,
          denominator,
          denominatorValue,
          mentions: 0,
          platforms: new Set(),
          directionCounts: { positive: 0, mixed: 0, negative: 0, neutral: 0 },
        });
      }
      const item = map.get(key);
      item.mentions += 1;
      if (platform) item.platforms.add(platform);
      item.directionCounts[direction] = (item.directionCounts[direction] ?? 0) + 1;
    }
  }

  return [...map.values()]
    .map((item) => {
      const direction = Object.entries(item.directionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'neutral';
      return {
        ...item,
        direction,
        negative: item.directionCounts.negative,
        platformCount: item.platforms.size,
        platforms: [...item.platforms],
      };
    })
    .filter((item) => item.mentions >= 10)
    .filter((item) => item.platformCount >= 2)
    .filter((item) => item.denominatorValue > 0 && item.mentions <= item.denominatorValue)
    .filter((item) => item.mentions / item.denominatorValue >= 0.02)
    .filter((item) => item.direction !== 'neutral')
    .sort((a, b) => itemPriority(a) - itemPriority(b) || b.mentions - a.mentions || b.platformCount - a.platformCount)
    .slice(0, 5);
}

function itemPriority(item) {
  if (item.signal === 'room_bath_hot_spring' || item.signal === 'public_bath_hot_spring' || item.signal === 'private_bath_experience') return 0;
  if (item.signal === 'water_texture') return 1;
  if (item.signal === 'booking_confusion' || item.signal === 'crowding' || item.signal === 'temperature_control' || item.signal === 'temperature_management') return 2;
  return 3;
}

function itemLabel(item) {
  if (item.signal === 'room_bath_hot_spring') return bathAreaLabels[item.bathArea] ?? '객실 내 프라이빗탕';
  if (item.signal === 'public_bath_hot_spring') return bathAreaLabels[item.bathArea] ?? '대욕장/공용 온천';
  if (item.signal === 'private_bath_experience') return bathAreaLabels[item.bathArea] ?? '대절탕';
  return signalLabels[item.signal] ?? '온천 이용';
}

function itemType(item) {
  if (conditionalSignals.has(item.signal)) return 'conditional';
  if (item.direction === 'mixed' || item.direction === 'negative') return 'conditional';
  if (item.mentions / item.denominatorValue < 0.08) return 'minor';
  return 'positive';
}

function itemHeadline(item) {
  const label = itemLabel(item);
  if (item.signal === 'weak_onsen_feeling') return '온천감은 기대치에 따라 갈립니다.';
  if (item.signal === 'chlorine_smell') return '냄새 민감도는 변수로 남습니다.';
  if (item.signal === 'crowding') return '혼잡은 시간대에 따라 달라집니다.';
  if (item.signal === 'booking_confusion') return '객실 타입과 운영 조건을 함께 보셔야 합니다.';
  if (item.signal === 'temperature_control' || item.signal === 'temperature_management') return '수온 체감은 계절과 시간대 영향을 받습니다.';
  if (item.signal === 'water_texture') return '수질 체감이 선택 기준으로 잡힙니다.';
  return `${label}이 주요 판단 기준입니다.`;
}

function itemBody(item) {
  const label = itemLabel(item);
  if (item.type === 'conditional') {
    return `${label} 관련 표현은 장점과 주의점이 함께 잡힙니다. 여러 플랫폼에서 반복되므로 객실 타입, 시간대, 계절 조건을 예약 전에 나란히 살펴보시기 바랍니다.`;
  }
  if (item.type === 'minor') {
    return `${label}은 중심 경험만큼 크지는 않지만 선택 전에 함께 볼 만한 항목입니다. 다른 욕장 경험과 비교하면 숙소의 성격이 더 분명해집니다.`;
  }
  return `${label} 관련 만족 표현은 플랫폼을 나눠 봐도 안정적으로 반복됩니다. 이 숙소를 고를 때 먼저 볼 핵심 온천 경험으로 볼 수 있습니다.`;
}

function itemVerdict(item) {
  const label = itemLabel(item);
  if (item.signal === 'booking_confusion') return '예약 단계에서 객실 타입과 온천 이용 조건을 따로 살펴보시기 바랍니다.';
  if (item.signal === 'temperature_control' || item.signal === 'temperature_management') return '겨울이나 야간 이용이 중요하다면 수온 조절 조건을 먼저 살펴보시기 바랍니다.';
  if (item.signal === 'weak_onsen_feeling' || item.signal === 'chlorine_smell') return '진한 온천감을 최우선으로 둔다면 다른 후보와 함께 비교하시기 바랍니다.';
  if (item.signal === 'crowding') return '조용한 이용을 원하면 시간대와 공용탕 동선을 먼저 살펴보시기 바랍니다.';
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

function deriveBathScope(primaryBath, items, sourceFlowOfficial) {
  const bathAreas = new Set(items.map((item) => item.bathArea));
  const hasRoom = /객실/.test(primaryBath) || bathAreas.has('room_bath') || bathAreas.has('room_open_air_bath');
  const hasPublic = /대욕장|공용/.test(primaryBath) || bathAreas.has('public_bath') || bathAreas.has('open_air_public_bath');
  if (sourceFlowOfficial && /全室|전 객실/.test(sourceFlowOfficial)) return 'all_rooms';
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

function hasOfficialSourceFlow(candidate) {
  const text = `${candidate.official_bath_or_product_fact ?? ''} ${candidate.normalization_notes ?? ''}`;
  return /源泉かけ流し|源泉掛け流し|원천가케나가시|원천\s*100|源泉100/.test(text) ? text : '';
}

function deriveWaterCriteria(items, sourceFlowText) {
  const values = new Set(['spring_confirmed']);
  if (sourceFlowText) values.add('direct_source');
  if (items.some((item) => item.signal === 'water_texture')) values.add('water_texture');
  if (items.some((item) => item.signal === 'temperature_control' || item.signal === 'temperature_management')) values.add('temperature_adjustment');
  return [...values];
}

function evidenceCounts(bundle, items) {
  const countBy = (predicate) => items.filter(predicate).reduce((sum, item) => sum + item.mentions, 0);
  return {
    directReviewCount: bundle.directCount,
    onsenReviewCount: bundle.onsenCount,
    directBodyPlatformCount: bundle.platformCount,
    roomBathMentionCount: countBy((item) => item.signal === 'room_bath_hot_spring'),
    publicBathMentionCount: countBy((item) => item.signal === 'public_bath_hot_spring'),
    privateBathMentionCount: countBy((item) => item.signal === 'private_bath_experience'),
    waterTextureMentionCount: countBy((item) => item.signal === 'water_texture'),
    cautionMentionCount: countBy((item) => itemType(item) === 'conditional'),
  };
}

function createAccommodation(candidate, bundle, items, level) {
  const meta = areaMeta[candidate.area_slug];
  const [region, area, regionGroup, prefecture, city, onsenArea] = meta;
  const sourceFlowText = hasOfficialSourceFlow(candidate);
  const primaryBath = primaryBathFromItems(items);
  const bathScope = deriveBathScope(primaryBath, items, sourceFlowText);
  const displayName = displayNameKo[candidate.slug] ?? candidate.name_ko_or_en ?? candidate.name_ja ?? candidate.slug;
  const notes = [`${primaryBath}으로 정리했습니다`];
  if (sourceFlowText) notes.push('공식 정보 기준으로 원천을 흘려보내는 방식이 확인됩니다');
  if (items.some((item) => item.signal === 'booking_confusion')) notes.push('객실 타입과 운영 조건을 예약 전에 함께 살펴보시기 바랍니다');
  if (items.some((item) => item.signal === 'temperature_control' || item.signal === 'temperature_management')) {
    notes.push('수온 체감은 계절과 시간대에 따라 달라질 수 있습니다');
  }

  return {
    slug: candidate.slug,
    name: displayName,
    ja_name: candidate.name_ja || null,
    display_name_ko: displayName,
    name_ja: candidate.name_ja || null,
    name_en: /[A-Za-z]/.test(candidate.name_ko_or_en ?? '') ? candidate.name_ko_or_en : null,
    aliases_ko: [displayName],
    aliases_ja: candidate.name_ja ? [candidate.name_ja] : [],
    aliases_en: /[A-Za-z]/.test(candidate.name_ko_or_en ?? '') ? [candidate.name_ko_or_en] : [],
    name_verification_status: 'verified',
    name_source_note:
      candidate.slug === 'yamanaka-kayotei'
        ? '후보 slug는 kayotei로 되어 있으나 공식명은 山中温泉 花紫이며, 한국어 서비스명은 하나무라사키로 보정했습니다.'
        : '중부/호쿠리쿠/고신 QA seed 생성 과정에서 한국어 서비스명을 보정했습니다.',
    region,
    area,
    country: 'JP',
    region_group: regionGroup,
    prefecture,
    city,
    onsen_area: onsenArea,
    travel_contexts: ['ryokan_stay'],
    bath_contexts: deriveBathContexts(primaryBath, items),
    water_criteria: deriveWaterCriteria(items, sourceFlowText),
    summary: `${area}의 온천 숙소입니다. ${primaryBath}으로 이용 경험이 반복되며, 객실 타입과 운영 조건을 예약 전에 함께 살펴보시기 바랍니다.`,
    primary_bath: primaryBath,
    water_use_status: 'official_confirmed',
    water_source_type: sourceFlowText ? 'free_flowing_source' : 'hot_spring_confirmed',
    bath_scope: bathScope,
    operation_notes: notes,
    evidence_counts: evidenceCounts(bundle, items),
    evidence_grade: bundle.directCount >= 300 ? 'A' : bundle.directCount >= 150 ? 'B' : 'C',
    evidence_note: `직접 읽은 이용 경험 ${bundle.directCount.toLocaleString('ko-KR')}건, 온천 관련 ${bundle.onsenCount.toLocaleString('ko-KR')}건, 본문 확인 플랫폼 ${bundle.platformCount}개`,
    status: 'active',
    source_file: `research/onsen-review-signals/${candidate.slug}/${bundle.sampleFile}`,
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
      verdict: itemVerdict(typed),
      chip_label: itemLabel(typed),
      adoption_status: 'verdict_basis',
      signal_key: item.signal,
      bath_area: item.bathArea,
      platforms: item.platforms,
      season_months: item.signal === 'temperature_control' || item.signal === 'temperature_management' ? [11, 12, 1, 2, 3] : null,
    };
  });
}

function createFactStatuses(candidate, accommodation, items) {
  const facts = [
    {
      code: 'hot_spring_water',
      label: '온천수',
      status: 'confirmed',
      value: '공식 안내 기준 온천 이용 확인',
      source: candidate.official_url,
    },
  ];
  if (hasOfficialSourceFlow(candidate)) {
    facts.push({
      code: 'water_kakenagashi',
      label: '원천 100% 직수',
      status: 'confirmed',
      value: '공식 안내 기준 원천 흘려보냄',
      source: candidate.official_url,
    });
  }
  if (items.some((item) => item.signal === 'room_bath_hot_spring')) {
    facts.push({
      code: 'room_bath_scope',
      label: '객실 내 프라이빗탕',
      status: accommodation.bath_scope === 'all_rooms' ? 'confirmed' : 'needs_check',
      value: accommodation.bath_scope === 'all_rooms' ? '전 객실 중심' : '객실 타입별 구성',
      source: candidate.official_url,
    });
  }
  return facts;
}

function createVerdict(candidate, accommodation, bundle, items, level) {
  return {
    target_type: 'accommodation',
    target_slug: candidate.slug,
    level,
    headline: `${accommodation.primary_bath} 숙소입니다.`,
    briefing: {
      experiences_read: bundle.directCount,
      onsen_related: bundle.onsenCount,
      platform_count: bundle.platformCount,
      platforms: bundle.platforms,
    },
    items: level === 'full' ? createVerdictItems(items) : [],
    fact_statuses: createFactStatuses(candidate, accommodation, items),
    status: 'published',
    verified_at: seedDate,
    source_file: `research/onsen-review-signals/${candidate.slug}/${bundle.sampleFile}`,
  };
}

function validateRows(accommodations, verdicts) {
  const errors = [];
  const banned = [/후기/, /리뷰/, /신호/, /확인 필요/, /확인 중(?:입니다|$)/];
  for (const row of accommodations) {
    if (!row.display_name_ko || !/[가-힣]/.test(row.display_name_ko)) errors.push(`${row.slug}: Korean display name missing`);
    for (const field of [row.summary, row.primary_bath, row.evidence_note, row.name_source_note, ...row.operation_notes]) {
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
      if (item.counts.mentions > denominator) errors.push(`${verdict.target_slug}: item mentions exceed denominator`);
      if (item.counts.negative > item.counts.mentions) errors.push(`${verdict.target_slug}: negative exceeds mentions`);
      if (item.counts.platform_count < 2) errors.push(`${verdict.target_slug}: item platform count below 2`);
    }
  }
  return errors;
}

function createSql(accommodations, verdicts) {
  const lines = [
    '-- Generated by scripts/build_chubu_hokuriku_koshin_reconciliation_seed.mjs',
    `-- Source: ${path.relative(repoRoot, candidatePath)}`,
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

function createBacklogCsv(candidateRows, seededSlugs, missingStats) {
  const rows = candidateRows
    .filter((row) => row.candidate_status.includes('ready') && !seededSlugs.has(row.slug))
    .map((row) => ({
      slug: row.slug,
      name_ja: row.name_ja,
      area_slug: row.area_slug,
      candidate_status: row.candidate_status,
      backlog_bucket: missingStats.has(row.slug) ? '딥리서치 원천 없음' : 'DB seed 기준 미달',
      next_action: missingStats.has(row.slug)
        ? '숙소별 직접 본문 300건과 온천 관련 200건 이상을 목표로 원천 수집을 진행합니다.'
        : '직접 수, 온천 관련 수, 플랫폼 수, 채택 item 수를 다시 검산합니다.',
    }));
  const headers = ['slug', 'name_ja', 'area_slug', 'candidate_status', 'backlog_bucket', 'next_action'];
  return `${headers.join(',')}\n${rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')).join('\n')}\n`;
}

function createReport(accommodations, verdicts, candidateRows, missingStats, sourceInventory) {
  const full = verdicts.filter((row) => row.level === 'full');
  const lite = verdicts.filter((row) => row.level === 'lite');
  const readyCandidates = candidateRows.filter((row) => row.candidate_status.includes('ready'));
  const lines = [
    '# 중부/호쿠리쿠/고신 온천 판정 DB Seed 리포트',
    '',
    `작성일: ${seedDate}`,
    '',
    '## 요약',
    '',
    `- ready 후보: ${readyCandidates.length}곳`,
    `- 이번 seed 생성 숙소: ${accommodations.length}곳`,
    `- full verdict: ${full.length}곳`,
    `- lite verdict: ${lite.length}곳`,
    `- 딥리서치 원천이 없어 보류한 ready 후보: ${missingStats.size}곳`,
    '',
    '## Seed 대상',
    '',
    '| slug | 숙소명 | 지역 | 직접 | 온천 | 플랫폼 | verdict | item | 온천수 방식 |',
    '|---|---|---|---:|---:|---:|---|---:|---|',
    ...verdicts.map((row) => {
      const accommodation = accommodations.find((item) => item.slug === row.target_slug);
      return `| ${row.target_slug} | ${accommodation?.name ?? ''} | ${accommodation?.area ?? ''} | ${row.briefing.experiences_read} | ${row.briefing.onsen_related} | ${row.briefing.platform_count} | ${row.level} | ${row.items.length} | ${accommodation?.water_source_type ?? ''} |`;
    }),
    '',
    '## 원천 파일',
    '',
    '| slug | stats | sample | rows |',
    '|---|---|---|---:|',
    ...sourceInventory.map((item) => `| ${item.slug} | ${item.statsFile} | ${item.sampleFile} | ${item.rows} |`),
    '',
    '## 산출물',
    '',
    `- \`${path.relative(repoRoot, outputJsonPath)}\``,
    `- \`${path.relative(repoRoot, outputSqlPath)}\``,
    `- \`${path.relative(repoRoot, outputBacklogPath)}\``,
    '',
    '## 적용 전 기준',
    '',
    '- full verdict는 직접 읽은 이용 경험 300건 이상, 온천 관련 200건 이상, 본문 확인 플랫폼 3개 이상, 채택 item 3개 이상일 때만 생성했다.',
    '- item 채택은 언급 10건 이상, 2개 플랫폼 이상, 분모 2% 이상으로 제한했다.',
    '- 공식 문구에 `源泉かけ流し` 또는 `源泉100`이 있는 숙소만 `water_kakenagashi` confirmed fact를 부여했다.',
    '',
  ];
  return `${lines.join('\n')}\n`;
}

async function main() {
  const candidateRows = readCsv(candidatePath);
  const candidateBySlug = new Map(candidateRows.map((row) => [row.slug, row]));
  const reviewDirs = readdirSync(reviewRoot).filter((slug) => targetSlugPattern.test(slug)).sort();
  const accommodations = [];
  const verdicts = [];
  const missingStats = new Set();
  const sourceInventory = [];

  for (const slug of reviewDirs) {
    const candidate = candidateBySlug.get(slug);
    if (!candidate || !candidate.candidate_status.includes('ready') || !areaMeta[candidate.area_slug]) continue;
    const bundle = loadReviewBundle(slug);
    if (!bundle) {
      missingStats.add(slug);
      continue;
    }
    const items = aggregateItems(bundle);
    const canBeFull = bundle.directCount >= 300 && bundle.onsenCount >= 200 && bundle.platformCount >= 3 && items.length >= 3;
    const level = canBeFull ? 'full' : 'lite';
    const accommodation = createAccommodation(candidate, bundle, items, level);
    const verdict = createVerdict(candidate, accommodation, bundle, items, level);
    accommodations.push(accommodation);
    verdicts.push(verdict);
    sourceInventory.push({
      slug,
      statsFile: bundle.statsFile,
      sampleFile: bundle.manualFile ? `${bundle.sampleFile} + ${bundle.manualFile}` : bundle.sampleFile,
      rows: bundle.rows.length,
    });
  }

  for (const row of candidateRows) {
    if (row.candidate_status.includes('ready') && targetSlugPattern.test(row.slug) && !reviewDirs.includes(row.slug)) {
      missingStats.add(row.slug);
    }
  }

  const errors = validateRows(accommodations, verdicts);
  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputJsonPath, JSON.stringify({ accommodations, verdicts }, null, 2));
  await writeFile(outputSqlPath, createSql(accommodations, verdicts));
  await writeFile(outputBacklogPath, createBacklogCsv(candidateRows, new Set(accommodations.map((row) => row.slug)), missingStats));
  await writeFile(outputReportPath, createReport(accommodations, verdicts, candidateRows, missingStats, sourceInventory));

  console.log(`Generated ${accommodations.length} accommodations and ${verdicts.length} verdicts.`);
  console.log(path.relative(repoRoot, outputJsonPath));
  console.log(path.relative(repoRoot, outputReportPath));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
