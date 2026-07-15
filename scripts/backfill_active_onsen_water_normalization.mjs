import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const repoRoot = process.cwd();
const date = '2026-07-09';
const shouldApply = process.argv.includes('--apply');
const outputDir = path.join(repoRoot, 'research/onsen-db-seed');
const outputBase = `active_onsen_water_normalization_backfill_${date}`;
const p0AuditPath = path.join(outputDir, `onsen_water_term_p0_official_audit_${date}.json`);
const priorAuditPath = path.join(outputDir, `onsen_water_term_backfill_audit_${date}.json`);

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const line of readFileSync(filePath, 'utf8').split(/\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    env[match[1]] = value;
  }
  return env;
}

function readConfig() {
  const env = {
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
    ...parseEnvFile(path.join(repoRoot, 'apps/web/.env.local')),
    ...parseEnvFile(path.join(repoRoot, 'apps/admin/.env.local')),
    ...process.env,
  };
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL;
  const restUrl = (env.CONTENT_DB_REST_URL || (supabaseUrl ? `${supabaseUrl}/rest/v1` : '')).replace(/\/+$/, '');
  const apiKey = env.CONTENT_DB_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!restUrl || !apiKey) throw new Error('Missing CONTENT_DB_REST_URL/SUPABASE_URL or CONTENT_DB_SERVICE_ROLE_KEY.');
  return { restUrl, apiKey, host: new URL(restUrl).host };
}

