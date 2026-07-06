import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const researchDir = path.join(repoRoot, 'research', 'onsen-candidates', 'nationwide-2026-07-03');
const outputDir = path.join(repoRoot, 'output');
const snapshotDate = '2026-07-04';

const sourcePaths = {
  accommodationMapping: path.join(researchDir, 'hokkaido_ready_accommodation_platform_mapping_2026-07-03.json'),
  accommodationSignals: path.join(researchDir, 'hokkaido_ready_accommodation_review_signal_rows_2026-07-03.csv'),
  accommodationQuality: path.join(researchDir, 'hokkaido_ready_accommodation_quality_matrix_2026-07-04.csv'),
  facilityMapping: path.join(researchDir, 'hokkaido_ready_facility_platform_mapping_2026-07-04.json'),
  facilitySignals: path.join(researchDir, 'hokkaido_ready_facility_review_signal_rows_2026-07-04.csv'),
  yunohanaSignals: path.join(researchDir, 'yunohana_jozankei_facility_review_signal_rows_2026-07-04.csv'),
};

const accommodationJsonPath = path.join(outputDir, 'hokkaido-onsen-mvp-accommodations.v1.json');
const accommodationSqlPath = path.join(outputDir, 'hokkaido-onsen-mvp-accommodations.v1.postgres.upserts.sql');
const facilityJsonPath = path.join(outputDir, 'hokkaido-onsen-mvp-facilities.v1.pending-schema.json');
const placeCsvPath = path.join(outputDir, 'hokkaido-onsen-mvp-places.v1.csv');
const signalCsvPath = path.join(outputDir, 'hokkaido-onsen-mvp-review-signals.v1.csv');
const reportPath = path.join(researchDir, 'hokkaido_mvp_db_load_report_2026-07-04.md');

function parseCsv(text) {
  const rows = [];
  let field = '';
  let row = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
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
    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
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
  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...body] = rows.filter((item) => item.some((value) => value !== ''));
  return body.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  );
}

function stringifyCsv(rows, headers) {
  const escape = (value) => {
    const text = value == null ? '' : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(',')),
  ].join('\n') + '\n';
}

