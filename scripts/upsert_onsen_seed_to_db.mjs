import { readdir, readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const researchRoot = path.join(repoRoot, 'research', 'onsen-review-signals');
const seedCopyPath = path.join(repoRoot, 'apps/admin/lib/onsen/seedCopy.ts');

const reportPriority = ['agoda_enriched', 'enriched', 'curated', 'review_signal_summary_', 'prelim'];

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

function readRefinedSummaries() {
  if (!existsSync(seedCopyPath)) return {};
  const source = readFileSync(seedCopyPath, 'utf8');
  const start = source.indexOf('export const refinedOnsenSeedSummaries');
  if (start === -1) return {};
  const objectStart = source.indexOf('{', start);
  const objectEnd = source.indexOf('};', objectStart);
  if (objectStart === -1 || objectEnd === -1) return {};
  const objectLiteral = source.slice(objectStart, objectEnd + 1);
  return Function(`"use strict"; return (${objectLiteral});`)();
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function flatten(value, prefix = '') {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flatten(item, `${prefix}[${index}]`));
  }
  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, item]) => flatten(item, prefix ? `${prefix}.${key}` : key));
  }
  return [[prefix, value]];
}

function getString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function pickName(data, fallback) {
  const value = data.accommodation_name;
  if (typeof value === 'string') return value;
  if (isRecord(value)) return getString(value.ko) ?? getString(value.ja) ?? getString(value.en) ?? fallback;
  return fallback;
}

function pickJapaneseName(data) {
  const value = data.accommodation_name;
  return isRecord(value) ? getString(value.ja) ?? null : null;
}

function cleanSummary(value) {
  return value.replace(/\s+/g, ' ').trim().slice(0, 700);
}

function pickFirstText(flat, pathHints) {
  for (const hint of pathHints) {
    const matches = flat
      .filter(([itemPath, value]) => itemPath.includes(hint) && typeof value === 'string')
      .map(([, value]) => String(value).trim())
      .filter((value) => value.length >= 20);
    if (matches.length > 0) return matches.slice(0, 3).join(' ');
  }
  return '';
}

function pickSummaryText(flat) {
  return cleanSummary(pickFirstText(flat, ['bathtime_interpretation_ko', 'bathtime_interpretation', 'interpretation_ko']));
}

function pickOfficialText(flat) {
  return cleanSummary(pickFirstText(flat, ['official_facts.summary', 'official_facts.summary_ko', 'official_facts.facts', 'official_facts[']));
}

function classifyPrimaryBath(text) {
  if (/(대욕장|大浴場|대형 노천|조망 노천)/.test(text) && /(가족탕|대여|대절|貸切)/.test(text)) return '대욕장 + 대절탕 중심';
  if (/(전 객실|모든 객실|全室|각 객실|객실마다).*(노천|온천|露天|内湯)|((노천|온천|露天|内湯).*(전 객실|모든 객실|全室|각 객실|객실마다))/.test(text)) return '전 객실 온천탕 중심';
  if (/(일부|특정|별채|본관|露天付き|노천탕 딸린|전용 노천탕 객실)/.test(text)) return '일부 객실 온천탕';
  if (/(대여탕|대절탕|가족탕|貸切|전세)/.test(text)) return '대절탕 중심';
  if (/(대욕장|大浴場|공용|남녀|노천탕|露天風呂)/.test(text)) return '공용탕 중심';
  return '온천 구성 확인 필요';
}

function classifyBathScope(text) {
  if (/(전 객실|모든 객실|全室|각 객실|객실마다).*(노천|온천|露天|内湯)|((노천|온천|露天|内湯).*(전 객실|모든 객실|全室|각 객실|객실마다))/.test(text)) return 'all_rooms';
  if (/(일부|특정|별채|본관|1층|2층|露天付き|노천탕 딸린|전용 노천탕 객실|5실|3실)/.test(text)) return 'some_rooms';
  if (/(객실|部屋|room|in-room|private bath|개인탕|프라이빗).*(온천|노천|露天|内湯)/i.test(text)) return 'room_signal_only';
  if (/(대욕장|大浴場|공용|남녀|노천탕|露天風呂)/.test(text)) return 'public_bath_only';
  return 'unclear';
}

function classifyWaterUseStatus(officialText, summaryText) {
  if (/(온천|温泉|원천|源泉|천연온천|天然温泉|泉質|100%|１００％)/.test(officialText)) return 'official_confirmed';
  if (/(온천|온천수|탕질|물성|원천|객실탕|노천탕|private onsen)/i.test(summaryText)) return 'review_supported';
  if (summaryText || officialText) return 'needs_official_check';
  return 'unclear';
}

