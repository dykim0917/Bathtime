import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const outputDir = path.join(repoRoot, 'research/onsen-db-seed');
const outputDate = '2026-07-09';

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

function readEnv() {
  return {
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
    ...parseEnvFile(path.join(repoRoot, 'apps/web/.env.local')),
    ...parseEnvFile(path.join(repoRoot, 'apps/admin/.env.local')),
    ...process.env,
  };
}

function dbConfig() {
  const env = readEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL;
  const restUrl = (env.CONTENT_DB_REST_URL || (supabaseUrl ? `${supabaseUrl}/rest/v1` : '')).replace(/\/+$/, '');
  const serviceKey = env.CONTENT_DB_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!restUrl || !serviceKey) throw new Error('Missing CONTENT_DB_REST_URL/SUPABASE_URL or CONTENT_DB_SERVICE_ROLE_KEY.');
  return { restUrl, serviceKey };
}

async function requestJson(config, table, params = {}) {
  const url = new URL(`${config.restUrl}/${table}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    headers: {
      apikey: config.serviceKey,
      authorization: `Bearer ${config.serviceKey}`,
      accept: 'application/json',
    },
  });
  if (!response.ok) throw new Error(`${table} read failed: ${response.status} ${await response.text()}`);
  return response.json();
}

function readReconciliationIndex() {
  const files = [
    'onsen_source_flow_reconciliation_2026-07-08.json',
    'onsen_source_flow_reconciliation_2nd_2026-07-08.json',
  ];
  const index = new Map();
  for (const fileName of files) {
    const filePath = path.join(outputDir, fileName);
    if (!existsSync(filePath)) continue;
    const parsed = JSON.parse(readFileSync(filePath, 'utf8'));
    for (const item of parsed.confirmed_updates || []) {
      index.set(item.slug, {
        status: 'confirmed_update',
        fileName,
        evidenceType: item.evidence_type || '',
        evidenceKeyword: item.evidence_keyword || '',
        sourceFile: item.source_file || '',
      });
    }
    for (const item of parsed.manual_review_candidates || []) {
      index.set(item.slug, {
        status: item.status || 'manual_review_candidate',
        fileName,
        evidenceType: 'manual_review_candidate',
        evidenceKeyword: item.reason || '',
        sourceFile: '',
      });
    }
  }
  return index;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function compactJoin(values, separator = ' | ') {
  return values.filter((value) => value !== undefined && value !== null && String(value).trim()).map(String).join(separator);
}

function jsonText(value) {
  return JSON.stringify(value ?? '', null, 0);
}

function hasJapaneseWaterKeyword(text) {
  return /源泉|かけ流し|掛け流し|掛流し|循環|加水|加温|消毒|白濁|乳白|にごり|濁り湯|鉄分|含鉄|炭酸水素|硫黄|塩化物|硫酸塩|二酸化炭素/.test(text);
}

function deriveScope(accommodation) {
  const bathScope = accommodation.bath_scope || 'unclear';
  const contexts = asArray(accommodation.bath_contexts);
  if (bathScope === 'public_bath_only') return { scope: 'public_bath', confidence: 'legacy_scope' };
  if (bathScope === 'all_rooms') return { scope: 'room_bath', confidence: 'legacy_all_rooms' };
  if (bathScope === 'some_rooms') return { scope: 'some_rooms', confidence: 'legacy_some_rooms' };
  if (contexts.includes('private_bath') && !contexts.includes('room_bath')) return { scope: 'private_bath', confidence: 'context_inferred' };
  if (bathScope === 'room_signal_only') return { scope: 'room_bath', confidence: 'review_signal_only' };
  return { scope: 'unknown', confidence: 'unknown' };
}

function deriveSystemCandidate(accommodation, facts, rec) {
  const sourceType = accommodation.water_source_type;
  const text = compactJoin([
    accommodation.water_use_status,
    sourceType,
    jsonText(accommodation.water_criteria),
    jsonText(accommodation.operation_notes),
    jsonText(facts),
    rec?.evidenceKeyword,
  ]);
  if (sourceType === 'natural_100') {
    return {
      value: 'null',
      confidence: 'deprecated_natural_100',
      reason: 'natural_100 is not a method badge under the new term guide',
    };
  }
  if (/循環ろ過|循環式|循環/.test(text)) {
    return {
      value: 'junkan',
      confidence: /official|公式|source|http|confirmed/.test(text) ? 'official_or_source_keyword' : 'keyword_only',
      reason: 'circulation keyword found',
    };
  }
  if (/無加水|無加温|無循環/.test(text) && /源泉(?:100%|百%|１００％)|源泉かけ流し|源泉掛け流し|掛け流し|かけ流し/.test(text)) {
    return {
      value: 'kakenagashi_pure',
      confidence: 'candidate_needs_raw_official_text',
      reason: 'pure-source keywords found but raw official preservation still needs audit',
    };
  }
  if (sourceType === 'free_flowing_source' || /源泉かけ流し|源泉掛け流し|掛け流し|かけ流し|掛流し|direct_source|free_flowing_source/.test(text)) {
    return {
      value: 'kakenagashi',
      confidence: sourceType === 'free_flowing_source' ? 'legacy_official_candidate' : 'keyword_candidate',
      reason: 'kakenagashi/free-flowing source signal found',
    };
  }
  return {
    value: 'null',
    confidence: 'no_method_badge_basis',
    reason: 'no official method badge basis in current DB fields',
  };
}

function deriveCondition(field, text) {
  if (field === 'kasui') {
    if (/加水|물을 섞|물.*더/.test(text)) return 'confirmed';
    if (/無加水|가수.*없|물을 더하지/.test(text)) return 'not_confirmed';
  }
  if (field === 'kaon') {
    if (/加温|가온|데워|겨울철 가온/.test(text)) return 'confirmed';
    if (/無加温|가온.*없|데우지도/.test(text)) return 'not_confirmed';
  }
  if (field === 'disinfection') {
    if (/消毒|소독|塩素|염소|カルキ/.test(text)) return 'confirmed';
    if (/消毒なし|消毒.*なし|소독.*없/.test(text)) return 'not_confirmed';
  }
  return 'unknown';
}

function deriveSpringAndTexture(text) {
  const springTypes = new Set();
  const textureFilters = new Set();
  if (/炭酸水素塩泉|탄산수소염천/.test(text)) {
    springTypes.add('炭酸水素塩泉');
    textureFilters.add('mikkul');
  }
  if (/アルカリ性単純温泉|알칼리성 단순온천/.test(text)) {
    springTypes.add('アルカリ性単純温泉');
    textureFilters.add('mikkul');
  }
  if (/塩化物泉|염화물천/.test(text)) {
    springTypes.add('塩化物泉');
    textureFilters.add('sogeum');
  }
  if (/硫酸塩泉|황산염천/.test(text)) {
    springTypes.add('硫酸塩泉');
    textureFilters.add('sogeum');
  }
  if (/硫黄泉|硫黄|유황천|유황/.test(text)) {
    springTypes.add('硫黄泉');
    textureFilters.add('yuhwang');
  }
  if (/二酸化炭素泉|이산화탄소천|炭酸泉/.test(text)) {
    springTypes.add('二酸化炭素泉');
    textureFilters.add('tansan');
  }
  if (/含鉄泉|鉄分|함철천|철분/.test(text)) {
    springTypes.add('含鉄泉');
  }
  return { springTypes: [...springTypes], textureFilters: [...textureFilters] };
}

function deriveWaterColor(text) {
  if (/白濁|乳白|にごり湯|濁り湯|백탁|유백색|니고리/.test(text)) return 'hakutaku_candidate';
  if (/褐色|茶褐色|赤褐色|鉄分|含鉄|갈색|적갈색|철분/.test(text)) return 'brown_candidate';
  if (/透明|무색투명|투명/.test(text)) return 'clear_detail_only';
  return 'unknown';
}

function factCodes(facts) {
  return [...new Set(facts.map((fact) => fact?.code).filter(Boolean))];
}

function officialTextStatus(facts, rec) {
  const text = compactJoin([
    ...facts.map((fact) => compactJoin([fact?.label, fact?.value, fact?.source], ' ')),
    rec?.evidenceKeyword,
  ]);
  if (!text) return 'missing';
  if (hasJapaneseWaterKeyword(text)) return 'keyword_or_original_fragment_present';
  return 'korean_paraphrase_only';
}

function officialSourceStatus(facts, rec, accommodation) {
  const sources = [
    ...facts.map((fact) => fact?.source).filter(Boolean),
    rec?.sourceFile,
    accommodation.source_file,
  ];
  if (sources.some((source) => /^https?:\/\//.test(source))) return 'direct_url_present';
  if (sources.some(Boolean)) return 'local_source_file_only';
  return 'missing';
}

function auditGroup(accommodation, systemCandidate, textStatus, scopeInfo, facts, rec) {
  if (accommodation.water_source_type === 'natural_100') return 'C_deprecate_natural_100';
  if (accommodation.water_source_type === 'free_flowing_source') {
    if (textStatus === 'keyword_or_original_fragment_present' && scopeInfo.scope !== 'unknown') return 'B_official_method_candidate_needs_scope_conditions';
    return 'B_badge_hold_needs_original_scope_audit';
  }
  if (factCodes(facts).includes('water_kakenagashi') || rec?.status === 'confirmed_update') {
    return 'B_legacy_kakenagashi_fact_needs_new_mapping';
  }
  if (systemCandidate.value !== 'null') return 'B_method_keyword_needs_official_audit';
  if (asArray(accommodation.water_criteria).includes('water_texture')) return 'C_review_texture_only_no_method_badge';
  return 'D_no_method_badge_keep_hot_spring_or_unknown';
}

function priorityFor(accommodation, group, evidenceCounts) {
  if (group.startsWith('B_') || group.startsWith('C_deprecate')) return 'P0';
  if (accommodation.status === 'active' && accommodation.evidence_grade === 'A') return 'P1';
  if ((Number(evidenceCounts.waterTextureMentionCount) || 0) >= 50) return 'P2';
  return 'P3';
}

function nextAction(group, systemCandidate, scopeInfo) {
  if (group === 'C_deprecate_natural_100') return 'natural_100 badge/filter use should be removed; keep only hot-spring fact if officially supported';
  if (group === 'B_official_method_candidate_needs_scope_conditions') {
    return `verify raw official text, preserve original wording, split scope=${scopeInfo.scope}, and fill kasui/kaon/disinfection before rendering ${systemCandidate.value}`;
  }
  if (group === 'B_badge_hold_needs_original_scope_audit') {
    return 'hold existing free-flowing badge until raw official wording and bath scope are preserved';
  }
  if (group === 'B_legacy_kakenagashi_fact_needs_new_mapping') {
    return 'map legacy water_kakenagashi fact to new water_system only after raw official source and scope check';
  }
  if (group === 'B_method_keyword_needs_official_audit') {
    return 'official source audit required before assigning method badge';
  }
  if (group === 'C_review_texture_only_no_method_badge') {
    return 'do not render method badge; keep review texture counts and audit spring/color filters if useful';
  }
  return 'no method badge; keep hot-spring confirmation only unless official method evidence is added';
}

function csvEscape(value) {
  const text = value === undefined || value === null ? '' : String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(filePath, rows, columns) {
  const lines = [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(',')),
  ];
  writeFileSync(filePath, `${lines.join('\n')}\n`);
}

function countBy(rows, key) {
  const counts = new Map();
  for (const row of rows) counts.set(row[key], (counts.get(row[key]) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function markdownTable(entries, headers) {
  const rows = [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...entries.map((entry) => `| ${headers.map((header) => entry[header] ?? '').join(' | ')} |`),
  ];
  return rows.join('\n');
}

async function main() {
  const config = dbConfig();
  const [accommodations, verdicts] = await Promise.all([
    requestJson(config, 'onsen_accommodations', {
      select: 'slug,name,ja_name,region,area,country,region_group,prefecture,city,onsen_area,travel_contexts,bath_contexts,water_criteria,summary,primary_bath,water_use_status,water_source_type,bath_scope,operation_notes,evidence_counts,evidence_grade,evidence_note,status,source_file,content_updated_at',
      status: 'eq.active',
      limit: '1000',
    }),
    requestJson(config, 'onsen_verdicts', {
      select: 'target_type,target_slug,level,headline,briefing,items,fact_statuses,status,verified_at,source_file',
      status: 'eq.published',
      limit: '1000',
    }),
  ]);

  const verdictBySlug = new Map(verdicts.map((verdict) => [`${verdict.target_type}:${verdict.target_slug}`, verdict]));
  const recIndex = readReconciliationIndex();
  const rows = accommodations.map((accommodation) => {
    const verdict = verdictBySlug.get(`accommodation:${accommodation.slug}`) || {};
    const facts = asArray(verdict.fact_statuses);
    const rec = recIndex.get(accommodation.slug);
    const scopeInfo = deriveScope(accommodation);
    const textBlob = compactJoin([
      jsonText(accommodation),
      jsonText(verdict),
      rec?.evidenceKeyword,
    ]);
    const systemCandidate = deriveSystemCandidate(accommodation, facts, rec);
    const conditions = {
      kasui: deriveCondition('kasui', textBlob),
      kaon: deriveCondition('kaon', textBlob),
      disinfection: deriveCondition('disinfection', textBlob),
    };
    const spring = deriveSpringAndTexture(textBlob);
    const textStatus = officialTextStatus(facts, rec);
    const sourceStatus = officialSourceStatus(facts, rec, accommodation);
    const group = auditGroup(accommodation, systemCandidate, textStatus, scopeInfo, facts, rec);
    const evidenceCounts = accommodation.evidence_counts || {};
    const priority = priorityFor(accommodation, group, evidenceCounts);
    const refs = [
      accommodation.source_file,
      verdict.source_file,
      ...facts.map((fact) => fact?.source).filter(Boolean),
      rec?.sourceFile,
      rec?.fileName,
    ];

    return {
      slug: accommodation.slug,
      name_ko: accommodation.name,
      name_ja: accommodation.ja_name || '',
      region_group: accommodation.region_group || '',
      prefecture: accommodation.prefecture || '',
      onsen_area: accommodation.onsen_area || accommodation.region || '',
      area_label: accommodation.area || '',
      status: accommodation.status || '',
      verdict_level: verdict.level || '',
      current_water_use_status: accommodation.water_use_status || '',
      current_water_source_type: accommodation.water_source_type || '',
      current_water_criteria: asArray(accommodation.water_criteria).join(';'),
      current_bath_scope: accommodation.bath_scope || '',
      current_bath_contexts: asArray(accommodation.bath_contexts).join(';'),
      derived_water_scope: scopeInfo.scope,
      derived_scope_confidence: scopeInfo.confidence,
      legacy_fact_codes: factCodes(facts).join(';'),
      prior_reconciliation_status: rec?.status || '',
      prior_reconciliation_keyword: rec?.evidenceKeyword || '',
      new_water_system_candidate: systemCandidate.value,
      water_system_candidate_confidence: systemCandidate.confidence,
      candidate_reason: systemCandidate.reason,
      kasui_candidate: conditions.kasui,
      kaon_candidate: conditions.kaon,
      disinfection_candidate: conditions.disinfection,
      spring_types_candidate: spring.springTypes.join(';'),
      texture_filter_candidates: spring.textureFilters.join(';'),
      water_color_candidate: deriveWaterColor(textBlob),
      official_source_status: sourceStatus,
      official_text_status: textStatus,
      official_water_text_snippet: compactJoin([
        ...facts.map((fact) => fact?.value).filter(Boolean),
        rec?.evidenceKeyword,
        ...asArray(accommodation.operation_notes),
      ], ' / ').slice(0, 500),
      direct_review_count: evidenceCounts.directReviewCount || '',
      onsen_review_count: evidenceCounts.onsenReviewCount || '',
      water_texture_mentions: evidenceCounts.waterTextureMentionCount || '',
      evidence_grade: accommodation.evidence_grade || '',
      audit_group: group,
      audit_priority: priority,
      next_action: nextAction(group, systemCandidate, scopeInfo),
      source_refs: [...new Set(refs.filter(Boolean))].join('; '),
    };
  }).sort((a, b) => {
    const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
    return (priorityOrder[a.audit_priority] ?? 9) - (priorityOrder[b.audit_priority] ?? 9)
      || a.audit_group.localeCompare(b.audit_group)
      || a.region_group.localeCompare(b.region_group)
      || a.slug.localeCompare(b.slug);
  });

  mkdirSync(outputDir, { recursive: true });
  const csvPath = path.join(outputDir, `onsen_water_term_backfill_audit_${outputDate}.csv`);
  const jsonPath = path.join(outputDir, `onsen_water_term_backfill_audit_${outputDate}.json`);
  const reportPath = path.join(outputDir, `onsen_water_term_backfill_audit_${outputDate}.md`);
  const columns = [
    'slug',
    'name_ko',
    'name_ja',
    'region_group',
    'prefecture',
    'onsen_area',
    'area_label',
    'status',
    'verdict_level',
    'current_water_use_status',
    'current_water_source_type',
    'current_water_criteria',
    'current_bath_scope',
    'current_bath_contexts',
    'derived_water_scope',
    'derived_scope_confidence',
    'legacy_fact_codes',
    'prior_reconciliation_status',
    'prior_reconciliation_keyword',
    'new_water_system_candidate',
    'water_system_candidate_confidence',
    'candidate_reason',
    'kasui_candidate',
    'kaon_candidate',
    'disinfection_candidate',
    'spring_types_candidate',
    'texture_filter_candidates',
    'water_color_candidate',
    'official_source_status',
    'official_text_status',
    'official_water_text_snippet',
    'direct_review_count',
    'onsen_review_count',
    'water_texture_mentions',
    'evidence_grade',
    'audit_group',
    'audit_priority',
    'next_action',
    'source_refs',
  ];
  writeCsv(csvPath, rows, columns);
  writeFileSync(jsonPath, JSON.stringify({
    generated_at: `${outputDate}T00:00:00+09:00`,
    source: 'Supabase active onsen_accommodations + published onsen_verdicts',
    row_count: rows.length,
    rows,
  }, null, 2));

  const groupSummary = countBy(rows, 'audit_group').map(([group, count]) => ({ group, count }));
  const prioritySummary = countBy(rows, 'audit_priority').map(([priority, count]) => ({ priority, count }));
  const sourceTypeSummary = countBy(rows, 'current_water_source_type').map(([water_source_type, count]) => ({ water_source_type, count }));
  const systemSummary = countBy(rows, 'new_water_system_candidate').map(([water_system_candidate, count]) => ({ water_system_candidate, count }));
  const p0Rows = rows.filter((row) => row.audit_priority === 'P0');
  const p0Preview = p0Rows.slice(0, 30).map((row) => ({
    slug: row.slug,
    name: row.name_ko,
    current: row.current_water_source_type,
    candidate: row.new_water_system_candidate,
    group: row.audit_group,
    next: row.next_action,
  }));

  const report = `# 온천수 용어 백필 감사 리포트 - ${outputDate}

## 범위

- 기준 문서: \`docs/03-content/onsen-term-guide.md\`
- 데이터 소스: Supabase \`onsen_accommodations(status=active)\` + \`onsen_verdicts(status=published)\`
- 감사 대상: ${rows.length}건
- DB 쓰기: 없음. 감사 큐만 생성.

## 핵심 판정

기존 데이터는 전수 재수집보다 백필 감사가 맞습니다. 현재 \`free_flowing_source\`는 20건뿐이지만, 새 기준에서는 이 값도 바로 \`순수직수\`로 이전하면 안 됩니다. 공식 원문, scope, 가수·가온·소독 조건을 분리해 보존한 뒤에만 \`kakenagashi_pure\`, \`kakenagashi\`, \`junkan\`을 렌더링해야 합니다.

## 현재 레거시 분포

${markdownTable(sourceTypeSummary, ['water_source_type', 'count'])}

## 새 방식 후보 분포

${markdownTable(systemSummary, ['water_system_candidate', 'count'])}

주의: \`new_water_system_candidate\`는 자동 배지 확정값이 아닙니다. 공식 원문과 scope 보존을 위한 감사 후보값입니다.

## 감사 그룹

${markdownTable(groupSummary, ['group', 'count'])}

## 우선순위

${markdownTable(prioritySummary, ['priority', 'count'])}

## P0 미리보기

${markdownTable(p0Preview, ['slug', 'name', 'current', 'candidate', 'group', 'next'])}

## 산출물

- \`${path.relative(repoRoot, csvPath)}\`
- \`${path.relative(repoRoot, jsonPath)}\`
- \`${path.relative(repoRoot, reportPath)}\`

## 다음 작업

1. P0부터 공식 원문과 scope를 확인합니다.
2. \`free_flowing_source\` 20건은 기존 배지를 잠정 보류하고, 새 \`water_system\`과 \`water_scope\`로 재분류합니다.
3. \`natural_100\`은 현재 active DB에는 없지만, 코드와 migration schema에는 남아 있으므로 deprecated 처리 대상입니다.
4. \`water_texture\`만 있는 행은 방식 배지가 아니라 감촉 카운트/수질 필터 후보로만 유지합니다.
5. 배지 렌더링은 \`water_system != null\` + 공식 원문 + scope + source URL이 있을 때만 허용합니다.
`;
  writeFileSync(reportPath, report);

  console.log(`Rows: ${rows.length}`);
  console.log(`CSV: ${csvPath}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`Report: ${reportPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
