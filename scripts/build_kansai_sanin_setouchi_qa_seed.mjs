import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const qaPath = path.join(repoRoot, 'research/onsen-deep-research/qa/kansai_sanin_setouchi_db_seed_qa_2026-07-07.csv');
const outputDir = path.join(repoRoot, 'research/onsen-db-seed');
const seedDate = '2026-07-08';
const outputBase = 'kansai_sanin_setouchi_qa_seed_2026-07-08';
const outputJsonPath = path.join(outputDir, `${outputBase}.json`);
const outputSqlPath = path.join(outputDir, `${outputBase}.upsert.sql`);
const outputReportPath = path.join(outputDir, `${outputBase}_report.md`);
const outputBacklogPath = path.join(outputDir, 'kansai_sanin_setouchi_qa_backlog_2026-07-08.csv');

const areaMeta = {
  arima: ['arima', '간사이 · 효고현 · 아리마', 'kansai', 'hyogo', 'kobe', 'arima'],
  kinosaki: ['kinosaki', '간사이 · 효고현 · 기노사키', 'kansai', 'hyogo', 'toyooka', 'kinosaki'],
  shirahama: ['shirahama', '간사이 · 와카야마현 · 시라하마', 'kansai', 'wakayama', 'shirahama', 'shirahama'],
  toba: ['toba', '간사이 · 미에현 · 도바', 'kansai', 'mie', 'toba', 'toba'],
  kaike: ['kaike', '주고쿠/시코쿠 · 돗토리현 · 가이케', 'chugoku_shikoku', 'tottori', 'yonago', 'kaike'],
  misasa: ['misasa', '주고쿠/시코쿠 · 돗토리현 · 미사사', 'chugoku_shikoku', 'tottori', 'misasa', 'misasa'],
  tamatsukuri: ['tamatsukuri', '주고쿠/시코쿠 · 시마네현 · 다마쓰쿠리', 'chugoku_shikoku', 'shimane', 'matsue', 'tamatsukuri'],
  dogo: ['dogo', '주고쿠/시코쿠 · 에히메현 · 도고', 'chugoku_shikoku', 'ehime', 'matsuyama', 'dogo'],
};