function classifyWaterSourceType(text) {
  if (/(100%|１００％|천연온천 100|天然温泉100|인공온천 아님|人工温泉含まず)/.test(text)) return 'natural_100';
  if (/(원천가케나가시|源泉かけ流し|源泉掛け流し|源泉掛流|かけ流し|掛け流し|掛流|온천가케나가시|원천수 방류|원천 방류|직수)/.test(text)) return 'free_flowing_source';
  if (/(온천수|온천|温泉|천연온천|天然温泉|泉質)/.test(text)) return 'hot_spring_confirmed';
  return 'needs_check';
}

function classifyOperationNotes(text) {
  const notes = [];
  if (/(가수|加水|물 추가|지하수|地下水|물로|온도 조절|温度調整)/.test(text)) notes.push('물을 섞어 식힘/온도 조절');
  if (/(가온|加温)/.test(text)) notes.push('가온 표기');
  if (/(순환|循環|循環ろ過|ろ過|여과|재사용 온천)/.test(text)) notes.push('순환/여과 표기');
  if (/(예약제|予約制|선착순|先着|貸切|대여|대절|전세|가족탕)/.test(text)) notes.push('대절탕 운영 조건');
  if (/(겨울|추위|냉기|雪|winter)/i.test(text)) notes.push('겨울 체감 주의');
  if (/(벌레|낙엽|虫|insect|자연물)/i.test(text)) notes.push('벌레/자연물 주의');
  return [...new Set(notes)];
}

function deriveBathContexts(bathScope, primaryBath, text) {
  const values = new Set();
  if (bathScope === 'all_rooms' || bathScope === 'some_rooms' || bathScope === 'room_signal_only' || /객실|전 객실|객실탕/.test(primaryBath)) {
    values.add('room_bath');
  }
  if (/(가족탕|대절탕|대여탕|貸切|전세|프라이빗)/.test(`${primaryBath} ${text}`)) {
    values.add('private_bath');
  }
  if (bathScope === 'public_bath_only' || /(대욕장|공용탕|大浴場)/.test(`${primaryBath} ${text}`)) {
    values.add('public_bath');
  }
  return [...values];
}

function deriveWaterCriteria(waterUseStatus, waterSourceType, summary, notes) {
  const text = `${summary} ${notes.join(' ')}`;
  const values = new Set();
  if (waterSourceType === 'free_flowing_source') values.add('direct_source');
  if (waterSourceType === 'natural_100') values.add('natural_100');
  if (waterUseStatus === 'official_confirmed' || waterUseStatus === 'review_supported' || waterSourceType === 'hot_spring_confirmed') values.add('spring_confirmed');
  if (/(부드럽|매끈|수질|피부감|온천감|물 느낌)/.test(text)) values.add('water_texture');
  if (/(물을 섞어|온도 조절|가온|가수)/.test(text)) values.add('temperature_adjustment');
  if (/(겨울|추위|춥|냉기)/.test(text)) values.add('winter_caution');
  return [...values];
}

function pickMaxNumber(flat, hints) {
  const values = flat
    .filter(([itemPath, value]) => typeof value === 'number' && hints.some((hint) => itemPath.toLowerCase().includes(hint)))
    .map(([, value]) => Number(value))
    .filter((value) => Number.isFinite(value));
  return values.length > 0 ? Math.max(...values) : null;
}

function pickEvidenceCounts(flat) {
  return {
    directReviewCount: pickMaxNumber(flat, ['directly_read_total', 'direct_read_total', 'direct_structured_review_sample_total', 'directly_structured_total', 'structured_reviews_total']),
    onsenReviewCount: pickMaxNumber(flat, ['onsen_related_total', 'onsen_related_direct_total', 'onsen_related_rows_auto', 'onsen_related_structured']),
    roomBathMentionCount: pickMaxNumber(flat, ['room_bath', 'room_open_air', 'room_open']),
    publicBathMentionCount: pickMaxNumber(flat, ['public_bath', 'open_air_public', 'large_open_air']),
    privateBathMentionCount: pickMaxNumber(flat, ['private_bath', 'privacy']),
    waterTextureMentionCount: pickMaxNumber(flat, ['water_texture', 'source_flow', 'weak_onsen', 'onsen_feeling']),
    cautionMentionCount: pickMaxNumber(flat, ['attention', 'caution', 'negative']),
  };
}

