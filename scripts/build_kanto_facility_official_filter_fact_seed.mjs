import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const repoRoot = process.cwd();
const seedDate = '2026-07-10';
const shouldApply = process.argv.includes('--apply');
const outputDir = path.join(repoRoot, 'research', 'onsen-db-seed');
const sourcePath = path.join(outputDir, `kanto_tokyo_facility_official_filter_facts_${seedDate}.json`);
const seedPath = path.join(outputDir, `kanto_tokyo_facility_official_filter_fact_seed_${seedDate}.json`);
const csvPath = path.join(outputDir, `kanto_tokyo_facility_official_filter_fact_seed_${seedDate}.csv`);
const reportPath = path.join(outputDir, `kanto_tokyo_facility_official_filter_fact_seed_${seedDate}.md`);
const loadReportPath = path.join(outputDir, `kanto_tokyo_facility_official_filter_fact_seed_${seedDate}_load_report.md`);
const facilitySeedPath = path.join(outputDir, `kanto_tokyo_facility_draft_seed_${seedDate}.json`);

const allowedFilterCodes = new Set([
  'day_use', 'lodging', 'open_air_bath', 'private_bath', 'family_bath', 'mixed_bathing',
  'sauna', 'loyly', 'water_bath', 'stone_sauna', 'private_sauna', 'sand_bath', 'steam_bath',
  'enzyme_bath', 'health_retreat', 'jet_bath', 'sleeping_bath', 'morning_bath', 'late_night',
  'station_walk_10m', 'parking', 'shuttle', 'tattoo_allowed', 'barrier_free',
  'wheelchair_accessible', 'english_support', 'meal_service', 'rest_area', 'wifi',
  'ocean_view', 'snow_view', 'autumn_foliage_view', 'adult_day_use_price',
  'spring_bicarbonate', 'spring_chloride', 'spring_sulfur', 'spring_sulfate', 'spring_iron',
  'spring_acidic', 'spring_carbon_dioxide', 'spring_radon', 'spring_radioactive',
  'spring_simple', 'spring_alkaline_simple',
]);

const allowedAreas = new Set([
  'public_bath', 'open_air_public_bath', 'family_bath', 'private_bath', 'sand_bath', 'steam_bath',
  'footbath', 'drinking_spring', 'inhalation', 'sauna', 'stone_sauna', 'rest_area', 'food_area',
  'food_steam', 'overnight_rest', 'route_or_pass', 'area_cluster', 'facility_wide', 'unclear',
]);

const allowedSourceKinds = new Set([
  'operator_official', 'municipal_official', 'tourism_association', 'official_analysis_document',
]);

const operationalCodes = new Set([
  'day_use', 'lodging', 'morning_bath', 'late_night', 'station_walk_10m', 'shuttle',
  'tattoo_allowed', 'adult_day_use_price',
]);

const equipmentCodes = new Set([
  'sauna', 'loyly', 'water_bath', 'stone_sauna', 'private_sauna', 'steam_bath', 'enzyme_bath',
  'health_retreat', 'parking', 'barrier_free', 'wheelchair_accessible', 'english_support',
  'meal_service', 'rest_area', 'wifi',
]);

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    env[match[1]] = value;
  }
  return env;
}

function relative(filePath) {
  return path.relative(repoRoot, filePath);
}

