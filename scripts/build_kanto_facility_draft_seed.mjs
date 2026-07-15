import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const repoRoot = process.cwd();
const researchDate = '2026-07-09';
const seedDate = '2026-07-10';
const collectionKey = 'kanto_tokyo_facility_normalized_2026-07-10';
const shouldApply = process.argv.includes('--apply');
const outputDir = path.join(repoRoot, 'research', 'onsen-db-seed');
const deepResearchRoot = path.join(outputDir, 'deepresearch', `kanto_tokyo_${researchDate}`);

const paths = {
  facilitySeed: path.join(outputDir, `kanto_tokyo_facility_db_seed_ready_${researchDate}.csv`),
  signalMaster: path.join(outputDir, `kanto_tokyo_facility_review_signal_master_${researchDate}.csv`),
  waterFacts: path.join(outputDir, `kanto_tokyo_facility_water_fact_status_${researchDate}.json`),
  seed: path.join(outputDir, `kanto_tokyo_facility_draft_seed_${seedDate}.json`),
  report: path.join(outputDir, `kanto_tokyo_facility_draft_seed_${seedDate}.md`),
  waterBacklog: path.join(outputDir, `kanto_tokyo_facility_draft_seed_${seedDate}_water_backlog.csv`),
  loadReport: path.join(outputDir, `kanto_tokyo_facility_draft_seed_${seedDate}_load_report.md`),
};

const allowedAreas = new Set([
  'public_bath', 'open_air_public_bath', 'family_bath', 'private_bath', 'sand_bath', 'steam_bath',
  'footbath', 'drinking_spring', 'inhalation', 'sauna', 'stone_sauna', 'rest_area', 'food_area',
  'food_steam', 'overnight_rest', 'route_or_pass', 'area_cluster', 'facility_wide', 'unclear',
]);

const allowedSignals = new Set([
  'water_texture', 'distinctive_spring_character', 'chlorine_smell', 'weak_onsen_feeling',
  'temperature_experience', 'weather_season', 'historic_bath_context', 'bath_variety',
  'sand_or_steam_experience', 'family_private_bath_experience', 'crowding_or_wait',
  'reservation_or_queue_confusion', 'cleanliness_amenities', 'price_payment_value', 'accessibility',
  'tourist_expectation_gap', 'local_user_culture', 'eligibility_or_use_scope', 'operation_volatility',
]);

const splitCounts = {
  'nasu-omaru-dayuse': { dayuse: 50, lodgingBath: 11 },
  'hoshi-onsen-choujukan-dayuse': { dayuse: 28, lodgingBath: 19 },
  'takaragawa-sanso-dayuse': { dayuse: 41, lodgingBath: 31 },
};

const koreanNameOverrides = {
  'spa-herbs': '미라쿠온천 스파 허브스',
};

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const result = {};
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    result[match[1]] = value;
  }
  return result;
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (character === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }
    if (character === '"') quoted = true;
    else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field.replace(/\r$/, ''));
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      field = '';
    } else field += character;
  }
  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows;
  return body.map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ''])));
}

function csvValue(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(filePath, rows, columns) {
  const lines = [columns.join(',')];
  for (const row of rows) lines.push(columns.map((column) => csvValue(row[column])).join(','));
  writeFileSync(filePath, `${lines.join('\n')}\n`);
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null && String(value).trim() !== ''))];
}

function numberOrNull(...values) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (/^\d+$/.test(String(value ?? '').trim())) return Number(value);
  }
  return null;
}

function relative(filePath) {
  return path.relative(repoRoot, filePath);
}

function mappingPath(slug) {
  const directory = path.join(deepResearchRoot, slug);
  const filename = readdirSync(directory).find((file) => file.endsWith(`_facility_platform_mapping_${researchDate}.json`));
  if (!filename) throw new Error(`Missing platform mapping for ${slug}`);
  return path.join(directory, filename);
}