function classifyEvidenceGrade(counts) {
  const direct = counts.directReviewCount ?? 0;
  if (direct >= 300) return 'A';
  if (direct >= 100) return 'B';
  if (direct >= 30) return 'C';
  return 'D';
}

function createEvidenceNote(counts) {
  const direct = counts.directReviewCount;
  const onsen = counts.onsenReviewCount;
  if (direct && onsen) return `직접 확인 ${direct}건 중 온천 관련 ${onsen}건`;
  if (direct) return `직접 확인 ${direct}건`;
  if (onsen) return `온천 관련 ${onsen}건`;
  return '정량 근거를 추가 정리해야 합니다.';
}

function compareReportFile(a, b) {
  return getReportPriority(a) - getReportPriority(b) || a.localeCompare(b);
}

function getReportPriority(file) {
  const index = reportPriority.findIndex((keyword) => file.includes(keyword));
  return index === -1 ? 99 : index;
}

async function readSeedRows() {
  const refinedSummaries = readRefinedSummaries();
  const entries = await readdir(researchRoot, { withFileTypes: true });
  const rows = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith('yufuin-') || entry.name === 'yufuin-tier2-triage') continue;
    const folderPath = path.join(researchRoot, entry.name);
    const files = (await readdir(folderPath)).filter((file) => file.startsWith('review_signal_summary') && file.endsWith('.json'));
    if (files.length === 0) continue;
    const file = files.sort(compareReportFile)[0];
    const raw = JSON.parse(await readFile(path.join(folderPath, file), 'utf8'));
    if (!isRecord(raw)) continue;
    const flat = flatten(raw);
    const summaryText = pickSummaryText(flat);
    const officialText = pickOfficialText(flat);
    const summary = refinedSummaries[entry.name] ?? (summaryText || officialText || '온천 숙소 리서치 요약을 정리해야 합니다.');
    const combinedText = `${officialText} ${summary}`;
    const evidenceCounts = pickEvidenceCounts(flat);
    const primaryBath = classifyPrimaryBath(combinedText);
    const waterUseStatus = classifyWaterUseStatus(officialText, summaryText);
    const waterSourceType = classifyWaterSourceType(combinedText);
    const bathScope = classifyBathScope(combinedText);
    const operationNotes = classifyOperationNotes(combinedText);
    rows.push({
      slug: entry.name,
      name: pickName(raw, entry.name),
      ja_name: pickJapaneseName(raw),
      region: 'yufuin',
      area: '오이타 유후인',
      country: 'JP',
      region_group: 'kyushu',
      prefecture: 'oita',
      city: 'yufu',
      onsen_area: 'yufuin',
      travel_contexts: ['ryokan_stay'],
      bath_contexts: deriveBathContexts(bathScope, primaryBath, combinedText),
      water_criteria: deriveWaterCriteria(waterUseStatus, waterSourceType, summary, operationNotes),
      summary,
      primary_bath: primaryBath,
      water_use_status: waterUseStatus,
      water_source_type: waterSourceType,
      bath_scope: bathScope,
      operation_notes: operationNotes,
      evidence_counts: evidenceCounts,
      evidence_grade: classifyEvidenceGrade(evidenceCounts),
      evidence_note: createEvidenceNote(evidenceCounts),
      status: 'draft',
      source_file: `research/onsen-review-signals/${entry.name}/${file}`,
      content_updated_at: '2026-07-03',
    });
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

async function upsertRows(restUrl, serviceKey, rows) {
  const chunkSize = 100;
  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    const url = new URL(`${restUrl}/onsen_accommodations`);
    url.searchParams.set('on_conflict', 'slug');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        'content-type': 'application/json',
        prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(chunk),
    });
    if (!response.ok) {
      throw new Error(`onsen_accommodations upsert failed: ${response.status} ${await response.text()}`);
    }
  }
}

async function main() {
  const env = readLocalEnv();
  const restUrl = (env.CONTENT_DB_REST_URL || `${env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1`).replace(/\/+$/, '');
  const serviceKey = env.CONTENT_DB_SERVICE_ROLE_KEY;
  if (!restUrl || !serviceKey) {
    throw new Error('Missing CONTENT_DB_REST_URL/SUPABASE_URL or CONTENT_DB_SERVICE_ROLE_KEY.');
  }

  const rows = await readSeedRows();
  if (rows.length === 0) throw new Error('No onsen seed rows found.');
  await upsertRows(restUrl, serviceKey, rows);
  console.log(`Upserted ${rows.length} onsen accommodations.`);
  console.log(rows.map((row) => row.slug).join('\n'));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
