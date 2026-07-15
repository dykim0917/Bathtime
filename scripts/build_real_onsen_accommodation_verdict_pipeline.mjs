import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const date = '2026-07-09';
const inputRoot = path.join(repoRoot, 'research/onsen-review-signals/real-onsen');
const outputDir = path.join(repoRoot, 'research/onsen-db-seed');
const candidateQueuePath = path.join(outputDir, `real_onsen_accommodation_candidate_queue_${date}.csv`);
const outputBase = `real_onsen_accommodation_verdict_pipeline_${date}`;

const targetSlugs = [
  'takayama-ryu-resort-spa',
  'yudanaka-biyu-no-yado',
  'okuyugawara-kamata',
  'okuhida-garden-hotel-yakedake',
];

const methodLabels = {
  kakenagashi_pure: '순수직수',
  kakenagashi: '직수',
  junkan: '순환식 온천',
  no_badge: '무배지',
};

const conditionLabels = {
  none: '조건 없음',
  kasui: '물을 섞어 식힘',
  kaon: '데워서 온도 조정',
  disinfection: '소독 표기 있음',
  scope_limited: '일부 탕 한정',
  operation_notice: '운영 공지 재확인',
};

const sensoryOverrides = {
  'takayama-ryu-resort-spa': {
    official_spring_quality: {
      japanese: 'アルカリ性単純温泉',
      korean_note: '알칼리성 단순온천',
      ph: '8.7',
      basis: '공식 온천성분/泉質 표기',
    },
    texture_filters: [
      {
        code: 'slippery',
        ui_label_ko: '미끌미끌',
        official_basis: '알칼리성 단순온천 pH 8.7',
      },
    ],
    official_color: {
      detail_label_ko: '투명',
      original_text: '無色透明',
      filter_candidate: null,
      expose_as_filter: false,
      status: 'detail_only',
      basis: '공식 성분표의 무색투명 표기. 투명은 필터 칩으로 팔지 않고 상세 사실로만 둡니다.',
    },
    sensory_summary_ko:
      '공식 수질상 미끌미끌 후보입니다. 후기의 매끈함은 약한 탐색 신호라 카운트와 함께만 노출합니다.',
  },
  'yudanaka-biyu-no-yado': {
    official_spring_quality: {
      japanese: 'アルカリ性単純温泉',
      korean_note: '알칼리성 단순온천',
      ph: null,
      basis: '공식 온천 상세 페이지',
    },
    texture_filters: [
      {
        code: 'slippery',
        ui_label_ko: '미끌미끌',
        official_basis: '공식 수질 알칼리성 단순온천',
      },
    ],
    official_color: {
      detail_label_ko: null,
      original_text: null,
      filter_candidate: null,
      expose_as_filter: false,
      status: 'not_confirmed',
      basis: '공식 색 표기는 이번 산출물에서 확인하지 못했습니다.',
    },
    sensory_summary_ko:
      '공식 수질상 미끌미끌 후보입니다. 후기에서는 물 자체보다 입욕 후 따뜻함 신호가 더 많이 보입니다.',
  },
  'okuyugawara-kamata': {
    official_spring_quality: {
      japanese: 'カルシウム-硫酸塩泉',
      korean_note: '칼슘-황산염천',
      ph: '7.5',
      basis: '공식 hotspa 및 공식계 OTA 표기',
    },
    texture_filters: [
      {
        code: 'salt_warmth',
        ui_label_ko: '소금탕',
        official_basis: '공식 수질 황산염천',
      },
    ],
    official_color: {
      detail_label_ko: '투명',
      original_text: null,
      filter_candidate: null,
      expose_as_filter: false,
      status: 'review_signal_only',
      basis: '후기에는 투명/사라사라 표현이 있으나 공식 색 강조가 없어 색 필터로 쓰지 않습니다.',
    },
    sensory_summary_ko:
      '공식 수질상 소금탕 계열 후보입니다. 후기에서는 부드러움, 사라사라함, 입욕 후 매끈함이 반복됩니다.',
  },
  'okuhida-garden-hotel-yakedake': {
    official_spring_quality: {
      japanese: 'ナトリウム－炭酸水素塩・塩化物温泉',
      korean_note: '나트륨-탄산수소염·염화물천',
      ph: '6.8 / 6.67',
      basis: '공식 온천분석표',
    },
    texture_filters: [
      {
        code: 'slippery',
        ui_label_ko: '미끌미끌',
        official_basis: '공식 수질 탄산수소염천',
      },
      {
        code: 'salt_warmth',
        ui_label_ko: '소금탕',
        official_basis: '공식 수질 염화물천',
      },
    ],
    official_color: {
      detail_label_ko: '미백탁',
      original_text: '分析時 微白濁',
      filter_candidate: 'hakutaku',
      expose_as_filter: false,
      status: 'needs_editorial_qa_before_filter',
      basis:
        '공식 분석표에는 미백탁이 있으나, 후기의 녹색/우구이스색 신호와 필터 라벨이 바로 일치하지 않아 색 필터 적용 전 QA가 필요합니다.',
    },
    sensory_summary_ko:
      '공식 수질상 미끌미끌/소금탕 후보가 동시에 있습니다. 녹색 탕색과 철 냄새 신호는 반복되지만 현재 색 필터 체계에는 별도 QA가 필요합니다.',
  },
};