function object(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function identityFrom(mapping) {
  const candidates = [mapping.identity, mapping.lodging, mapping.facility_identity, mapping];
  return candidates.find((candidate) => object(candidate).name_ja || object(candidate).japanese_name || object(candidate).facility_type) ?? {};
}

function officialFactsFrom(mapping) {
  return mapping.official_bath_facts_seen
    ?? mapping.official_facts_seen
    ?? mapping.official_facts
    ?? mapping.official_scope
    ?? {};
}

function samplingFrom(mapping) {
  return mapping.direct_review_sampling_status ?? mapping.review_collection ?? {};
}

function normalizeFacilityModel(value) {
  const text = String(value ?? '').toLowerCase();
  if (['bathe', 'reserve_private', 'experience', 'stopover', 'route_or_pass'].includes(text)) return text;
  if (text.includes('reserve_private') || text.includes('private')) return 'reserve_private';
  if (text.includes('experience')) return 'experience';
  if (text.includes('stopover')) return 'stopover';
  if (text.includes('route')) return 'route_or_pass';
  return 'bathe';
}

function normalizeArchetype(value) {
  const text = String(value ?? '').toLowerCase().replace(/[- ]/g, '_');
  if (['public_bathing', 'experience_led', 'private_use', 'mixed', 'route_or_pass'].includes(text)) return text;
  if (text.includes('experience')) return 'experience_led';
  if (text.includes('private')) return 'private_use';
  if (text.includes('route')) return 'route_or_pass';
  return 'public_bathing';
}

function normalizeLodgingAvailable(value) {
  if (value === true || String(value).toLowerCase() === 'true') return 'true';
  if (value === false || String(value).toLowerCase() === 'false') return 'false';
  return 'unclear';
}

function normalizeGrade(value, directReviews) {
  const grade = String(value ?? '').match(/[ABCD]/)?.[0];
  if (grade) return grade;
  if (directReviews >= 300) return 'A';
  if (directReviews >= 100) return 'B';
  if (directReviews >= 50) return 'C';
  return 'D';
}

function normalizeReadiness(value) {
  if (value === 'DB_seed_ready') return 'ready';
  if (value === 'needs_split_reinforcement') return 'scope_split';
  if (value === 'needs_reinforcement') return 'needs_reinforcement';
  return 'hold';
}

function collectUrls(value, target) {
  if (typeof value === 'string' && /^https?:\/\//.test(value)) target.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectUrls(item, target));
}

function sanitizeOfficialProfile(value, depth = 0) {
  if (depth >= 6) return null;
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => sanitizeOfficialProfile(item, depth + 1));
  const clean = {};
  for (const [key, child] of Object.entries(value)) {
    if (/(source_flow|source_operation|water_system|kakenagashi|junkan|kasui|kaon|disinfection|natural_100|method_render|texture_filter|water_color)/i.test(key)) continue;
    clean[key] = sanitizeOfficialProfile(child, depth + 1);
  }
  return clean;
}

function platformEntries(mapping) {
  const candidates = [mapping.platforms, mapping.visible_review_pool?.platforms, mapping.review_collection?.platforms];
  const raw = candidates.find((value) => Array.isArray(value) || Object.keys(object(value)).length > 0);
  if (Array.isArray(raw)) return raw.map((item) => ({ name: item.platform ?? item.source_platform ?? 'unknown', value: item }));
  return Object.entries(object(raw)).map(([name, value]) => ({ name, value }));
}

function platformManifests(mapping, sampling) {
  const visible = [];
  const direct = [];
  for (const { name, value } of platformEntries(mapping)) {
    const entry = object(value);
    const visibleCount = numberOrNull(entry.visible_review_count);
    const directCount = numberOrNull(entry.directly_read_reviews, entry.direct_reviews_read) ?? 0;
    const facilityRelated = numberOrNull(entry.facility_related_reviews, entry.facility_related_direct_reviews);
    const base = {
      platform: name,
      rating: entry.rating ?? null,
      url: entry.url ?? null,
      review_body_access: entry.review_body_access ?? entry.access_status ?? null,
    };
    if (visibleCount !== null) visible.push({ ...base, visible_review_count: visibleCount });
    if (directCount > 0) direct.push({ ...base, directly_read_reviews: directCount, facility_related_reviews: facilityRelated });
  }

  const directCounts = object(sampling.platform_direct_read_counts);
  const facilityCounts = object(sampling.platform_facility_related_counts);
  for (const [platform, count] of Object.entries(directCounts)) {
    if (direct.some((entry) => entry.platform === platform)) continue;
    direct.push({
      platform,
      rating: null,
      url: null,
      review_body_access: 'direct_read_count_from_collection_stats',
      directly_read_reviews: numberOrNull(count) ?? 0,
      facility_related_reviews: numberOrNull(facilityCounts[platform]),
    });
  }
  return { visible, direct };
}

function normalizedArea(slug, area) {
  if (area === 'overnight') return 'overnight_rest';
  if (area === 'accessibility' || area === 'operation_volatility') return 'facility_wide';
  if (area === 'women_only_open_air_bath') return 'open_air_public_bath';
  if (area === 'mixed_bathing_or_gender_rule') {
    if (slug === 'hoshi-onsen-choujukan-dayuse') return 'public_bath';
    return 'open_air_public_bath';
  }
  return area;
}

function normalizedSignal(signal) {
  if (signal === 'temperature') return 'temperature_experience';
  return signal;
}

function normalizedDirection(direction) {
  return direction === 'insufficient' ? 'neutral' : direction;
}

function normalizedContradiction(level) {
  if (level === 'none') return 'low';
  if (level === 'not_provided') return 'not_assessed';
  return ['low', 'medium', 'high'].includes(level) ? level : 'not_assessed';
}

function createFacilityRow(row, mapping, mappingFile) {
  const identity = identityFrom(mapping);
  const official = officialFactsFrom(mapping);
  const urls = [];
  collectUrls(identity.official_url, urls);
  collectUrls(mapping.official_url, urls);
  collectUrls(official.official_url, urls);
  collectUrls(official.source_urls, urls);
  collectUrls(official.facility_urls, urls);
  collectUrls(official.source_url, urls);
  const directReviews = Number(row.direct_reviews_read);
  const facilityRelated = Number(row.onsen_facility_related_direct_reviews);

  return {
    slug: row.slug,
    name_ko: koreanNameOverrides[row.slug] ?? row.name_ko,
    name_ja: row.name_ja,
    name_en: identity.name_en ?? identity.english_name ?? null,
    aliases: Array.isArray(identity.aliases) ? identity.aliases : [],
    country: 'JP',
    region_group: 'kanto',
    prefecture: null,
    municipality: null,
    onsen_area: null,
    address: official.address ?? null,
    facility_type: row.facility_type,
    facility_model: normalizeFacilityModel(identity.facility_model ?? mapping.facility_model),
    primary_archetype: normalizeArchetype(identity.archetype ?? row.archetype),
    lodging_available: normalizeLodgingAvailable(identity.lodging_available ?? mapping.lodging_available),
    cleanup_status: row.db_seed_status === 'needs_split_reinforcement' ? 'split_needed' : 'keep_facility',
    official_url: unique(urls)[0] ?? null,
    map_or_review_url: identity.map_or_review_url ?? mapping.map_or_review_url ?? null,
    official_profile: sanitizeOfficialProfile(official),
    official_source_urls: unique(urls),
    official_checked_at: unique(urls).length > 0 ? researchDate : null,
    summary: null,
    status: 'draft',
    content_updated_at: seedDate,
    source_file: relative(mappingFile),
    research_metadata: {
      candidate_track: row.candidate_track,
      direct_reviews_read: directReviews,
      facility_related_direct_reviews: facilityRelated,
      source_seed_status: row.db_seed_status,
    },
  };
}

function createEvidenceRow(row, mapping, mappingFile) {
  const sampling = samplingFrom(mapping);
  const directReviews = Number(row.direct_reviews_read);
  const facilityRelated = Number(row.onsen_facility_related_direct_reviews);
  const manifests = platformManifests(mapping, sampling);
  const split = splitCounts[row.slug];
  const declaredPlatformCount = numberOrNull(
    sampling.direct_body_platform_count,
    Object.keys(object(sampling.platform_direct_read_counts)).length,
  );

  return {
    facility_slug: row.slug,
    collection_key: collectionKey,
    collected_on: seedDate,
    visible_review_pools: manifests.visible,
    direct_review_manifest: manifests.direct,
    raw_direct_reviews: directReviews,
    deduped_direct_reviews: directReviews,
    facility_related_direct_reviews: facilityRelated,
    dayuse_only_direct_reviews: split?.dayuse ?? null,
    lodging_bath_only_direct_reviews: split?.lodgingBath ?? null,
    excluded_direct_reviews: directReviews - facilityRelated,
    direct_body_platform_count: Math.max(declaredPlatformCount ?? 0, new Set(manifests.direct.map((entry) => entry.platform)).size),
    evidence_grade: normalizeGrade(row.data_quality_grade, directReviews),
    collection_readiness: normalizeReadiness(row.db_seed_status),
    collection_note: `직접 판독 ${directReviews}건과 시설 관련 직접 판독 ${facilityRelated}건은 기존 수집 선언값을 보존했습니다. 원시 판독·중복 제거가 별도 집계되지 않은 수집은 두 값을 같은 선언값으로 둡니다.`,
    source_file: relative(mappingFile),
  };
}

function createReviewSignals(rows, evidenceRef) {
  const signals = [];
  const excluded = [];
  for (const row of rows) {
    if (row.signal_type === 'source_flow_claim') {
      excluded.push({ slug: row.slug, reason: 'deprecated_source_flow_claim', signal_type: row.signal_type });
      continue;
    }
    const mentionCount = Number(row.mention_count);
    const sourceCount = Number(row.source_count);
    const platformCount = Number(row.platform_count);
    if (mentionCount === 0 || sourceCount === 0 || platformCount === 0) {
      excluded.push({ slug: row.slug, reason: 'not_direct_review_evidence', signal_type: row.signal_type });
      continue;
    }
    const facilityArea = normalizedArea(row.slug, row.facility_area);
    const signalType = normalizedSignal(row.signal_type);
    const signalDirection = normalizedDirection(row.signal_direction);
    if (!allowedAreas.has(facilityArea)) throw new Error(`Unsupported facility area: ${row.slug} ${facilityArea}`);
    if (!allowedSignals.has(signalType)) throw new Error(`Unsupported signal type: ${row.slug} ${signalType}`);
    if (!['positive', 'negative', 'mixed', 'neutral'].includes(signalDirection)) throw new Error(`Unsupported direction: ${row.slug} ${signalDirection}`);
    if (sourceCount > mentionCount || platformCount > sourceCount) throw new Error(`Invalid signal count chain: ${row.slug} ${signalType}`);
    signals.push({
      evidence_ref: evidenceRef(row.slug),
      facility_area: facilityArea,
      facility_area_confidence: facilityArea === 'facility_wide' ? 'facility_wide' : row.facility_area_confidence,
      signal_type: signalType,
      signal_direction: signalDirection,
      mention_count: mentionCount,
      source_count: sourceCount,
      platform_count: platformCount,
      contradiction_level: normalizedContradiction(row.contradiction_level),
      review_signal_status: row.review_signal_status,
      evidence_summary: row.notes || null,
      evidence_sources: unique(String(row.source_platforms ?? '').split(/[|;]/).map((item) => item.trim())),
    });
  }
  return { signals, excluded };
}

function createWaterFacts(waterAudit) {
  const backlog = [];
  const waterFacts = [];
  for (const item of waterAudit.facilities ?? []) {
    const water = object(item.fact_statuses).water_system ?? {};
    if (item.slug === 'kusatsu-sainokawara' && water.value === 'kakenagashi') {
      waterFacts.push({
        facility_slug: item.slug,
        facility_area: 'open_air_public_bath',
        scope_key: 'open-air-public-bath',
        scope_label_ko: '노천 공용탕',
        day_use_available: 'confirmed',
        water_system: 'kakenagashi',
        kasui: 'unknown',
        kaon: 'unknown',
        disinfection: 'unknown',
        spring_types: ['酸性塩化物硫酸塩温泉'],
        texture_filter_candidates: ['salt_warmth'],
        water_color: 'unknown',
        method_render_status: 'candidate_after_recheck',
        texture_filter_status: 'official_candidate',
        color_filter_status: 'not_eligible',
        official_original_text: water.original_text,
        official_source_url: water.source_url,
        official_source_checked_at: researchDate,
        source_file: relative(paths.waterFacts),
      });
      continue;
    }
    backlog.push({
      slug: item.slug,
      name_ko: item.name_ko,
      water_system_candidate: water.value ?? 'null',
      water_system_status: water.status ?? 'not_found',
      badge_rendering_status: item.badge_rendering_status,
      next_action: item.next_action,
    });
  }
  return { waterFacts, backlog };
}

function validateSeed(seed) {
  if (seed.facilities.length !== 19) throw new Error(`Expected 19 facilities, found ${seed.facilities.length}`);
  if (seed.evidence.length !== seed.facilities.length) throw new Error('Every facility needs one collection evidence row.');
  if (seed.facilities.some((row) => row.status !== 'draft')) throw new Error('Facility seed must remain draft.');
  if (seed.reviewSignals.some((row) => row.signal_type === 'source_flow_claim')) throw new Error('Deprecated source_flow_claim leaked into seed.');
  for (const row of seed.evidence) {
    if (row.deduped_direct_reviews > row.raw_direct_reviews) throw new Error(`Invalid direct count chain: ${row.facility_slug}`);
    if (row.facility_related_direct_reviews > row.deduped_direct_reviews) throw new Error(`Invalid facility count chain: ${row.facility_slug}`);
    if (row.dayuse_only_direct_reviews !== null && row.dayuse_only_direct_reviews > row.facility_related_direct_reviews) throw new Error(`Invalid day-use count: ${row.facility_slug}`);
    if (row.lodging_bath_only_direct_reviews !== null && row.lodging_bath_only_direct_reviews > row.facility_related_direct_reviews) throw new Error(`Invalid lodging-bath count: ${row.facility_slug}`);
  }
}

function markdownTable(rows, columns) {
  const escape = (value) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', '<br>');
  return [
    `| ${columns.join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${columns.map((column) => escape(row[column])).join(' | ')} |`),
  ].join('\n');
}