function sqlString(value) {
  if (value == null) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

function toInt(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.floor(parsed) : null;
}

function compact(values) {
  return values.filter((value) => value != null && value !== '');
}

function unique(values) {
  return [...new Set(compact(values))];
}

function areaFromSlug(slug, qualityRow) {
  if (qualityRow?.area_slug) return qualityRow.area_slug;
  if (slug.includes('noboribetsu')) return 'noboribetsu';
  if (slug.includes('jozankei')) return 'jozankei';
  if (slug.includes('yunokawa')) return 'yunokawa';
  if (slug.includes('toyako')) return 'toyako';
  if (slug.includes('tokachigawa')) return 'tokachigawa';
  return 'hokkaido';
}

function cityFromArea(area) {
  if (area.includes('noboribetsu')) return 'noboribetsu';
  if (area.includes('jozankei')) return 'sapporo';
  if (area.includes('yunokawa') || area.includes('hakodate')) return 'hakodate';
  if (area.includes('toyako')) return 'toyako';
  if (area.includes('tokachigawa')) return 'otofuke';
  return 'hokkaido';
}

function deriveBathScope(axis, name, signalRows) {
  const text = `${axis} ${name}`;
  if (/全室|all rooms/i.test(text)) return 'all_rooms';
  if (/room_open_air_bath|room_bath/.test(axis)) return 'some_rooms';
  if (signalRows.some((row) => row.bath_area === 'room_open_air_bath' || row.bath_area === 'room_bath')) return 'room_signal_only';
  if (signalRows.some((row) => row.bath_area === 'public_bath' || row.bath_area === 'open_air_public_bath')) return 'public_bath_only';
  return 'unclear';
}

function derivePrimaryBath(axis, signalRows) {
  const signalAreas = new Set(signalRows.map((row) => row.bath_area));
  const roomMentions = sumMentions(signalRows, (row) => row.bath_area === 'room_bath' || row.bath_area === 'room_open_air_bath') ?? 0;
  const publicMentions = sumMentions(signalRows, (row) => row.bath_area === 'public_bath' || row.bath_area === 'open_air_public_bath') ?? 0;
  if (publicMentions >= 80 && publicMentions > roomMentions * 1.5) return '대욕장 중심';
  if (roomMentions >= 80 && roomMentions > publicMentions * 1.5) {
    return axis.includes('room_open_air_bath') || signalAreas.has('room_open_air_bath') ? '객실 노천탕 중심' : '객실탕 중심';
  }
  if (axis.includes('room_open_air_bath')) return '객실 노천탕 중심';
  if (axis.includes('room_bath')) return '객실탕 중심';
  if (axis.includes('private_bath') || signalAreas.has('private_bath') || signalAreas.has('family_bath')) return '대절탕/프라이빗탕 있음';
  if (axis.includes('public_bath') || signalAreas.has('public_bath') || signalAreas.has('open_air_public_bath')) return '대욕장 중심';
  return '온천 구성 확인 필요';
}

function deriveBathContexts(bathScope, signalRows) {
  const values = new Set();
  if (['all_rooms', 'some_rooms', 'room_signal_only'].includes(bathScope)) values.add('room_bath');
  if (signalRows.some((row) => row.bath_area === 'private_bath' || row.bath_area === 'family_bath')) values.add('private_bath');
  if (signalRows.some((row) => row.bath_area === 'public_bath' || row.bath_area === 'open_air_public_bath')) values.add('public_bath');
  return [...values];
}

function deriveWaterSourceType(text) {
  if (/100%|１００％|天然温泉100|100% 천연/.test(text)) return 'natural_100';
  if (/源泉かけ流し|源泉掛け流し|源泉掛流|かけ流し|掛け流し|원천가케나가시|원천/.test(text)) return 'free_flowing_source';
  if (/温泉|온천|泉質|モール温泉/.test(text)) return 'hot_spring_confirmed';
  return 'needs_check';
}

function deriveWaterCriteria(waterSourceType, signalRows, text) {
  const values = new Set(['spring_confirmed']);
  if (waterSourceType === 'free_flowing_source') values.add('direct_source');
  if (waterSourceType === 'natural_100') values.add('natural_100');
  if (signalRows.some((row) => row.signal_type === 'water_texture') || /肌|湯|물|부드럽|茶褐色|モール/.test(text)) values.add('water_texture');
  if (/加水|加温|온도|temperature|熱い|ぬるい/.test(text)) values.add('temperature_adjustment');
  if (/겨울|雪|winter|寒/.test(text)) values.add('winter_caution');
  return [...values];
}

function sumMentions(signalRows, predicate) {
  return signalRows
    .filter(predicate)
    .reduce((sum, row) => sum + (toInt(row.mention_count) ?? 0), 0) || null;
}

function pickVisibleReviewPool(item) {
  const pools = [];
  if (item.google_maps) {
    pools.push({
      platform: 'Google Maps',
      rating: item.google_maps.rating ?? null,
      visible_review_count: item.google_maps.visible_review_count ?? null,
      access_status: item.google_maps.access_status ?? null,
    });
  }
  for (const source of item.ota_review_pool_signals ?? []) {
    pools.push({
      platform: source.source,
      rating: source.rating ?? null,
      visible_review_count: source.visible_review_count ?? null,
      access_status: source.access_status ?? null,
    });
  }
  return pools;
}

function createAccommodationRow(item, qualityBySlug, signalsBySlug) {
  const quality = qualityBySlug.get(item.slug);
  const signalRows = signalsBySlug.get(item.slug) ?? [];
  const directReviewCount = toInt(quality?.direct_reviews_checked) ?? item.direct_reviews_checked ?? 0;
  const onsenReviewCount = toInt(quality?.onsen_related_direct_reviews_checked) ?? item.onsen_related_direct_reviews_checked ?? 0;
  const platformText = quality?.direct_body_platforms || (item.direct_body_platforms ?? []).join(' | ');
  const platforms = platformText.split('|').map((value) => value.trim()).filter(Boolean);
  const facts = item.official_bath_facts_seen ?? {};
  const axis = facts.candidate_axes ?? '';
  const officialText = JSON.stringify(facts, null, 0);
  const signalText = [...(item.review_signal_keywords ?? []), ...(item.caution_keywords ?? [])].join(' ');
  const area = areaFromSlug(item.slug, quality);
  const bathScope = deriveBathScope(axis, item.name_ja, signalRows);
  const primaryBath = derivePrimaryBath(axis, signalRows);
  const waterSourceType = deriveWaterSourceType(`${officialText} ${signalText}`);
  const bathContexts = deriveBathContexts(bathScope, signalRows);
  const waterCriteria = deriveWaterCriteria(waterSourceType, signalRows, `${officialText} ${signalText}`);
  const topSignals = signalRows
    .slice()
    .sort((a, b) => (toInt(b.mention_count) ?? 0) - (toInt(a.mention_count) ?? 0))
    .slice(0, 3)
    .map((row) => `${row.signal_type}:${row.signal_direction}(${row.mention_count})`);

  return {
    slug: item.slug,
    name: item.name_ja,
    ja_name: item.name_ja,
    region: area,
    area: `홋카이도 ${area}`,
    country: 'JP',
    region_group: 'hokkaido',
    prefecture: 'hokkaido',
    city: cityFromArea(area),
    onsen_area: area,
    travel_contexts: ['ryokan_stay'],
    bath_contexts: bathContexts.length > 0 ? bathContexts : ['public_bath'],
    water_criteria: waterCriteria,
    summary: `홋카이도 MVP 온천숙소 표본. 직접 확인 리뷰 ${directReviewCount}건 중 온천 관련 ${onsenReviewCount}건을 분리 집계했고, 주요 신호는 ${topSignals.join(', ') || '온천 경험 신호 추가 정리 필요'}로 요약된다.`,
    primary_bath: primaryBath,
    water_use_status: 'official_confirmed',
    water_source_type: waterSourceType,
    bath_scope: bathScope,
    operation_notes: unique([
      signalRows.some((row) => row.signal_type === 'booking_confusion') ? '예약/객실타입 혼동 신호 있음' : '',
      signalRows.some((row) => row.signal_type === 'crowding') ? '혼잡 신호 있음' : '',
      signalRows.some((row) => row.signal_type === 'weak_onsen_feeling') ? '온천감 약함 신호 일부 있음' : '',
    ]),
    evidence_counts: {
      directReviewCount,
      onsenReviewCount,
      roomBathMentionCount: sumMentions(signalRows, (row) => row.bath_area === 'room_bath' || row.bath_area === 'room_open_air_bath'),
      publicBathMentionCount: sumMentions(signalRows, (row) => row.bath_area === 'public_bath' || row.bath_area === 'open_air_public_bath'),
      privateBathMentionCount: sumMentions(signalRows, (row) => row.bath_area === 'private_bath' || row.bath_area === 'family_bath'),
      waterTextureMentionCount: sumMentions(signalRows, (row) => row.signal_type === 'water_texture'),
      cautionMentionCount: sumMentions(signalRows, (row) => ['booking_confusion', 'crowding', 'weak_onsen_feeling', 'chlorine_smell'].includes(row.signal_type)),
      directBodyPlatformCount: platforms.length,
      directBodyPlatforms: platforms,
      visibleReviewPool: pickVisibleReviewPool(item),
      mvpDataset: 'hokkaido_onsen_mvp_v1',
    },
    evidence_grade: 'A',
    evidence_note: `A: 직접 확인 ${directReviewCount}건, 온천 관련 ${onsenReviewCount}건, 직접 본문 플랫폼 ${platforms.length}개`,
    status: 'active',
    source_file: 'research/onsen-candidates/nationwide-2026-07-03/hokkaido_ready_accommodation_platform_mapping_2026-07-03.json',
    content_updated_at: snapshotDate,
  };
}

function createFacilityRow(item, signalsBySlug) {
  const signalRows = signalsBySlug.get(item.slug) ?? [];
  const platformPools = Object.entries(item.platform_review_pools ?? {}).map(([platform, pool]) => ({
    platform,
    rating: pool.rating ?? null,
    visible_review_count: pool.visible_review_count ?? null,
    review_body_access: pool.review_body_access ?? null,
    directly_read_reviews: pool.directly_read_reviews ?? 0,
    onsen_related_direct_reviews: pool.onsen_related_direct_reviews ?? null,
  }));

  return {
    slug: item.slug,
    place_kind: 'facility',
    name_ja: item.name_ja,
    name_ko: item.name_ko ?? '',
    region_group: 'hokkaido',
    prefecture: 'hokkaido',
    city: cityFromArea(item.area ?? ''),
    onsen_area: item.area ?? 'hokkaido',
    facility_type: item.facility_type ?? 'onsen_facility',
    official_url: item.official_url ?? '',
    service_data_status: item.service_data_status ?? 'ready_for_service',
    data_quality_grade: item.data_quality_grade,
    direct_reviews_checked: item.direct_reviews_checked,
    onsen_related_direct_reviews_checked: item.onsen_related_direct_reviews_checked,
    direct_body_platform_count: item.direct_body_platform_count,
    direct_body_platforms: item.direct_body_platforms ?? [],
    platform_review_pools: platformPools,
    official_facts: item.official_facility_facts_seen ?? {},
    review_signal_keywords: item.review_signal_keywords ?? [],
    caution_keywords: item.caution_keywords ?? [],
    signal_rows_count: signalRows.length,
    source_file: 'research/onsen-candidates/nationwide-2026-07-03/hokkaido_ready_facility_platform_mapping_2026-07-04.json',
  };
}

function normalizeFacilitySignalType(value) {
  const map = {
    source_flow_feeling: 'source_flow_claim',
    price_value: 'price_payment_value',
    cleanliness: 'cleanliness_amenities',
    aged_facility: 'cleanliness_amenities',
    operation_confusion: 'operation_volatility',
    access_parking: 'accessibility',
    shuttle_bus: 'accessibility',
    sauna_quality: 'bath_variety',
    cold_bath_quality: 'bath_variety',
    temperature_issue: 'distinctive_spring_character',
    amenity_gap: 'cleanliness_amenities',
    crowding: 'crowding_or_wait',
  };
  return map[value] ?? value;
}

function normalizeFacilityBathArea(value) {
  if (value === 'indoor_public_bath') return 'public_bath';
  if (value === 'sauna') return 'facility_wide';
  if (value === 'cold_bath') return 'facility_wide';
  if (value === 'restaurant') return 'rest_area';
  if (value === 'parking') return 'facility_wide';
  return value;
}

function placeRows(accommodations, facilities) {
  return [
    ...accommodations.map((row) => ({
      place_kind: 'accommodation',
      slug: row.slug,
      name_ja: row.ja_name,
      name_ko: '',
      region_group: row.region_group,
      prefecture: row.prefecture,
      city: row.city,
      onsen_area: row.onsen_area,
      data_quality_grade: row.evidence_grade,
      service_data_status: row.status,
      direct_reviews_checked: row.evidence_counts.directReviewCount,
      onsen_related_direct_reviews_checked: row.evidence_counts.onsenReviewCount,
      direct_body_platform_count: row.evidence_counts.directBodyPlatformCount,
      source_file: row.source_file,
    })),
    ...facilities.map((row) => ({
      place_kind: 'facility',
      slug: row.slug,
      name_ja: row.name_ja,
      name_ko: row.name_ko,
      region_group: row.region_group,
      prefecture: row.prefecture,
      city: row.city,
      onsen_area: row.onsen_area,
      data_quality_grade: row.data_quality_grade,
      service_data_status: row.service_data_status,
      direct_reviews_checked: row.direct_reviews_checked,
      onsen_related_direct_reviews_checked: row.onsen_related_direct_reviews_checked,
      direct_body_platform_count: row.direct_body_platform_count,
      source_file: row.source_file,
    })),
  ];
}

function signalRows(accommodationSignals, facilitySignals, yunohanaSignals, facilitySlugs) {
  const facilityRows = [
    ...facilitySignals.filter((row) => facilitySlugs.has(row.slug) && row.slug !== 'jozankei-yunohana'),
    ...yunohanaSignals.filter((row) => facilitySlugs.has(row.slug)),
  ];
  return [
    ...accommodationSignals.map((row) => ({
      place_kind: 'accommodation',
      slug: row.slug,
      name: row.accommodation_name,
      bath_area_raw: row.bath_area,
      bath_area_normalized: row.bath_area,
      bath_area_confidence: row.bath_area_confidence,
      signal_type_raw: row.signal_type,
      signal_type_normalized: row.signal_type,
      signal_direction: row.signal_direction,
      mention_count: row.mention_count,
      source_count: row.source_count,
      platform_count: row.platform_count,
      contradiction_level: row.contradiction_level,
      review_signal_status: row.review_signal_status,
    })),
    ...facilityRows.map((row) => ({
      place_kind: 'facility',
      slug: row.slug,
      name: row.facility_name,
      bath_area_raw: row.bath_area,
      bath_area_normalized: normalizeFacilityBathArea(row.bath_area),
      bath_area_confidence: row.bath_area_confidence,
      signal_type_raw: row.signal_type,
      signal_type_normalized: normalizeFacilitySignalType(row.signal_type),
      signal_direction: row.signal_direction,
      mention_count: row.mention_count,
      source_count: row.source_count,
      platform_count: row.platform_count,
      contradiction_level: row.contradiction_level,
      review_signal_status: row.review_signal_status,
    })),
  ];
}

function buildAccommodationSql(rows) {
  const columns = [
    'slug',
    'name',
    'ja_name',
    'region',
    'area',
    'summary',
    'primary_bath',
    'water_use_status',
    'water_source_type',
    'bath_scope',
    'operation_notes',
    'evidence_counts',
    'evidence_grade',
    'evidence_note',
    'status',
    'source_file',
    'content_updated_at',
    'country',
    'region_group',
    'prefecture',
    'city',
    'onsen_area',
    'travel_contexts',
    'bath_contexts',
    'water_criteria',
  ];
  const values = rows.map((row) => `(${[
    sqlString(row.slug),
    sqlString(row.name),
    sqlString(row.ja_name),
    sqlString(row.region),
    sqlString(row.area),
    sqlString(row.summary),
    sqlString(row.primary_bath),
    sqlString(row.water_use_status),
    sqlString(row.water_source_type),
    sqlString(row.bath_scope),
    sqlJson(row.operation_notes),
    sqlJson(row.evidence_counts),
    sqlString(row.evidence_grade),
    sqlString(row.evidence_note),
    sqlString(row.status),
    sqlString(row.source_file),
    sqlString(row.content_updated_at),
    sqlString(row.country),
    sqlString(row.region_group),
    sqlString(row.prefecture),
    sqlString(row.city),
    sqlString(row.onsen_area),
    sqlJson(row.travel_contexts),
    sqlJson(row.bath_contexts),
    sqlJson(row.water_criteria),
  ].join(', ')})`);

  const updateColumns = columns.filter((column) => column !== 'slug');
  return [
    '-- Generated by scripts/export_hokkaido_onsen_mvp_seed.mjs',
    `-- Snapshot: ${snapshotDate}`,
    '-- Scope: Hokkaido MVP accommodations only. Facility A rows are exported as pending-schema JSON/CSV.',
    '',
    `INSERT INTO onsen_accommodations (${columns.join(', ')})`,
    'VALUES',
    values.join(',\n'),
    'ON CONFLICT (slug) DO UPDATE SET',
    updateColumns.map((column) => `  ${column} = EXCLUDED.${column}`).join(',\n') + ',',
    '  updated_at = NOW();',
    '',
  ].join('\n');
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const [
    accommodationMapping,
    facilityMapping,
    accommodationSignalRows,
    facilitySignalRows,
    yunohanaSignalRows,
    qualityRows,
  ] = await Promise.all([
    readFile(sourcePaths.accommodationMapping, 'utf8').then(JSON.parse),
    readFile(sourcePaths.facilityMapping, 'utf8').then(JSON.parse),
    readFile(sourcePaths.accommodationSignals, 'utf8').then(parseCsv),
    readFile(sourcePaths.facilitySignals, 'utf8').then(parseCsv),
    readFile(sourcePaths.yunohanaSignals, 'utf8').then(parseCsv),
    readFile(sourcePaths.accommodationQuality, 'utf8').then(parseCsv),
  ]);

  const qualityBySlug = new Map(qualityRows.map((row) => [row.slug, row]));
  const accommodationSignalsBySlug = Map.groupBy(accommodationSignalRows, (row) => row.slug);
  const facilitySignalsBySlug = Map.groupBy([...facilitySignalRows, ...yunohanaSignalRows], (row) => row.slug);
  const accommodationRows = accommodationMapping.lodgings
    .filter((item) => item.data_quality_grade === 'A')
    .map((item) => createAccommodationRow(item, qualityBySlug, accommodationSignalsBySlug));
  const facilityRowsForMvp = facilityMapping.facilities
    .filter((item) => item.data_quality_grade === 'A')
    .map((item) => createFacilityRow(item, facilitySignalsBySlug));
  const facilitySlugs = new Set(facilityRowsForMvp.map((row) => row.slug));
  const mvpPlaceRows = placeRows(accommodationRows, facilityRowsForMvp);
  const mvpSignalRows = signalRows(accommodationSignalRows, facilitySignalRows, yunohanaSignalRows, facilitySlugs);

  await writeFile(accommodationJsonPath, `${JSON.stringify(accommodationRows, null, 2)}\n`);
  await writeFile(accommodationSqlPath, buildAccommodationSql(accommodationRows));
  await writeFile(facilityJsonPath, `${JSON.stringify(facilityRowsForMvp, null, 2)}\n`);
  await writeFile(placeCsvPath, stringifyCsv(mvpPlaceRows, [
    'place_kind',
    'slug',
    'name_ja',
    'name_ko',
    'region_group',
    'prefecture',
    'city',
    'onsen_area',
    'data_quality_grade',
    'service_data_status',
    'direct_reviews_checked',
    'onsen_related_direct_reviews_checked',
    'direct_body_platform_count',
    'source_file',
  ]));
  await writeFile(signalCsvPath, stringifyCsv(mvpSignalRows, [
    'place_kind',
    'slug',
    'name',
    'bath_area_raw',
    'bath_area_normalized',
    'bath_area_confidence',
    'signal_type_raw',
    'signal_type_normalized',
    'signal_direction',
    'mention_count',
    'source_count',
    'platform_count',
    'contradiction_level',
    'review_signal_status',
  ]));

  const accommodationDirectTotal = accommodationRows.reduce((sum, row) => sum + row.evidence_counts.directReviewCount, 0);
  const facilityDirectTotal = facilityRowsForMvp.reduce((sum, row) => sum + row.direct_reviews_checked, 0);
  const report = [
    '# Hokkaido MVP DB Load Report',
    '',
    `- 생성일: ${snapshotDate}`,
    '- 범위: 홋카이도 MVP 숙소 A 16곳 + 온천시설 A 3곳',
    '- 숙소 DB 상태: 기존 `onsen_accommodations` 테이블에 업서트 가능',
    '- 시설 DB 상태: 현재 시설 전용 테이블이 없어 `pending-schema` JSON/CSV로 분리 보관',
    '',
    '## 적재 대상',
    '',
    `- 숙소: ${accommodationRows.length}곳, 직접 확인 리뷰 합계 ${accommodationDirectTotal.toLocaleString('ko-KR')}건`,
    `- 시설: ${facilityRowsForMvp.length}곳, 직접 확인 리뷰 합계 ${facilityDirectTotal.toLocaleString('ko-KR')}건`,
    `- 통합 장소 원장: ${mvpPlaceRows.length}건`,
    `- 통합 리뷰 신호 rows: ${mvpSignalRows.length}건`,
    '',
    '## 생성 파일',
    '',
    `- \`${path.relative(repoRoot, accommodationJsonPath)}\``,
    `- \`${path.relative(repoRoot, accommodationSqlPath)}\``,
    `- \`${path.relative(repoRoot, facilityJsonPath)}\``,
    `- \`${path.relative(repoRoot, placeCsvPath)}\``,
    `- \`${path.relative(repoRoot, signalCsvPath)}\``,
    '',
    '## 시설 A 3곳',
    '',
    '| slug | name_ja | direct_reviews | onsen_reviews | platforms | status |',
    '|---|---:|---:|---:|---:|---|',
    ...facilityRowsForMvp.map((row) => `| ${row.slug} | ${row.name_ja} | ${row.direct_reviews_checked} | ${row.onsen_related_direct_reviews_checked} | ${row.direct_body_platform_count} | ${row.service_data_status} |`),
    '',
    '## 주의',
    '',
    '- Google/OTA visible review pool은 직접 읽은 리뷰 수와 합산하지 않았다.',
    '- 시설 신호는 숙소 신호와 다른 모델이므로 `bath_area_raw/signal_type_raw`와 normalized 값을 함께 남겼다.',
    '- `noboribetsu-sagiriyu`는 C등급 87건으로 MVP 적재 대상에서 제외했다.',
    '- 실제 DB 반영 전 시설 테이블을 만들거나, 장소 공통 테이블로 스키마를 재설계해야 한다.',
    '',
  ].join('\n');
  await writeFile(reportPath, report);

  console.log(`Exported ${accommodationRows.length} accommodation rows and ${facilityRowsForMvp.length} facility rows.`);
  console.log(path.relative(repoRoot, accommodationSqlPath));
  console.log(path.relative(repoRoot, facilityJsonPath));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