const overrides = {
  'takayama-ryu-resort-spa': {
    canonical_water_method: 'kakenagashi',
    ui_label_ko: '직수',
    conditions: ['kaon'],
    badge_gate: 'hold_pure_due_heating',
    water_scope: '대욕장과 공용 노천탕 중심',
    bath_scope_code: 'public_bath_only',
    seed_readiness: 'needs_water_condition_qa',
    reason:
      '공식 원문에서 원천 100% 직수와 무순환·무가수·무염소소독은 확인되지만, 보온 목적 가온 표기가 있어 순수직수로 바로 승격하지 않습니다.',
  },
  'yudanaka-biyu-no-yado': {
    canonical_water_method: 'kakenagashi_pure',
    ui_label_ko: '순수직수',
    conditions: ['none'],
    badge_gate: 'pure_candidate_ready_after_sample_index_qa',
    water_scope: '대욕장, 대절 노천탕, 노천탕 포함 객실 3실',
    bath_scope_code: 'some_rooms',
    seed_readiness: 'needs_review_index_qa',
    reason:
      '공식/공식계 OTA에서 원천 100% 직수, 무가수, 무가온, 무순환, 약제 미사용 취지가 확인됩니다. 다만 직접 표본 JSON과 CSV 인덱스 수가 맞지 않아 seed 전 QA가 필요합니다.',
  },
  'okuyugawara-kamata': {
    canonical_water_method: 'kakenagashi',
    ui_label_ko: '직수',
    conditions: ['kaon', 'operation_notice'],
    badge_gate: 'ready_as_kakenagashi_only_after_operation_recheck',
    water_scope: '전 객실 온천 내탕, 대욕장, 대절 노천탕',
    bath_scope_code: 'all_rooms',
    seed_readiness: 'needs_operational_recheck',
    reason:
      '공식 원문에서 자가원천 직수와 무순환·무소독은 확인되지만 상시 가온이 확인되어 순수직수는 제외합니다. 공식 메인에 객실 목욕 사용 중지 공지가 있어 적용 전 재확인이 필요합니다.',
  },
  'okuhida-garden-hotel-yakedake': {
    canonical_water_method: 'kakenagashi_pure',
    ui_label_ko: '순수직수',
    conditions: ['scope_limited'],
    badge_gate: 'pure_candidate_scope_limited',
    water_scope: 'うぐいすの湯 한정',
    bath_scope_code: 'public_bath_only',
    seed_readiness: 'needs_bath_area_scope_qa',
    reason:
      '공식 표면의 100% 원천 직수 근거는 최소 うぐいすの湯에 한정합니다. 내탕 일부는 공식상 온천이 아니므로 숙소 전체 배지로 확장하면 안 됩니다.',
  },
};

function parseCsvLine(line) {
  const values = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === ',' && !quoted) {
      values.push(value);
      value = '';
      continue;
    }
    value += char;
  }
  values.push(value);
  return values;
}

function readCsv(filePath) {
  const [headerLine, ...lines] = readFileSync(filePath, 'utf8').trim().split(/\r?\n/);
  const headers = parseCsvLine(headerLine);
  return lines.filter(Boolean).map((line) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
    if (values.length > headers.length) row.__overflow_values = values.slice(headers.length);
    return row;
  });
}

function csvEscape(value) {
  const text = value === undefined || value === null ? '' : String(value);
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function writeCsv(filePath, rows, headers) {
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ];
  writeFileSync(filePath, `${lines.join('\n')}\n`);
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function fileLineCount(filePath) {
  if (!existsSync(filePath)) return 0;
  return readFileSync(filePath, 'utf8').trim().split(/\r?\n/).filter(Boolean).length;
}

function readText(filePath) {
  if (!existsSync(filePath)) return '';
  return readFileSync(filePath, 'utf8');
}

function parseMarkdownRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((value) => value.trim());
}