function buildSeed() {
  const facilityRows = parseCsv(readFileSync(paths.facilitySeed, 'utf8'));
  const signalRows = parseCsv(readFileSync(paths.signalMaster, 'utf8'));
  const waterAudit = readJson(paths.waterFacts);
  const facilities = [];
  const evidence = [];
  for (const row of facilityRows) {
    const sourcePath = mappingPath(row.slug);
    const mapping = readJson(sourcePath);
    facilities.push(createFacilityRow(row, mapping, sourcePath));
    evidence.push(createEvidenceRow(row, mapping, sourcePath));
  }
  const { signals, excluded } = createReviewSignals(signalRows, (slug) => `${slug}:${collectionKey}`);
  const { waterFacts, backlog } = createWaterFacts(waterAudit);
  const seed = {
    seed_date: seedDate,
    collection_key: collectionKey,
    status: 'draft_only',
    count_policy: 'Platform-visible review pools and directly read review counts are separate. Snippets, topic chips, AI summaries, and OTA summaries are excluded from direct counts.',
    facilities,
    evidence,
    water_facts: waterFacts,
    review_signals: signals,
    excluded_review_rows: excluded,
    water_backlog: backlog,
  };
  validateSeed({ facilities, evidence, reviewSignals: signals });
  return seed;
}