const displayNameKo = {
  'arima-grand-hotel': '아리마 그랜드 호텔',
  'arima-hanamusubi': '미유키소 하나무스비',
  'arima-hyoe-koyokaku': '효에 고요카쿠',
  'arima-nakanobo': '나카노보 즈이엔',
  'kinosaki-nishimuraya-shogetsutei': '니시무라야 호텔 쇼게츠테이',
  'shirahama-kaishu': '하마치도리노유 가이슈',
  'shirahama-kawakyu': '호텔 가와큐',
  'shirahama-key-terrace': '시라하마 키 테라스 호텔 시모어',
  'shirahama-sanrakuso': '호텔 산라쿠소',
  'shirahama-yanagiya': '시라하마 야나기야',
  'toba-kisara': '키사라',
  'toba-kisara-bettei-toki': '키사라 벳테이 토키',
  'toba-todaya': '토다야',
  'kaike-yugetsu': '가이케 유게츠',
  'misasa-izanro-iwasaki': '이잔로 이와사키',
  'misasa-mansuirou': '미사사 만스이로',
  'tamatsukuri-chorakuen': '초라쿠엔',
  'tamatsukuri-kasuien-minami': '가스이엔 미나미',
  'tamatsukuri-konya': '호텔 교쿠센',
  'tamatsukuri-yunosuke': '다마쓰쿠리 그랜드 호텔 조세이카쿠',
  'dogo-funaya': '도고온천 후나야',
  'dogo-miyu': '도고 미유',
  'dogo-yachiyo': '도고온천 야치요',
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

const ignoredSignals = new Set(['', 'neutral', 'food', 'service', 'room', 'access', 'general_stay']);

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

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function splitList(value) {
  return String(value ?? '')
    .split(/\s*[;|,]\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePlatform(value) {
  const raw = String(value ?? '').trim();
  const lower = raw.toLowerCase();
  if (!raw) return '';
  if (lower.includes('provider card') || lower.includes('supplier card') || lower.includes('snippet')) return '';
  if (lower.includes('jalan')) return '자란';
  if (lower.includes('rakuten')) return '라쿠텐';
  if (lower.includes('google')) return '구글 지도';
  if (lower.includes('jtb')) return 'JTB';
  if (lower.includes('yahoo')) return '야후 트래블';
  if (lower.includes('naver') || lower.includes('tistory')) return '한국어 블로그';
  if (lower.includes('tripadvisor')) return '트립어드바이저';
  if (lower.includes('agoda')) return '아고다';
  if (lower.includes('booking')) return '부킹닷컴';
  if (lower.includes('trip')) return '트립닷컴';
  if (lower.includes('ikkyu') || lower.includes('一休')) return '잇큐';
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
  if (ignoredSignals.has(lower)) return '';
  if (lower === 'room_bath' || lower === 'room_open_air_bath' || lower.includes('room_bath_hot_spring')) return 'room_bath_hot_spring';
  if (lower === 'public_bath' || lower === 'open_air_public_bath' || lower.includes('public_bath_hot_spring')) return 'public_bath_hot_spring';
  if (lower === 'private_bath' || lower === 'family_bath' || lower.includes('private_bath_experience')) return 'private_bath_experience';
  if (lower.includes('water_texture')) return 'water_texture';
  if (lower.includes('weak_onsen_feeling')) return 'weak_onsen_feeling';
  if (lower.includes('chlorine')) return 'chlorine_smell';
  if (lower.includes('crowding')) return 'crowding';
  if (lower.includes('booking')) return 'booking_confusion';
  if (lower.includes('operation') || lower.includes('maintenance')) return 'operation_caution';
  if (lower.includes('temperature_control')) return 'temperature_control';
  if (lower.includes('temperature')) return 'temperature_management';
  if (lower.includes('source_flow')) return 'source_flow';
  if (lower.includes('facility_wide')) return 'facility_wide_onsen_experience';
  return lower;
}

function isSignalBathCompatible(signal, bathArea) {
  if (signal === 'room_bath_hot_spring') return bathArea === 'room_bath' || bathArea === 'room_open_air_bath';
  if (signal === 'public_bath_hot_spring') return bathArea === 'public_bath' || bathArea === 'open_air_public_bath' || bathArea === 'facility_wide';
  if (signal === 'private_bath_experience') return bathArea === 'private_bath' || bathArea === 'family_bath' || bathArea === 'facility_wide';
  if (signal === 'facility_wide_onsen_experience') return bathArea === 'facility_wide' || bathArea === 'unclear';
  return true;
}

function getByPath(value, keys) {
  let current = value;
  for (const key of keys) {
    if (!current || typeof current !== 'object') return undefined;
    current = current[key];
  }
  return current;
}

function pickFirstArray(value, paths) {
  if (Array.isArray(value)) return { rows: value, source: '<root>' };
  for (const itemPath of paths) {
    const rows = getByPath(value, itemPath.split('.'));
    if (Array.isArray(rows)) return { rows, source: itemPath };
  }
  return { rows: [], source: null };
}

function platformListFromAggregate(row, aggregate) {
  const fromQa = splitList(row.platforms_direct).map(normalizePlatform).filter(Boolean);
  if (fromQa.length > 0) return [...new Set(fromQa)];

  const candidates = [
    aggregate.direct_body_platforms,
    aggregate.direct_body_platform_names,
    aggregate.direct_body_platforms_counted,
    aggregate.direct_review_counts?.direct_body_platforms,
    aggregate.direct_review_sources?.map?.((item) => item.platform),
  ];
  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;
    const platforms = candidate.map(normalizePlatform).filter(Boolean);
    if (platforms.length > 0) return [...new Set(platforms)];
  }

  const count = toInt(row.platform_count);
  return count > 0 ? [`본문 확인 플랫폼 ${count}개`] : [];
}

function loadAggregate(row) {
  if (!row.deep_research_folder || !row.aggregate_file) return { aggregate: null, path: null };
  const aggregatePath = path.join(repoRoot, row.deep_research_folder, row.aggregate_file);
  if (!existsSync(aggregatePath)) return { aggregate: null, path: aggregatePath };
  return { aggregate: JSON.parse(readFileSync(aggregatePath, 'utf8')), path: aggregatePath };
}

function extractRawSignalRows(aggregate) {
  if (!aggregate) return { rows: [], source: null };
  return pickFirstArray(aggregate, [
    'review_signal_rows',
    'signals',
    'signal_rows',
    'review_signal_table',
    'review_signal_tags',
  ]);
}

function aggregateItems(row, aggregate) {
  const directCount = toInt(row.direct_review_count);
  const onsenCount = toInt(row.onsen_related_count);
  const platformCount = toInt(row.platform_count);
  const { rows, source } = extractRawSignalRows(aggregate);

  const items = rows
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => {
      const signal = normalizeSignal(item.signal_type ?? item.signal ?? item.signal_key);
      const bathArea = normalizeBathArea(item.bath_area ?? item.bathArea);
      const direction = normalizeDirection(item.signal_direction ?? item.direction);
      const mentions = toInt(item.mention_count ?? item.mentions ?? item.count);
      const rowPlatformCount = Math.min(toInt(item.platform_count ?? item.platforms_count), platformCount || toInt(item.platform_count ?? item.platforms_count));
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
        note: item.notes ?? item.note ?? item.interpretation ?? item.evidence_basis ?? '',
      };
    })
    .filter((item) => item.signal && item.mentions >= 10)
    .filter((item) => item.direction !== 'neutral')
    .filter((item) => knownBathAreas.has(item.bathArea))
    .filter((item) => isSignalBathCompatible(item.signal, item.bathArea))
    .filter((item) => item.denominatorValue > 0 && item.mentions / item.denominatorValue >= 0.02)
    .filter((item) => item.platformCount >= 2)
    .filter((item) => item.mentions <= item.denominatorValue)
    .sort((a, b) => b.mentions - a.mentions || b.platformCount - a.platformCount);

  return {
    source,
    rawRows: rows.length,
    aggregate,
    items: dedupeItems(items).slice(0, 5),
  };
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

function hasFullSampleThreshold(row) {
  return toInt(row.direct_review_count) >= 300 && toInt(row.onsen_related_count) >= 200 && toInt(row.platform_count) >= 3;
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
  if (item.direction === 'mixed' || item.negative / Math.max(1, item.mentions) >= 0.18) return 'conditional';
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

function numberFromMap(map, key) {
  const value = map?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function mergeCountMaps(...maps) {
  const merged = {};
  for (const map of maps) {
    if (!map || typeof map !== 'object' || Array.isArray(map)) continue;
    for (const [key, value] of Object.entries(map)) {
      if (typeof value !== 'number' || !Number.isFinite(value)) continue;
      merged[key] = Math.max(merged[key] ?? 0, value);
    }
  }
  return merged;
}

function bathCountMapFromAggregate(aggregate) {
  return mergeCountMaps(
    aggregate?.combined_bath_area_tags,
    aggregate?.bathCounts,
    aggregate?.bath_area_tags,
    aggregate?.bath_area_tags_combined,
    aggregate?.static_summary?.bath_area_tags,
    aggregate?.summary?.bath_area_tags
  );
}

function signalCountMapFromAggregate(aggregate) {
  return mergeCountMaps(
    aggregate?.combined_signal_type_tags,
    aggregate?.signalCounts,
    aggregate?.signal_type_tags,
    aggregate?.signal_type_tags_static,
    aggregate?.static_summary?.signal_type_tags,
    aggregate?.summary?.signal_type_tags
  );
}

function primaryBathFromItems(items, aggregate) {
  const bathItems = items
    .filter((item) => item.signal === 'room_bath_hot_spring' || item.signal === 'public_bath_hot_spring' || item.signal === 'private_bath_experience')
    .sort((a, b) => b.mentions - a.mentions || b.platformCount - a.platformCount);
  if (bathItems[0]) return bathPrimaryLabel(bathItems[0].bathArea);

  const bathCounts = bathCountMapFromAggregate(aggregate);
  const signalCounts = signalCountMapFromAggregate(aggregate);
  const roomScore =
    numberFromMap(signalCounts, 'room_bath_hot_spring') ||
    numberFromMap(bathCounts, 'room_open_air_bath') + numberFromMap(bathCounts, 'room_bath');
  const publicScore =
    numberFromMap(signalCounts, 'public_bath_hot_spring') ||
    numberFromMap(bathCounts, 'open_air_public_bath') + numberFromMap(bathCounts, 'public_bath');
  const privateScore =
    numberFromMap(signalCounts, 'private_bath_experience') ||
    numberFromMap(bathCounts, 'private_bath') + numberFromMap(bathCounts, 'family_bath');
  const maxScore = Math.max(roomScore, publicScore, privateScore);

  if (maxScore > 0 && roomScore > 0 && publicScore > 0 && Math.abs(roomScore - publicScore) / maxScore <= 0.1) {
    return '객실/공용 온천 비교형';
  }
  if (maxScore === roomScore && maxScore > 0) {
    return numberFromMap(bathCounts, 'room_open_air_bath') >= numberFromMap(bathCounts, 'room_bath')
      ? '객실 노천탕 중심'
      : '객실 내 프라이빗탕 중심';
  }
  if (maxScore === publicScore && maxScore > 0) {
    return numberFromMap(bathCounts, 'open_air_public_bath') > numberFromMap(bathCounts, 'public_bath')
      ? '공용 노천탕 중심'
      : '대욕장/공용 온천 중심';
  }
  if (maxScore === privateScore && maxScore > 0) return '대절탕/가족탕 중심';
  if (items.some((item) => item.signal === 'water_texture')) return '수질 체감 중심';
  return '온천 구성 확인형';
}

function deriveBathScope(primaryBath, items) {
  const bathAreas = new Set(items.map((item) => item.bathArea));
  const hasRoom = /객실/.test(primaryBath) || bathAreas.has('room_bath') || bathAreas.has('room_open_air_bath');
  const hasPublic = /대욕장|공용/.test(primaryBath) || bathAreas.has('public_bath') || bathAreas.has('open_air_public_bath');
  if (hasRoom && hasPublic) return 'some_rooms';
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
    directReviewCount: toInt(row.direct_review_count),
    onsenReviewCount: toInt(row.onsen_related_count),
    directBodyPlatformCount: toInt(row.platform_count),
    roomBathMentionCount: countBy((item) => /room_bath|room_open_air_bath/.test(item.bathArea)),
    publicBathMentionCount: countBy((item) => /public_bath|open_air_public_bath/.test(item.bathArea)),
    privateBathMentionCount: countBy((item) => /private_bath|family_bath/.test(item.bathArea)),
    waterTextureMentionCount: countBy((item) => item.signal === 'water_texture'),
    cautionMentionCount: countBy((item) => itemType(item) === 'conditional'),
  };
}

function createAccommodation(row, aggregateInfo, level) {
  const meta = areaMeta[row.area] ?? areaMeta.arima;
  const [region, area, regionGroup, prefecture, city, onsenArea] = meta;
  const items = aggregateInfo.items;
  const primaryBath = primaryBathFromItems(items, aggregateInfo.aggregate);
  const displayName = displayNameKo[row.slug] ?? row.name_ko_or_en ?? row.name_ja ?? row.slug;
  const platformCount = toInt(row.platform_count);
  const summary =
    level === 'full'
      ? `${area}의 온천 숙소입니다. ${primaryBath}을 기준으로 이용 경험이 반복되며, 객실 타입과 공용탕 운영 조건을 함께 확인하시기 바랍니다.`
      : `${area}의 온천 숙소입니다. 직접 읽은 이용 경험 수는 확보했지만, 판정 항목은 추가 정리가 필요한 상태입니다. 객실 타입과 온천 이용 조건을 예약 전에 확인하시기 바랍니다.`;
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
    name_en: /[A-Za-z]/.test(row.name_ko_or_en ?? '') ? row.name_ko_or_en : null,
    aliases_ko: [displayName],
    aliases_ja: row.name_ja ? [row.name_ja] : [],
    aliases_en: /[A-Za-z]/.test(row.name_ko_or_en ?? '') ? [row.name_ko_or_en] : [],
    name_verification_status: 'verified',
    name_source_note: '간사이/산인/세토우치 QA seed 생성 과정에서 한국어 서비스명을 보정',
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
    evidence_grade: toInt(row.direct_review_count) >= 300 ? 'A' : toInt(row.direct_review_count) >= 100 ? 'B' : 'C',
    evidence_note: `직접 읽은 이용 경험 ${toInt(row.direct_review_count).toLocaleString('ko-KR')}건, 온천 관련 ${toInt(row.onsen_related_count).toLocaleString('ko-KR')}건, 본문 확인 플랫폼 ${platformCount}개`,
    status: 'active',
    source_file: 'research/onsen-deep-research/qa/kansai_sanin_setouchi_db_seed_qa_2026-07-07.csv',
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

function createVerdict(row, accommodation, aggregateInfo, level, platforms) {
  const briefing = {
    experiences_read: toInt(row.direct_review_count),
    onsen_related: toInt(row.onsen_related_count),
    platform_count: toInt(row.platform_count),
    platforms,
  };
  if (level === 'full') {
    return {
      target_type: 'accommodation',
      target_slug: row.slug,
      level: 'full',
      headline: `${accommodation.primary_bath} 숙소입니다.`,
      briefing,
      items: createVerdictItems(aggregateInfo.items),
      fact_statuses: [],
      status: 'published',
      verified_at: seedDate,
      source_file: 'research/onsen-deep-research/qa/kansai_sanin_setouchi_db_seed_qa_2026-07-07.csv',
    };
  }
  return {
    target_type: 'accommodation',
    target_slug: row.slug,
    level: 'lite',
    headline: `${accommodation.primary_bath} 숙소입니다.`,
    briefing,
    items: [],
    fact_statuses: [],
    status: 'published',
    verified_at: seedDate,
    source_file: 'research/onsen-deep-research/qa/kansai_sanin_setouchi_db_seed_qa_2026-07-07.csv',
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
      if (item.counts.mentions > denominator) errors.push(`${verdict.target_slug}: item mentions exceed denominator`);
      if (item.counts.negative > item.counts.mentions) errors.push(`${verdict.target_slug}: item negative exceed mentions`);
      if (item.counts.platform_count < 2) errors.push(`${verdict.target_slug}: item platform count below 2`);
      for (const direction of ['positive', 'mixed', 'negative', 'neutral']) {
        if (!Number.isFinite(item.counts.direction_counts?.[direction])) errors.push(`${verdict.target_slug}: missing ${direction} count`);
      }
    }
  }
  return errors;
}

function createSql(accommodations, verdicts) {
  const lines = [
    '-- Generated by scripts/build_kansai_sanin_setouchi_qa_seed.mjs',
    `-- Source: ${path.relative(repoRoot, qaPath)}`,
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

function downgradeReason(row, aggregateInfo, aggregatePath) {
  if (!aggregatePath) return 'aggregate 파일 없음';
  if (!hasFullSampleThreshold(row)) return 'full 표본 기준 미달';
  if (!aggregateInfo.source) return '상세 signal row 없음';
  if (aggregateInfo.items.length < 3) return `판정 채택 item ${aggregateInfo.items.length}개`;
  return 'lite 유지';
}

function backlogBucket(row, reason = '') {
  if (row.qa_status === 'near_ready_b') return '2차 보강 후보';
  if (row.qa_status === 'needs_research_reinforcement') return '재조사 필요';
  if (row.qa_status === 'candidate_only') return '딥리서치 대기';
  if (reason.includes('상세 signal row 없음')) return '3차 상세 signal row 복원';
  if (reason.includes('full 표본 기준 미달')) return '2차 표본 보강';
  return '보류';
}

function backlogAction(row, reason = '') {
  const directGap = Math.max(0, 300 - toInt(row.direct_review_count));
  const onsenGap = Math.max(0, 200 - toInt(row.onsen_related_count));
  if (reason.includes('상세 signal row 없음')) {
    return '원천 sample index 또는 숙소별 상세 signal row를 복원한 뒤 full/lite를 다시 판정합니다.';
  }
  if (reason.includes('full 표본 기준 미달')) {
    return `직접 ${directGap}건, 온천 관련 ${onsenGap}건 이상 보강 여부를 확인합니다.`;
  }
  if (row.qa_status === 'near_ready_b') {
    return '한국어/저평점/추가 플랫폼 gap을 보강하고 QA 상태를 ready_for_db로 재판정합니다.';
  }
  if (row.qa_status === 'needs_research_reinforcement') {
    return 'manifest, summary, platform mapping, aggregate 세트를 먼저 완성합니다.';
  }
  if (row.qa_status === 'candidate_only') {
    return 'ready 딥리서치 대상 여부를 먼저 결정하고, 직접 본문 300건 목표로 조사합니다.';
  }
  return row.next_action || '다음 QA에서 재분류합니다.';
}

function createBacklogCsv(rows, downgraded) {
  const downgradedBySlug = new Map(downgraded.map((row) => [row.slug, row.reason]));
  const backlogRows = rows
    .filter((row) => row.qa_status !== 'ready_for_db' || downgradedBySlug.has(row.slug))
    .map((row) => {
      const reason = downgradedBySlug.get(row.slug) ?? row.issue ?? row.qa_status;
      return {
        slug: row.slug,
        qa_status: row.qa_status,
        grade_verified: row.grade_verified,
        direct_review_count: row.direct_review_count,
        onsen_related_count: row.onsen_related_count,
        platform_count: row.platform_count,
        seed_status: downgradedBySlug.has(row.slug) ? 'seeded_lite' : 'not_seeded',
        backlog_bucket: backlogBucket(row, reason),
        reason,
        next_action: backlogAction(row, reason),
      };
    });
  const headers = [
    'slug',
    'qa_status',
    'grade_verified',
    'direct_review_count',
    'onsen_related_count',
    'platform_count',
    'seed_status',
    'backlog_bucket',
    'reason',
    'next_action',
  ];
  return `${headers.join(',')}\n${backlogRows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')).join('\n')}\n`;
}

function backlogSummary(rows, downgraded) {
  const csvRows = parseCsv(createBacklogCsv(rows, downgraded));
  const counts = new Map();
  for (const row of csvRows) counts.set(row.backlog_bucket, (counts.get(row.backlog_bucket) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], 'ko'));
}

function createReport(accommodations, verdicts, selectedRows, allRows, downgraded, skipped, aggregateInventory) {
  const full = verdicts.filter((row) => row.level === 'full');
  const lite = verdicts.filter((row) => row.level === 'lite');
  const backlog = backlogSummary(allRows, downgraded);
  const lines = [
    '# 간사이/산인/세토우치 QA 1차 DB Seed 생성 리포트',
    '',
    `작성일: ${seedDate}`,
    '',
    '## 요약',
    '',
    `- QA ready_for_db 후보: ${selectedRows.length}곳`,
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
      return `| ${row.target_slug} | ${accommodation?.name ?? ''} | ${row.briefing.experiences_read} | ${row.briefing.onsen_related} | ${row.briefing.platform_count} | ${row.items.length} |`;
    }),
    '',
    '## Lite Verdict',
    '',
    '| slug | 숙소명 | 직접 | 온천 | 플랫폼 | 이유 |',
    '|---|---|---:|---:|---:|---|',
    ...lite.map((row) => {
      const accommodation = accommodations.find((item) => item.slug === row.target_slug);
      const reason = downgraded.find((item) => item.slug === row.target_slug)?.reason ?? 'ready_for_db_lite';
      return `| ${row.target_slug} | ${accommodation?.name ?? ''} | ${row.briefing.experiences_read} | ${row.briefing.onsen_related} | ${row.briefing.platform_count} | ${reason} |`;
    }),
    '',
    '## Aggregate 구조 메모',
    '',
    '| slug | aggregate rows | adopted items | row source |',
    '|---|---:|---:|---|',
    ...aggregateInventory.map((item) => `| ${item.slug} | ${item.rawRows} | ${item.items} | ${item.source ?? 'none'} |`),
    '',
    '## 다음 백로그',
    '',
    '| bucket | count |',
    '|---|---:|',
    ...backlog.map(([bucket, count]) => `| ${bucket} | ${count} |`),
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
    `- \`${path.relative(repoRoot, outputBacklogPath)}\``,
    '',
    '## 적용 전 주의',
    '',
    '- 이 권역은 숙소별 aggregate JSON 스키마가 일정하지 않아, 상세 signal row가 없는 숙소는 full로 승격하지 않았다.',
    '- full 항목은 `mentions >= 10`, 분모 2% 이상, 2플랫폼 이상, 방향 카운트 보유 기준으로만 생성했다.',
    '- `ise_shima`는 DB 권역상 `kansai`, `sanin`/`shikoku_setouchi`는 `chugoku_shikoku`로 정규화했다.',
    '',
  ];
  return `${lines.join('\n')}\n`;
}

async function main() {
  const rows = readCsv(qaPath);
  const selectedRows = rows.filter((row) => row.qa_status === 'ready_for_db');
  const accommodations = [];
  const verdicts = [];
  const downgraded = [];
  const skipped = [];
  const aggregateInventory = [];

  for (const row of selectedRows) {
    const { aggregate, path: aggregatePath } = loadAggregate(row);
    if (!aggregate) {
      skipped.push({ slug: row.slug, reason: 'aggregate 파일을 열 수 없음' });
      continue;
    }
    const aggregateInfo = aggregateItems(row, aggregate);
    const platforms = platformListFromAggregate(row, aggregate);
    const canBeFull = hasFullSampleThreshold(row) && aggregateInfo.source && aggregateInfo.items.length >= 3;
    const level = canBeFull ? 'full' : 'lite';

    aggregateInventory.push({
      slug: row.slug,
      rawRows: aggregateInfo.rawRows,
      items: aggregateInfo.items.length,
      source: aggregateInfo.source,
    });

    if (!canBeFull) {
      downgraded.push({ slug: row.slug, reason: downgradeReason(row, aggregateInfo, aggregatePath) });
    }

    const accommodation = createAccommodation(row, aggregateInfo, level);
    const verdict = createVerdict(row, accommodation, aggregateInfo, level, platforms);
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
  await writeFile(outputBacklogPath, createBacklogCsv(rows, downgraded));
  await writeFile(outputReportPath, createReport(accommodations, verdicts, selectedRows, rows, downgraded, skipped, aggregateInventory));

  console.log(`Generated ${accommodations.length} accommodations.`);
  console.log(`Full verdicts: ${verdicts.filter((row) => row.level === 'full').length}`);
  console.log(`Lite verdicts: ${verdicts.filter((row) => row.level === 'lite').length}`);
  console.log(outputJsonPath);
  console.log(outputSqlPath);
  console.log(outputReportPath);
  console.log(outputBacklogPath);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
