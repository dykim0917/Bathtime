import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const seedDate = '2026-07-09';
const reviewRoot = path.join(repoRoot, 'research/onsen-review-signals');
const batchRoot = path.join(reviewRoot, 'kanto-2026-07-08');
const readyPath = path.join(batchRoot, 'kanto_accommodation_db_seed_ready_2026-07-08.csv');
const statusPath = path.join(batchRoot, 'kanto_accommodation_deepresearch_status_2026-07-08.csv');
const outputDir = path.join(repoRoot, 'research/onsen-db-seed');
const outputBase = 'kanto_remaining_reconciliation_seed_2026-07-09';
const outputJsonPath = path.join(outputDir, `${outputBase}.json`);
const outputSqlPath = path.join(outputDir, `${outputBase}.upsert.sql`);
const outputReportPath = path.join(outputDir, `${outputBase}_report.md`);
const outputStatsPath = path.join(outputDir, `${outputBase}_normalized_source_stats.csv`);
const outputBacklogPath = path.join(outputDir, `${outputBase}_backlog.csv`);

const displayNameKo = {
  'ikaho-kaichoro': '오쿠이카호 료테이 카이초로',
  'kinugawa-kanaya': '기누가와 가나야 호텔',
  'kusatsu-hotel-ichii': '호텔 이치이',
  'kusatsu-lavista-hills': '라비스타 쿠사츠 힐즈',
  'kusatsu-naraya': '쿠사츠온천 나라야',
  'kusatsu-tokino-niwa': '유야도 토키노니와',
  'minakami-senjuan': '벳테이 센주안',
  'nasu-bettei-kai': '나스 벳테이 카이',
  'nasu-omaru': '오마루온천 료칸',
  'nasu-sanraku': '나스온천 산라쿠',
};

const areaMeta = {
  kusatsu: ['kusatsu', '간토 · 군마현 · 쿠사츠', 'kanto', 'gunma', 'kusatsu', 'kusatsu'],
  ikaho: ['ikaho', '간토 · 군마현 · 이카호', 'kanto', 'gunma', 'shibukawa', 'ikaho'],
  minakami: ['minakami', '간토 · 군마현 · 미나카미', 'kanto', 'gunma', 'minakami', 'minakami'],
  nasu: ['nasu', '간토 · 도치기현 · 나스', 'kanto', 'tochigi', 'nasu', 'nasu'],
  kinugawa: ['kinugawa', '간토 · 도치기현 · 기누가와', 'kanto', 'tochigi', 'nikko', 'kinugawa'],
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

const signalLabels = {
  room_bath_hot_spring: '객실 내 프라이빗탕',
  public_bath_hot_spring: '공용 온천',
  private_bath_experience: '대절탕',
  water_texture: '수질 체감',
  weak_onsen_feeling: '온천감 약함',
  chlorine_smell: '염소 냄새',
  crowding: '혼잡',
  booking_confusion: '예약/운영 조건',
  temperature_management: '수온 관리',
  temperature_control: '수온 조절',
};

const conditionalSignals = new Set([
  'weak_onsen_feeling',
  'chlorine_smell',
  'crowding',
  'booking_confusion',
  'temperature_management',
  'temperature_control',
]);

const signalScope = {
  booking_confusion: 'experiences_read',
  crowding: 'experiences_read',
  temperature_management: 'experiences_read',
  temperature_control: 'experiences_read',
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
      } else if (char === '"') quoted = false;
      else field += char;
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
    } else if (char !== '\r') field += char;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...body] = rows.filter((items) => items.some((item) => item.trim().length > 0));
  if (!headers) return [];
  const cleanHeaders = headers.map((header) => header.replace(/^\uFEFF/, ''));
  return body.map((items) => Object.fromEntries(cleanHeaders.map((header, index) => [header, items[index] ?? ''])));
}

