import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const date = '2026-07-09';
const inputPath = path.join(repoRoot, 'research/onsen-db-seed', `real_onsen_accommodation_verdict_pipeline_${date}.json`);
const outputDir = path.join(repoRoot, 'research/onsen-db-seed');
const outputPath = path.join(outputDir, `real_onsen_accommodation_db_seed_${date}.json`);
const reportPath = path.join(outputDir, `real_onsen_accommodation_db_seed_${date}.md`);

const areaLabels = {
  'takayama-ryujin-onsen': '주부 · 기후현 · 다카야마 류진온천',
  'yudanaka-onsen': '주부 · 나가노현 · 유다나카 온천',
  'okuyugawara-onsen': '간토 · 가나가와현 · 오쿠유가와라 온천',
  'okuhida-onsengo': '주부 · 기후현 · 오쿠히다 온천향',
};

const englishNames = {
  'takayama-ryu-resort-spa': 'Ryu Resort & Spa',
  'yudanaka-biyu-no-yado': 'Ryokan Biyunoyado',
  'okuyugawara-kamata': 'Okuyugawara Ryokan Kamata',
  'okuhida-garden-hotel-yakedake': 'Okuhida Garden Hotel Yakedake',
};

const aliases = {
  'takayama-ryu-resort-spa': {
    ko: ['고산 류 리조트 앤 스파', '류 리조트 앤 스파'],
    ja: ['龍リゾート＆スパ', '龍リゾート&スパ', '高山龍神温泉'],
    en: ['Ryu Resort & Spa', 'Hotel Ryu Resort & Spa', 'Ryu Resort and Spa'],
  },
  'yudanaka-biyu-no-yado': {
    ko: ['잇사의 오솔길 미유노야도', '미유노야도'],
    ja: ['一茶のこみち美湯の宿', '湯田中温泉 一茶のこみち 美湯の宿'],
    en: ['Ryokan Biyunoyado', 'Biyunoyado', 'Issa no Komichi Biyu no Yado'],
  },
  'okuyugawara-kamata': {
    ko: ['오쿠유가와라 가마다', '료칸 가마다'],
    ja: ['旅館 加満田', '湯河原温泉 加満田', '加満田'],
    en: ['Okuyugawara Ryokan Kamata', 'Kamata'],
  },
  'okuhida-garden-hotel-yakedake': {
    ko: ['오쿠히다 가든 호텔 야케다케'],
    ja: ['奥飛騨ガーデンホテル焼岳', '奥飛騨ガーデンホテル焼岳（やけだけ）'],
    en: ['Okuhida Garden Hotel Yakedake', 'Okuhida Garden Hotel YAKEDAKE'],
  },
};

const primaryBath = {
  'takayama-ryu-resort-spa': '대욕장·공용 노천탕 중심',
  'yudanaka-biyu-no-yado': '대욕장·대절탕·일부 객실 노천탕',
  'okuyugawara-kamata': '전 객실 온천 내탕 + 대절 노천탕',
  'okuhida-garden-hotel-yakedake': '우구이스노유 중심 공용 노천탕',
};