function parseMarkdownSectionTable(markdown, startHeading, endHeading) {
  const rows = [];
  let inSection = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (line.startsWith(startHeading)) {
      inSection = true;
      continue;
    }
    if (inSection && endHeading && line.startsWith(endHeading)) break;
    if (!inSection || !line.trim().startsWith('|')) continue;
    if (/^\|\s*-+/.test(line) || line.includes('---')) continue;
    const cells = parseMarkdownRow(line);
    if (cells[0] === 'bath_area' || cells[0] === 'issue') continue;
    rows.push(cells);
  }
  return rows;
}

function parseReviewSignalSummary(summaryPath) {
  const markdown = readText(summaryPath);
  const signalRows = parseMarkdownSectionTable(markdown, '## 4. Review Signal Summary', '## 5.').map((cells) => ({
    bath_area: cells[0],
    bath_area_confidence: cells[1],
    signal_type: cells[2],
    signal_direction: cells[3],
    mention_count: Number(cells[4]) || 0,
    source_count: Number(cells[5]) || 0,
    platform_count: Number(cells[6]) || 0,
    contradiction_level: cells[7],
    review_signal_status: cells[8],
  }));

  const issueRows = parseMarkdownSectionTable(markdown, '## 5. 부정/주의 신호', '## 6.').map((cells) => ({
    issue: cells[0],
    bath_area: cells[1],
    evidence_level: cells[2],
    summary: cells[3],
    sample_count: Number(cells[4]) || 0,
  }));

  const signals = new Map();
  for (const row of signalRows) {
    const current = signals.get(row.signal_type) ?? {
      mention_count: 0,
      source_count: 0,
      platform_count: 0,
      directions: new Set(),
      contradiction_levels: new Set(),
      statuses: new Set(),
      rows: [],
    };
    current.mention_count += row.mention_count;
    current.source_count += row.source_count;
    current.platform_count = Math.max(current.platform_count, row.platform_count);
    current.directions.add(row.signal_direction);
    current.contradiction_levels.add(row.contradiction_level);
    current.statuses.add(row.review_signal_status);
    current.rows.push(row);
    signals.set(row.signal_type, current);
  }

  return {
    signalRows,
    issueRows,
    signals,
  };
}

function isDirectSampleRow(row) {
  const flags = [
    row.is_direct_body_read,
    row.direct_body_read,
    row.counted_as_direct_review,
    row.is_full_body_read,
    ...(row.__overflow_values ?? []),
  ].map((value) => String(value ?? '').toLowerCase());
  return flags.includes('true');
}

function splitSignalTypes(value) {
  return String(value ?? '').split(';').map((item) => item.trim()).filter(Boolean);
}

function countSampleSignals(sampleRows) {
  const signalCounts = new Map();
  const colorMentions = {
    clear: 0,
    greenish: 0,
    hakutaku: 0,
    brown_or_iron: 0,
    rows: [],
  };

  for (const row of sampleRows.filter(isDirectSampleRow)) {
    for (const signalType of splitSignalTypes(row.signal_type)) {
      signalCounts.set(signalType, (signalCounts.get(signalType) ?? 0) + 1);
    }

    const colorText = `${row.original_keyword ?? ''} ${row.short_paraphrase ?? ''}`;
    const matched = [];
    if (/無色透明|透明|무색|투명/.test(colorText)) {
      colorMentions.clear += 1;
      matched.push('clear');
    }
    if (/微黄緑色|黄緑色|緑色|うぐいす色|鶯色|エメラルド色|녹색 탕색|우구이스색|에메랄드색/.test(colorText)) {
      colorMentions.greenish += 1;
      matched.push('greenish');
    }
    if (/白濁|乳白|にごり|濁り|백탁|유백|뽀얗/.test(colorText)) {
      colorMentions.hakutaku += 1;
      matched.push('hakutaku');
    }
    if (/褐色|茶褐|赤褐|鉄色|鉄分.*色|갈색|적갈색|철분.*색/.test(colorText)) {
      colorMentions.brown_or_iron += 1;
      matched.push('brown_or_iron');
    }
    if (matched.length > 0) {
      colorMentions.rows.push({
        sample_id: row.sample_id,
        matched,
        bath_area: row.bath_area,
        signal_type: row.signal_type,
        short_paraphrase: row.short_paraphrase,
        original_keyword: row.original_keyword,
      });
    }
  }

  return {
    signalCounts,
    colorMentions,
  };
}