function writeArtifacts(seed) {
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(paths.seed, `${JSON.stringify(seed, null, 2)}\n`);
  writeCsv(paths.waterBacklog, seed.water_backlog, ['slug', 'name_ko', 'water_system_candidate', 'water_system_status', 'badge_rendering_status', 'next_action']);
  const readiness = Object.entries(seed.evidence.reduce((counts, row) => {
    counts[row.collection_readiness] = (counts[row.collection_readiness] ?? 0) + 1;
    return counts;
  }, {})).map(([collection_readiness, count]) => ({ collection_readiness, count }));
  const report = `# 간토·수도권 시설 Draft Seed\n\n- 생성일: ${seedDate}\n- 상태: 모든 시설은 \`draft\`\n- 시설: ${seed.facilities.length}건\n- 수집 근거: ${seed.evidence.length}건\n- 직접 후기 신호: ${seed.review_signals.length}건\n- 폐기한 \`source_flow_claim\`/비직접 증거 행: ${seed.excluded_review_rows.length}건\n- 공식 원문 보존 수질 사실 초안: ${seed.water_facts.length}건\n- 공식 원문 재잠금 수질 백로그: ${seed.water_backlog.length}건\n\n## 적재 준비 상태\n\n${markdownTable(readiness, ['collection_readiness', 'count'])}\n\n## 적용 원칙\n\n- 플랫폼상 후기 수와 직접 판독 수를 분리했습니다.\n- 직접 판독 수는 기존 수집의 선언값만 보존했습니다. 원시/중복제거가 별도 기록되지 않은 행은 같은 값으로 두고 collection note에 명시했습니다.\n- 당일입욕 전용/숙박 공용탕 보조 수가 명시되지 않은 시설은 \`null\`로 유지했습니다.\n- \`source_flow_claim\`은 후기 신호에 적재하지 않았습니다.\n- 온천수 방식은 공식 원문 보존 여부가 충족된 \`사이노카와라 노천탕\` 보류 후보 1건만 초안으로 저장했습니다. 이 행도 \`candidate_after_recheck\`이므로 사용자 배지를 렌더하지 않습니다.\n\n## 다음 QA\n\n1. 수질 백로그 ${seed.water_backlog.length}건은 공식 원문·욕조 범위·가수·가온·소독을 재확인합니다.\n2. \`needs_reinforcement\`와 \`scope_split\` 시설은 \`draft\`에서만 보강합니다.\n3. 사용자 노출 전에는 시설별 판정문과 수질 렌더 게이트를 별도로 QA합니다.\n`;
  writeFileSync(paths.report, report);
}