function addDays(dateText, days) {
  const date = new Date(`${dateText}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function defaultValidUntil(row) {
  if (operationalCodes.has(row.filter_code)) return addDays(row.official_source_checked_at, 30);
  if (equipmentCodes.has(row.filter_code)) return addDays(row.official_source_checked_at, 90);
  if (row.filter_code.startsWith('spring_')) return null;
  return addDays(row.official_source_checked_at, 180);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function csvValue(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function markdownTable(rows, columns) {
  const escape = (value) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', '<br>');
  return [
    `| ${columns.join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${columns.map((column) => escape(row[column])).join(' | ')} |`),
  ].join('\n');
}

function validateFacts(raw) {
  if (!raw || !Array.isArray(raw.facts)) throw new Error('Source JSON must contain a facts array.');
  if (raw.seed_date !== seedDate) throw new Error(`Source JSON seed_date must be ${seedDate}.`);
  const knownSlugs = new Set(readJson(facilitySeedPath).facilities.map((facility) => facility.slug));
  const seen = new Set();
  const defaults = isPlainObject(raw.defaults) ? raw.defaults : {};
  const entries = raw.facts.map((fact) => {
    if (!Array.isArray(fact)) return fact;
    const [facility_slug, filter_code, scope_key, scope_label_ko, availability, filter_value, official_original_text, official_source_url, source_kind] = fact;
    return {
      facility_slug,
      filter_code,
      scope_key,
      scope_label_ko,
      availability: availability ?? defaults.availability,
      filter_value,
      filter_status: defaults.filter_status,
      official_original_text,
      official_source_url,
      source_kind: source_kind ?? defaults.source_kind,
      official_source_checked_at: defaults.official_source_checked_at,
    };
  });

  return entries.map((fact, index) => {
    const prefix = `facts[${index}]`;
    if (!isPlainObject(fact)) throw new Error(`${prefix} must be an object.`);
    if (!knownSlugs.has(fact.facility_slug)) throw new Error(`${prefix}.facility_slug is not a loaded Kanto facility.`);
    if (!allowedFilterCodes.has(fact.filter_code)) throw new Error(`${prefix}.filter_code is not allowed.`);
    if (!allowedAreas.has(fact.scope_key)) throw new Error(`${prefix}.scope_key is not an allowed facility area.`);
    if (!['confirmed', 'conditional', 'not_available'].includes(fact.availability)) throw new Error(`${prefix}.availability is invalid.`);
    if (!['ready', 'hold', 'expired', 'deprecated'].includes(fact.filter_status)) throw new Error(`${prefix}.filter_status is invalid.`);
    if (!isPlainObject(fact.filter_value)) throw new Error(`${prefix}.filter_value must be an object.`);
    if (!String(fact.scope_label_ko ?? '').trim()) throw new Error(`${prefix}.scope_label_ko is required.`);
    if (!String(fact.official_original_text ?? '').trim()) throw new Error(`${prefix}.official_original_text is required.`);
    if (!/^https:\/\//.test(String(fact.official_source_url ?? ''))) throw new Error(`${prefix}.official_source_url must be HTTPS.`);
    if (!allowedSourceKinds.has(fact.source_kind)) throw new Error(`${prefix}.source_kind is invalid.`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fact.official_source_checked_at ?? ''))) throw new Error(`${prefix}.official_source_checked_at is invalid.`);
    if (/source[_ -]?flow|natural[_ -]?100|100%\s*(natural|천연)|천연온천/i.test(JSON.stringify(fact))) {
      throw new Error(`${prefix} contains an excluded water-method or marketing term.`);
    }
    if (fact.filter_code === 'adult_day_use_price') {
      if (!Number.isFinite(fact.filter_value.amount_jpy) || !String(fact.filter_value.pricing_scope ?? '').trim()) {
        throw new Error(`${prefix} price facts require filter_value.amount_jpy and pricing_scope.`);
      }
    }
    if (fact.filter_code === 'station_walk_10m' && (!Number.isFinite(fact.filter_value.walk_minutes) || fact.filter_value.walk_minutes > 10)) {
      throw new Error(`${prefix} station_walk_10m requires filter_value.walk_minutes <= 10.`);
    }
    const key = `${fact.facility_slug}:${fact.filter_code}:${fact.scope_key}`;
    if (seen.has(key)) throw new Error(`${prefix} duplicates ${key}.`);
    seen.add(key);
    return {
      facility_slug: fact.facility_slug,
      filter_code: fact.filter_code,
      scope_key: fact.scope_key,
      scope_label_ko: fact.scope_label_ko,
      availability: fact.availability,
      filter_value: fact.filter_value,
      filter_status: fact.filter_status,
      official_original_text: fact.official_original_text,
      official_source_url: fact.official_source_url,
      source_kind: fact.source_kind,
      official_source_checked_at: fact.official_source_checked_at,
      valid_until: fact.valid_until ?? defaultValidUntil(fact),
      source_file: relative(sourcePath),
    };
  });
}

function writeArtifacts(facts) {
  mkdirSync(outputDir, { recursive: true });
  const seed = {
    seed_date: seedDate,
    target_type: 'facility',
    source_policy: 'Official original text, source URL, source kind, scope, and check date are required. Nifty/OTA/review/snippet labels are excluded.',
    facts,
  };
  writeFileSync(seedPath, `${JSON.stringify(seed, null, 2)}\n`);
  const columns = ['facility_slug', 'filter_code', 'scope_key', 'scope_label_ko', 'availability', 'filter_value', 'filter_status', 'official_original_text', 'official_source_url', 'source_kind', 'official_source_checked_at', 'valid_until'];
  writeFileSync(csvPath, `${columns.join(',')}\n${facts.map((fact) => columns.map((column) => csvValue(fact[column])).join(',')).join('\n')}\n`);
  const groups = [...facts.reduce((result, fact) => {
    result.set(fact.filter_code, (result.get(fact.filter_code) ?? 0) + 1);
    return result;
  }, new Map()).entries()].map(([filter_code, count]) => ({ filter_code, count }));
  const report = `# 간토·수도권 시설 공식 필터 사실 Seed\n\n- 생성일: ${seedDate}\n- 대상 사실: ${facts.length}건\n- 대상 시설: ${new Set(facts.map((fact) => fact.facility_slug)).size}건\n- 상태: 원문·URL·범위가 확인된 행만 적재 후보\n\n## 필터 분포\n\n${markdownTable(groups, ['filter_code', 'count'])}\n\n## 품질 게이트\n\n- 니프티온천 태그, OTA, 후기, 검색 스니펫을 적재 근거로 쓰지 않았습니다.\n- 온천수 방식과 천연온천 마케팅 용어는 이 Seed에서 제외했습니다.\n- 가격·운영 정보는 확인일을 기준으로 30일 유효기간을 부여했습니다.\n- 사용자 필터에는 \`availability = confirmed\`, \`filter_status = ready\` 행만 사용합니다.\n`;
  writeFileSync(reportPath, report);
  return seed;
}

function curl(args, input) {
  const result = spawnSync('curl', args, { input, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`curl failed (${result.status}): ${result.stderr || result.stdout}`);
  return result.stdout;
}

function resolveHost(host) {
  const response = curl(['--silent', '--show-error', '--fail-with-body', '--max-time', '20', `https://dns.google/resolve?name=${encodeURIComponent(host)}&type=A`]);
  const address = JSON.parse(response).Answer?.find((answer) => answer.type === 1 && answer.data)?.data;
  if (!address) throw new Error(`Could not resolve ${host} via DNS-over-HTTPS.`);
  return address;
}

function readConfig() {
  const env = { ...parseEnvFile(path.join(repoRoot, '.env.local')), ...process.env };
  const restUrl = String(env.CONTENT_DB_REST_URL ?? '').replace(/\/+$/, '');
  const apiKey = env.CONTENT_DB_SERVICE_ROLE_KEY;
  if (!restUrl || !apiKey) throw new Error('Missing REST DB configuration.');
  return { restUrl, apiKey, host: new URL(restUrl).host, resolveIp: resolveHost(new URL(restUrl).host) };
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

function applyFacts(facts) {
  const config = readConfig();
  const url = new URL(`${config.restUrl}/onsen_facility_official_filter_facts`);
  url.searchParams.set('on_conflict', 'facility_slug,filter_code,scope_key');
  const applied = requestJson(config, 'POST', url.toString(), facts, 'resolution=merge-duplicates,return=representation') ?? [];
  const slugs = [...new Set(facts.map((fact) => fact.facility_slug))];
  const verificationUrl = new URL(`${config.restUrl}/onsen_facility_official_filter_facts`);
  verificationUrl.searchParams.set('select', 'facility_slug,filter_code,scope_key,filter_status,availability,source_file');
  verificationUrl.searchParams.set('facility_slug', `in.(${slugs.join(',')})`);
  verificationUrl.searchParams.set('source_file', `eq.${relative(sourcePath)}`);
  const verified = requestJson(config, 'GET', verificationUrl.toString()) ?? [];
  if (applied.length !== facts.length || verified.length !== facts.length) {
    throw new Error(`Post-load fact verification failed: ${JSON.stringify({ applied: applied.length, verified: verified.length, expected: facts.length })}`);
  }
  if (verified.some((fact) => fact.filter_status !== 'ready')) {
    throw new Error('A loaded fact is not ready.');
  }
  const report = `# 간토·수도권 시설 공식 필터 사실 DB 적재 리포트\n\n- 적재일: ${seedDate}\n- 적재 사실: ${facts.length}건\n- 검증된 사실: ${verified.length}건\n- 상태: 모든 행 \`ready\`이며, 이용 가능 여부는 공식 원문대로 보존했습니다.\n`;
  writeFileSync(loadReportPath, report);
  return { applied: applied.length, verified: verified.length };
}

if (!existsSync(sourcePath)) throw new Error(`Missing verified fact source JSON: ${relative(sourcePath)}`);
const raw = readJson(sourcePath);
const facts = validateFacts(raw);
const seed = writeArtifacts(facts);
console.log(JSON.stringify({ seed: relative(seedPath), csv: relative(csvPath), report: relative(reportPath), facts: seed.facts.length, apply: shouldApply }, null, 2));

if (shouldApply) {
  const verification = applyFacts(seed.facts);
  console.log(JSON.stringify({ load_report: relative(loadReportPath), verification }, null, 2));
}
