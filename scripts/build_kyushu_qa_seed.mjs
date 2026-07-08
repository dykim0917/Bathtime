import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const researchRoot = path.join(repoRoot, 'research/onsen-review-signals');
const outputDir = path.join(repoRoot, 'research/onsen-db-seed');
const directionBackfillRoot = path.join(outputDir, 'kyushu-direction-backfill');
const qaMatrixPath = path.join(researchRoot, 'kyushu_deep_research_qa_matrix_2026-07-08.csv');
const nameQaPath = path.join(repoRoot, 'research/onsen-name-normalization/onsen_accommodation_name_qa_reviewed_2026-07-07.csv');
const copyQaPath = path.join(repoRoot, 'research/onsen-copy-qa/onsen_accommodation_copy_qa_reviewed_2026-07-07.csv');

const seedDate = '2026-07-08';
const isSecondBatch = process.argv.includes('--second-batch');
const isThirdBatch = process.argv.includes('--third-batch');
const isThirdBBatch = process.argv.includes('--third-b-batch');
const batchLabel = isThirdBBatch ? '3차-B 방향 Backfill 회수' : isThirdBatch ? '3차-A 방향 태그 회수' : isSecondBatch ? '2차 회수' : '1차';
const outputFileBase = isThirdBBatch
  ? 'kyushu_qa_seed_3rd_b_2026-07-08'
  : isThirdBatch
  ? 'kyushu_qa_seed_3rd_2026-07-08'
  : isSecondBatch
    ? 'kyushu_qa_seed_2nd_2026-07-08'
    : 'kyushu_qa_seed_2026-07-08';
const outputJsonPath = path.join(outputDir, `${outputFileBase}.json`);
const outputSqlPath = path.join(outputDir, `${outputFileBase}.upsert.sql`);
const outputReportPath = path.join(
  outputDir,
  isThirdBatch
    ? 'kyushu_qa_seed_3rd_report_2026-07-08.md'
    : isThirdBBatch
      ? 'kyushu_qa_seed_3rd_b_report_2026-07-08.md'
      : isSecondBatch
        ? 'kyushu_qa_seed_2nd_report_2026-07-08.md'
        : 'kyushu_qa_seed_report_2026-07-08.md'
);

const areaMeta = {
  Beppu: ['beppu', '규슈 · 오이타현 · 벳푸', 'kyushu', 'oita', 'beppu', 'beppu'],
  Yufuin: ['yufuin', '규슈 · 오이타현 · 유후인', 'kyushu', 'oita', 'yufu', 'yufuin'],
  'Yufuin/Yunohira': ['yufuin', '규슈 · 오이타현 · 유후인', 'kyushu', 'oita', 'yufu', 'yufuin'],
  Yunohira: ['yunohira', '규슈 · 오이타현 · 유노히라', 'kyushu', 'oita', 'yufu', 'yunohira'],
  Kurokawa: ['kurokawa', '규슈 · 구마모토현 · 구로카와', 'kyushu', 'kumamoto', 'minamioguni', 'kurokawa'],
  Ibusuki: ['ibusuki', '규슈 · 가고시마현 · 이부스키', 'kyushu', 'kagoshima', 'ibusuki', 'ibusuki'],
  Ureshino: ['ureshino', '규슈 · 사가현 · 우레시노', 'kyushu', 'saga', 'ureshino', 'ureshino'],
  Takeo: ['takeo', '규슈 · 사가현 · 다케오', 'kyushu', 'saga', 'takeo', 'takeo'],
  Kirishima: ['kirishima', '규슈 · 가고시마현 · 기리시마', 'kyushu', 'kagoshima', 'kirishima', 'kirishima'],
  Unzen: ['unzen', '규슈 · 나가사키현 · 운젠', 'kyushu', 'nagasaki', 'unzen', 'unzen'],
};

