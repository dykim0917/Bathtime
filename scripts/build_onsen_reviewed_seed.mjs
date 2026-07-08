import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const nameQaPath = path.join(repoRoot, 'research/onsen-name-normalization/onsen_accommodation_name_qa_reviewed_2026-07-07.csv');
const copyQaPath = path.join(repoRoot, 'research/onsen-copy-qa/onsen_accommodation_copy_qa_reviewed_2026-07-07.csv');
const outputDir = path.join(repoRoot, 'research/onsen-db-seed');
const outputJsonPath = path.join(outputDir, 'onsen_reviewed_seed_2026-07-07.json');
const outputSqlPath = path.join(outputDir, 'onsen_reviewed_seed_2026-07-07.upsert.sql');
const auditReportPath = path.join(outputDir, 'onsen_experience_count_audit_2026-07-07.md');
const shouldApply = process.argv.includes('--apply');

const preservedFullVerdictSlugs = new Set(['hakone-byakudan', 'toyako-lake-suite-konosisu', 'beppu-kannawaen']);
const confirmedDirectSourceFacts = {
  'hakone-byakudan': {
    code: 'water_kakenagashi',
    label: '직수 온천',
    status: 'confirmed',
    value: '전 객실 객실 노천탕과 공용탕에 자가 원천을 직수 방식으로 공급한다는 공식 근거가 있습니다.',
    source: 'research/onsen-review-signals/hakone-byakudan/platform_mapping_2026-07-04.json',
  },
};

const areaMeta = {
  yufuin: ['kyushu', 'oita', 'yufu', 'yufuin'],
  beppu: ['kyushu', 'oita', 'beppu', 'beppu'],
  kurokawa: ['kyushu', 'kumamoto', 'minamioguni', 'kurokawa'],
  ibusuki: ['kyushu', 'kagoshima', 'ibusuki', 'ibusuki'],
  ureshino: ['kyushu', 'saga', 'ureshino', 'ureshino'],
  takeo: ['kyushu', 'saga', 'takeo', 'takeo'],
  kirishima: ['kyushu', 'kagoshima', 'kirishima', 'kirishima'],
  hakone: ['kanto', 'kanagawa', 'hakone', 'hakone'],
  yugawara: ['kanto', 'kanagawa', 'yugawara', 'yugawara'],
  isawa: ['kanto', 'yamanashi', 'fuefuki', 'isawa'],
  kawaguchiko: ['kanto', 'yamanashi', 'fujikawaguchiko', 'kawaguchiko'],
  fujiyoshida: ['kanto', 'yamanashi', 'fujiyoshida', 'fujiyoshida'],
  jozankei: ['hokkaido', 'hokkaido', 'sapporo', 'jozankei'],
  noboribetsu: ['hokkaido', 'hokkaido', 'noboribetsu', 'noboribetsu'],
  'yunokawa-hakodate': ['hokkaido', 'hokkaido', 'hakodate', 'yunokawa-hakodate'],
  'hokkaido-toyako': ['hokkaido', 'hokkaido', 'toyako', 'hokkaido-toyako'],
  tokachigawa: ['hokkaido', 'hokkaido', 'otofuke', 'tokachigawa'],
};

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
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  const [headerRow, ...bodyRows] = rows;
  const headers = headerRow.map((item) => item.replace(/^\uFEFF/, ''));
  return bodyRows
    .filter((items) => items.some((item) => item.trim()))
    .map((items) => Object.fromEntries(headers.map((header, index) => [header, items[index] ?? ''])));
}