function sumPlatform(platforms, directKeys) {
  return platforms.reduce((sum, platform) => {
    for (const key of directKeys) {
      if (typeof platform[key] === 'number') return sum + platform[key];
    }
    return sum;
  }, 0);
}

function extractReviewTotals(platformMapping) {
  if (platformMapping.direct_sampling_totals) {
    return {
      directly_read_reviews: platformMapping.direct_sampling_totals.directly_read_reviews ?? 0,
      onsen_related_direct_reviews: platformMapping.direct_sampling_totals.onsen_related_reviews ?? 0,
      visible_pool_note: platformMapping.visible_review_pool_note?.known_source_level_visible_counts
        ?? platformMapping.visible_review_pool_note?.recommended_reporting
        ?? '',
      sampling_label: platformMapping.sampling_status ?? 'initial_sampling',
    };
  }

  if (platformMapping.direct_sample_totals) {
    return {
      directly_read_reviews: platformMapping.direct_sample_totals.directly_read_reviews ?? 0,
      onsen_related_direct_reviews: platformMapping.direct_sample_totals.onsen_related_directly_read ?? 0,
      visible_pool_note: `visible review pool simple sum ${platformMapping.visible_review_pool_sum_not_deduped}; not deduped`,
      sampling_label: platformMapping.direct_sample_totals.sampling_label ?? 'initial_sampling',
    };
  }

  if (platformMapping.totals) {
    return {
      directly_read_reviews: platformMapping.totals.directly_read_reviews ?? 0,
      onsen_related_direct_reviews: platformMapping.totals.onsen_related_directly_read_reviews ?? 0,
      visible_pool_note: `known visible pool ${platformMapping.totals.visible_review_pool_sum_with_known_overlap_risk}; overlap risk`,
      sampling_label: platformMapping.collection_mode ?? 'initial_sampling',
    };
  }

  if (typeof platformMapping.directly_read_total === 'number') {
    return {
      directly_read_reviews: platformMapping.directly_read_total,
      onsen_related_direct_reviews: platformMapping.onsen_related_directly_read_total ?? 0,
      visible_pool_note:
        platformMapping.visible_review_pool_sum_note
        ?? `visible review pool simple sum ${platformMapping.visible_review_pool_sum_simple}; not deduped`,
      sampling_label: platformMapping.sampling_label ?? 'initial_sampling',
    };
  }

  const platforms = platformMapping.platforms ?? [];
  return {
    directly_read_reviews: sumPlatform(platforms, ['directly_read_reviews']),
    onsen_related_direct_reviews: sumPlatform(platforms, [
      'onsen_related_reviews',
      'onsen_related_directly_read',
      'onsen_related_directly_read_reviews',
    ]),
    visible_pool_note: platformMapping.visible_review_pool_note ?? '',
    sampling_label: platformMapping.collection_mode ?? 'initial_sampling',
  };
}

function extractIdentity(officialFacts, queueRow) {
  const identity = officialFacts.identity ?? {};
  return {
    korean_name: identity.korean_name ?? queueRow.korean_name,
    japanese_name: identity.japanese_name ?? queueRow.japanese_name,
    official_url: identity.official_url ?? queueRow.official_url,
    real_onsen_source_url: identity.source_url ?? queueRow.real_onsen_source_url,
    region_group: queueRow.region_group,
    prefecture: queueRow.prefecture,
    city: queueRow.city,
    onsen_area: queueRow.onsen_area,
    property_type: queueRow.property_type,
  };
}

function officialSourceUrls(officialFacts) {
  const urls = new Set();
  if (officialFacts.identity?.official_url) urls.add(officialFacts.identity.official_url);
  if (officialFacts.identity?.source_url) urls.add(officialFacts.identity.source_url);
  for (const key of ['official_source_urls', 'official_sources_checked', 'official_fact_sources', 'official_sources']) {
    const value = officialFacts[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') urls.add(item);
        if (item?.url) urls.add(item.url);
      }
    }
  }
  const nestedUrls = [
    officialFacts.official_bath_facts?.bath_scope?.official_source_url,
    officialFacts.bath_facts?.facility_wide?.official_source_url,
    officialFacts.spring_quality?.official_source_url,
  ];
  for (const url of nestedUrls) if (url) urls.add(url);
  return [...urls];
}