function curl(args, input) {
  const result = spawnSync('curl', args, { input, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`curl failed (${result.status}) ${result.stderr || ''} ${result.stdout || ''}`);
  return result.stdout;
}

function resolveHost(host) {
  const url = `https://dns.google/resolve?name=${encodeURIComponent(host)}&type=A`;
  const body = curl(['--silent', '--show-error', '--fail-with-body', '--max-time', '20', url]);
  const parsed = JSON.parse(body);
  const answer = (parsed.Answer ?? []).find((item) => item.type === 1 && item.data);
  if (!answer) throw new Error(`Could not resolve ${host} via DNS-over-HTTPS.`);
  return answer.data;
}

function requestJson(config, method, url, body) {
  const args = [
    '--silent',
    '--show-error',
    '--fail-with-body',
    '--max-time',
    '60',
    '--resolve',
    `${config.host}:443:${config.resolveIp}`,
    '-X',
    method,
    '-H',
    `apikey: ${config.apiKey}`,
    '-H',
    `authorization: Bearer ${config.apiKey}`,
    '-H',
    'accept: application/json',
    '-H',
    'content-type: application/json',
  ];
  if (body !== undefined) {
    args.push('-H', 'prefer: return=minimal');
    args.push('--data-binary', '@-');
  }
  args.push(url);
  const output = curl(args, body === undefined ? undefined : JSON.stringify(body));
  return output ? JSON.parse(output) : null;
}

function getRows(config, table, params) {
  const url = new URL(`${config.restUrl}/${table}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return requestJson(config, 'GET', url.toString());
}

function patchRows(config, table, filters, body) {
  const url = new URL(`${config.restUrl}/${table}`);
  for (const [key, value] of Object.entries(filters)) url.searchParams.set(key, value);
  requestJson(config, 'PATCH', url.toString(), body);
}

function readJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function bySlug(rows, key = 'slug') {
  return new Map(rows.map((row) => [row[key], row]));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function compact(values) {
  return values.filter((value) => value !== undefined && value !== null && String(value).trim()).map(String);
}

function toNumber(...values) {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function conditionLabels(row) {
  const labels = [];
  if (/confirmed/.test(row?.kasui ?? '')) labels.push('물을 섞어 식힘');
  if (/confirmed/.test(row?.kaon ?? '')) labels.push('데워서 온도 조정');
  if (/confirmed/.test(row?.disinfection ?? '')) labels.push('소독 표기 있음');
  if (labels.length === 0) labels.push('조건 없음');
  return labels;
}

function canonicalMethod(row) {
  if (!row?.water_system) return null;
  if (row.water_system === 'kakenagashi_pure_candidate') return 'kakenagashi_pure';
  if (row.water_system === 'kakenagashi_with_kaon') return 'kakenagashi';
  return row.water_system;
}

function waterJudgment(accommodation, verdict, p0Row, auditRow) {
  if (p0Row) {
    return {
      canonical_water_method: canonicalMethod(p0Row),
      source_status: p0Row.water_system ? 'official_original_text_backfilled' : 'no_method_badge_after_official_audit',
      ui_label_ko: p0Row.water_system?.includes('pure') ? '순수직수' : p0Row.water_system ? '직수' : '무배지',
      conditions: {
        kasui: p0Row.kasui,
        kaon: p0Row.kaon,
        disinfection: p0Row.disinfection,
      },
      condition_labels_ko: conditionLabels(p0Row),
      water_scope: p0Row.scope,
      badge_gate: p0Row.qa_status === 'ready_for_qa' ? 'ready_for_editorial_qa' : p0Row.qa_status,
      official_original_text: p0Row.official_original_text,
      official_source_url: p0Row.official_source_url,
      source_type: p0Row.source_type,
      note_ko: p0Row.note_ko,
      review_used_for_method: false,
      legacy_water_source_type: accommodation.water_source_type,
    };
  }

  const hasLegacyDirect = accommodation.water_source_type === 'free_flowing_source'
    || asArray(accommodation.water_criteria).includes('direct_source')
    || asArray(verdict?.fact_statuses).some((fact) => fact?.code === 'water_kakenagashi' && fact?.status === 'confirmed');

  return {
    canonical_water_method: null,
    source_status: hasLegacyDirect ? 'legacy_direct_source_hold' : 'no_method_badge_basis',
    ui_label_ko: '무배지',
    conditions: {
      kasui: auditRow?.kasui_candidate ?? 'unknown',
      kaon: auditRow?.kaon_candidate ?? 'unknown',
      disinfection: auditRow?.disinfection_candidate ?? 'unknown',
    },
    condition_labels_ko: [],
    water_scope: auditRow?.derived_water_scope ?? accommodation.bath_scope ?? 'unknown',
    badge_gate: hasLegacyDirect ? 'hold_until_official_original_text_and_scope_qa' : 'no_method_badge',
    official_original_text: null,
    official_source_url: null,
    review_used_for_method: false,
    legacy_water_source_type: accommodation.water_source_type,
    audit_group: auditRow?.audit_group,
    audit_priority: auditRow?.audit_priority,
  };
}

const textureLabelMap = {
  mikkul: ['slippery', '미끌미끌'],
  sogeum: ['salt_warmth', '소금탕'],
  yuhwang: ['sulfur', '유황탕'],
  tansan: ['carbonated', '탄산온천'],
};

function textureFilters(accommodation, auditRow, textureCount) {
  const filters = [];
  const rawCandidates = compact(String(auditRow?.texture_filter_candidates ?? '').split(/[;,|]/).map((value) => value.trim()));
  for (const candidate of rawCandidates) {
    const [code, label] = textureLabelMap[candidate] ?? [candidate, candidate];
    filters.push({
      code,
      ui_label_ko: label,
      official_basis: '기존 active 감사 큐의 공식 수질 후보',
      direct_review_mention_count: textureCount,
      exposure_status: textureCount > 0 ? 'candidate_with_count' : 'official_basis_only_hold',
      display_rule: '감촉 필터는 직접 후기 카운트와 함께만 노출합니다.',
    });
  }
  if (filters.length === 0 && textureCount > 0) {
    filters.push({
      code: 'water_texture_unclassified',
      ui_label_ko: '물의 감촉',
      official_basis: '공식 수질 필터 미분류. 이용 경험 카운트만 보존합니다.',
      direct_review_mention_count: textureCount,
      exposure_status: 'review_count_only_hold',
      display_rule: '공식 수질과 연결되기 전에는 감촉 필터로 노출하지 않습니다.',
    });
  }
  return filters;
}

function colorModel(auditRow) {
  const candidate = auditRow?.water_color_candidate ?? 'unknown';
  if (candidate === 'hakutaku_candidate') {
    return {
      detail_label_ko: '백탁',
      filter_candidate: 'hakutaku',
      status: 'needs_official_color_qa_before_filter',
      review_color_mentions: {},
      display_rule: '색 필터는 공식 공시·공식 사진·시설 안내 근거가 있을 때만 노출합니다.',
    };
  }
  if (candidate === 'brown_candidate') {
    return {
      detail_label_ko: '갈색빛',
      filter_candidate: 'brown',
      status: 'needs_official_color_qa_before_filter',
      review_color_mentions: {},
      display_rule: '색 필터는 공식 공시·공식 사진·시설 안내 근거가 있을 때만 노출합니다.',
    };
  }
  if (candidate === 'clear_detail_only') {
    return {
      detail_label_ko: '투명',
      filter_candidate: null,
      status: 'detail_only',
      review_color_mentions: {},
      display_rule: '투명은 필터 칩으로 팔지 않고 상세 사실로만 보존합니다.',
    };
  }
  return {
    detail_label_ko: null,
    filter_candidate: null,
    status: 'not_confirmed',
    review_color_mentions: {},
    display_rule: '색 근거 없음. 후기 색 언급만으로 색 필터를 부여하지 않습니다.',
  };
}

function waterSensoryJudgment(accommodation, auditRow) {
  const counts = accommodation.evidence_counts ?? {};
  const textureCount = toNumber(counts.waterTextureMentionCount, auditRow?.water_texture_mentions);
  return {
    official_spring_quality: {
      japanese: auditRow?.spring_types_candidate || null,
      korean_note: auditRow?.spring_types_candidate ? '공식 수질 후보 있음' : null,
      basis: auditRow?.spring_types_candidate ? 'active backfill audit' : 'not_classified',
    },
    texture_filters: textureFilters(accommodation, auditRow, textureCount),
    official_color: colorModel(auditRow),
    review_signal_counts: {
      water_texture: {
        mention_count: textureCount,
        count_source: counts.waterTextureMentionCount !== undefined ? 'evidence_counts' : 'backfill_audit',
      },
      chlorine_smell: {
        mention_count: toNumber(counts.chlorineSmellMentionCount),
        count_source: 'evidence_counts',
      },
      weak_onsen_feeling: {
        mention_count: toNumber(counts.weakOnsenFeelingMentionCount),
        count_source: 'evidence_counts',
      },
    },
    caution_counts: {
      caution_mention_count: toNumber(counts.cautionMentionCount),
    },
    model_gaps: {
      water_color_signal_type_exists: false,
      note: '기존 active 데이터는 색 태그가 별도 모델로 수집되지 않은 경우가 많아 공식 색 근거만 보존합니다.',
    },
  };
}

function buildPatches(accommodations, verdicts, p0Map, auditMap) {
  const verdictMap = bySlug(verdicts, 'target_slug');
  return accommodations.map((accommodation) => {
    const verdict = verdictMap.get(accommodation.slug);
    const auditRow = auditMap.get(accommodation.slug);
    const p0Row = p0Map.get(accommodation.slug);
    const judgment = waterJudgment(accommodation, verdict, p0Row, auditRow);
    const sensory = waterSensoryJudgment(accommodation, auditRow);
    const existingCounts = accommodation.evidence_counts ?? {};
    const existingBriefing = verdict?.briefing ?? {};
    const evidence_counts = {
      ...existingCounts,
      waterJudgment: judgment,
      waterSensoryJudgment: sensory,
      waterNormalizationBackfill: {
        generated_at: date,
        source: p0Row ? 'p0_official_audit' : 'active_backfill_audit',
        applied_at: shouldApply ? date : null,
      },
    };
    const briefing = {
      ...existingBriefing,
      water_judgment: judgment,
      water_sensory_judgment: sensory,
      water_normalization_backfill: {
        generated_at: date,
        source: p0Row ? 'p0_official_audit' : 'active_backfill_audit',
        applied_at: shouldApply ? date : null,
      },
    };
    return {
      slug: accommodation.slug,
      name: accommodation.display_name_ko ?? accommodation.name,
      accommodation_status: accommodation.status,
      verdict_status: verdict?.status ?? null,
      water_source_type: accommodation.water_source_type,
      canonical_water_method: judgment.canonical_water_method,
      badge_gate: judgment.badge_gate,
      texture_filter_count: sensory.texture_filters.length,
      water_texture_mentions: sensory.review_signal_counts.water_texture.mention_count,
      p0_official_backfill: Boolean(p0Row),
      audit_priority: auditRow?.audit_priority ?? '',
      evidence_counts,
      briefing,
    };
  });
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeOutputs(patches, applied) {
  mkdirSync(outputDir, { recursive: true });
  const jsonPath = path.join(outputDir, `${outputBase}.json`);
  const csvPath = path.join(outputDir, `${outputBase}.csv`);
  const mdPath = path.join(outputDir, `${outputBase}.md`);
  const summary = {
    generated_at: date,
    applied,
    row_count: patches.length,
    p0_official_backfill_count: patches.filter((row) => row.p0_official_backfill).length,
    method_counts: Object.fromEntries(
      [...patches.reduce((map, row) => map.set(row.canonical_water_method ?? 'null', (map.get(row.canonical_water_method ?? 'null') ?? 0) + 1), new Map()).entries()].sort()
    ),
    patches,
  };
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`);

  const headers = ['slug', 'name', 'canonical_water_method', 'badge_gate', 'water_source_type', 'texture_filter_count', 'water_texture_mentions', 'p0_official_backfill', 'audit_priority'];
  const lines = [
    headers.join(','),
    ...patches.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ];
  writeFileSync(csvPath, `${lines.join('\n')}\n`);

  const reportRows = patches.slice(0, 40).map((row) =>
    `| \`${row.slug}\` | ${row.name} | ${row.canonical_water_method ?? 'null'} | ${row.badge_gate} | ${row.water_texture_mentions} | ${row.p0_official_backfill ? 'Y' : ''} |`
  );
  const md = `# Active 온천수 정규화 백필 - ${date}

## 결과

- 대상 active 숙소: ${patches.length}건
- DB 적용: ${applied ? '완료' : '미적용'}
- P0 공식 원문 감사 기반 방식 백필: ${summary.p0_official_backfill_count}건
- 방식 분포: ${Object.entries(summary.method_counts).map(([key, count]) => `${key} ${count}`).join(', ')}

## 정책

- 기존 \`water_source_type\`, \`water_criteria\`, \`status\`는 변경하지 않습니다.
- 새 모델은 \`onsen_accommodations.evidence_counts.waterJudgment\`, \`waterSensoryJudgment\`에 병합합니다.
- published verdict에는 기존 \`briefing\`을 보존하면서 \`water_judgment\`, \`water_sensory_judgment\`를 병합합니다.
- P0 공식 감사가 없는 레거시 직수 후보는 \`canonical_water_method = null\`과 \`badge_gate = hold_until_official_original_text_and_scope_qa\`로 보류합니다.

## 미리보기

| slug | 숙소명 | 방식 | gate | 감촉 언급 | P0 |
| --- | --- | --- | --- | ---: | --- |
${reportRows.join('\n')}
`;
  writeFileSync(mdPath, md);
  return { jsonPath, csvPath, mdPath };
}

function applyPatches(config, patches) {
  for (const patch of patches) {
    patchRows(config, 'onsen_accommodations', { slug: `eq.${patch.slug}` }, { evidence_counts: patch.evidence_counts });
    patchRows(config, 'onsen_verdicts', { target_type: 'eq.accommodation', target_slug: `eq.${patch.slug}` }, { briefing: patch.briefing });
  }
}

function verifyApplied(config, expectedCount) {
  const rows = getRows(config, 'onsen_accommodations', {
    select: 'slug,evidence_counts',
    status: 'eq.active',
    limit: '1000',
  });
  const count = rows.filter((row) => row.evidence_counts?.waterNormalizationBackfill?.generated_at === date).length;
  if (count !== expectedCount) throw new Error(`Expected ${expectedCount} accommodation backfills, got ${count}`);

  const verdicts = getRows(config, 'onsen_verdicts', {
    select: 'target_slug,briefing',
    target_type: 'eq.accommodation',
    status: 'eq.published',
    limit: '1000',
  });
  const verdictCount = verdicts.filter((row) => row.briefing?.water_normalization_backfill?.generated_at === date).length;
  if (verdictCount < expectedCount) throw new Error(`Expected at least ${expectedCount} verdict backfills, got ${verdictCount}`);
  return { accommodation_count: count, verdict_count: verdictCount };
}

function main() {
  const config = readConfig();
  config.resolveIp = resolveHost(config.host);

  const accommodations = getRows(config, 'onsen_accommodations', {
    select: 'slug,name,display_name_ko,summary,water_use_status,water_source_type,water_criteria,bath_scope,bath_contexts,operation_notes,evidence_counts,evidence_grade,status,source_file',
    status: 'eq.active',
    order: 'slug.asc',
    limit: '1000',
  });
  const verdicts = getRows(config, 'onsen_verdicts', {
    select: 'target_slug,status,level,briefing,items,fact_statuses,source_file',
    target_type: 'eq.accommodation',
    status: 'eq.published',
    limit: '1000',
  });

  const p0Map = bySlug(readJson(p0AuditPath, { rows: [] }).rows ?? []);
  const auditMap = bySlug(readJson(priorAuditPath, { rows: [] }).rows ?? []);
  const patches = buildPatches(accommodations, verdicts, p0Map, auditMap);
  const output = writeOutputs(patches, false);

  if (shouldApply) {
    applyPatches(config, patches);
    const verify = verifyApplied(config, patches.length);
    writeOutputs(patches, true);
    console.log(`Applied active normalization backfill: accommodations ${verify.accommodation_count}, verdicts ${verify.verdict_count}`);
  } else {
    console.log(`Generated active normalization backfill patches: ${patches.length}`);
  }
  console.log(`Wrote ${path.relative(repoRoot, output.jsonPath)}`);
  console.log(`Wrote ${path.relative(repoRoot, output.csvPath)}`);
  console.log(`Wrote ${path.relative(repoRoot, output.mdPath)}`);
}

main();
