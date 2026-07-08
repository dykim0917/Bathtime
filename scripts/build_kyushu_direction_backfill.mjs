import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const researchRoot = path.join(repoRoot, 'research/onsen-review-signals');
const outputRoot = path.join(repoRoot, 'research/onsen-db-seed');
const backfillRoot = path.join(outputRoot, 'kyushu-direction-backfill');
const qaMatrixPath = path.join(researchRoot, 'kyushu_deep_research_qa_matrix_2026-07-08.csv');
const seedDate = '2026-07-08';

const alreadySeededFiles = [
  'kyushu_qa_seed_2026-07-08.json',
  'kyushu_qa_seed_2nd_2026-07-08.json',
  'kyushu_qa_seed_3rd_2026-07-08.json',
];

const ruleJsonPath = path.join(outputRoot, 'kyushu_direction_backfill_rules_2026-07-08.json');
const ruleReportPath = path.join(outputRoot, 'kyushu_direction_backfill_rules_2026-07-08.md');
const resultReportPath = path.join(outputRoot, 'kyushu_direction_backfill_result_2026-07-08.md');
const auditCsvPath = path.join(outputRoot, 'kyushu_direction_backfill_audit_rows_2026-07-08.csv');

const signalAliases = {
  room_open_air_bath: 'room_bath_hot_spring',
  room_bath: 'room_bath_hot_spring',
  private_bath: 'private_bath_experience',
  family_bath: 'private_bath_experience',
  public_bath: 'public_bath_hot_spring',
  open_air_public_bath: 'public_bath_hot_spring',
  facility_wide_hot_spring_mention: 'facility_wide_onsen_experience',
  onsen_related: 'facility_wide_onsen_experience',
  temperature: 'temperature_management',
  temperature_hot: 'temperature_management',
  temperature_cold: 'temperature_management',
  booking_or_operation_confusion: 'booking_confusion',
  maintenance_caution: 'operation_caution',
  maintenance_cleanliness: 'operation_caution',
  room_bath_operational_caution: 'operation_caution',
  transport_access_caution: 'operation_caution',
  access_caution: 'operation_caution',
  chlorine: 'chlorine_smell',
};

const neutralSignals = new Set([
  '',
  'food',
  'access',
  'service',
  'room',
  'view',
  'general_stay',
  'general_lodging_signal',
  'neutral',
  'neutral_stay',
  'room_positive',
  'service_positive',
  'general_positive',
  'korean_guest_signal',
]);

const positiveSignals = new Set([
  'room_bath_hot_spring',
  'public_bath_hot_spring',
  'private_bath_experience',
  'water_texture',
  'source_flow',
  'facility_wide_onsen_experience',
]);

const conditionalSignals = new Set([
  'booking_confusion',
  'operation_caution',
  'temperature_management',
  'temperature_control',
  'crowding',
  'maintenance_caution',
  'maintenance_cleanliness',
  'room_bath_operational_caution',
  'booking_or_operation_confusion',
  'temperature_access_cleanliness',
]);

const negativeSignals = new Set(['weak_onsen_feeling', 'chlorine_smell']);

const cautionDirectionRules = {
  sister_property_movement: 'mixed',
  aging_or_access: 'mixed',
  operation_recheck: 'mixed',
  cleanliness: 'mixed',
  temperature: 'mixed',
  crowding: 'mixed',
  stairs_access: 'mixed',
  room_coldness: 'mixed',
  insects: 'mixed',
  weak_onsen_feeling: 'negative',
  chlorine: 'negative',
  booking_confusion: 'mixed',
  booking_access: 'mixed',
  operation_caution: 'mixed',
  temperature_control: 'mixed',
  cleanliness_or_age: 'mixed',
  cleanliness_or_safety: 'mixed',
  building_age: 'mixed',
  temperature_access_cleanliness: 'mixed',
  room_no_shower_or_small_wet_area: 'mixed',
  stairs_or_access: 'mixed',
  room_type_mismatch: 'mixed',
  access_or_taxi: 'mixed',
  expectation_or_service_gap: 'mixed',
  pet_friendly_context: 'neutral',
};