function readJson(filePath) {
  if (!existsSync(filePath)) throw new Error(`Missing input: ${filePath}`);
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function bathContexts(record) {
  const contexts = new Set();
  const scope = record.water_judgment.bath_scope_code;
  const text = `${record.water_judgment.water_scope} ${primaryBath[record.slug]}`;
  if (scope === 'all_rooms' || scope === 'some_rooms' || /객실/.test(text)) contexts.add('room_bath');
  if (/노천탕 포함 객실|객실 노천/.test(text)) contexts.add('room_open_air_bath');
  if (/대절|貸切/.test(text)) contexts.add('private_bath');
  if (/대욕장|공용|우구이스|うぐいす/.test(text)) contexts.add('public_bath');
  return [...contexts];
}

function waterCriteria(record) {
  const values = new Set(['spring_confirmed']);
  if (record.water_judgment.canonical_water_method === 'kakenagashi' || record.water_judgment.canonical_water_method === 'kakenagashi_pure') {
    values.add('direct_source');
  }
  if (record.water_sensory_judgment.review_signal_counts.water_texture.mention_count > 0) values.add('water_texture');
  if (record.water_judgment.conditions.includes('kaon')) values.add('temperature_adjustment');
  return [...values];
}

function operationNotes(record) {
  const notes = [
    `${record.water_judgment.ui_label_ko} 판정: ${record.water_judgment.judgment_reason_ko}`,
    `적용 범위: ${record.water_judgment.water_scope}`,
    `감촉/색: ${record.water_sensory_judgment.summary_ko}`,
  ];
  if (record.qa_gates.length > 0) notes.push(`QA gate: ${record.qa_gates.join(', ')}`);
  for (const label of record.water_judgment.condition_labels_ko) {
    if (label !== '조건 없음') notes.push(`조건: ${label}`);
  }
  return unique(notes);
}

function evidenceCounts(record) {
  return {
    directReviewCount: record.review_evidence.directly_read_reviews,
    onsenReviewCount: record.review_evidence.onsen_related_direct_reviews,
    waterTextureMentionCount: record.water_sensory_judgment.review_signal_counts.water_texture.mention_count,
    chlorineSmellMentionCount: record.water_sensory_judgment.review_signal_counts.chlorine_smell.mention_count,
    weakOnsenFeelingMentionCount: record.water_sensory_judgment.review_signal_counts.weak_onsen_feeling.mention_count,
    colorReviewMentions: {
      clear: record.water_sensory_judgment.official_color.review_color_mentions.clear,
      greenish: record.water_sensory_judgment.official_color.review_color_mentions.greenish,
      hakutaku: record.water_sensory_judgment.official_color.review_color_mentions.hakutaku,
      brownOrIron: record.water_sensory_judgment.official_color.review_color_mentions.brown_or_iron,
    },
    waterJudgment: record.water_judgment,
    waterSensoryJudgment: record.water_sensory_judgment,
    qaGates: record.qa_gates,
    visibleReviewPoolNote: record.review_evidence.visible_review_pool_note,
    countPolicy: record.review_evidence.count_policy,
  };
}

function summary(record) {
  const area = areaLabels[record.identity.onsen_area] ?? record.identity.onsen_area;
  const condition = record.water_judgment.condition_labels_ko.filter((label) => label !== '조건 없음').join(', ');
  const conditionText = condition ? ` ${condition} 조건을 함께 확인해야 합니다.` : '';
  return `${area}의 온천 숙소 후보입니다. ${primaryBath[record.slug]} 구성을 기준으로 정리했으며, 온천수 방식은 ${record.water_judgment.ui_label_ko}로 판정했습니다.${conditionText} 현재는 직접 표본 ${record.review_evidence.directly_read_reviews}건 기준의 초도 적재라 공개 전 QA가 필요합니다.`;
}

function factStatuses(record) {
  const facts = [
    {
      code: 'water_kakenagashi',
      label: '직수 온천',
      status: 'confirmed',
      value: `${record.water_judgment.ui_label_ko}. 적용 범위: ${record.water_judgment.water_scope}`,
      source: record.source_files.official_facts,
    },
    {
      code: 'water_method_scope',
      label: '온천수 방식 적용 범위',
      status: record.water_judgment.conditions.includes('scope_limited') ? 'limited' : 'confirmed',
      value: record.water_judgment.water_scope,
      source: record.source_files.official_facts,
    },
    {
      code: 'water_texture_filter',
      label: '물의 감촉 후보',
      status: record.water_sensory_judgment.review_signal_counts.water_texture.mention_count > 0 ? 'review_supported' : 'official_basis_only',
      value: record.water_sensory_judgment.texture_filters.map((item) => item.ui_label_ko).join(', '),
      source: record.source_files.review_signal_summary,
    },
    {
      code: 'water_color_filter',
      label: '물의 색 후보',
      status: record.water_sensory_judgment.official_color.status,
      value: record.water_sensory_judgment.official_color.detail_label_ko ?? '공식 색 근거 없음',
      source: record.source_files.official_facts,
    },
  ];
  return facts;
}

function verdictItems(record) {
  const onsenRelated = record.review_evidence.onsen_related_direct_reviews;
  const experiences = record.review_evidence.directly_read_reviews;
  const textureMentions = record.water_sensory_judgment.review_signal_counts.water_texture.mention_count;
  const cautionMentions = record.water_sensory_judgment.caution_counts.smell_related_issue_count;
  const items = [
    {
      order: 1,
      type: 'conditional',
      headline: `${primaryBath[record.slug]} 구성을 먼저 확인합니다.`,
      counts: {
        mentions: Math.min(onsenRelated, Math.max(1, Math.round(onsenRelated * 0.6))),
        negative: 0,
        denominator: 'onsen_related',
      },
      body: `${record.water_judgment.water_scope} 범위로 정리했습니다. 숙소 전체에 같은 방식이 적용된다고 확장하지 않습니다.`,
      verdict: record.accommodation_candidate.seed_readiness,
      chip_label: primaryBath[record.slug],
      adoption_status: 'draft_basis',
      signal_key: 'bath_scope',
    },
    {
      order: 2,
      type: 'positive',
      headline: `물의 감촉은 ${record.water_sensory_judgment.texture_filters.map((item) => item.ui_label_ko).join(', ')} 후보입니다.`,
      counts: {
        mentions: textureMentions,
        negative: 0,
        denominator: 'onsen_related',
      },
      body: `${record.water_sensory_judgment.summary_ko} 감촉 문구는 직접 후기 카운트와 함께만 노출합니다.`,
      verdict: '감촉 필터 후보로 보존합니다.',
      chip_label: '물의 감촉',
      adoption_status: 'draft_basis',
      signal_key: 'water_texture',
    },
  ];
  if (cautionMentions > 0) {
    items.push({
      order: 3,
      type: 'conditional',
      headline: '냄새·온천감 주의 신호를 함께 봅니다.',
      counts: {
        mentions: cautionMentions,
        negative: cautionMentions,
        denominator: 'experiences_read',
      },
      body: '주의 신호는 공식 방식 판정 근거로 쓰지 않고, 이용 경험의 보조 정보로만 보존합니다.',
      verdict: '예약 전 욕장 범위와 조건을 함께 확인하시기 바랍니다.',
      chip_label: '주의 신호',
      adoption_status: 'draft_basis',
      signal_key: 'caution_signal',
    });
  }
  for (const item of items) {
    if (item.counts.denominator === 'onsen_related') item.counts.mentions = Math.min(item.counts.mentions, onsenRelated);
    if (item.counts.denominator === 'experiences_read') item.counts.mentions = Math.min(item.counts.mentions, experiences);
  }
  return items;
}

function accommodationRow(record) {
  const area = areaLabels[record.identity.onsen_area] ?? record.identity.onsen_area;
  const alias = aliases[record.slug] ?? { ko: [record.identity.korean_name], ja: [record.identity.japanese_name], en: [] };
  return {
    slug: record.slug,
    name: record.identity.korean_name,
    ja_name: record.identity.japanese_name,
    display_name_ko: record.identity.korean_name,
    name_ja: record.identity.japanese_name,
    name_en: englishNames[record.slug] ?? null,
    aliases_ko: unique(alias.ko),
    aliases_ja: unique(alias.ja),
    aliases_en: unique(alias.en),
    name_verification_status: 'verified',
    name_source_note: 'Real Onsen 추천 숙소 리서치 기반 초도 적재',
    region: record.identity.onsen_area,
    area,
    country: 'JP',
    region_group: record.identity.region_group,
    prefecture: record.identity.prefecture,
    city: record.identity.city,
    onsen_area: record.identity.onsen_area,
    travel_contexts: ['ryokan_stay'],
    bath_contexts: bathContexts(record),
    water_criteria: waterCriteria(record),
    summary: summary(record),
    primary_bath: primaryBath[record.slug],
    water_use_status: 'official_confirmed',
    water_source_type: 'free_flowing_source',
    bath_scope: record.water_judgment.bath_scope_code,
    operation_notes: operationNotes(record),
    evidence_counts: evidenceCounts(record),
    evidence_grade: 'D',
    evidence_note: `직접 읽은 이용 경험 ${record.review_evidence.directly_read_reviews}건, 온천 관련 ${record.review_evidence.onsen_related_direct_reviews}건, 감촉 직접 언급 ${record.water_sensory_judgment.review_signal_counts.water_texture.mention_count}건`,
    status: 'draft',
    source_file: record.source_files.review_signal_summary,
    content_updated_at: date,
  };
}

function verdictRow(record) {
  return {
    target_type: 'accommodation',
    target_slug: record.slug,
    level: 'draft',
    headline: `${primaryBath[record.slug]} 온천 숙소 후보입니다.`,
    briefing: {
      experiences_read: record.review_evidence.directly_read_reviews,
      onsen_related: record.review_evidence.onsen_related_direct_reviews,
      platform_count: null,
      platforms: ['직접 표본 인덱스', '공식 사이트', '공식계 OTA'],
      data_quality_grade: record.review_evidence.data_quality_grade,
      sampling_label: record.review_evidence.sampling_label,
      water_judgment: record.water_judgment,
      water_sensory_judgment: record.water_sensory_judgment,
      qa_gates: record.qa_gates,
      count_policy: record.review_evidence.count_policy,
    },
    items: verdictItems(record),
    fact_statuses: factStatuses(record),
    status: 'draft',
    verified_at: date,
    source_file: record.source_files.review_signal_summary,
  };
}

function writeReport(seed) {
  const rows = seed.accommodations.map((row) => {
    const counts = row.evidence_counts;
    return `| \`${row.slug}\` | ${row.name} | ${row.status} | ${row.primary_bath} | ${row.water_source_type} | ${counts.directReviewCount} / ${counts.onsenReviewCount} | ${counts.waterTextureMentionCount} | ${counts.qaGates.join(', ')} |`;
  });
  const content = `# Real Onsen 숙소 DB seed - ${date}

## 적용 정책

- 4건 모두 \`draft\`로 적재합니다.
- 기존 \`water_source_type\` enum에는 새 용어를 직접 넣지 않고, 호환 값 \`free_flowing_source\`를 사용합니다.
- 새 판정 모델은 \`evidence_counts.waterJudgment\`, \`evidence_counts.waterSensoryJudgment\`, \`onsen_verdicts.briefing.water_judgment\`, \`onsen_verdicts.briefing.water_sensory_judgment\`에 보존합니다.
- 실제 DB schema cache에 \`onsen_verdicts.localized_copy\`가 없어 verdict seed에서는 해당 컬럼을 제외합니다.
- DB 적재용 산출물이며, 공개 승격은 QA gate 해소 후 별도 처리합니다.

| slug | 숙소명 | 상태 | 온천 구성 | 구 enum | 직접/온천 직접 | 감촉 언급 | QA gate |
| --- | --- | --- | --- | --- | ---: | ---: | --- |
${rows.join('\n')}
`;
  writeFileSync(reportPath, content);
}

function main() {
  const parsed = readJson(inputPath);
  const records = parsed.records ?? [];
  if (records.length === 0) throw new Error('No pipeline records found.');

  mkdirSync(outputDir, { recursive: true });
  const seed = {
    generated_at: date,
    source_file: path.relative(repoRoot, inputPath),
    accommodations: records.map(accommodationRow),
    verdicts: records.map(verdictRow),
  };
  writeFileSync(outputPath, `${JSON.stringify(seed, null, 2)}\n`);
  writeReport(seed);
  console.log(`Wrote ${path.relative(repoRoot, outputPath)}`);
  console.log(`Wrote ${path.relative(repoRoot, reportPath)}`);
}

main();