function sourceFragments(officialFacts) {
  const text = JSON.stringify(officialFacts);
  const fragments = [];
  for (const pattern of [
    /源泉100%かけ流し/g,
    /100％かけ流し/g,
    /100%源泉かけ流し/g,
    /源泉掛け流し/g,
    /源泉かけ流し/g,
    /かけ流し/g,
    /加水/g,
    /加温/g,
    /循環/g,
    /消毒/g,
    /塩素/g,
    /温泉ではありません/g,
  ]) {
    for (const match of text.matchAll(pattern)) fragments.push(match[0]);
  }
  return [...new Set(fragments)];
}

function bathScopeFacts(officialFacts) {
  const source =
    officialFacts.official_bath_facts?.bath_scope
    ?? officialFacts.bath_areas
    ?? officialFacts.bath_facts
    ?? {};
  return source;
}

function qualityGate(slug, reviewTotals, csvLines) {
  const gate = [];
  if (reviewTotals.directly_read_reviews < 100) {
    gate.push('direct_review_sample_under_100');
  }
  if (reviewTotals.directly_read_reviews < 300) {
    gate.push('direct_review_sample_under_300');
  }
  if (slug === 'yudanaka-biyu-no-yado' && csvLines - 1 !== reviewTotals.directly_read_reviews) {
    gate.push('direct_review_index_count_mismatch');
  }
  if (slug === 'okuyugawara-kamata') {
    gate.push('current_operation_notice_must_recheck');
  }
  if (slug === 'okuhida-garden-hotel-yakedake') {
    gate.push('bath_area_scope_must_not_expand');
  }
  if (slug === 'takayama-ryu-resort-spa') {
    gate.push('pure_badge_blocked_by_heating_condition');
  }
  return gate;
}

function plainSet(setValue) {
  return [...setValue].filter(Boolean);
}

function signalSummaryFor(parsedSummary, sampleSignals, signalType) {
  const summary = parsedSummary.signals.get(signalType);
  if (summary) {
    return {
      mention_count: summary.mention_count,
      source_count: summary.source_count,
      platform_count: summary.platform_count,
      directions: plainSet(summary.directions),
      contradiction_levels: plainSet(summary.contradiction_levels),
      statuses: plainSet(summary.statuses),
      count_source: 'review_signal_summary',
    };
  }

  return {
    mention_count: sampleSignals.signalCounts.get(signalType) ?? 0,
    source_count: sampleSignals.signalCounts.get(signalType) ?? 0,
    platform_count: null,
    directions: [],
    contradiction_levels: [],
    statuses: [],
    count_source: 'direct_review_sample_index',
  };
}

function issueCount(issueRows, pattern) {
  return issueRows
    .filter((issue) => pattern.test(issue.issue))
    .reduce((sum, issue) => sum + issue.sample_count, 0);
}

function buildSensoryJudgment(slug, parsedSummary, sampleSignals) {
  const override = sensoryOverrides[slug];
  const textureSignal = signalSummaryFor(parsedSummary, sampleSignals, 'water_texture');
  const chlorineSignal = signalSummaryFor(parsedSummary, sampleSignals, 'chlorine_smell');
  const weakOnsenSignal = signalSummaryFor(parsedSummary, sampleSignals, 'weak_onsen_feeling');
  const smellIssueCount = issueCount(parsedSummary.issueRows, /냄새|염소|塩素|カルキ|소독|消毒|황화수소|硫化|鉄臭|배기|カビ|곰팡이/);
  const smellCautionCount = Math.max(smellIssueCount, chlorineSignal.mention_count);

  return {
    official_spring_quality: override.official_spring_quality,
    texture_filters: override.texture_filters.map((filter) => ({
      ...filter,
      direct_review_mention_count: textureSignal.mention_count,
      direct_review_source_count: textureSignal.source_count,
      direct_review_platform_count: textureSignal.platform_count,
      review_signal_status: textureSignal.statuses,
      exposure_status: textureSignal.mention_count > 0 ? 'candidate_with_count' : 'official_basis_only_hold',
      display_rule: '감촉 필터는 직접 후기 카운트와 함께만 노출합니다.',
    })),
    official_color: {
      ...override.official_color,
      review_color_mentions: sampleSignals.colorMentions,
      display_rule:
        '색 필터는 공식 공시·공식 사진·시설 안내 근거가 있을 때만 노출합니다. 후기 색 언급은 보조 카운트로만 사용합니다.',
    },
    review_signal_counts: {
      water_texture: textureSignal,
      chlorine_smell: chlorineSignal,
      weak_onsen_feeling: weakOnsenSignal,
    },
    caution_counts: {
      smell_related_issue_count: smellCautionCount,
      smell_issue_table_count: smellIssueCount,
      chlorine_smell_direct_mentions: chlorineSignal.mention_count,
      weak_onsen_feeling_mentions: weakOnsenSignal.mention_count,
    },
    model_gaps: {
      water_color_signal_type_exists: false,
      note:
        '기존 직접 리뷰 인덱스에는 water_color 태그가 없습니다. 색은 키워드 스캔과 공식 색 근거로 임시 정규화했으며, 다음 수집부터 water_color 태그를 추가해야 합니다.',
    },
    summary_ko: override.sensory_summary_ko,
  };
}