function curl(args, input) {
  const result = spawnSync('curl', args, { input, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`curl failed (${result.status}): ${result.stderr || result.stdout}`);
  return result.stdout;
}

function resolveHost(host) {
  const body = curl(['--silent', '--show-error', '--fail-with-body', `https://dns.google/resolve?name=${encodeURIComponent(host)}&type=A`]);
  const answer = JSON.parse(body).Answer?.find((item) => item.type === 1 && item.data);
  if (!answer) throw new Error(`Could not resolve ${host} via DNS-over-HTTPS.`);
  return answer.data;
}

function readConfig() {
  const env = { ...parseEnvFile(path.join(repoRoot, '.env.local')), ...process.env };
  const restUrl = String(env.CONTENT_DB_REST_URL ?? '').replace(/\/+$/, '');
  const apiKey = env.CONTENT_DB_SERVICE_ROLE_KEY;
  if (!restUrl || !apiKey) throw new Error('Missing REST DB configuration.');
  const host = new URL(restUrl).host;
  return { restUrl, apiKey, host, resolveIp: resolveHost(host) };
}

function requestJson(config, method, url, body, preference) {
  const args = [
    '--silent', '--show-error', '--fail-with-body', '--max-time', '60',
    '--resolve', `${config.host}:443:${config.resolveIp}`,
    '-X', method,
    '-H', `apikey: ${config.apiKey}`,
    '-H', `authorization: Bearer ${config.apiKey}`,
    '-H', 'accept: application/json',
    '-H', 'content-type: application/json',
  ];
  if (preference) args.push('-H', `prefer: ${preference}`);
  if (body !== undefined) args.push('--data-binary', '@-');
  args.push(url);
  const output = curl(args, body === undefined ? undefined : JSON.stringify(body));
  return output ? JSON.parse(output) : null;
}

function upsertRows(config, table, rows, conflictColumns) {
  if (rows.length === 0) return [];
  const url = new URL(`${config.restUrl}/${table}`);
  url.searchParams.set('on_conflict', conflictColumns);
  return requestJson(config, 'POST', url.toString(), rows, 'resolution=merge-duplicates,return=representation') ?? [];
}

function insertRows(config, table, rows) {
  if (rows.length === 0) return [];
  return requestJson(config, 'POST', `${config.restUrl}/${table}`, rows, 'return=representation') ?? [];
}

function deleteRows(config, table, filterKey, filterValue) {
  if (!filterValue) return;
  const url = new URL(`${config.restUrl}/${table}`);
  url.searchParams.set(filterKey, filterValue);
  requestJson(config, 'DELETE', url.toString(), undefined, 'return=minimal');
}

function getRows(config, table, params) {
  const url = new URL(`${config.restUrl}/${table}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return requestJson(config, 'GET', url.toString()) ?? [];
}

function applySeed(seed) {
  const config = readConfig();
  const facilityRows = seed.facilities.map(({ research_metadata, ...row }) => row);
  const facilities = upsertRows(config, 'onsen_facilities', facilityRows, 'slug');
  const waterFacts = upsertRows(config, 'onsen_facility_water_facts', seed.water_facts, 'facility_slug,scope_key');
  const evidence = upsertRows(config, 'onsen_facility_review_evidence', seed.evidence, 'facility_slug,collection_key');
  const evidenceByRef = new Map(evidence.map((row) => [`${row.facility_slug}:${row.collection_key}`, row.id]));
  if (evidenceByRef.size !== seed.evidence.length) throw new Error('Evidence upsert did not return every seed row.');
  const signals = seed.review_signals.map(({ evidence_ref, ...row }) => ({ ...row, evidence_id: evidenceByRef.get(evidence_ref) }));
  if (signals.some((row) => !row.evidence_id)) throw new Error('A review signal could not resolve its evidence id.');
  const evidenceIds = [...evidenceByRef.values()];
  deleteRows(config, 'onsen_facility_review_signals', 'evidence_id', `in.(${evidenceIds.join(',')})`);
  const insertedSignals = insertRows(config, 'onsen_facility_review_signals', signals);

  const slugs = seed.facilities.map((row) => row.slug).join(',');
  const verifiedFacilities = getRows(config, 'onsen_facilities', { select: 'slug,status', slug: `in.(${slugs})` });
  const verifiedEvidence = getRows(config, 'onsen_facility_review_evidence', {
    select: 'id,facility_slug,collection_key,evidence_grade,collection_readiness',
    collection_key: `eq.${collectionKey}`,
  });
  const verifiedSignals = getRows(config, 'onsen_facility_review_signals', { select: 'id', evidence_id: `in.(${evidenceIds.join(',')})` });
  const verifiedWaterFacts = getRows(config, 'onsen_facility_water_facts', { select: 'id,facility_slug,method_render_status', facility_slug: `in.(${slugs})` });
  const verification = {
    facilities: verifiedFacilities.length,
    all_draft: verifiedFacilities.length === seed.facilities.length && verifiedFacilities.every((row) => row.status === 'draft'),
    evidence: verifiedEvidence.length,
    review_signals: verifiedSignals.length,
    water_facts: verifiedWaterFacts.length,
    upsert_response: {
      facilities: facilities.length,
      water_facts: waterFacts.length,
      review_signals: insertedSignals.length,
    },
  };
  if (!verification.all_draft || verification.evidence !== seed.evidence.length || verification.review_signals !== seed.review_signals.length) {
    throw new Error(`Post-load verification failed: ${JSON.stringify(verification)}`);
  }
  return verification;
}

function writeLoadReport(seed, verification) {
  const report = `# 간토·수도권 시설 Draft Seed DB 적재 리포트\n\n- 적재일: ${seedDate}\n- collection key: \`${collectionKey}\`\n- 상태: 모든 시설 \`draft\`\n- 시설: ${verification.facilities}건\n- 수집 근거: ${verification.evidence}건\n- 이용 경험 신호: ${verification.review_signals}건\n- 수질 사실: ${verification.water_facts}건\n\n## 검증\n\n- 모든 시설이 \`draft\`인지: ${verification.all_draft ? '예' : '아니오'}\n- 플랫폼상 후기 수와 직접 판독 수를 같은 필드에 합산하지 않았습니다.\n- \`source_flow_claim\` 후기 신호는 적재하지 않았습니다.\n- 수질 사실 1건은 \`candidate_after_recheck\`이므로 사용자 방식 배지를 렌더하지 않습니다.\n`;
  writeFileSync(paths.loadReport, report);
}

const seed = buildSeed();
writeArtifacts(seed);
console.log(JSON.stringify({
  seed: relative(paths.seed),
  facilities: seed.facilities.length,
  evidence: seed.evidence.length,
  reviewSignals: seed.review_signals.length,
  waterFacts: seed.water_facts.length,
  waterBacklog: seed.water_backlog.length,
  excludedReviewRows: seed.excluded_review_rows.length,
  apply: shouldApply,
}, null, 2));

if (shouldApply) {
  const verification = applySeed(seed);
  writeLoadReport(seed, verification);
  console.log(JSON.stringify({ loadReport: relative(paths.loadReport), verification }, null, 2));
}