const bodyPositivePatterns = [
  /良かった|よかった|最高|満足|大満足|素晴らし|すばらし|気持ち良|気持ちよ|快適|ゆっくり|のんびり|楽し|また.*(泊まり|行き|伺い)|お湯.*(良|よ)|泉質.*(良|よ)|すべすべ|スベスベ|とろとろ|トロトロ|美人の湯|掛け流|かけ流|癒され|満喫|贅沢|絶景|眺め.*良/,
  /good|great|excellent|amazing|wonderful|relax|private onsen|nice bath/i,
  /좋았|만족|최고|훌륭|편안|프라이빗|온천.*좋|물.*좋|다시/,
];

const bodyNegativePatterns = [
  /残念|不満|不快|悪い|悪かった|最悪|がっかり|期待外れ|汚|カビ|臭|狭|寒|ぬるい|ぬるかった|熱すぎ|熱過ぎ|虫|蚊|入れなかった|掃除|壊|工事|騒|不便|分かりにく|わかりにく|危な|痛|古すぎ|冷た|清潔感がない/,
  /bad|dirty|cold|too hot|too small|disappoint|smell|bug|insect|mold|noise/i,
  /아쉽|불편|더럽|춥|차갑|너무 뜨|벌레|냄새|실망|낡|좁/,
];

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
  if (!headerRow) return { headers: [], rows: [] };
  const headers = headerRow.map((header) => header.replace(/^\uFEFF/, ''));
  return {
    headers,
    rows: bodyRows.map((items) => Object.fromEntries(headers.map((header, index) => [header, items[index] ?? '']))),
  };
}