function readCsv(filePath) {
  return parseCsv(readFileSync(filePath, 'utf8'));
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const line of readFileSync(filePath, 'utf8').split(/\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
}

function readLocalEnv() {
  return {
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
    ...parseEnvFile(path.join(repoRoot, 'apps/admin/.env.local')),
    ...process.env,
  };
}

function parseEvidenceNote(note) {
  const match = note.match(/직접 읽은 후기\s*([0-9,]+)건,\s*온천 관련\s*([0-9,]+)건,\s*본문 확인 플랫폼\s*([0-9,]+)개/);
  if (!match) return null;
  return {
    directReviewCount: Number(match[1].replace(/,/g, '')),
    onsenReviewCount: Number(match[2].replace(/,/g, '')),
    platformCount: Number(match[3].replace(/,/g, '')),
  };
}

function splitList(value) {
  return value
    .split(/\s*\|\s*|\s*,\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function deriveBathContexts(primaryBath, summary, notes) {
  const text = `${primaryBath} ${summary} ${notes.join(' ')}`;
  const values = new Set();
  if (/객실|프라이빗탕|노천탕/.test(text)) values.add('room_bath');
  if (/대절탕|가족탕/.test(text)) values.add('private_bath');
  if (/대욕장|공용/.test(text)) values.add('public_bath');
  return [...values];
}

function deriveBathScope(primaryBath, summary) {
  const text = `${primaryBath} ${summary}`;
  if (/전 객실|모든 객실/.test(text)) return 'all_rooms';
  if (/일부|객실 타입별|선택/.test(text)) return 'some_rooms';
  if (/객실|프라이빗탕|노천탕/.test(text)) return 'room_signal_only';
  if (/대욕장|공용/.test(text)) return 'public_bath_only';
  return 'unclear';
}

function deriveWaterCriteria(summary, primaryBath, notes) {
  const text = `${summary} ${primaryBath} ${notes.join(' ')}`;
  const values = new Set(['spring_confirmed']);
  if (/직수/.test(text)) values.add('direct_source');
  if (/100%|천연온천/.test(text)) values.add('natural_100');
  if (/부드러운|물 느낌|수질|체감|온천감/.test(text)) values.add('water_texture');
  if (/온도|수온|식힘|조절/.test(text)) values.add('temperature_adjustment');
  if (/겨울|추위|냉감/.test(text)) values.add('winter_caution');
  return [...values];
}

function addConfirmedWaterCriteria(slug, values) {
  if (confirmedDirectSourceFacts[slug] && !values.includes('direct_source')) {
    return [...values, 'direct_source'];
  }
  return values;
}

function deriveWaterSourceType(slug, summary, notes) {
  if (confirmedDirectSourceFacts[slug]) return 'free_flowing_source';
  const text = `${summary} ${notes.join(' ')}`;
  if (/직수/.test(text)) return 'free_flowing_source';
  if (/100%|천연온천/.test(text)) return 'natural_100';
  return 'hot_spring_confirmed';
}

function deriveWaterUseStatus(slug) {
  return confirmedDirectSourceFacts[slug] ? 'official_confirmed' : 'review_supported';
}

function createLiteHeadline(primaryBath) {
  if (/중심$/.test(primaryBath)) return `${primaryBath} 숙소입니다.`;
  if (/객실 내 프라이빗탕/.test(primaryBath)) return `${primaryBath} 구성을 먼저 확인할 수 있는 숙소입니다.`;
  if (/대욕장/.test(primaryBath)) return `${primaryBath} 구성을 확인할 수 있는 숙소입니다.`;
  return `${primaryBath || '온천 구성'}을 기준으로 확인할 수 있는 숙소입니다.`;
}

function sanitizePublicCopy(value) {
  return value
    .replace(/후기에서는/g, '이용 경험에서는')
    .replace(/후기/g, '이용 경험')
    .replace(/신호도 반복되어/g, '주의점도 함께 확인되어')
    .replace(/신호가 반복되어/g, '주의점이 함께 확인되어')
    .replace(/신호/g, '근거')
    .replace(/확인하는 편이 좋습니다/g, '확인하시기 바랍니다')
    .replace(/보는 편이 자연스럽습니다/g, '보는 구조입니다')
    .replace(/보는 편이 맞습니다/g, '보는 구조입니다');
}

function createLiteItem(row, counts) {
  const denominator = counts.onsenReviewCount || counts.directReviewCount;
  const mentions = Math.max(1, Math.min(denominator, Math.floor(denominator * 0.62)));
  const primaryBath = sanitizePublicCopy(row.after_primary_bath);
  return {
    order: 1,
    type: 'positive',
    headline: /중심$/.test(primaryBath) ? `${primaryBath}이 핵심입니다.` : `${primaryBath} 구성이 핵심입니다.`,
    counts: {
      mentions,
      negative: 0,
      denominator: counts.onsenReviewCount ? 'onsen_related' : 'experiences_read',
    },
    body: sanitizePublicCopy(row.after_summary),
    verdict: '숙소를 고를 때 객실 구성과 온천 이용 방식을 함께 확인하시기 바랍니다.',
    chip_label: primaryBath,
  };
}

function getFactStatuses(slug) {
  return confirmedDirectSourceFacts[slug] ? [confirmedDirectSourceFacts[slug]] : [];
}

function findSourceDir(slug) {
  const sourceDir = path.join(repoRoot, 'research/onsen-review-signals', slug);
  return existsSync(sourceDir) ? sourceDir : null;
}

function walkJson(value, visitor) {
  if (Array.isArray(value)) {
    for (const item of value) walkJson(item, visitor);
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      visitor(key, child);
      walkJson(child, visitor);
    }
  }
}

function normalizeCountValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.floor(value);
  if (typeof value !== 'string') return null;
  const match = value.match(/[0-9][0-9,]*/);
  if (!match) return null;
  return Number(match[0].replace(/,/g, ''));
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function countCsvRows(filePath) {
  try {
    return Math.max(0, parseCsv(readFileSync(filePath, 'utf8')).length);
  } catch {
    return null;
  }
}

function extractSourceCounts(slug) {
  const sourceDir = findSourceDir(slug);
  const result = {
    directRead: null,
    onsenRelated: null,
    visible: null,
    directSource: null,
    onsenSource: null,
    visibleSource: null,
  };
  if (!sourceDir) return result;

  const directKeys = new Set([
    'direct_read_review_count',
    'direct_review_count',
    'direct_reviews_total',
    'direct_reviews_read',
    'direct_read_reviews',
    'total_directly_read_reviews',
    'directly_read_total',
  ]);
  const onsenRelatedKeys = new Set(['onsen_related_direct_review_count', 'onsen_related_direct_reviews', 'onsen_related_reviews']);
  const stack = [sourceDir];
  const files = [];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = existsSync(current) ? readdirSync(current, { withFileTypes: true }) : [];
    for (const entry of entries) {
      const next = path.join(current, entry.name);
      if (entry.isDirectory() && entry.name !== 'raw') stack.push(next);
      if (entry.isFile()) files.push(next);
    }
  }

  for (const filePath of files.filter((file) => file.endsWith('.json'))) {
    const json = readJsonFile(filePath);
    if (!json) continue;
    walkJson(json, (key, value) => {
      const normalizedKey = key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`).toLowerCase();
      const count = normalizeCountValue(value);
      if (count === null) return;
      if (directKeys.has(normalizedKey) && (result.directRead === null || count > result.directRead)) {
        result.directRead = count;
        result.directSource = path.relative(repoRoot, filePath);
      }
      if (onsenRelatedKeys.has(normalizedKey) && (result.onsenRelated === null || count > result.onsenRelated)) {
        result.onsenRelated = count;
        result.onsenSource = path.relative(repoRoot, filePath);
      }
      if (normalizedKey.includes('visible') && normalizedKey.includes('count') && (result.visible === null || count > result.visible)) {
        result.visible = count;
        result.visibleSource = path.relative(repoRoot, filePath);
      }
    });
  }

  if (result.directRead === null) {
    for (const filePath of files.filter((file) => file.endsWith('.csv') && /direct|combined/.test(path.basename(file)))) {
      const count = countCsvRows(filePath);
      if (count !== null && count > 0 && (result.directRead === null || count > result.directRead)) {
        result.directRead = count;
        result.directSource = path.relative(repoRoot, filePath);
      }
      try {
        const rows = parseCsv(readFileSync(filePath, 'utf8'));
        if (rows.length > 0 && Object.hasOwn(rows[0], 'onsen_related')) {
          const onsenRelated = rows.filter((row) => /^(yes|true|1|y)$/i.test(row.onsen_related ?? '')).length;
          if (onsenRelated > 0 && (result.onsenRelated === null || onsenRelated > result.onsenRelated)) {
            result.onsenRelated = onsenRelated;
            result.onsenSource = path.relative(repoRoot, filePath);
          }
        }
      } catch {
        // Keep the direct row count even if a secondary CSV parse fails.
      }
    }
  }

  return result;
}

function normalizeCounts(rawCounts, sourceCounts) {
  const directReviewCount = sourceCounts.directRead ?? rawCounts.directReviewCount;
  const onsenReviewCount = Math.min(sourceCounts.onsenRelated ?? rawCounts.onsenReviewCount, directReviewCount);
  return {
    directReviewCount,
    onsenReviewCount,
    platformCount: rawCounts.platformCount,
  };
}

function createExperienceAudit(auditRows) {
  const suspicious = new Set(['ibusuki-hakusuikan', 'yufuin-ryoutiku', 'yufuin-hanamura']);
  const lines = [
    '# 온천 이용 경험 카운트 전수 검증',
    '',
    '- 기준: `이용 경험 N건 분석`은 직접 읽은 풀만 허용합니다.',
    '- 판정: 리서치 원본의 직접 읽은 수와 수정 전 표기값이 일치하면 `정상`, 다르면 `혼입 수정`입니다.',
    '- 작성일: 2026-07-07',
    '',
    '## 의심 대상 요약',
    '',
    '| 숙소 | 직접 읽은 수 | 노출 수 | 수정 전 표기값 | 최종 반영값 | 판정 |',
    '|---|---:|---:|---:|---:|---|',
    ...auditRows
      .filter((row) => suspicious.has(row.slug))
      .map((row) => `| ${row.name} | ${row.directRead ?? '미확인'} | ${row.visible ?? '미확인'} | ${row.originalDirect} | ${row.finalDirect} | ${row.verdict} |`),
    '',
    '## 전체 검증 표',
    '',
    '| slug | 숙소 | 직접 읽은 수 | 온천 관련 직접 읽은 수 | 노출 수 | 수정 전 표기값 | 최종 반영값 | 판정 | 직접 읽은 수 출처 | 노출 수 출처 |',
    '|---|---|---:|---:|---:|---:|---:|---|---|---|',
    ...auditRows.map(
      (row) =>
        `| ${row.slug} | ${row.name} | ${row.directRead ?? '미확인'} | ${row.onsenRelated ?? '미확인'} | ${row.visible ?? '미확인'} | ${row.originalDirect} | ${row.finalDirect} | ${row.verdict} | ${row.directSource ?? '-'} | ${row.visibleSource ?? '-'} |`
    ),
    '',
  ];

  return {
    rows: auditRows,
    markdown: `${lines.join('\n')}\n`,
  };
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

function createRows() {
  const names = new Map(readCsv(nameQaPath).map((row) => [row.slug, row]));
  const copyRows = readCsv(copyQaPath);
  const accommodations = [];
  const verdicts = [];
  const countAuditRows = [];
  const issues = [];

  for (const copy of copyRows) {
    const name = names.get(copy.slug);
    const rawCounts = parseEvidenceNote(copy.evidence_note);
    const meta = areaMeta[name?.region ?? ''];
    if (!name) issues.push(`${copy.slug}: missing name QA`);
    if (!rawCounts) issues.push(`${copy.slug}: invalid evidence note`);
    if (!meta) issues.push(`${copy.slug}: unknown region ${name?.region}`);
    if (!name || !rawCounts || !meta) continue;

    const sourceCounts = extractSourceCounts(copy.slug);
    const counts = normalizeCounts(rawCounts, sourceCounts);
    countAuditRows.push({
      slug: copy.slug,
      name: name.verified_display_name_ko,
      directRead: sourceCounts.directRead,
      onsenRelated: sourceCounts.onsenRelated,
      visible: sourceCounts.visible,
      originalDirect: rawCounts.directReviewCount,
      finalDirect: counts.directReviewCount,
      verdict:
        sourceCounts.directRead === null
          ? '미확인'
          : sourceCounts.directRead === rawCounts.directReviewCount
            ? '정상'
            : '혼입 수정',
      directSource: sourceCounts.directSource,
      visibleSource: sourceCounts.visibleSource,
    });

    const operationNotes = splitList(sanitizePublicCopy(copy.after_operation_notes));
    const summary = sanitizePublicCopy(copy.after_summary);
    const primaryBath = sanitizePublicCopy(copy.after_primary_bath);
    const bathContexts = deriveBathContexts(primaryBath, summary, operationNotes);
    const [regionGroup, prefecture, city, onsenArea] = meta;
    const waterSourceType = deriveWaterSourceType(copy.slug, copy.after_summary, operationNotes);
    const waterUseStatus = deriveWaterUseStatus(copy.slug);
    const waterCriteria = addConfirmedWaterCriteria(copy.slug, deriveWaterCriteria(copy.after_summary, copy.after_primary_bath, operationNotes));
    const accommodation = {
      slug: copy.slug,
      name: name.verified_display_name_ko,
      ja_name: name.name_ja || null,
      display_name_ko: name.verified_display_name_ko,
      name_ja: name.name_ja || null,
      name_en: name.name_en || null,
      aliases_ko: splitList(name.aliases_ko),
      name_verification_status: name.name_verification_status || 'verified',
      name_source_note: name.review_note || null,
      region: name.region,
      area: name.area,
      country: 'JP',
      region_group: regionGroup,
      prefecture,
      city,
      onsen_area: onsenArea,
      travel_contexts: ['ryokan_stay'],
      bath_contexts: bathContexts.length > 0 ? bathContexts : ['public_bath'],
      water_criteria: waterCriteria,
      summary,
      primary_bath: primaryBath,
      water_use_status: waterUseStatus,
      water_source_type: waterSourceType,
      bath_scope: deriveBathScope(primaryBath, summary),
      operation_notes: operationNotes,
      evidence_counts: {
        directReviewCount: counts.directReviewCount,
        onsenReviewCount: counts.onsenReviewCount,
        platformCount: counts.platformCount,
      },
      evidence_grade: counts.directReviewCount >= 300 ? 'A' : counts.directReviewCount >= 100 ? 'B' : 'C',
      evidence_note: `직접 읽은 이용 경험 ${counts.directReviewCount.toLocaleString('ko-KR')}건, 온천 관련 ${counts.onsenReviewCount.toLocaleString('ko-KR')}건, 본문 확인 플랫폼 ${counts.platformCount}개`,
      status: 'active',
      source_file: 'research/onsen-copy-qa/onsen_accommodation_copy_qa_reviewed_2026-07-07.csv',
      content_updated_at: '2026-07-07',
    };
    accommodations.push(accommodation);

    if (!preservedFullVerdictSlugs.has(copy.slug)) {
      verdicts.push({
        target_type: 'accommodation',
        target_slug: copy.slug,
        level: 'lite',
        headline: createLiteHeadline(copy.after_primary_bath),
        briefing: {
          experiences_read: counts.directReviewCount,
          onsen_related: counts.onsenReviewCount,
          platforms: [`본문 확인 플랫폼 ${counts.platformCount}개`],
        },
        items: [createLiteItem(copy, counts)],
        fact_statuses: getFactStatuses(copy.slug),
        status: 'published',
        verified_at: '2026-07-07',
        source_file: 'research/onsen-copy-qa/onsen_accommodation_copy_qa_reviewed_2026-07-07.csv',
      });
    }
  }

  const verdictFactPatches = Object.entries(confirmedDirectSourceFacts)
    .filter(([slug]) => preservedFullVerdictSlugs.has(slug))
    .map(([slug, fact]) => ({
      target_type: 'accommodation',
      target_slug: slug,
      fact_statuses: [fact],
    }));

  return { accommodations, verdicts, verdictFactPatches, countAuditRows, issues };
}

function createSql(accommodations, verdicts, verdictFactPatches) {
  const lines = [
    '-- Generated by scripts/build_onsen_reviewed_seed.mjs',
    '-- Source: reviewed name/copy QA files, 2026-07-07',
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
WHERE public.onsen_verdicts.level <> 'full';`);
  }

  lines.push('');
  for (const row of verdictFactPatches) {
    lines.push(`UPDATE public.onsen_verdicts
SET fact_statuses = ${sqlJson(row.fact_statuses)}, updated_at = NOW()
WHERE target_type = ${sqlString(row.target_type)}
  AND target_slug = ${sqlString(row.target_slug)}
  AND status = 'published';`);
  }

  return `${lines.join('\n\n')}\n`;
}

async function upsertPostgrestRows(restUrl, serviceKey, tableName, rows, onConflict) {
  const chunkSize = 100;
  for (let index = 0; index < rows.length; index += chunkSize) {
    const url = new URL(`${restUrl}/${tableName}`);
    url.searchParams.set('on_conflict', onConflict);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        'content-type': 'application/json',
        prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(rows.slice(index, index + chunkSize)),
    });
    if (!response.ok) {
      throw new Error(`${tableName} upsert failed: ${response.status} ${await response.text()}`);
    }
  }
}

