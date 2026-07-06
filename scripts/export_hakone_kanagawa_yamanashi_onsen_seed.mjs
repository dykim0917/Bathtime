import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const researchRoot = path.join(repoRoot, 'research', 'onsen-review-signals');
const qaPath = path.join(researchRoot, 'hakone_kanagawa_yamanashi_db_seed_qa_2026-07-06.csv');
const outputDir = path.join(repoRoot, 'output');
const snapshotDate = '2026-07-06';
const jsonOutputPath = path.join(outputDir, 'hakone-kanagawa-yamanashi-onsen-mvp-accommodations.v1.json');
const sqlOutputPath = path.join(outputDir, 'hakone-kanagawa-yamanashi-onsen-mvp-accommodations.v1.postgres.upserts.sql');
const reportOutputPath = path.join(researchRoot, 'hakone_kanagawa_yamanashi_db_load_report_2026-07-06.md');

function parseCsv(text) {
  const rows = [];
  let field = '';
  let row = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
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
  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...body] = rows.filter((item) => item.some((value) => value !== ''));
  return body.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  );
}

function sqlString(value) {
  if (value == null) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

function toInt(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.floor(parsed) : 0;
}

function cleanText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function extractSection(markdown, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = markdown.match(new RegExp(`## \\d+\\. ${escaped}\\n([\\s\\S]*?)(?=\\n## \\d+\\.|$)`));
  return cleanText(match?.[1] ?? '');
}

function firstSentenceBlock(text, maxLength = 520) {
  const cleaned = cleanText(text.replace(/\|/g, ' '));
  if (!cleaned) return '';
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength - 1)}…` : cleaned;
}

async function findFirstFile(dir, predicate) {
  if (!existsSync(dir)) return null;
  const files = await readdir(dir);
  return files.find(predicate) ?? null;
}

function areaMeta(areaLabel, slug) {
  if (areaLabel === 'yugawara') {
    return {
      region: 'yugawara',
      area: '가나가와 유가와라',
      region_group: 'kanto',
      prefecture: 'kanagawa',
      city: 'yugawara',
      onsen_area: 'yugawara',
    };
  }
  if (areaLabel === 'isawa') {
    return {
      region: 'isawa',
      area: '야마나시 이사와',
      region_group: 'kanto',
      prefecture: 'yamanashi',
      city: 'fuefuki',
      onsen_area: 'isawa',
    };
  }
  if (areaLabel.includes('kawaguchiko')) {
    return {
      region: slug.includes('fujiyoshida') ? 'fujiyoshida' : 'kawaguchiko',
      area: '야마나시 가와구치코/후지요시다',
      region_group: 'kanto',
      prefecture: 'yamanashi',
      city: slug.includes('fujiyoshida') ? 'fujiyoshida' : 'fujikawaguchiko',
      onsen_area: slug.includes('fujiyoshida') ? 'fujiyoshida' : 'kawaguchiko',
    };
  }
  return {
    region: 'hakone',
    area: '가나가와 하코네',
    region_group: 'kanto',
    prefecture: 'kanagawa',
    city: 'hakone',
    onsen_area: 'hakone',
  };
}

function pickName(mapping, markdown, slug) {
  const lodging = Array.isArray(mapping?.lodgings) ? mapping.lodgings[0] : null;
  const title = markdown.match(/^#\s+(.+?)(?:\s+온천|\s+리뷰|\s+\()/m)?.[1];
  const nameJa = lodging?.name_ja ?? title?.split('/')[0]?.trim() ?? slug;
  const displayName = lodging?.name_ko_or_en ?? title ?? nameJa;
  return { name: displayName, ja_name: nameJa };
}

function visibleReviewPool(mapping) {
  const lodging = Array.isArray(mapping?.lodgings) ? mapping.lodgings[0] : null;
  const pools = [];
  if (lodging?.google_maps) {
    pools.push({
      platform: 'Google Maps',
      rating: lodging.google_maps.rating ?? null,
      visible_review_count: lodging.google_maps.visible_review_count ?? null,
      access_status: lodging.google_maps.review_body_access ?? null,
    });
  }
  const otaPools = Array.isArray(lodging?.ota_review_pool_signals)
    ? lodging.ota_review_pool_signals
    : Object.entries(lodging?.ota_review_pool_signals ?? {}).map(([platform, value]) => ({
        platform,
        ...(value && typeof value === 'object' ? value : {}),
      }));
  for (const source of otaPools) {
    pools.push({
      platform: source.platform ?? source.source ?? null,
      rating: source.rating ?? null,
      visible_review_count: source.visible_review_count ?? null,
      access_status: source.review_body_access ?? source.access_status ?? null,
      direct_read_reviews: source.direct_read_reviews ?? null,
      onsen_related_direct_reviews: source.onsen_related_direct_reviews ?? null,
    });
  }
  return pools.filter((item) => item.platform);
}

function directBodyPlatforms(mapping) {
  const status = mapping?.direct_review_sampling_status;
  if (status?.direct_body_platforms && typeof status.direct_body_platforms === 'object') {
    return Object.keys(status.direct_body_platforms);
  }
  const poolPlatforms = visibleReviewPool(mapping)
    .filter((item) => Number(item.direct_read_reviews) > 0)
    .map((item) => item.platform);
  return [...new Set(poolPlatforms)];
}

function classifyPrimaryBath(text) {
  if (/(전 객실|全室).*(노천|露天|온천|温泉)/.test(text)) return '전 객실 온천탕 중심';
  if (/(객실 노천|客室露天|露天風呂付客室|room_open_air_bath)/.test(text)) return '객실 노천탕 중심';
  if (/(객실 내탕|객실탕|部屋風呂|room_bath)/.test(text)) return '객실탕 중심';
  if (/(대절탕|가족탕|貸切|private_bath|family_bath)/.test(text)) return '대절탕/프라이빗탕 있음';
  if (/(대욕장|大浴場|공용|public_bath)/.test(text)) return '대욕장 중심';
  return '온천 구성 확인 필요';
}

function classifyBathScope(text) {
  if (/(전 객실|全室).*(노천|露天|온천|温泉)/.test(text)) return 'all_rooms';
  if (/(일부 객실|일부|특정 객실|露天風呂付客室|객실형|room_open_air_bath)/.test(text)) return 'some_rooms';
  if (/(객실|部屋|room).*(온천|노천|露天|内湯)/i.test(text)) return 'room_signal_only';
  if (/(대욕장|大浴場|공용|public_bath)/.test(text)) return 'public_bath_only';
  return 'unclear';
}

function classifyWaterSourceType(text) {
  if (/(100%|１００％|天然温泉100|자연 온천 100|自家源泉100)/.test(text)) return 'natural_100';
  if (/(源泉かけ流し|源泉掛け流し|源泉掛流|かけ流し|掛け流し|원천가케나가시)/.test(text)) return 'free_flowing_source';
  if (/(温泉|온천|泉質|天然温泉|천연온천|自家源泉)/.test(text)) return 'hot_spring_confirmed';
  return 'needs_check';
}

function deriveBathContexts(text, bathScope) {
  const values = new Set();
  if (['all_rooms', 'some_rooms', 'room_signal_only'].includes(bathScope)) values.add('room_bath');
  if (/(대절탕|가족탕|貸切|private_bath|family_bath|프라이빗)/.test(text)) values.add('private_bath');
  if (/(대욕장|大浴場|공용|public_bath|open_air_public_bath)/.test(text)) values.add('public_bath');
  return [...values];
}

function deriveWaterCriteria(text, waterSourceType) {
  const values = new Set(['spring_confirmed']);
  if (waterSourceType === 'free_flowing_source') values.add('direct_source');
  if (waterSourceType === 'natural_100') values.add('natural_100');
  if (/(수질|탕질|부드럽|とろり|ツルツル|なめらか|water_texture|美人の湯)/.test(text)) values.add('water_texture');
  if (/(가수|加水|가온|加温|온도|温度|ぬる|熱)/.test(text)) values.add('temperature_adjustment');
  if (/(겨울|雪|winter|寒)/i.test(text)) values.add('winter_caution');
  return [...values];
}

function operationNotes(text) {
  const notes = [];
  if (/(예약|予約|booking_confusion|객실 타입|객실형)/.test(text)) notes.push('예약/객실타입 확인 필요');
  if (/(대절탕|가족탕|貸切)/.test(text)) notes.push('대절탕 운영 조건 확인');
  if (/(혼잡|crowding|만원|待ち)/.test(text)) notes.push('혼잡 신호 있음');
  if (/(청소|清掃|배수|벌레|虫|낙엽)/.test(text)) notes.push('관리/자연물 주의 신호 있음');
  return [...new Set(notes)];
}

function createSql(rows) {
  const columns = [
    'slug',
    'name',
    'ja_name',
    'region',
    'area',
    'country',
    'region_group',
    'prefecture',
    'city',
    'onsen_area',
    'travel_contexts',
    'bath_contexts',
    'water_criteria',
    'summary',
    'primary_bath',
    'water_use_status',
    'water_source_type',
    'bath_scope',
    'operation_notes',
    'evidence_counts',
    'evidence_grade',
    'evidence_note',
    'status',
    'source_file',
    'content_updated_at',
  ];
  const values = rows
    .map((row) => `(${columns.map((column) => {
      if (['travel_contexts', 'bath_contexts', 'water_criteria', 'operation_notes', 'evidence_counts'].includes(column)) {
        return sqlJson(row[column]);
      }
      return sqlString(row[column]);
    }).join(', ')})`)
    .join(',\n');
  return `INSERT INTO onsen_accommodations (${columns.join(', ')})\nVALUES\n${values}\nON CONFLICT (slug) DO UPDATE SET\n${columns
    .filter((column) => column !== 'slug')
    .map((column) => `  ${column} = EXCLUDED.${column}`)
    .join(',\n')},\n  updated_at = NOW();\n`;
}

async function createRow(qaRow) {
  const slug = qaRow.slug;
  const dir = path.join(researchRoot, slug);
  const summaryFile = await findFirstFile(dir, (file) => file.startsWith('review_signal_summary_') && file.endsWith('.md'));
  const mappingFile = await findFirstFile(dir, (file) => file.startsWith('platform_mapping_') && file.endsWith('.json'));
  if (!summaryFile || !mappingFile) {
    throw new Error(`Missing summary or platform mapping for ${slug}`);
  }
  const markdown = await readFile(path.join(dir, summaryFile), 'utf8');
  const mapping = JSON.parse(await readFile(path.join(dir, mappingFile), 'utf8'));
  const facts = extractSection(markdown, '공식 사실');
  const interpretation = extractSection(markdown, 'Bathtime 해석');
  const summary = firstSentenceBlock(interpretation || facts || `${slug} 온천 리뷰 신호 요약`);
  const combinedText = `${facts} ${interpretation}`;
  const names = pickName(mapping, markdown, slug);
  const meta = areaMeta(qaRow.area_label, slug);
  const bathScope = classifyBathScope(combinedText);
  const waterSourceType = classifyWaterSourceType(combinedText);
  const platforms = directBodyPlatforms(mapping);
  const directReviewCount = toInt(qaRow.direct_read_count);
  const onsenReviewCount = toInt(qaRow.onsen_related_count);

  return {
    slug,
    name: names.name,
    ja_name: names.ja_name,
    ...meta,
    country: 'JP',
    travel_contexts: ['ryokan_stay'],
    bath_contexts: deriveBathContexts(combinedText, bathScope),
    water_criteria: deriveWaterCriteria(combinedText, waterSourceType),
    summary,
    primary_bath: classifyPrimaryBath(combinedText),
    water_use_status: /온천|温泉|源泉|泉質|天然温泉|自家源泉/.test(facts) ? 'official_confirmed' : 'review_supported',
    water_source_type: waterSourceType,
    bath_scope: bathScope,
    operation_notes: operationNotes(combinedText),
    evidence_counts: {
      directReviewCount,
      onsenReviewCount,
      directBodyPlatformCount: toInt(qaRow.platform_count),
      directBodyPlatforms: platforms,
      visibleReviewPool: visibleReviewPool(mapping),
      areaLabel: qaRow.area_label,
      qaStatus: qaRow.qa_status,
      remainingIssue: qaRow.remaining_issue,
      mvpDataset: 'hakone_kanagawa_yamanashi_onsen_mvp_v1',
    },
    evidence_grade: qaRow.final_grade,
    evidence_note: `A: 직접 확인 ${directReviewCount}건, 온천 관련 ${onsenReviewCount}건, 직접 본문 플랫폼 ${qaRow.platform_count}개`,
    status: 'active',
    source_file: `research/onsen-review-signals/${slug}/${summaryFile}`,
    content_updated_at: snapshotDate,
  };
}

async function main() {
  const qaRows = parseCsv(await readFile(qaPath, 'utf8')).filter((row) => row.db_ready === 'true');
  const rows = [];
  for (const row of qaRows) rows.push(await createRow(row));
  await mkdir(outputDir, { recursive: true });
  await writeFile(jsonOutputPath, `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(sqlOutputPath, createSql(rows));
  const report = [
    '# 하코네/가나가와/야마나시 MVP 숙소 DB 로드 리포트',
    '',
    `- 생성일: ${snapshotDate}`,
    `- 입력 QA 파일: \`${path.relative(repoRoot, qaPath)}\``,
    `- 출력 JSON: \`${path.relative(repoRoot, jsonOutputPath)}\``,
    `- 출력 SQL: \`${path.relative(repoRoot, sqlOutputPath)}\``,
    `- DB 적재 대상: ${rows.length}곳`,
    `- 제외: ${parseCsv(await readFile(qaPath, 'utf8')).filter((row) => row.db_ready !== 'true').length}곳`,
    '',
    '| slug | area | grade | direct | onsen | platforms |',
    '|---|---|---:|---:|---:|---:|',
    ...rows.map((row) => `| ${row.slug} | ${row.region} | ${row.evidence_grade} | ${row.evidence_counts.directReviewCount} | ${row.evidence_counts.onsenReviewCount} | ${row.evidence_counts.directBodyPlatformCount} |`),
    '',
  ].join('\n');
  await writeFile(reportOutputPath, report);
  console.log(`Exported ${rows.length} rows`);
  console.log(jsonOutputPath);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