function readCsv(filePath) {
  if (!existsSync(filePath)) return { headers: [], rows: [] };
  return parseCsv(readFileSync(filePath, 'utf8'));
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function toCsv(headers, rows) {
  return `${headers.map(csvEscape).join(',')}\n${rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')).join('\n')}\n`;
}

function splitTags(value) {
  return String(value ?? '')
    .split(/[;|、/]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSignal(tag) {
  const lower = String(tag ?? '').trim().toLowerCase();
  if (!lower || neutralSignals.has(lower)) return '';
  if (signalAliases[lower]) return signalAliases[lower];
  if (lower.includes('room_bath_hot_spring')) return 'room_bath_hot_spring';
  if (lower.includes('public_bath_hot_spring')) return 'public_bath_hot_spring';
  if (lower.includes('private_bath_experience') || lower.includes('family_bath_experience')) return 'private_bath_experience';
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

function truthy(value) {
  return /^(1|true|yes|y)$/i.test(String(value ?? '').trim());
}

function toNumber(value) {
  const match = String(value ?? '').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function bodyText(row) {
  return [row.body, row.body_excerpt, row.title, row.short_paraphrase, row.paraphrase_ko, row.original_keywords_short, row.original_keywords, row.original_keyword]
    .filter(Boolean)
    .join(' ');
}

function bodyPolarity(text) {
  const positive = bodyPositivePatterns.some((pattern) => pattern.test(text));
  const negative = bodyNegativePatterns.some((pattern) => pattern.test(text));
  return { positive, negative };
}

function strongestCautionDirection(tags) {
  const directions = tags.map((tag) => cautionDirectionRules[tag]).filter(Boolean);
  if (directions.includes('negative')) return 'negative';
  if (directions.includes('mixed')) return 'mixed';
  if (directions.includes('neutral')) return 'neutral';
  return '';
}

function inferDirection(row, candidateType) {
  const issueTags = splitTags(row.issue_tags);
  const cautionTags = splitTags(row.caution_tags);
  const signalTags = [
    ...splitTags(row.signal_tags),
    ...splitTags(row.signals),
    ...splitTags(row.keyword_tags),
    ...splitTags(row.matched_keywords).map(normalizeSignal),
  ]
    .map(normalizeSignal)
    .filter(Boolean);
  const hasPositiveSignal = signalTags.some((tag) => positiveSignals.has(tag));
  const hasConditionalSignal = signalTags.some((tag) => conditionalSignals.has(tag));
  const hasNegativeSignal = signalTags.some((tag) => negativeSignals.has(tag));
  const cautionDirection = strongestCautionDirection([...issueTags, ...cautionTags]);
  const text = bodyText(row);
  const polarity = bodyPolarity(text);
  const rating = toNumber(row.bath_score ?? row.bath_rating ?? row.rating);

  if (hasNegativeSignal) {
    return { direction: 'negative', confidence: 'high', rule: 'negative_signal_tag' };
  }

  if (cautionDirection === 'negative') {
    return { direction: hasPositiveSignal || polarity.positive ? 'mixed' : 'negative', confidence: 'high', rule: 'negative_caution_tag' };
  }

  if (polarity.positive && polarity.negative) {
    return { direction: 'mixed', confidence: 'high', rule: 'body_positive_and_negative' };
  }
  if (polarity.negative) {
    if (rating !== null && rating <= 2) return { direction: 'negative', confidence: 'high', rule: 'low_rating_negative_body' };
    return { direction: 'mixed', confidence: 'high', rule: 'body_negative_with_context' };
  }
  if (cautionDirection === 'mixed') {
    return { direction: 'mixed', confidence: 'high', rule: 'caution_or_issue_tag' };
  }
  if (hasConditionalSignal) {
    return { direction: 'mixed', confidence: 'medium', rule: 'conditional_signal_tag' };
  }
  if (polarity.positive) {
    return { direction: 'positive', confidence: 'high', rule: 'body_positive' };
  }
  if (rating !== null && rating >= 4 && hasPositiveSignal) {
    return { direction: 'positive', confidence: candidateType === 'positive_default_is_risky' ? 'low' : 'medium', rule: 'rating_positive_signal' };
  }
  if (hasPositiveSignal) {
    return { direction: 'positive', confidence: candidateType === 'positive_default_is_risky' ? 'low' : 'medium', rule: 'positive_signal_no_caution' };
  }
  return { direction: 'neutral', confidence: 'medium', rule: 'neutral_or_lodging_context' };
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

function latestSamplePath(slug) {
  const dir = findSourceDir(slug);
  if (!dir) return null;
  const files = readdirSync(dir)
    .filter((file) => /^direct_review_sample_index_.*\.csv$/.test(file))
    .sort();
  return files.length ? path.join(dir, files.at(-1)) : null;
}

function seededSlugs() {
  const slugs = new Set();
  for (const file of alreadySeededFiles) {
    const filePath = path.join(outputRoot, file);
    if (!existsSync(filePath)) continue;
    const parsed = JSON.parse(readFileSync(filePath, 'utf8'));
    for (const row of parsed.accommodations ?? []) {
      if (row.slug) slugs.add(row.slug);
    }
  }
  return slugs;
}

function classifyCandidate(slug, rows) {
  const headers = rows[0] ? Object.keys(rows[0]) : [];
  const hasBody = headers.includes('body') || headers.includes('body_excerpt');
  const hasIssueOrCaution = rows.some((row) => String(row.issue_tags ?? row.caution_tags ?? '').trim());
  if (hasBody) return 'body_sentiment_inference_needed';
  if (hasIssueOrCaution) return 'issue_caution_calibration_needed';
  return 'positive_default_is_risky';
}

function selectRows() {
  const seeded = seededSlugs();
  const qaRows = readCsv(qaMatrixPath).rows;
  return qaRows.filter((row) => {
    if (seeded.has(row.slug)) return false;
    if (row.qa_status !== 'needs_direction_backfill') return false;
    if (Number(row.direct_read_recounted) < 300 || Number(row.onsen_related_recounted) < 200 || Number(row.direct_platform_recounted) < 3) return false;
    const samplePath = latestSamplePath(row.slug);
    if (!samplePath) return false;
    const sample = readCsv(samplePath).rows;
    const type = classifyCandidate(row.slug, sample);
    return type === 'body_sentiment_inference_needed' || type === 'issue_caution_calibration_needed';
  });
}

function rulesJson() {
  return {
    version: 'kyushu-direction-backfill-v0.1',
    created_at: seedDate,
    scope: 'Kyushu 3차-B candidates only',
    policy: {
      include_for_seed: ['body_sentiment_inference_needed', 'issue_caution_calibration_needed'],
      exclude_for_seed: ['positive_default_is_risky'],
      low_confidence_rows_are_kept_but_not_enough_to_select_positive_default_candidates: true,
      original_direct_review_sample_index_files_are_not_overwritten: true,
    },
    directions: {
      positive: '온천/욕장 경험이 명확히 좋게 언급되거나, 긍정 본문 표현과 온천 태그가 함께 있는 경우',
      mixed: '장점과 주의점이 같은 행에 함께 있거나, 예약/운영/온도/혼잡 같은 조건부 태그가 붙은 경우',
      negative: '약한 온천감, 염소, 명백한 불만 본문 또는 낮은 평점+부정 본문이 있는 경우',
      neutral: '숙박 맥락 또는 온천과 무관한 행',
    },
    caution_direction_rules: cautionDirectionRules,
    positive_signals: [...positiveSignals].sort(),
    conditional_signals: [...conditionalSignals].sort(),
    negative_signals: [...negativeSignals].sort(),
    body_positive_patterns: bodyPositivePatterns.map((pattern) => pattern.source),
    body_negative_patterns: bodyNegativePatterns.map((pattern) => pattern.source),
  };
}

function createRulesReport(rules) {
  const lines = [
    '# 규슈 3차-B 방향 태그 Backfill 규칙',
    '',
    `작성일: ${seedDate}`,
    '',
    '## 적용 범위',
    '',
    '- 원천 CSV를 덮어쓰지 않고 별도 backfilled CSV를 생성한다.',
    '- 이번 seed 후보는 본문 판정 가능 후보와 issue/caution 태그 캘리브레이션 가능 후보만 포함한다.',
    '- 방향 컬럼도 본문도 없는 positive-default 후보는 계속 보류한다.',
    '',
    '## 방향 정의',
    '',
    `- positive: ${rules.directions.positive}`,
    `- mixed: ${rules.directions.mixed}`,
    `- negative: ${rules.directions.negative}`,
    `- neutral: ${rules.directions.neutral}`,
    '',
    '## 태그 규칙',
    '',
    '| tag | direction |',
    '|---|---|',
    ...Object.entries(rules.caution_direction_rules).map(([tag, direction]) => `| ${tag} | ${direction} |`),
    '',
    '## 제외 원칙',
    '',
    '- `signal_tags`만 있고 본문/issue/caution이 없는 행은 positive로 단정하지 않는다.',
    '- `booking_confusion`, `temperature_control`, `crowding`은 기본적으로 mixed로 처리한다.',
    '- `weak_onsen_feeling`, `chlorine_smell`은 negative 신호로 처리하되, 같은 행에 긍정 욕장 경험이 있으면 mixed가 될 수 있다.',
    '',
  ];
  return `${lines.join('\n')}\n`;
}

async function main() {
  const selected = selectRows();
  const auditRows = [];
  const resultRows = [];
  const rules = rulesJson();

  await mkdir(backfillRoot, { recursive: true });
  await writeFile(ruleJsonPath, JSON.stringify(rules, null, 2));
  await writeFile(ruleReportPath, createRulesReport(rules));

  for (const row of selected) {
    const samplePath = latestSamplePath(row.slug);
    const sample = readCsv(samplePath);
    const candidateType = classifyCandidate(row.slug, sample.rows);
    const outputDir = path.join(backfillRoot, row.slug);
    const outputPath = path.join(outputDir, 'direct_review_sample_index_direction_backfilled_2026-07-08.csv');
    await mkdir(outputDir, { recursive: true });

    const headers = [
      ...sample.headers.filter((header) => !['signal_direction', 'direction_backfill_rule', 'direction_backfill_confidence', 'direction_backfill_candidate_type'].includes(header)),
      'signal_direction',
      'direction_backfill_rule',
      'direction_backfill_confidence',
      'direction_backfill_candidate_type',
    ];
    const counts = { positive: 0, mixed: 0, negative: 0, neutral: 0 };
    const ruleCounts = new Map();
    const filledRows = sample.rows.map((sampleRow) => {
      const inferred = inferDirection(sampleRow, candidateType);
      counts[inferred.direction] += 1;
      ruleCounts.set(inferred.rule, (ruleCounts.get(inferred.rule) ?? 0) + 1);
      return {
        ...sampleRow,
        signal_direction: inferred.direction,
        direction_backfill_rule: inferred.rule,
        direction_backfill_confidence: inferred.confidence,
        direction_backfill_candidate_type: candidateType,
      };
    });

    await writeFile(outputPath, toCsv(headers, filledRows));
    resultRows.push({
      slug: row.slug,
      candidate_type: candidateType,
      direct_read_recounted: row.direct_read_recounted,
      onsen_related_recounted: row.onsen_related_recounted,
      direct_platform_recounted: row.direct_platform_recounted,
      rows: filledRows.length,
      positive: counts.positive,
      mixed: counts.mixed,
      negative: counts.negative,
      neutral: counts.neutral,
      top_rules: [...ruleCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([rule, count]) => `${rule}:${count}`)
        .join('; '),
      source_file: path.relative(repoRoot, samplePath),
      output_file: path.relative(repoRoot, outputPath),
    });

    for (const [index, filledRow] of filledRows.entries()) {
      if (index >= 20) break;
      auditRows.push({
        slug: row.slug,
        row_index: index + 1,
        platform: filledRow.platform ?? filledRow.source ?? '',
        rating: filledRow.rating ?? filledRow.bath_score ?? filledRow.bath_rating ?? '',
        onsen_related: filledRow.onsen_related ?? filledRow.is_onsen_related ?? '',
        signal_tags: filledRow.signal_tags ?? filledRow.signals ?? filledRow.keyword_tags ?? filledRow.matched_keywords ?? '',
        issue_tags: filledRow.issue_tags ?? filledRow.caution_tags ?? '',
        signal_direction: filledRow.signal_direction,
        rule: filledRow.direction_backfill_rule,
        confidence: filledRow.direction_backfill_confidence,
      });
    }
  }

  const auditHeaders = Object.keys(auditRows[0] ?? { slug: '', row_index: '', platform: '', rating: '', onsen_related: '', signal_tags: '', issue_tags: '', signal_direction: '', rule: '', confidence: '' });
  await writeFile(auditCsvPath, toCsv(auditHeaders, auditRows));

  const resultLines = [
    '# 규슈 3차-B 방향값 Backfill 결과',
    '',
    `작성일: ${seedDate}`,
    '',
    '## 요약',
    '',
    `- backfilled 후보: ${resultRows.length}곳`,
    `- 본문 감성/문맥 판정 후보: ${resultRows.filter((row) => row.candidate_type === 'body_sentiment_inference_needed').length}곳`,
    `- issue/caution 캘리브레이션 후보: ${resultRows.filter((row) => row.candidate_type === 'issue_caution_calibration_needed').length}곳`,
    '- positive-default-only 후보는 이번 backfill에서 제외했다.',
    '',
    '## 후보별 방향 분포',
    '',
    '| slug | type | rows | positive | mixed | negative | neutral | top_rules |',
    '|---|---|---:|---:|---:|---:|---:|---|',
    ...resultRows.map((row) => `| ${row.slug} | ${row.candidate_type} | ${row.rows} | ${row.positive} | ${row.mixed} | ${row.negative} | ${row.neutral} | ${row.top_rules} |`),
    '',
    '## 산출물',
    '',
    `- \`${path.relative(repoRoot, ruleJsonPath)}\``,
    `- \`${path.relative(repoRoot, ruleReportPath)}\``,
    `- \`${path.relative(repoRoot, auditCsvPath)}\``,
    `- \`${path.relative(repoRoot, backfillRoot)}/*/direct_review_sample_index_direction_backfilled_2026-07-08.csv\``,
    '',
  ];
  await writeFile(resultReportPath, `${resultLines.join('\n')}\n`);

  console.log(`Backfilled ${resultRows.length} candidates.`);
  console.log(ruleJsonPath);
  console.log(resultReportPath);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