const nameOverrides = {
  'unzen-kyushu-hotel': '운젠 규슈 호텔',
  'unzen-hanzuiryo': '운젠 한즈이료',
  'yufuin-enowa': '에노와 유후인',
  'kurokawa-takefue': '타케후에',
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
  source_flow: '온천수 방식',
  sand_steam_bath_experience: '스나유·무시유',
  facility_wide_onsen_experience: '온천 이용 경험',
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

const signalScope = {
  booking_confusion: 'experiences_read',
  operation_caution: 'experiences_read',
  crowding: 'experiences_read',
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

const ignoredSignalTokens = new Set([
  '',
  'neutral',
  'neutral_lodging_context',
  'neutral_stay',
  'food',
  'access',
  'access_road',
  'service',
  'room',
  'view',
  'general_stay',
  'general_lodging_signal',
  'small_bath_or_room',
  'facility_wide_service_food_or_room',
]);

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
  return existsSync(filePath) ? parseCsv(readFileSync(filePath, 'utf8')) : [];
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

function splitPipeList(value) {
  return String(value ?? '')
    .split(/\s*\|\s*|\s*,\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitTags(value) {
  return String(value ?? '')
    .split(/[;|、]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function truthy(value) {
  return /^(1|true|yes|y)$/i.test(String(value ?? '').trim());
}

function sanitizeCopy(value) {
  return String(value ?? '')
    .replace(/후기/g, '이용 경험')
    .replace(/리뷰/g, '이용 경험')
    .replace(/신호/g, '근거')
    .replace(/보는 편이 맞습니다/g, '기준으로 판단합니다')
    .replace(/보는 편이 좋습니다/g, '기준으로 확인하시기 바랍니다')
    .replace(/보는 편이 자연스럽습니다/g, '기준으로 판단합니다')
    .replace(/확인하는 편이 좋습니다/g, '확인하시기 바랍니다')
    .replace(/확인 필요/g, '예약 시 확인')
    .replace(/조건 확인/g, '예약 시 확인')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizePlatform(rawValue) {
  const value = String(rawValue ?? '').trim();
  const lower = value.toLowerCase();
  if (!value) return '';
  if (lower.includes('supplier card') || lower.includes('supplier_card') || lower.includes('snippet_only')) return '';
  if (lower.includes('jalan')) return '자란';
  if (lower.includes('rakuten')) return '라쿠텐';
  if (lower.includes('google')) return '구글 지도';
  if (lower.includes('agoda')) return '아고다';
  if (lower.includes('booking')) return '부킹닷컴';
  if (lower.includes('tripadvisor')) return '트립어드바이저';
  if (lower.includes('trip')) return '트립닷컴';
  if (lower.includes('yahoo')) return '야후 트래블';
  if (lower.includes('ikkyu') || lower.includes('一休')) return '잇큐';
  if (lower.includes('relux')) return '리럭스';
  if (lower.includes('jtb')) return 'JTB';
  if (lower.includes('naver') || lower.includes('tistory')) return '한국어 블로그';
  if (lower.includes('hotels.com')) return '호텔스닷컴';
  if (lower.includes('expedia')) return '익스피디아';
  return value;
}

function normalizeDirection(value) {
  const direction = String(value ?? '').trim().toLowerCase();
  if (direction === 'positive' || direction === 'mixed' || direction === 'negative' || direction === 'neutral') return direction;
  const tokens = splitTags(direction);
  if (tokens.includes('mixed')) return 'mixed';
  if (tokens.includes('positive') && tokens.includes('negative')) return 'mixed';
  if (tokens.includes('negative')) return 'negative';
  if (tokens.includes('positive')) return 'positive';
  if (tokens.includes('neutral')) return 'neutral';
  return 'neutral';
}

function normalizeSignal(value) {
  const raw = String(value ?? '').trim();
  const lower = raw.toLowerCase();
  if (ignoredSignalTokens.has(lower)) return '';
  if (lower === 'room_open_air_bath' || lower === 'room_bath') return 'room_bath_hot_spring';
  if (lower === 'private_bath' || lower === 'family_bath') return 'private_bath_experience';
  if (lower === 'public_bath' || lower === 'open_air_public_bath') return 'public_bath_hot_spring';
  if (lower.includes('room_bath_hot_spring')) return 'room_bath_hot_spring';
  if (lower.includes('public_bath_hot_spring')) return 'public_bath_hot_spring';
  if (lower.includes('private_bath_experience') || lower.includes('family_bath_experience')) return 'private_bath_experience';
  if (lower.includes('water_texture')) return 'water_texture';
  if (lower.includes('weak_onsen_feeling')) return 'weak_onsen_feeling';
  if (lower.includes('chlorine')) return 'chlorine_smell';
  if (lower.includes('crowding')) return 'crowding';
  if (lower.includes('booking_confusion')) return 'booking_confusion';
  if (lower.includes('booking_or_operation_confusion')) return 'booking_confusion';
  if (lower.includes('operation')) return 'operation_caution';
  if (lower.includes('maintenance')) return 'operation_caution';
  if (lower.includes('temperature_control')) return 'temperature_control';
  if (lower.includes('temperature_hot') || lower.includes('temperature_cold')) return 'temperature_management';
  if (lower.includes('temperature')) return 'temperature_management';
  if (lower.includes('source_flow')) return 'source_flow';
  if (lower.includes('onsen_related')) return 'facility_wide_onsen_experience';
  if (lower.includes('sand') || lower.includes('steam')) return 'sand_steam_bath_experience';
  if (lower.includes('facility_wide_onsen_experience') || lower.includes('facility_wide_hot_spring_mention')) {
    return 'facility_wide_onsen_experience';
  }
  return ignoredSignalTokens.has(lower) ? '' : lower;
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
  return lower || 'facility_wide';
}

function signalFromBathArea(value) {
  const bathArea = normalizeBathArea(value);
  if (bathArea === 'room_bath' || bathArea === 'room_open_air_bath') return 'room_bath_hot_spring';
  if (bathArea === 'public_bath' || bathArea === 'open_air_public_bath') return 'public_bath_hot_spring';
  if (bathArea === 'private_bath' || bathArea === 'family_bath') return 'private_bath_experience';
  if (bathArea === 'facility_wide') return 'facility_wide_onsen_experience';
  return '';
}

function findSourceDir(slug) {
  const direct = path.join(researchRoot, slug);
  if (existsSync(direct)) return direct;
  const stack = [researchRoot];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const next = path.join(current, entry.name);
      if (!entry.isDirectory()) continue;
      if (entry.name === slug) return next;
      stack.push(next);
    }
  }
  return null;
}

function latestFile(sourceDir, pattern) {
  if (!sourceDir) return null;
  const files = readdirSync(sourceDir)
    .filter((file) => pattern.test(file))
    .sort()
    .map((file) => path.join(sourceDir, file));
  return files.at(-1) ?? null;
}

function directionBackfilledSamplePath(slug) {
  const filePath = path.join(directionBackfillRoot, slug, 'direct_review_sample_index_direction_backfilled_2026-07-08.csv');
  return existsSync(filePath) ? filePath : null;
}

function aggregateItems(row) {
  const sourceDir = findSourceDir(row.slug);
  const samplePath = isThirdBBatch
    ? directionBackfilledSamplePath(row.slug) ?? latestFile(sourceDir, /^direct_review_sample_index_.*\.csv$/)
    : latestFile(sourceDir, /^direct_review_sample_index_.*\.csv$/);
  const rows = samplePath ? readCsv(samplePath) : [];
  const directCount = toInt(row.direct_read_recounted);
  const onsenCount = toInt(row.onsen_related_recounted);
  const groups = new Map();
  const platforms = new Set();

  for (const review of rows) {
    if (review.included_in_lodging_direct_count && !truthy(review.included_in_lodging_direct_count)) continue;
    const platform = normalizePlatform(review.platform ?? review.source ?? review.source_type);
    if (platform) platforms.add(platform);

    const onsenRelated = truthy(review.onsen_related ?? review.is_onsen_related);
    const direction = normalizeDirection(review.signal_direction ?? review.signal_direction_tags ?? review.direction);
    const rowId =
      review.sample_id ||
      review.review_id ||
      review.source_review_id ||
      review.content_sha1 ||
      `${platform}-${review.review_date}-${review.author_hash ?? ''}-${review.reviewer_hash ?? ''}`;
    const signalTokens = splitTags(review.signal_type ?? review.signal_tags ?? review.signals ?? review.keyword_tags ?? '');
    const bathAreaTokens = splitTags(review.bath_area ?? review.bath_area_tags ?? review.bath_areas);
    const signalBathAreas = signalTokens.map(normalizeBathArea).filter((item) => knownBathAreas.has(item) && item !== 'facility_wide' && item !== 'unclear');
    const bathAreas = bathAreaTokens.map(normalizeBathArea).filter((item) => knownBathAreas.has(item));
    const normalizedBathAreas = bathAreas.length > 0 ? bathAreas : signalBathAreas.length > 0 ? signalBathAreas : ['facility_wide'];
    const signals = signalTokens.map(normalizeSignal).filter(Boolean);
    if (signals.length === 0) {
      for (const bathArea of normalizedBathAreas) {
        const fallbackSignal = signalFromBathArea(bathArea);
        if (fallbackSignal) signals.push(fallbackSignal);
      }
    }

    for (const signal of new Set(signals)) {
      const denominator = signalScope[signal] ?? 'onsen_related';
      if (denominator === 'onsen_related' && !onsenRelated) continue;
      for (const bathArea of new Set(normalizedBathAreas)) {
        if (!isSignalBathCompatible(signal, bathArea)) continue;
        const key = `${bathArea}:${signal}`;
        if (!groups.has(key)) {
          groups.set(key, {
            signal,
            bathArea,
            denominator,
            directionRows: {
              positive: new Set(),
              mixed: new Set(),
              negative: new Set(),
              neutral: new Set(),
            },
            platformsByDirection: {
              positive: new Set(),
              mixed: new Set(),
              negative: new Set(),
              neutral: new Set(),
            },
          });
        }
        const group = groups.get(key);
        group.directionRows[direction].add(rowId);
        if (platform) group.platformsByDirection[direction].add(platform);
      }
    }
  }

  const candidates = [...groups.values()]
    .map((group) => {
      const directionCounts = Object.fromEntries(
        Object.entries(group.directionRows).map(([direction, values]) => [direction, values.size])
      );
      const mentionPlatforms = new Set([
        ...group.platformsByDirection.positive,
        ...group.platformsByDirection.mixed,
        ...group.platformsByDirection.negative,
      ]);
      const mentions = directionCounts.positive + directionCounts.mixed + directionCounts.negative;
      const denominatorValue = group.denominator === 'experiences_read' ? directCount : onsenCount;
      return {
        signal: group.signal,
        bathArea: group.bathArea,
        denominator: group.denominator,
        denominatorValue,
        mentions,
        negative: directionCounts.negative,
        directionCounts,
        platformCount: mentionPlatforms.size,
        platforms: [...mentionPlatforms].sort(),
      };
    })
    .filter((item) => item.mentions >= 10)
    .filter((item) => item.denominatorValue > 0 && item.mentions / item.denominatorValue >= 0.02)
    .filter((item) => item.platformCount >= 2)
    .filter((item) => item.mentions <= item.denominatorValue)
    .sort((a, b) => b.mentions - a.mentions || b.platformCount - a.platformCount);

  return {
    sourceDir,
    samplePath,
    platforms: platforms.size > 0 ? [...platforms].sort() : [],
    items: dedupeSimilarItems(candidates).slice(0, 5),
  };
}

function dedupeSimilarItems(items) {
  const selected = [];
  const seenSignals = new Set();
  for (const item of items) {
    const signalKey = `${item.signal}:${item.bathArea}`;
    if (selected.length < 3) {
      selected.push(item);
      seenSignals.add(signalKey);
      continue;
    }
    if (seenSignals.has(signalKey)) continue;
    const sameSignalCount = selected.filter((candidate) => candidate.signal === item.signal).length;
    if (sameSignalCount >= 2) continue;
    selected.push(item);
    seenSignals.add(signalKey);
    if (selected.length >= 5) break;
  }
  return selected;
}

function isSignalBathCompatible(signal, bathArea) {
  if (signal === 'room_bath_hot_spring') return bathArea === 'room_bath' || bathArea === 'room_open_air_bath';
  if (signal === 'public_bath_hot_spring') {
    return bathArea === 'public_bath' || bathArea === 'open_air_public_bath' || bathArea === 'facility_wide';
  }
  if (signal === 'private_bath_experience') return bathArea === 'private_bath' || bathArea === 'family_bath' || bathArea === 'facility_wide';
  if (signal === 'facility_wide_onsen_experience') return bathArea === 'facility_wide' || bathArea === 'unclear';
  return true;
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
  if (item.negative / Math.max(1, item.mentions) >= 0.18) return 'conditional';
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
    return `${label} 관련 평가는 장점과 주의점이 함께 잡힙니다. 플랫폼이 나뉘어도 같은 항목이 반복되므로 예약 조건과 계절 변수를 같이 확인하는 것이 안전합니다.`;
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

function primaryBathFromItems(items, fallback = '') {
  const top = items[0];
  if (top?.bathArea === 'room_open_air_bath') return '객실 노천탕 중심';
  if (top?.bathArea === 'room_bath') return '객실 내 프라이빗탕 중심';
  if (top?.bathArea === 'open_air_public_bath') return '공용 노천탕 중심';
  if (top?.bathArea === 'public_bath') return '대욕장/공용 온천 중심';
  if (top?.bathArea === 'private_bath' || top?.bathArea === 'family_bath') return '대절탕/가족탕 중심';
  if (top?.signal === 'water_texture') return '수질 체감 중심';
  const text = `${fallback} ${items.map((item) => `${item.bathArea}:${item.signal}`).join(' ')}`;
  if (/room_open_air_bath/.test(text)) return '객실 노천탕 중심';
  if (/room_bath/.test(text)) return '객실 내 프라이빗탕 중심';
  if (/private_bath|family_bath/.test(text)) return '대절탕/가족탕 중심';
  if (/open_air_public_bath/.test(text)) return '공용 노천탕 중심';
  if (/public_bath/.test(text)) return '대욕장/공용 온천 중심';
  if (/water_texture/.test(text)) return '수질 체감 중심';
  return fallback || '온천 구성 확인형';
}

function deriveBathScope(primaryBath) {
  if (/객실.*\+.*대욕장|객실.*\+.*공용/.test(primaryBath)) return 'some_rooms';
  if (/객실/.test(primaryBath)) return 'room_signal_only';
  if (/대욕장|공용/.test(primaryBath)) return 'public_bath_only';
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
  if (items.some((item) => item.signal === 'source_flow')) values.add('direct_source');
  return [...values];
}

function evidenceCounts(row, items) {
  const countBy = (predicate) => items.filter(predicate).reduce((sum, item) => sum + item.mentions, 0);
  return {
    directReviewCount: toInt(row.direct_read_recounted),
    onsenReviewCount: toInt(row.onsen_related_recounted),
    directBodyPlatformCount: toInt(row.direct_platform_recounted),
    roomBathMentionCount: countBy((item) => /room_bath|room_open_air_bath/.test(item.bathArea)),
    publicBathMentionCount: countBy((item) => /public_bath|open_air_public_bath/.test(item.bathArea)),
    privateBathMentionCount: countBy((item) => /private_bath|family_bath/.test(item.bathArea)),
    waterTextureMentionCount: countBy((item) => item.signal === 'water_texture'),
    cautionMentionCount: countBy((item) => itemType(item) === 'conditional'),
  };
}

function createSummary(row, primaryBath, copyRow) {
  if (copyRow?.after_summary) return sanitizeCopy(copyRow.after_summary);
  const [, areaDisplay] = areaMeta[row.area_bucket] ?? areaMeta.Yufuin;
  const primaryPhrase = primaryBath === '온천 구성 확인형' ? '온천 구성을 기준으로' : `${primaryBath}을 기준으로`;
  return `${areaDisplay}의 온천 숙소입니다. ${primaryPhrase} 온천 경험을 확인하며, 객실 타입과 공용탕 운영 조건을 예약 전에 함께 확인하시기 바랍니다.`;
}

function createOperationNotes(row, primaryBath, copyRow, items) {
  if (copyRow?.after_operation_notes) {
    return splitPipeList(sanitizeCopy(copyRow.after_operation_notes));
  }
  const notes = [`${primaryBath}으로 정리했습니다`];
  if (items.some((item) => item.signal === 'booking_confusion' || item.signal === 'operation_caution')) notes.push('예약 조건과 운영 시간을 함께 확인하시기 바랍니다');
  if (items.some((item) => item.signal === 'temperature_management' || item.signal === 'temperature_control')) notes.push('수온 체감은 계절과 시간대에 따라 달라질 수 있습니다');
  return notes;
}

function createFullHeadline(primaryBath) {
  if (/중심$/.test(primaryBath)) return `${primaryBath} 숙소입니다.`;
  if (primaryBath === '온천 구성 확인형') return '온천 구성을 먼저 확인할 숙소입니다.';
  return `${primaryBath}을 기준으로 판단할 숙소입니다.`;
}

function createLiteHeadline(primaryBath) {
  if (/중심$/.test(primaryBath)) return `${primaryBath} 숙소입니다.`;
  if (primaryBath === '온천 구성 확인형') return '온천 구성을 먼저 확인할 숙소입니다.';
  return `${primaryBath} 구성을 먼저 확인할 수 있는 숙소입니다.`;
}

function createVerdictItems(items) {
  return items.map((item, index) => ({
    order: index + 1,
    type: itemType(item),
    headline: itemHeadline({ ...item, type: itemType(item) }),
    counts: {
      mentions: item.mentions,
      negative: item.negative,
      denominator: item.denominator,
      platform_count: item.platformCount,
      direction_counts: item.directionCounts,
    },
    body: itemBody({ ...item, type: itemType(item) }),
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
  }));
}

function loadMaps() {
  const names = new Map(readCsv(nameQaPath).map((row) => [row.slug, row]));
  const copies = new Map(readCsv(copyQaPath).map((row) => [row.slug, row]));
  return { names, copies };
}

function hasFullSampleThreshold(row) {
  return (
    toInt(row.direct_read_recounted) >= 300 &&
    toInt(row.onsen_related_recounted) >= 200 &&
    toInt(row.direct_platform_recounted) >= 3
  );
}

function hasFullNumericThreshold(row) {
  return hasFullSampleThreshold(row) && toInt(row.full_verdict_candidate_item_count) >= 3;
}

function seededSlugs() {
  const paths = [
    path.join(outputDir, 'kyushu_qa_seed_2026-07-08.json'),
    path.join(outputDir, 'kyushu_qa_seed_2nd_2026-07-08.json'),
    path.join(outputDir, 'kyushu_qa_seed_3rd_2026-07-08.json'),
  ];
  const slugs = new Set();
  for (const filePath of paths) {
    if (!existsSync(filePath)) continue;
    const parsed = JSON.parse(readFileSync(filePath, 'utf8'));
    for (const row of parsed.accommodations ?? []) {
      if (row.slug) slugs.add(row.slug);
    }
  }
  return slugs;
}

function directionTagCoverage(slug) {
  const sourceDir = findSourceDir(slug);
  const samplePath = latestFile(sourceDir, /^direct_review_sample_index_.*\.csv$/);
  const rows = samplePath ? readCsv(samplePath) : [];
  if (rows.length === 0) return { samplePath, rows: 0, explicitRows: 0, ratio: 0 };
  const explicitRows = rows.filter((row) => String(row.signal_direction ?? row.signal_direction_tags ?? row.direction ?? '').trim()).length;
  return { samplePath, rows: rows.length, explicitRows, ratio: explicitRows / rows.length };
}

function hasUsableDirectionTags(slug) {
  const coverage = directionTagCoverage(slug);
  return coverage.rows >= 50 && coverage.ratio >= 0.8;
}

function selectQaRows(rows) {
  if (!isSecondBatch) {
    if (isThirdBBatch) {
      const alreadySeeded = seededSlugs();
      return rows.filter((row) => {
        if (alreadySeeded.has(row.slug)) return false;
        if (row.qa_status !== 'needs_direction_backfill') return false;
        if (!hasFullSampleThreshold(row)) return false;
        if (row.source_scope_status === 'needs_scope_reconciliation') return false;
        return Boolean(directionBackfilledSamplePath(row.slug));
      });
    }
    if (isThirdBatch) {
      const alreadySeeded = seededSlugs();
      return rows.filter((row) => {
        if (alreadySeeded.has(row.slug)) return false;
        if (row.qa_status !== 'needs_direction_backfill') return false;
        if (!hasFullSampleThreshold(row)) return false;
        if (row.source_scope_status === 'needs_scope_reconciliation') return false;
        return hasUsableDirectionTags(row.slug);
      });
    }
    return rows.filter((row) => row.qa_status === 'full_verdict_candidate' || row.qa_status === 'ready_for_db_lite');
  }

  const alreadySeeded = seededSlugs();
  return rows.filter((row) => {
    if (alreadySeeded.has(row.slug)) return false;
    if (!hasFullNumericThreshold(row)) return false;
    if (row.direction_count_status !== 'ok') return false;
    if (row.source_scope_status === 'needs_scope_reconciliation') return false;
    return row.qa_status === 'needs_platform_reconciliation' || row.qa_status === 'needs_count_reconciliation';
  });
}

function nameFor(row, nameRow) {
  if (nameOverrides[row.slug]) return nameOverrides[row.slug];
  const fromNameQa = nameRow?.verified_display_name_ko?.trim();
  const qaNames = String(row.name_ko ?? '')
    .split('/')
    .map((item) => item.trim())
    .filter(Boolean);
  const fromQa = qaNames.find((item) => /[가-힣]/.test(item)) || qaNames[0];
  const fallback = row.name_ja?.trim() || row.slug;
  return fromNameQa || fromQa || fallback;
}

function aliasesFor(row, nameRow, displayName) {
  const values = new Set([displayName]);
  for (const value of splitPipeList(nameRow?.aliases_ko ?? '')) values.add(value);
  for (const value of splitPipeList(row.name_ko ?? '')) values.add(value);
  return [...values].filter(Boolean);
}

function createAccommodation(row, nameRow, copyRow, aggregate, level) {
  const meta = areaMeta[row.area_bucket] ?? areaMeta.Yufuin;
  const [region, area, regionGroup, prefecture, city, onsenArea] = meta;
  const displayName = nameFor(row, nameRow);
  const sourceItems = aggregate.items;
  const primaryBath = sanitizeCopy(copyRow?.after_primary_bath || primaryBathFromItems(sourceItems));
  const summary = createSummary(row, primaryBath, copyRow);
  const operationNotes = createOperationNotes(row, primaryBath, copyRow, sourceItems);
  const counts = evidenceCounts(row, sourceItems);
  return {
    slug: row.slug,
    name: displayName,
    ja_name: nameRow?.name_ja || row.name_ja || null,
    display_name_ko: displayName,
    name_ja: nameRow?.name_ja || row.name_ja || null,
    name_en: nameRow?.name_en || null,
    aliases_ko: aliasesFor(row, nameRow, displayName),
    name_verification_status: nameRow?.name_verification_status || (row.name_ko ? 'verified' : 'needs_review'),
    name_source_note: nameRow?.review_note || '규슈 QA seed 1차 생성 과정에서 보정',
    region,
    area,
    country: 'JP',
    region_group: regionGroup,
    prefecture,
    city,
    onsen_area: onsenArea,
    travel_contexts: ['ryokan_stay'],
    bath_contexts: deriveBathContexts(primaryBath, sourceItems),
    water_criteria: deriveWaterCriteria(sourceItems),
    summary,
    primary_bath: primaryBath,
    water_use_status: 'review_supported',
    water_source_type: 'hot_spring_confirmed',
    bath_scope: deriveBathScope(primaryBath),
    operation_notes: operationNotes,
    evidence_counts: counts,
    evidence_grade: toInt(row.direct_read_recounted) >= 300 ? 'A' : toInt(row.direct_read_recounted) >= 100 ? 'B' : 'C',
    evidence_note: `직접 읽은 이용 경험 ${toInt(row.direct_read_recounted).toLocaleString('ko-KR')}건, 온천 관련 ${toInt(row.onsen_related_recounted).toLocaleString('ko-KR')}건, 본문 확인 플랫폼 ${toInt(row.direct_platform_recounted)}개`,
    status: 'active',
    source_file: 'research/onsen-review-signals/kyushu_deep_research_qa_matrix_2026-07-08.csv',
    content_updated_at: seedDate,
  };
}

function createVerdict(row, accommodation, aggregate, level) {
  const platforms = aggregate.platforms.length > 0 ? aggregate.platforms : [`본문 확인 플랫폼 ${toInt(row.direct_platform_recounted)}개`];
  const briefing = {
    experiences_read: toInt(row.direct_read_recounted),
    onsen_related: toInt(row.onsen_related_recounted),
    platforms,
  };
  if (level === 'full') {
    return {
      target_type: 'accommodation',
      target_slug: row.slug,
      level: 'full',
      headline: createFullHeadline(accommodation.primary_bath),
      briefing,
      items: createVerdictItems(aggregate.items.slice(0, 5)),
      fact_statuses: [],
      status: 'published',
      verified_at: seedDate,
      source_file: 'research/onsen-review-signals/kyushu_deep_research_qa_matrix_2026-07-08.csv',
    };
  }
  return {
    target_type: 'accommodation',
    target_slug: row.slug,
    level: 'lite',
    headline: createLiteHeadline(accommodation.primary_bath),
    briefing,
    items: [],
    fact_statuses: [],
    status: 'published',
    verified_at: seedDate,
    source_file: 'research/onsen-review-signals/kyushu_deep_research_qa_matrix_2026-07-08.csv',
  };
}

function validateRows(accommodations, verdicts) {
  const errors = [];
  const banned = [/후기/, /신호/, /보는 편/, /확인 필요/, /확인 중(?:입니다|$)/, /조건 확인/];
  for (const row of accommodations) {
    if (!row.name || !row.display_name_ko) errors.push(`${row.slug}: missing Korean name`);
    if (!/[가-힣]/.test(row.display_name_ko)) errors.push(`${row.slug}: display_name_ko has no Hangul`);
    for (const field of [row.summary, row.primary_bath, ...row.operation_notes]) {
      for (const pattern of banned) {
        if (pattern.test(field)) errors.push(`${row.slug}: banned copy "${pattern.source}" in ${field}`);
      }
    }
  }
  for (const verdict of verdicts) {
    if (verdict.level === 'full') {
      if (verdict.briefing.experiences_read < 300) errors.push(`${verdict.target_slug}: full experiences_read below 300`);
      if (verdict.briefing.onsen_related < 200) errors.push(`${verdict.target_slug}: full onsen_related below 200`);
      if (verdict.briefing.platforms.length < 3) errors.push(`${verdict.target_slug}: full platforms below 3`);
      if (verdict.items.length < 3) errors.push(`${verdict.target_slug}: full items below 3`);
    }
    for (const item of verdict.items) {
      const denominator = item.counts.denominator === 'experiences_read' ? verdict.briefing.experiences_read : verdict.briefing.onsen_related;
      if (item.counts.mentions > denominator) errors.push(`${verdict.target_slug}: item mentions exceed denominator`);
      if (item.counts.negative > item.counts.mentions) errors.push(`${verdict.target_slug}: item negative exceeds mentions`);
      if (verdict.level === 'full' && item.counts.platform_count < 2) errors.push(`${verdict.target_slug}: full item platform_count below 2`);
      for (const direction of ['positive', 'mixed', 'negative', 'neutral']) {
        if (!Number.isFinite(item.counts.direction_counts?.[direction])) errors.push(`${verdict.target_slug}: missing ${direction} direction count`);
      }
    }
  }
  return errors;
}

function createSql(accommodations, verdicts) {
  const lines = [
    '-- Generated by scripts/build_kyushu_qa_seed.mjs',
    `-- Source: ${path.relative(repoRoot, qaMatrixPath)}`,
    '',
  ];
  for (const row of accommodations) {
    lines.push(`INSERT INTO public.onsen_accommodations (
  slug, name, ja_name, display_name_ko, name_ja, name_en, aliases_ko, name_verification_status, name_source_note,
  region, area, country, region_group, prefecture, city, onsen_area,
  travel_contexts, bath_contexts, water_criteria,
  summary, primary_bath, water_use_status, water_source_type, bath_scope,
  operation_notes, evidence_counts, evidence_grade, evidence_note, status, source_file, content_updated_at
) VALUES (
  ${sqlString(row.slug)}, ${sqlString(row.name)}, ${sqlString(row.ja_name)}, ${sqlString(row.display_name_ko)}, ${sqlString(row.name_ja)}, ${sqlString(row.name_en)}, ${sqlTextArray(row.aliases_ko)}, ${sqlString(row.name_verification_status)}, ${sqlString(row.name_source_note)},
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

function createReport(accommodations, verdicts, qaRows, downgraded, skipped) {
  const full = verdicts.filter((row) => row.level === 'full');
  const lite = verdicts.filter((row) => row.level === 'lite');
  const lines = [
    `# 규슈 QA ${batchLabel} DB Seed 생성 리포트`,
    '',
    `작성일: ${seedDate}`,
    '',
    '## 요약',
    '',
    `- QA 매트릭스 적재 후보: ${qaRows.length}곳`,
    `- 생성 숙소 row: ${accommodations.length}곳`,
    `- full verdict: ${full.length}곳`,
    `- lite verdict: ${lite.length}곳`,
    `- full 후보였으나 lite로 낮춘 곳: ${downgraded.length}곳`,
    `- 검산 중 제외한 곳: ${skipped.length}곳`,
    '',
    '## Full Verdict',
    '',
    '| slug | 숙소명 | 직접 | 온천 | 플랫폼 | items |',
    '|---|---|---:|---:|---:|---:|',
    ...full.map((row) => {
      const accommodation = accommodations.find((item) => item.slug === row.target_slug);
      return `| ${row.target_slug} | ${accommodation?.name ?? ''} | ${row.briefing.experiences_read} | ${row.briefing.onsen_related} | ${row.briefing.platforms.length} | ${row.items.length} |`;
    }),
    '',
    '## Lite Verdict',
    '',
    '| slug | 숙소명 | 직접 | 온천 | 플랫폼 | 이유 |',
    '|---|---|---:|---:|---:|---|',
    ...lite.map((row) => {
      const accommodation = accommodations.find((item) => item.slug === row.target_slug);
      const original = qaRows.find((item) => item.slug === row.target_slug);
      const reason = downgraded.find((item) => item.slug === row.target_slug)?.reason || original?.qa_status || 'ready_for_db_lite';
      return `| ${row.target_slug} | ${accommodation?.name ?? ''} | ${row.briefing.experiences_read} | ${row.briefing.onsen_related} | ${row.briefing.platforms.length} | ${reason} |`;
    }),
    '',
    '## 제외',
    '',
    '| slug | 이유 |',
    '|---|---|',
    ...skipped.map((row) => `| ${row.slug} | ${row.reason} |`),
    '',
    '## 산출물',
    '',
    `- \`${path.relative(repoRoot, outputJsonPath)}\``,
    `- \`${path.relative(repoRoot, outputSqlPath)}\``,
    '',
    '## 적용 전 주의',
    '',
    '- 이 산출물은 생성 후 별도 검산을 거쳐 DB 적용 여부를 결정한다.',
    '- `needs_direction_backfill` 후보와 방향/플랫폼 기준을 통과하지 못한 나머지 후보는 이번 seed에서 제외했다.',
    '- full 항목은 `mentions >= 10`, 분모 2% 이상, 2플랫폼 이상, 방향 카운트 보유 기준으로만 생성했다.',
    '',
  ];
  return `${lines.join('\n')}\n`;
}

async function main() {
  const { names, copies } = loadMaps();
  const qaRows = selectQaRows(readCsv(qaMatrixPath));
  const accommodations = [];
  const verdicts = [];
  const downgraded = [];
  const skipped = [];

  for (const row of qaRows) {
    const aggregate = aggregateItems(row);
    const requestedLevel = isSecondBatch || isThirdBatch || isThirdBBatch || row.qa_status === 'full_verdict_candidate' ? 'full' : 'lite';
    if ((isSecondBatch || isThirdBatch || isThirdBBatch) && requestedLevel === 'full' && aggregate.items.length < 3) {
      skipped.push({ slug: row.slug, reason: `full 회수 후보였으나 local aggregation verdict_basis ${aggregate.items.length}개` });
      continue;
    }
    const level = requestedLevel === 'full' && aggregate.items.length >= 3 ? 'full' : 'lite';
    if (requestedLevel === 'full' && level === 'lite') {
      downgraded.push({ slug: row.slug, reason: `full candidate but only ${aggregate.items.length} verdict_basis items after local aggregation` });
    }
    const accommodation = createAccommodation(row, names.get(row.slug), copies.get(row.slug), aggregate, level);
    const verdict = createVerdict(row, accommodation, aggregate, level);
    accommodations.push(accommodation);
    verdicts.push(verdict);
  }

  const errors = validateRows(accommodations, verdicts);
  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputJsonPath, JSON.stringify({ accommodations, verdicts }, null, 2));
  await writeFile(outputSqlPath, createSql(accommodations, verdicts));
  await writeFile(outputReportPath, createReport(accommodations, verdicts, qaRows, downgraded, skipped));

  console.log(`Generated ${accommodations.length} accommodations, ${verdicts.filter((row) => row.level === 'full').length} full verdicts, ${verdicts.filter((row) => row.level === 'lite').length} lite verdicts.`);
  console.log(outputJsonPath);
  console.log(outputSqlPath);
  console.log(outputReportPath);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