function buildRecord(queueRow) {
  const slug = queueRow.candidate_slug;
  const dir = path.join(inputRoot, slug);
  const officialFactsPath = path.join(dir, `official_facts_${date}.json`);
  const platformMappingPath = path.join(dir, `platform_mapping_${date}.json`);
  const sampleIndexPath = path.join(dir, `direct_review_sample_index_${date}.csv`);
  const reviewSummaryPath = path.join(dir, `review_signal_summary_${date}.md`);

  if (!existsSync(officialFactsPath)) throw new Error(`Missing official facts: ${officialFactsPath}`);
  if (!existsSync(platformMappingPath)) throw new Error(`Missing platform mapping: ${platformMappingPath}`);

  const officialFacts = readJson(officialFactsPath);
  const platformMapping = readJson(platformMappingPath);
  const sampleRows = existsSync(sampleIndexPath) ? readCsv(sampleIndexPath) : [];
  const parsedSummary = parseReviewSignalSummary(reviewSummaryPath);
  const sampleSignals = countSampleSignals(sampleRows);
  const reviewTotals = extractReviewTotals(platformMapping);
  const csvLineCount = fileLineCount(sampleIndexPath);
  const override = overrides[slug];
  const qaGates = qualityGate(slug, reviewTotals, csvLineCount);
  const waterMethod = override.canonical_water_method;
  const conditionKo = override.conditions.map((condition) => conditionLabels[condition] ?? condition);

  return {
    slug,
    identity: extractIdentity(officialFacts, queueRow),
    accommodation_candidate: {
      source_track: queueRow.candidate_track,
      db_match_status: queueRow.db_match_status,
      likely_tier: queueRow.likely_tier,
      model: 'accommodation',
      status_recommendation: 'draft_until_qa',
      seed_readiness: override.seed_readiness,
    },
    water_judgment: {
      canonical_water_method: waterMethod,
      ui_label_ko: methodLabels[waterMethod] ?? override.ui_label_ko,
      conditions: override.conditions,
      condition_labels_ko: conditionKo,
      water_scope: override.water_scope,
      bath_scope_code: override.bath_scope_code,
      badge_gate: override.badge_gate,
      judgment_reason_ko: override.reason,
      review_used_for_method: false,
      method_source_policy:
        '공식 원문/공식계 OTA 원문만 온천수 방식 판정 근거로 사용합니다. 후기는 감촉·색·주의 신호로만 사용합니다.',
      official_source_urls: officialSourceUrls(officialFacts),
      official_keyword_fragments: sourceFragments(officialFacts),
      raw_bath_scope_facts: bathScopeFacts(officialFacts),
    },
    water_sensory_judgment: buildSensoryJudgment(slug, parsedSummary, sampleSignals),
    review_evidence: {
      directly_read_reviews: reviewTotals.directly_read_reviews,
      onsen_related_direct_reviews: reviewTotals.onsen_related_direct_reviews,
      visible_review_pool_note: reviewTotals.visible_pool_note,
      sampling_label: reviewTotals.sampling_label,
      data_quality_grade: reviewTotals.directly_read_reviews >= 100 ? 'C' : 'D',
      direct_review_sample_index_rows_excluding_header: Math.max(csvLineCount - 1, 0),
      count_policy:
        'visible review count와 직접 읽은 리뷰 수를 섞지 않습니다. 검색 스니펫, AI 요약, OTA 요약은 직접 리뷰 수에 포함하지 않습니다.',
    },
    qa_gates: qaGates,
    output_policy: {
      db_write_allowed: false,
      sql_generated: false,
      legacy_water_source_type_mapping:
        '현재 onsen_accommodations.water_source_type enum은 구 기준입니다. 새 방식 배지는 별도 컬럼/JSONB 마이그레이션 후 적용해야 합니다.',
    },
    source_files: {
      official_facts: path.relative(repoRoot, officialFactsPath),
      platform_mapping: path.relative(repoRoot, platformMappingPath),
      direct_review_sample_index: path.relative(repoRoot, sampleIndexPath),
      review_signal_summary: path.relative(repoRoot, reviewSummaryPath),
    },
  };
}