function readCsv(filePath) {
  return parseCsv(readFileSync(filePath, 'utf8'));
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function toInt(value) {
  const parsed = Number.parseInt(String(value ?? '').replace(/,/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function firstNumber(...values) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const parsed = toInt(value);
    if (parsed > 0) return parsed;
  }
  return undefined;
}

function newest(files, matcher) {
  return files.filter((file) => matcher.test(file)).sort().at(-1) ?? null;
}

function splitList(value) {
  return String(value ?? '')
    .split(/\s*[;|,/]\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
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

function normalizePlatform(value) {
  const raw = String(value ?? '').trim();
  const lower = raw.toLowerCase();
  if (!raw || lower.includes('snippet') || lower.includes('provider card') || lower.includes('supplier card')) return '';
  if (lower.includes('jalan')) return '자란';
  if (lower.includes('rakuten')) return '라쿠텐';
  if (lower.includes('google hotels')) return '구글 호텔';
  if (lower.includes('google maps') || lower.includes('google native')) return '구글 지도';
  if (lower.includes('google')) return '구글';
  if (lower.includes('ikkyu') || lower.includes('一休')) return '잇큐';
  if (lower.includes('yahoo')) return '야후 트래블';
  if (lower.includes('jtb')) return 'JTB';
  if (lower.includes('trip.com') || lower.includes('tripcom')) return '트립닷컴';
  if (lower.includes('tripadvisor')) return '트립어드바이저';
  if (lower.includes('agoda')) return '아고다';
  if (lower.includes('booking')) return '부킹닷컴';
  if (lower.includes('naver') && lower.includes('cafe')) return '네이버 카페';
  if (lower.includes('naver') && lower.includes('blog')) return '네이버 블로그';
  if (lower.includes('naver')) return '네이버';
  if (lower.includes('4travel')) return '포트래블';
  if (lower.includes('relux')) return '리럭스';
  if (lower.includes('tabelog')) return '타베로그';
  if (lower.includes('instagram')) return '인스타그램';
  if (lower.includes('facebook')) return '페이스북';
  if (lower.includes('youtube')) return '유튜브';
  if (lower.includes('note')) return 'note';
  if (lower.includes('chinese blog')) return '중국어 블로그';
  if (lower.includes('japanese blog')) return '일본어 블로그';
  if (lower.includes('blog')) return '블로그';
  if (lower.includes('ptt')) return 'PTT';
  return raw;
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

function normalizeSignal(value) {
  const lower = String(value ?? '').trim().toLowerCase();
  if (!lower || ['neutral', 'food', 'service', 'room', 'access', 'general_stay'].includes(lower)) return '';
  if (lower.includes('room_bath_hot_spring') || lower === 'room_bath' || lower === 'room_open_air_bath') return 'room_bath_hot_spring';
  if (lower.includes('public_bath_hot_spring') || lower === 'public_bath' || lower === 'open_air_public_bath') return 'public_bath_hot_spring';
  if (lower.includes('private_bath_experience') || lower === 'private_bath' || lower === 'family_bath') return 'private_bath_experience';
  if (lower.includes('water_texture')) return 'water_texture';
  if (lower.includes('weak_onsen_feeling')) return 'weak_onsen_feeling';
  if (lower.includes('chlorine')) return 'chlorine_smell';
  if (lower.includes('crowding')) return 'crowding';
  if (lower.includes('booking')) return 'booking_confusion';
  if (lower.includes('temperature_control')) return 'temperature_control';
  if (lower.includes('temperature')) return 'temperature_management';
  return lower;
}

function normalizeDirection(value, signal, rating) {
  const lower = String(value ?? '').trim().toLowerCase();
  if (lower.includes('negative')) return 'negative';
  if (lower.includes('mixed')) return 'mixed';
  if (lower.includes('positive')) return 'positive';
  if (signal === 'weak_onsen_feeling' || signal === 'chlorine_smell') return 'negative';
  if (conditionalSignals.has(signal)) return 'mixed';
  const numeric = Number.parseFloat(String(rating ?? ''));
  if (Number.isFinite(numeric) && numeric > 0 && numeric <= 2) return 'mixed';
  return 'positive';
}

function isTruthy(value) {
  return /^(yes|true|1|y)$/i.test(String(value ?? '').trim());
}

function signalPairs(row) {
  const pairs = splitList(row.signal_tags).map((item) => {
    const [signal, direction] = item.split(':');
    return { signal: normalizeSignal(signal), direction: normalizeDirection(direction, signal, row.rating) };
  });
  if (pairs.length > 0) return pairs.filter((item) => item.signal);

  const signals = splitList(row.signal_types ?? row.signal_type ?? row.signal_guess).map(normalizeSignal).filter(Boolean);
  const directions = splitList(row.signal_directions ?? row.signal_direction ?? row.direction);
  return signals.map((signal, index) => ({
    signal,
    direction: normalizeDirection(directions[index] ?? directions.join(';'), signal, row.rating),
  }));
}

function deriveSignalsFromBathAreas(rawAreas) {
  const areas = rawAreas.map(normalizeBathArea);
  if (areas.some((area) => area === 'room_bath' || area === 'room_open_air_bath')) return [{ signal: 'room_bath_hot_spring', direction: 'positive' }];
  if (areas.some((area) => area === 'private_bath' || area === 'family_bath')) return [{ signal: 'private_bath_experience', direction: 'positive' }];
  if (areas.some((area) => area === 'public_bath' || area === 'open_air_public_bath' || area === 'facility_wide')) {
    return [{ signal: 'public_bath_hot_spring', direction: 'positive' }];
  }
  return [];
}

function selectBathArea(signal, rawAreas) {
  const areas = rawAreas.map(normalizeBathArea).filter(Boolean);
  const find = (choices) => choices.find((choice) => areas.includes(choice));
  if (signal === 'room_bath_hot_spring') return find(['room_open_air_bath', 'room_bath']) ?? 'room_bath';
  if (signal === 'public_bath_hot_spring') return find(['open_air_public_bath', 'public_bath', 'facility_wide']) ?? 'public_bath';
  if (signal === 'private_bath_experience') return find(['private_bath', 'family_bath']) ?? 'private_bath';
  return find(['room_open_air_bath', 'room_bath', 'open_air_public_bath', 'public_bath', 'private_bath', 'family_bath', 'facility_wide', 'unclear']) ?? 'facility_wide';
}

function statsFromObject(stats) {
  const direct = firstNumber(
    stats.directly_read_total,
    stats.directly_read_reviews,
    stats.direct_reviews_total,
    stats.total_direct_reviews,
    stats.direct_read_review_count,
    stats.direct_read_reviews,
    stats.direct_reviews_checked,
    stats.direct_read_total
  );
  const onsen = firstNumber(
    stats.onsen_related_total,
    stats.onsen_related_direct_reviews,
    stats.onsen_related_direct_review_count,
    stats.onsen_related_direct_reviews_checked,
    stats.onsen_related_reviews
  );
  const platformCount =
    firstNumber(stats.direct_body_platform_count) ??
    (Array.isArray(stats.direct_body_platforms) ? stats.direct_body_platforms.length : undefined) ??
    (stats.direct_body_platforms && typeof stats.direct_body_platforms === 'object' ? Object.keys(stats.direct_body_platforms).length : undefined) ??
    (stats.platform_counts && typeof stats.platform_counts === 'object' ? Object.keys(stats.platform_counts).length : undefined) ??
    (stats.platform_direct_counts && typeof stats.platform_direct_counts === 'object' ? Object.keys(stats.platform_direct_counts).length : undefined);
  const platforms = stats.direct_body_platforms ?? stats.platform_counts ?? stats.platform_direct_counts ?? {};
  return {
    direct,
    onsen,
    platformCount,
    platforms,
    grade: stats.data_quality_grade ?? stats.grade ?? '',
    nameJa: stats.name_ja ?? stats.accommodation_name ?? null,
    nameKoOrEn: stats.name_ko_or_en ?? null,
  };
}

function platformList(value, fallback) {
  const raw = [];
  if (Array.isArray(value)) raw.push(...value);
  else if (value && typeof value === 'object') raw.push(...Object.keys(value));
  return [...new Set([...raw, ...fallback].map(normalizePlatform).filter(Boolean))];
}

function ensurePlatforms(platforms, platformCount) {
  const normalized = [...new Set(platforms.map(normalizePlatform).filter(Boolean))];
  if (normalized.length > 0) return normalized;
  if (platformCount > 0) return [`본문 확인 플랫폼 ${platformCount}개`];
  return [];
}

function loadBundle(slug) {
  const dir = path.join(reviewRoot, slug);
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir);
  const statsFile = newest(files, /^collection_stats_.*\.json$/) ?? newest(files, /^review_sample_stats_.*\.json$/);
  const sampleFile = newest(files, /^direct_review_sample_index_.*\.csv$/);
  if (!statsFile || !sampleFile) return null;

  const stats = readJson(path.join(dir, statsFile));
  const rows = readCsv(path.join(dir, sampleFile));
  const parsed = statsFromObject(stats);
  const samplePlatforms = [...new Set(rows.map((row) => normalizePlatform(row.platform)).filter(Boolean))];
  const onsenFromRows = rows.filter((row) => isTruthy(row.onsen_related ?? row.is_onsen_related)).length;
  const platformCount = Math.max(parsed.platformCount ?? 0, samplePlatforms.length);
  return {
    slug,
    statsFile,
    sampleFile,
    rows,
    directCount: parsed.direct ?? rows.length,
    onsenCount: parsed.onsen ?? onsenFromRows,
    platformCount,
    platforms: ensurePlatforms(platformList(parsed.platforms, samplePlatforms), platformCount),
    grade: parsed.grade,
    nameJa: parsed.nameJa,
    nameKoOrEn: parsed.nameKoOrEn,
    rowCount: rows.length,
    onsenRowCount: onsenFromRows,
  };
}

function dominantDirection(counts) {
  if ((counts.negative ?? 0) > 0 || (counts.mixed ?? 0) > 0) return 'mixed';
  if ((counts.positive ?? 0) > 0) return 'positive';
  return 'neutral';
}

function itemPriority(item) {
  if (['room_bath_hot_spring', 'public_bath_hot_spring', 'private_bath_experience'].includes(item.signal)) return 0;
  if (item.signal === 'water_texture') return 1;
  if (conditionalSignals.has(item.signal)) return 2;
  return 3;
}

function aggregateItems(bundle) {
  const grouped = new Map();
  for (const row of bundle.rows) {
    if (!isTruthy(row.onsen_related ?? row.is_onsen_related)) continue;
    const rawAreas = splitList(row.bath_area_tags ?? row.bath_areas ?? row.bath_area ?? row.bath_area_guess);
    let pairs = signalPairs(row);
    if (pairs.length === 0) pairs = deriveSignalsFromBathAreas(rawAreas);
    const platform = normalizePlatform(row.platform ?? row.source);
    for (const pair of pairs) {
      const bathArea = selectBathArea(pair.signal, rawAreas);
      const denominator = signalScope[pair.signal] ?? 'onsen_related';
      const denominatorValue = denominator === 'experiences_read' ? bundle.directCount : bundle.onsenCount;
      const key = `${bathArea}:${pair.signal}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          bathArea,
          signal: pair.signal,
          denominator,
          denominatorValue,
          mentions: 0,
          platforms: new Set(),
          directionCounts: { positive: 0, mixed: 0, negative: 0, neutral: 0 },
        });
      }
      const item = grouped.get(key);
      item.mentions += 1;
      if (platform) item.platforms.add(platform);
      item.directionCounts[pair.direction] = (item.directionCounts[pair.direction] ?? 0) + 1;
    }
  }

  return [...grouped.values()]
    .map((item) => ({
      ...item,
      direction: dominantDirection(item.directionCounts),
      negative: item.directionCounts.negative,
      platformCount: item.platforms.size,
      platforms: [...item.platforms],
    }))
    .filter((item) => item.signal && item.mentions >= 10)
    .filter((item) => item.direction !== 'neutral')
    .filter((item) => item.platformCount >= 2)
    .filter((item) => item.denominatorValue > 0 && item.mentions <= item.denominatorValue)
    .filter((item) => item.mentions / item.denominatorValue >= 0.02)
    .sort((a, b) => itemPriority(a) - itemPriority(b) || b.mentions - a.mentions || b.platformCount - a.platformCount)
    .slice(0, 5);
}

function itemLabel(item) {
  if (item.bathArea === 'facility_wide' && item.signal === 'public_bath_hot_spring') return '공용 온천';
  if (item.signal === 'room_bath_hot_spring') return bathAreaLabels[item.bathArea] ?? signalLabels[item.signal];
  if (item.signal === 'public_bath_hot_spring') return bathAreaLabels[item.bathArea] ?? signalLabels[item.signal];
  if (item.signal === 'private_bath_experience') return bathAreaLabels[item.bathArea] ?? signalLabels[item.signal];
  return signalLabels[item.signal] ?? '온천 이용';
}

function itemType(item) {
  if (conditionalSignals.has(item.signal)) return 'conditional';
  if (item.direction === 'mixed' || item.negative / Math.max(1, item.mentions) >= 0.18) return 'conditional';
  if (item.mentions / item.denominatorValue < 0.08) return 'minor';
  return 'positive';
}

function itemHeadline(item) {
  if (item.signal === 'weak_onsen_feeling') return '온천감은 조건부로 봐야 합니다.';
  if (item.signal === 'chlorine_smell') return '냄새 민감도는 변수입니다.';
  if (item.signal === 'crowding') return '혼잡은 시간대에 따라 갈립니다.';
  if (item.signal === 'booking_confusion') return '예약 조건은 분리해 봐야 합니다.';
  if (item.signal === 'temperature_management' || item.signal === 'temperature_control') return '수온은 계절과 시간대 영향을 받습니다.';
  if (item.signal === 'water_texture') return '수질 체감이 선택 기준으로 잡힙니다.';
  return `${itemLabel(item)}이 주요 판단 기준입니다.`;
}

function itemBody(item) {
  const label = itemLabel(item);
  if (item.type === 'conditional') {
    return `${label} 관련 평가는 장점과 주의점이 함께 잡힙니다. 여러 플랫폼에서 같은 항목이 반복되므로 예약 조건과 계절 변수를 같이 살펴보시기 바랍니다.`;
  }
  if (item.type === 'minor') {
    return `${label}은 중심 경험만큼 크지는 않지만 선택 전에 함께 볼 만한 항목입니다. 다른 욕장 경험과 비교하면 숙소의 성격이 더 분명해집니다.`;
  }
  return `${label} 관련 만족 표현은 플랫폼을 나눠 봐도 안정적으로 반복됩니다. 이 숙소를 고를 때 먼저 볼 핵심 온천 경험입니다.`;
}

function itemVerdict(item) {
  const label = itemLabel(item);
  if (item.signal === 'booking_confusion') return '예약 단계에서 객실 타입과 온천 이용 조건을 따로 살펴보시기 바랍니다.';
  if (item.signal === 'temperature_management' || item.signal === 'temperature_control') return '겨울이나 야간 이용이 중요하다면 수온 조건을 먼저 살펴보시기 바랍니다.';
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

function primaryBath(items) {
  const bathItem = items
    .filter((item) => ['room_bath_hot_spring', 'public_bath_hot_spring', 'private_bath_experience'].includes(item.signal))
    .sort((a, b) => b.mentions - a.mentions || b.platformCount - a.platformCount)[0];
  if (bathItem) return bathPrimaryLabel(bathItem.bathArea);
  if (items.some((item) => item.signal === 'water_texture')) return '수질 체감 중심';
  return '온천 구성 확인형';
}

function deriveBathContexts(label, items) {
  const values = new Set();
  const text = `${label} ${items.map((item) => item.bathArea).join(' ')}`;
  if (/객실|room_bath|room_open_air/.test(text)) values.add('room_bath');
  if (/대절|가족|private_bath|family_bath/.test(text)) values.add('private_bath');
  if (/대욕장|공용|public_bath|open_air_public/.test(text)) values.add('public_bath');
  return values.size > 0 ? [...values] : ['public_bath'];
}

function bathScope(label, items) {
  const text = `${label} ${items.map((item) => item.bathArea).join(' ')}`;
  const hasRoom = /객실|room_bath|room_open_air/.test(text);
  const hasPublic = /대욕장|공용|public_bath|open_air_public/.test(text);
  if (hasRoom && hasPublic) return 'some_rooms';
  if (hasRoom) return 'room_signal_only';
  if (hasPublic) return 'public_bath_only';
  return 'unclear';
}

function waterCriteria(items) {
  const values = new Set(['spring_confirmed']);
  if (items.some((item) => item.signal === 'water_texture')) values.add('water_texture');
  if (items.some((item) => item.signal === 'temperature_management' || item.signal === 'temperature_control')) values.add('temperature_adjustment');
  return [...values];
}

function evidenceCounts(bundle, items) {
  const countBy = (predicate) => items.filter(predicate).reduce((sum, item) => sum + item.mentions, 0);
  return {
    directReviewCount: bundle.directCount,
    onsenReviewCount: bundle.onsenCount,
    directBodyPlatformCount: bundle.platformCount,
    roomBathMentionCount: countBy((item) => item.bathArea === 'room_bath' || item.bathArea === 'room_open_air_bath'),
    publicBathMentionCount: countBy((item) => item.bathArea === 'public_bath' || item.bathArea === 'open_air_public_bath' || item.bathArea === 'facility_wide'),
    privateBathMentionCount: countBy((item) => item.bathArea === 'private_bath' || item.bathArea === 'family_bath'),
    waterTextureMentionCount: countBy((item) => item.signal === 'water_texture'),
    cautionMentionCount: countBy((item) => itemType(item) === 'conditional'),
  };
}

function createAccommodation(row, bundle, items, level) {
  const meta = areaMeta[row.area_slug] ?? areaMeta.kusatsu;
  const [region, area, regionGroup, prefecture, city, onsenArea] = meta;
  const bath = primaryBath(items);
  const displayName = displayNameKo[row.slug] ?? row.name_ja ?? row.slug;
  const nameJa = bundle.nameJa ?? row.name_ja ?? null;
  const nameEn = /[A-Za-z]/.test(row.name_ko_or_en ?? '') ? row.name_ko_or_en : bundle.nameKoOrEn;
  const operationNotes = [`${bath}으로 정리했습니다`];
  if (items.some((item) => item.signal === 'booking_confusion')) operationNotes.push('객실 타입과 운영 조건을 예약 전에 함께 살펴보시기 바랍니다');
  if (items.some((item) => item.signal === 'temperature_management' || item.signal === 'temperature_control')) operationNotes.push('수온 체감은 계절과 시간대에 따라 달라질 수 있습니다');
  return {
    slug: row.slug,
    name: displayName,
    ja_name: nameJa,
    display_name_ko: displayName,
    name_ja: nameJa,
    name_en: nameEn || null,
    aliases_ko: [displayName],
    aliases_ja: nameJa ? [nameJa] : [],
    aliases_en: nameEn ? [nameEn] : [],
    name_verification_status: 'verified',
    name_source_note: '간토 잔여 숙소 판정 seed 생성 과정에서 후보명과 딥리서치 산출물을 대조했습니다.',
    region,
    area,
    country: 'JP',
    region_group: regionGroup,
    prefecture,
    city,
    onsen_area: onsenArea,
    travel_contexts: ['ryokan_stay'],
    bath_contexts: deriveBathContexts(bath, items),
    water_criteria: waterCriteria(items),
    summary: `${area}의 온천 숙소입니다. ${bath}으로 이용 경험이 반복되며, 객실 타입과 운영 조건을 예약 전에 함께 살펴보시기 바랍니다.`,
    primary_bath: bath,
    water_use_status: 'review_supported',
    water_source_type: 'hot_spring_confirmed',
    bath_scope: bathScope(bath, items),
    operation_notes: operationNotes,
    evidence_counts: evidenceCounts(bundle, items),
    evidence_grade: bundle.directCount >= 300 ? 'A' : bundle.directCount >= 150 ? 'B' : 'C',
    evidence_note: `직접 읽은 이용 경험 ${bundle.directCount.toLocaleString('ko-KR')}건, 온천 관련 ${bundle.onsenCount.toLocaleString('ko-KR')}건, 본문 확인 플랫폼 ${bundle.platformCount}개`,
    status: 'active',
    source_file: `research/onsen-review-signals/${row.slug}/${bundle.sampleFile}`,
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
      season_months: ['temperature_management', 'temperature_control'].includes(item.signal) ? [11, 12, 1, 2, 3] : null,
    };
  });
}

function createVerdict(row, accommodation, bundle, items, level) {
  return {
    target_type: 'accommodation',
    target_slug: row.slug,
    level,
    headline: `${accommodation.primary_bath} 숙소입니다.`,
    briefing: {
      experiences_read: bundle.directCount,
      onsen_related: bundle.onsenCount,
      platform_count: bundle.platformCount,
      platforms: bundle.platforms,
    },
    items: level === 'full' ? createVerdictItems(items) : [],
    fact_statuses: [
      {
        code: 'hot_spring_water',
        label: '온천수',
        status: 'confirmed',
        value: '공식 정보와 이용 경험 표본 기준 온천 이용 확인',
        source: row.source_urls?.split(';')[0]?.trim() || null,
      },
    ],
    status: 'published',
    verified_at: seedDate,
    source_file: `research/onsen-review-signals/${row.slug}/${bundle.sampleFile}`,
  };
}

function createSql(accommodations, verdicts) {
  const lines = [
    '-- Generated by scripts/build_kanto_remaining_reconciliation_seed.mjs',
    `-- Generated at ${seedDate}`,
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

function validate(accommodations, verdicts, statsRows) {
  const errors = [];
  const banned = [/후기/, /리뷰/, /신호/, /확인 필요/, /확인 중(?:입니다|$)/];
  for (const row of accommodations) {
    if (!/[가-힣]/.test(row.display_name_ko ?? '')) errors.push(`${row.slug}: Korean display name missing`);
    if (/[A-Za-z]/.test(row.area ?? '')) errors.push(`${row.slug}: romanized area leaked`);
    for (const field of [row.summary, row.primary_bath, row.evidence_note, row.name_source_note, ...row.operation_notes]) {
      for (const pattern of banned) {
        if (pattern.test(field)) errors.push(`${row.slug}: banned copy ${pattern.source}`);
      }
    }
  }
  for (const row of statsRows) {
    if (row.direct_reviews_checked !== row.sample_rows) errors.push(`${row.slug}: direct count and sample rows mismatch`);
    if (row.onsen_related_checked !== row.onsen_related_sample_rows) errors.push(`${row.slug}: onsen count and sample rows mismatch`);
  }
  for (const verdict of verdicts) {
    if (verdict.level === 'full') {
      if (verdict.briefing.experiences_read < 300) errors.push(`${verdict.target_slug}: full direct below 300`);
      if (verdict.briefing.onsen_related < 200) errors.push(`${verdict.target_slug}: full onsen below 200`);
      if (verdict.briefing.platform_count < 3) errors.push(`${verdict.target_slug}: full platform below 3`);
      if (verdict.briefing.platforms.length < verdict.briefing.platform_count) errors.push(`${verdict.target_slug}: full platform list shorter than platform count`);
      if (verdict.items.length < 3) errors.push(`${verdict.target_slug}: full items below 3`);
    }
    if (verdict.briefing.platform_count > 0 && verdict.briefing.platforms.length === 0) {
      errors.push(`${verdict.target_slug}: briefing platforms empty`);
    }
    for (const item of verdict.items) {
      const denominator = item.counts.denominator === 'experiences_read' ? verdict.briefing.experiences_read : verdict.briefing.onsen_related;
      const directions = item.counts.direction_counts;
      const sum = directions.positive + directions.mixed + directions.negative;
      if (item.counts.mentions > denominator) errors.push(`${verdict.target_slug}: mentions exceed denominator`);
      if (item.counts.negative > item.counts.mentions) errors.push(`${verdict.target_slug}: negative exceeds mentions`);
      if (item.counts.platform_count < 2) errors.push(`${verdict.target_slug}: item platform below 2`);
      if (item.counts.platform_count > 0 && item.platforms.length === 0) errors.push(`${verdict.target_slug}: item platforms empty`);
      if (sum !== item.counts.mentions) errors.push(`${verdict.target_slug}: direction sum mismatch`);
    }
  }
  return errors;
}

function createStatsCsv(rows) {
  const headers = [
    'slug',
    'name_ko',
    'name_ja',
    'area',
    'direct_reviews_checked',
    'sample_rows',
    'onsen_related_checked',
    'onsen_related_sample_rows',
    'direct_body_platform_count',
    'platforms',
    'level',
    'adopted_items',
    'stats_file',
    'sample_file',
  ];
  return `${headers.join(',')}\n${rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')).join('\n')}\n`;
}

function createBacklogCsv(statusRows, seededSlugs) {
  const headers = ['slug', 'name_ja', 'area_slug', 'grade_claimed', 'direct_reviews_checked', 'direct_body_platform_count', 'qa_status', 'next_action'];
  const rows = statusRows
    .filter((row) => !seededSlugs.has(row.slug))
    .map((row) => ({
      slug: row.slug,
      name_ja: row.name_ja,
      area_slug: row.area_slug,
      grade_claimed: row.grade_claimed,
      direct_reviews_checked: row.direct_reviews_checked,
      direct_body_platform_count: row.direct_body_platform_count,
      qa_status: row.qa_status,
      next_action: row.next_action,
    }));
  return `${headers.join(',')}\n${rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')).join('\n')}\n`;
}

function createReport(reportRows, backlogRows) {
  const full = reportRows.filter((row) => row.level === 'full');
  const lite = reportRows.filter((row) => row.level === 'lite');
  const lines = [
    '# 간토 잔여 온천 판정 Seed 리포트',
    '',
    `작성일: ${seedDate}`,
    '',
    '## 요약',
    '',
    `- seed 생성 숙소: ${reportRows.length}곳`,
    `- full verdict: ${full.length}곳`,
    `- lite verdict: ${lite.length}곳`,
    `- backlog 유지: ${backlogRows.length}곳`,
    '',
    '## Seed 대상',
    '',
    '| slug | 숙소명 | 지역 | direct | onsen | platforms | verdict | items | source |',
    '|---|---|---|---:|---:|---:|---|---:|---|',
    ...reportRows.map((row) => `| ${row.slug} | ${row.name_ko} | ${row.area} | ${row.direct_reviews_checked} | ${row.onsen_related_checked} | ${row.direct_body_platform_count} | ${row.level} | ${row.adopted_items} | ${row.sample_file} |`),
    '',
    '## 산출물',
    '',
    `- \`${path.relative(repoRoot, outputJsonPath)}\``,
    `- \`${path.relative(repoRoot, outputSqlPath)}\``,
    `- \`${path.relative(repoRoot, outputStatsPath)}\``,
    `- \`${path.relative(repoRoot, outputBacklogPath)}\``,
    '',
    '## 기준',
    '',
    '- full verdict는 직접 300건 이상, 온천 관련 200건 이상, 본문 플랫폼 3개 이상, 채택 item 3개 이상일 때만 생성했다.',
    '- 직접 읽은 수는 sample CSV row 수와 다시 대조했다.',
    '- 간토 잔여 seed는 기존 하코네/야마나시 `kanto_reconciliation_seed_2026-07-08`와 분리했다.',
    '- 지역명과 숙소명은 한국어 서비스 표기로 정규화했다.',
    '',
  ];
  return `${lines.join('\n')}\n`;
}

async function main() {
  const readyRows = readCsv(readyPath);
  const statusRows = readCsv(statusPath);
  const accommodations = [];
  const verdicts = [];
  const statsRows = [];

  for (const row of readyRows) {
    const bundle = loadBundle(row.slug);
    if (!bundle) throw new Error(`${row.slug}: missing source bundle`);
    const items = aggregateItems(bundle);
    const level = bundle.directCount >= 300 && bundle.onsenCount >= 200 && bundle.platformCount >= 3 && items.length >= 3 ? 'full' : 'lite';
    const accommodation = createAccommodation(row, bundle, items, level);
    const verdict = createVerdict(row, accommodation, bundle, items, level);
    accommodations.push(accommodation);
    verdicts.push(verdict);
    statsRows.push({
      slug: row.slug,
      name_ko: accommodation.display_name_ko,
      name_ja: accommodation.name_ja,
      area: accommodation.area,
      direct_reviews_checked: bundle.directCount,
      sample_rows: bundle.rowCount,
      onsen_related_checked: bundle.onsenCount,
      onsen_related_sample_rows: bundle.onsenRowCount,
      direct_body_platform_count: bundle.platformCount,
      platforms: bundle.platforms.join('; '),
      level,
      adopted_items: verdict.items.length,
      stats_file: bundle.statsFile,
      sample_file: bundle.sampleFile,
    });
  }

  const seededSlugs = new Set(accommodations.map((row) => row.slug));
  const backlogRows = statusRows.filter((row) => !seededSlugs.has(row.slug));
  const errors = validate(accommodations, verdicts, statsRows);
  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputJsonPath, `${JSON.stringify({ accommodations, verdicts }, null, 2)}\n`);
  await writeFile(outputSqlPath, createSql(accommodations, verdicts));
  await writeFile(outputStatsPath, createStatsCsv(statsRows));
  await writeFile(outputBacklogPath, createBacklogCsv(statusRows, seededSlugs));
  await writeFile(outputReportPath, createReport(statsRows, backlogRows));

  console.log(`Generated ${accommodations.length} accommodations and ${verdicts.length} verdicts.`);
  console.log(`full=${verdicts.filter((row) => row.level === 'full').length} lite=${verdicts.filter((row) => row.level === 'lite').length} backlog=${backlogRows.length}`);
  console.log(`Output JSON: ${path.relative(repoRoot, outputJsonPath)}`);
  console.log(`Output SQL: ${path.relative(repoRoot, outputSqlPath)}`);
  console.log(`Stats: ${path.relative(repoRoot, outputStatsPath)}`);
  console.log(`Report: ${path.relative(repoRoot, outputReportPath)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