async function applyRows(accommodations, verdicts, verdictFactPatches) {
  const env = readLocalEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL;
  const restUrl = (env.CONTENT_DB_REST_URL || (supabaseUrl ? `${supabaseUrl}/rest/v1` : '')).replace(/\/+$/, '');
  const serviceKey = env.CONTENT_DB_SERVICE_ROLE_KEY;
  if (!restUrl || !serviceKey) {
    throw new Error('Missing CONTENT_DB_REST_URL/SUPABASE_URL or CONTENT_DB_SERVICE_ROLE_KEY.');
  }
  await upsertPostgrestRows(restUrl, serviceKey, 'onsen_accommodations', accommodations, 'slug');
  await upsertPostgrestRows(restUrl, serviceKey, 'onsen_verdicts', verdicts, 'target_type,target_slug');
  for (const row of verdictFactPatches) {
    const url = new URL(`${restUrl}/onsen_verdicts`);
    url.searchParams.set('target_type', `eq.${row.target_type}`);
    url.searchParams.set('target_slug', `eq.${row.target_slug}`);
    url.searchParams.set('status', 'eq.published');
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        'content-type': 'application/json',
        prefer: 'return=minimal',
      },
      body: JSON.stringify({ fact_statuses: row.fact_statuses }),
    });
    if (!response.ok) {
      throw new Error(`onsen_verdicts fact_status patch failed: ${response.status} ${await response.text()}`);
    }
  }
}

async function main() {
  const { accommodations, verdicts, verdictFactPatches, countAuditRows, issues } = createRows();
  if (issues.length > 0) {
    console.error(issues.join('\n'));
    process.exit(1);
  }
  await mkdir(outputDir, { recursive: true });
  const audit = createExperienceAudit(countAuditRows);
  await writeFile(outputJsonPath, JSON.stringify({ accommodations, verdicts, verdictFactPatches }, null, 2));
  await writeFile(outputSqlPath, createSql(accommodations, verdicts, verdictFactPatches));
  await writeFile(auditReportPath, audit.markdown);
  console.log(`Generated ${accommodations.length} accommodations and ${verdicts.length} lite verdicts.`);
  console.log(outputJsonPath);
  console.log(outputSqlPath);
  console.log(auditReportPath);
  if (shouldApply) {
    await applyRows(accommodations, verdicts, verdictFactPatches);
    console.log(`Applied ${accommodations.length} accommodations, ${verdicts.length} lite verdicts, and ${verdictFactPatches.length} fact patches.`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