function writeMarkdown(filePath, records) {
  const rows = records.map((record) => {
    const review = record.review_evidence;
    const water = record.water_judgment;
    return `| \`${record.slug}\` | ${record.identity.korean_name} | ${water.ui_label_ko} | ${water.water_scope} | ${water.condition_labels_ko.join(', ')} | ${review.directly_read_reviews} / ${review.onsen_related_direct_reviews} | ${record.accommodation_candidate.seed_readiness} | ${record.qa_gates.join(', ')} |`;
  });

  const sensoryRows = records.map((record) => {
    const sensory = record.water_sensory_judgment;
    const textureLabels = sensory.texture_filters.map((filter) => filter.ui_label_ko).join(', ');
    const textureCount = sensory.review_signal_counts.water_texture.mention_count;
    const color = sensory.official_color;
    const colorLabel = color.filter_candidate
      ? `${color.detail_label_ko ?? color.filter_candidate} 후보`
      : (color.detail_label_ko ?? '없음');
    const colorMentions = color.review_color_mentions;
    const colorCountText = [
      colorMentions.clear ? `투명 ${colorMentions.clear}` : '',
      colorMentions.greenish ? `녹색 ${colorMentions.greenish}` : '',
      colorMentions.hakutaku ? `백탁 ${colorMentions.hakutaku}` : '',
      colorMentions.brown_or_iron ? `철/갈색 ${colorMentions.brown_or_iron}` : '',
    ].filter(Boolean).join(', ') || '0';
    return `| \`${record.slug}\` | ${sensory.official_spring_quality.korean_note} | ${textureLabels} | ${textureCount} | ${colorLabel} | ${color.status} | ${colorCountText} | ${sensory.caution_counts.smell_related_issue_count} |`;
  });

  const content = `# Real Onsen 숙소 온천 판정 데이터 파이프라인 - ${date}

## 기준

- 숙소 모델과 시설 모델을 분리합니다. 이번 산출물은 숙소 후보만 다룹니다.
- 온천수 방식 배지는 공식 원문 또는 공식계 OTA 원문으로만 판정합니다.
- 후기는 물 감촉, 색, 혼잡, 벌레, 온도 같은 이용 신호로만 사용합니다.
- visible review count와 직접 읽은 리뷰 수는 별도 필드로 유지합니다.
- \`natural_100\`, \`천연온천\`, \`100% 천연온천\`은 방식 배지로 쓰지 않습니다.
- 감촉 필터는 공식 수질과 직접 후기 카운트가 함께 있을 때만 후보로 둡니다.
- 색 필터는 공식 색 근거가 있을 때만 노출 후보로 두며, 후기 색 언급은 보조 카운트로만 씁니다.
- 현재 DB의 \`water_source_type\` enum은 구 기준이므로, 이 파일은 DB write용이 아니라 seed 전 판정/QA용입니다.

## 결과

| slug | 숙소명 | 방식 판정 | 적용 범위 | 조건 라인 | 직접/온천 직접 리뷰 | seed 상태 | QA gate |
| --- | --- | --- | --- | --- | ---: | --- | --- |
${rows.join('\n')}

## 적용 전 차단 조건

1. \`takayama-ryu-resort-spa\`: 가온 조건 때문에 순수직수 배지로 바로 승격하지 않습니다.
2. \`yudanaka-biyu-no-yado\`: JSON 직접 리뷰 수와 CSV 샘플 인덱스 수 불일치를 확인해야 합니다.
3. \`okuyugawara-kamata\`: 공식 운영 공지의 객실 목욕 사용 중지 상태를 재확인해야 합니다.
4. \`okuhida-garden-hotel-yakedake\`: 순수직수 후보는 \`うぐいすの湯\` 한정입니다. 숙소 전체/모든 욕장 배지로 확장하지 않습니다.

## 감촉/색 정규화

| slug | 공식 수질 | 감촉 후보 | 감촉 직접 언급 | 색 후보/상세 | 색 상태 | 후기 색 언급 | 냄새 주의 |
| --- | --- | --- | ---: | --- | --- | --- | ---: |
${sensoryRows.join('\n')}

색 상태가 \`needs_editorial_qa_before_filter\`이면 공식/후기 신호가 있어도 바로 필터로 노출하지 않습니다. 특히 녹색·우구이스색 신호는 현재 용어 가이드의 색 필터 칩과 직접 대응하지 않으므로 별도 QA가 필요합니다.

## 산출물

- \`research/onsen-db-seed/${outputBase}.json\`
- \`research/onsen-db-seed/${outputBase}.csv\`
- \`research/onsen-db-seed/${outputBase}.md\`
`;

  writeFileSync(filePath, content);
}

