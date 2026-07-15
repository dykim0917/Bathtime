import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const seedDate = '2026-07-10';
const outputDir = path.join(repoRoot, 'research', 'onsen-db-seed');
const handoffPath = path.join(outputDir, `kansai_sanin_setouchi_facility_official_filter_facts_handoff_${seedDate}.json`);
const outputPath = path.join(outputDir, `kansai_sanin_setouchi_p0_official_filter_facts_${seedDate}.json`);
const reportPath = path.join(outputDir, `kansai_sanin_setouchi_p0_official_filter_facts_${seedDate}.md`);

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

const allowedScopes = new Set([
  'public_bath', 'open_air_public_bath', 'family_bath', 'private_bath', 'sand_bath', 'steam_bath',
  'footbath', 'drinking_spring', 'inhalation', 'sauna', 'stone_sauna', 'rest_area', 'food_area',
  'food_steam', 'overnight_rest', 'route_or_pass', 'area_cluster', 'facility_wide', 'unclear',
]);

const allowedSourceKinds = new Set([
  'operator_official', 'municipal_official', 'tourism_association', 'official_analysis_document',
]);

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeFacts(handoff) {
  const facts = handoff.facts;
  const taikoPrices = facts.filter((fact) => fact.facility_slug === 'arima-taikounoyu' && fact.filter_code === 'adult_day_use_price');
  if (taikoPrices.length !== 3) throw new Error(`Expected three Taiko day-use price variants, received ${taikoPrices.length}.`);
  const base = taikoPrices[0];
  const mergedPrice = {
    ...base,
    scope_key: 'public_bath',
    scope_label_ko: '공용탕 성인 전일 입관',
    filter_value: {
      pricing_scope: 'adult_fulltime_admission',
      price_variants: taikoPrices.map((fact) => fact.filter_value),
    },
    official_original_text: taikoPrices.map((fact) => fact.official_original_text).join('\n'),
  };
  return [...facts.filter((fact) => !taikoPrices.includes(fact)), mergedPrice];
}

function validateFacts(facts) {
  const seen = new Set();
  for (const [index, fact] of facts.entries()) {
    const prefix = `facts[${index}]`;
    if (!isPlainObject(fact)) throw new Error(`${prefix} must be an object.`);
    if (!allowedFilterCodes.has(fact.filter_code)) throw new Error(`${prefix}.filter_code is not allowed.`);
    if (!allowedScopes.has(fact.scope_key)) throw new Error(`${prefix}.scope_key is not allowed.`);
    if (!['confirmed', 'conditional', 'not_available'].includes(fact.availability)) throw new Error(`${prefix}.availability is invalid.`);
    if (fact.filter_status !== 'ready') throw new Error(`${prefix}.filter_status must be ready.`);
    if (!isPlainObject(fact.filter_value)) throw new Error(`${prefix}.filter_value must be an object.`);
    if (!String(fact.scope_label_ko ?? '').trim() || !String(fact.official_original_text ?? '').trim()) throw new Error(`${prefix} is missing scope label or official text.`);
    if (!/^https:\/\//.test(String(fact.official_source_url ?? ''))) throw new Error(`${prefix}.official_source_url must be HTTPS.`);
    if (!allowedSourceKinds.has(fact.source_kind)) throw new Error(`${prefix}.source_kind is invalid.`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fact.official_source_checked_at ?? ''))) throw new Error(`${prefix}.official_source_checked_at is invalid.`);
    if (/source[_ -]?flow|natural[_ -]?100|100%\s*(natural|천연)|천연온천/i.test(fact.filter_code)) throw new Error(`${prefix} contains an excluded concept.`);
    const key = `${fact.facility_slug}:${fact.filter_code}:${fact.scope_key}`;
    if (seen.has(key)) throw new Error(`${prefix} duplicates ${key}.`);
    seen.add(key);
  }
}

const handoff = readJson(handoffPath);
if (handoff.seed_date !== seedDate || !Array.isArray(handoff.facts)) throw new Error('Invalid official fact handoff.');
const facts = normalizeFacts(handoff);
validateFacts(facts);
const seed = {
  seed_date: seedDate,
  target_type: 'facility',
  status: 'canonical_fact_seed_pending_parent_facility_draft',
  source_policy: 'Official operator or municipal original text only. Platform labels, reviews, snippets, water-method claims, and natural-hot-spring marketing are excluded.',
  facts,
};
writeFileSync(outputPath, `${JSON.stringify(seed, null, 2)}\n`);
const byFacility = [...facts.reduce((counts, fact) => {
  counts.set(fact.facility_slug, (counts.get(fact.facility_slug) ?? 0) + 1);
  return counts;
}, new Map()).entries()];
const report = `# 간사이·산인·세토우치 P0 공식 필터 사실 정규화\n\n- 기준일: ${seedDate}\n- 정규화 사실: ${facts.length}건\n- 상태: 시설 부모 draft Seed 전용 준비 상태\n\n## 시설별 사실 수\n\n| 시설 | 사실 수 |\n| --- | ---: |\n${byFacility.map(([slug, count]) => `| ${slug} | ${count} |`).join('\n')}\n\n## 정규화\n\n- 다이코노유의 성인 전일 입관 가격 3종은 하나의 \`public_bath\` 가격 사실 안의 \`price_variants\`로 병합했습니다.\n- 온천수 방식·천연온천 마케팅·후기 근거는 포함하지 않았습니다.\n- DB 적재는 해당 시설 부모가 \`onsen_facilities\` draft로 만들어진 뒤에만 가능합니다.\n`;
writeFileSync(reportPath, report);
console.log(JSON.stringify({ seed: path.relative(repoRoot, outputPath), report: path.relative(repoRoot, reportPath), facts: facts.length, facilities: byFacility.length }, null, 2));
