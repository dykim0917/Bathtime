import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const seedDate = '2026-07-10';
const outputDir = path.join(repoRoot, 'research', 'onsen-db-seed');
const seedPath = path.join(outputDir, `kanto_tokyo_facility_draft_seed_${seedDate}.json`);
const queuePath = path.join(outputDir, `kanto_tokyo_facility_official_filter_backfill_queue_${seedDate}.csv`);
const reportPath = path.join(outputDir, `kanto_tokyo_facility_official_filter_backfill_queue_${seedDate}.md`);

const candidates = [
  ['노천|露天', 'open_air_bath'],
  ['가족탕|家族風呂', 'family_bath'],
  ['대절|貸切|개인탕|個室風呂', 'private_bath'],
  ['사우나|サウナ', 'sauna'],
  ['암반|岩盤', 'stone_sauna'],
  ['로우류|ロウリュ', 'loyly'],
  ['수풍로|水風呂', 'water_bath'],
  ['모래탕|砂風呂', 'sand_bath'],
  ['증기탕|蒸し|スチーム', 'steam_bath'],
  ['식당|레스토랑|食事|レストラン', 'meal_service'],
  ['휴게|휴식|休憩', 'rest_area'],
  ['주차|駐車', 'parking'],
  ['셔틀|送迎', 'shuttle'],
  ['문신|타투|刺青|タトゥー', 'tattoo_allowed'],
  ['영업.*(익일|다음날)|翌.*時|24:00|25:00|26:00', 'late_night'],
  ['도보|徒歩', 'station_walk_10m'],
  ['탄산수소염|炭酸水素塩', 'spring_bicarbonate'],
  ['염화물|塩化物', 'spring_chloride'],
  ['유황|硫黄', 'spring_sulfur'],
  ['황산염|硫酸塩', 'spring_sulfate'],
  ['철|鉄', 'spring_iron'],
  ['산성|酸性', 'spring_acidic'],
  ['방사능|ラドン|ラジウム|放射能', 'spring_radon'],
  ['단순온천|単純温泉', 'spring_simple'],
  ['알칼리성 단순|アルカリ性単純', 'spring_alkaline_simple'],
].map(([pattern, code]) => ({ pattern: new RegExp(pattern, 'i'), code }));

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function officialFacts(profile) {
  return Array.isArray(profile?.facts) ? profile.facts.filter((value) => typeof value === 'string') : [];
}

function candidateCodes(facts) {
  return [...new Set(candidates.filter(({ pattern }) => facts.some((fact) => pattern.test(fact))).map(({ code }) => code))];
}

const seed = JSON.parse(readFileSync(seedPath, 'utf8'));
const rows = seed.facilities.map((facility) => {
  const facts = officialFacts(facility.official_profile);
  const codes = candidateCodes(facts);
  return {
    priority: facility.research_metadata?.source_seed_status === 'DB_seed_ready' ? 'P0' : 'P1',
    slug: facility.slug,
    name_ko: facility.name_ko,
    official_url: facility.official_url ?? '',
    official_source_url_count: facility.official_source_urls?.length ?? 0,
    official_fact_summary_count: facts.length,
    candidate_filter_codes: codes.join(';'),
    status: 'needs_official_original_text_and_scope',
    note_ko: codes.length > 0
      ? '기존 공식 요약에서 후보를 찾았습니다. 각 코드의 공식 원문, URL, 적용 욕조·상품 범위를 다시 확보한 뒤에만 ready로 적재합니다.'
      : '공식 요약만으로 안전하게 후보를 추출하지 못했습니다. 공식 운영 페이지부터 다시 확인합니다.',
  };
});

const headers = Object.keys(rows[0]);
writeFileSync(queuePath, `${headers.join(',')}\n${rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')).join('\n')}\n`);

const p0 = rows.filter((row) => row.priority === 'P0').length;
const candidatesFound = rows.filter((row) => row.candidate_filter_codes).length;
const report = `# 간토·수도권 시설 공식 필터 백필 큐\n\n- 생성일: ${seedDate}\n- 대상: ${rows.length}건\n- P0: ${p0}건\n- 공식 요약에서 필터 후보를 찾은 시설: ${candidatesFound}건\n\n## 원칙\n\n- 이 큐는 공식 필터 사실이 아닙니다. 기존 조사에서 남긴 공식 요약을 바탕으로 재확인할 항목을 표시합니다.\n- 니프티온천 태그, 검색 결과, 후기, 스니펫은 후보 발굴에만 사용하며 적재 근거가 아닙니다.\n- 각 행은 운영사·지자체·관광협회·공식 분석서의 원문과 URL, 범위를 확보한 뒤 onsen_facility_official_filter_facts에 적재합니다.\n- 온천수 방식은 이 큐에 포함하지 않습니다. 별도 수질 사실과 용어 가이드가 우선입니다.\n`;
writeFileSync(reportPath, report);

console.log(JSON.stringify({
  queue: path.relative(repoRoot, queuePath),
  report: path.relative(repoRoot, reportPath),
  facilities: rows.length,
  p0,
  candidatesFound,
}, null, 2));