function main() {
  if (!existsSync(candidateQueuePath)) throw new Error(`Missing candidate queue: ${candidateQueuePath}`);
  mkdirSync(outputDir, { recursive: true });

  const queueRows = readCsv(candidateQueuePath)
    .filter((row) => targetSlugs.includes(row.candidate_slug))
    .sort((a, b) => targetSlugs.indexOf(a.candidate_slug) - targetSlugs.indexOf(b.candidate_slug));

  if (queueRows.length !== targetSlugs.length) {
    throw new Error(`Expected ${targetSlugs.length} target rows, got ${queueRows.length}`);
  }

  const records = queueRows.map(buildRecord);
  const jsonPath = path.join(outputDir, `${outputBase}.json`);
  const csvPath = path.join(outputDir, `${outputBase}.csv`);
  const mdPath = path.join(outputDir, `${outputBase}.md`);

  writeFileSync(jsonPath, `${JSON.stringify({ generated_at: date, records }, null, 2)}\n`);
  writeCsv(
    csvPath,
    records.map((record) => {
      const sensory = record.water_sensory_judgment;
      return {
        slug: record.slug,
        korean_name: record.identity.korean_name,
        japanese_name: record.identity.japanese_name,
        canonical_water_method: record.water_judgment.canonical_water_method,
        ui_label_ko: record.water_judgment.ui_label_ko,
        conditions: record.water_judgment.conditions.join('|'),
        water_scope: record.water_judgment.water_scope,
        bath_scope_code: record.water_judgment.bath_scope_code,
        official_spring_quality_ko: sensory.official_spring_quality.korean_note,
        texture_filter_candidates: sensory.texture_filters.map((filter) => filter.code).join('|'),
        texture_filter_labels_ko: sensory.texture_filters.map((filter) => filter.ui_label_ko).join('|'),
        texture_direct_mentions: sensory.review_signal_counts.water_texture.mention_count,
        color_filter_candidate: sensory.official_color.filter_candidate ?? '',
        color_status: sensory.official_color.status,
        color_review_clear_mentions: sensory.official_color.review_color_mentions.clear,
        color_review_greenish_mentions: sensory.official_color.review_color_mentions.greenish,
        color_review_hakutaku_mentions: sensory.official_color.review_color_mentions.hakutaku,
        color_review_brown_or_iron_mentions: sensory.official_color.review_color_mentions.brown_or_iron,
        smell_caution_mentions: sensory.caution_counts.smell_related_issue_count,
        direct_reviews: record.review_evidence.directly_read_reviews,
        onsen_related_direct_reviews: record.review_evidence.onsen_related_direct_reviews,
        data_quality_grade: record.review_evidence.data_quality_grade,
        seed_readiness: record.accommodation_candidate.seed_readiness,
        qa_gates: record.qa_gates.join('|'),
        db_write_allowed: record.output_policy.db_write_allowed,
      };
    }),
    [
      'slug',
      'korean_name',
      'japanese_name',
      'canonical_water_method',
      'ui_label_ko',
      'conditions',
      'water_scope',
      'bath_scope_code',
      'official_spring_quality_ko',
      'texture_filter_candidates',
      'texture_filter_labels_ko',
      'texture_direct_mentions',
      'color_filter_candidate',
      'color_status',
      'color_review_clear_mentions',
      'color_review_greenish_mentions',
      'color_review_hakutaku_mentions',
      'color_review_brown_or_iron_mentions',
      'smell_caution_mentions',
      'direct_reviews',
      'onsen_related_direct_reviews',
      'data_quality_grade',
      'seed_readiness',
      'qa_gates',
      'db_write_allowed',
    ],
  );
  writeMarkdown(mdPath, records);

  console.log(`Wrote ${path.relative(repoRoot, jsonPath)}`);
  console.log(`Wrote ${path.relative(repoRoot, csvPath)}`);
  console.log(`Wrote ${path.relative(repoRoot, mdPath)}`);
}

main();
