import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const runDate = process.argv.find((argument) => argument.startsWith('--run-date='))?.split('=')[1] ?? new Date().toISOString().slice(0, 10);
const outputDir = path.join(repoRoot, 'research', 'onsen-db-seed');
const outputBase = path.join(outputDir, `onsen_facility_card_summary_audit_${runDate}`);

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/))
      .filter(Boolean)
      .map((match) => [match[1], match[2].trim().replace(/^(?:"(.*)"|'(.*)')$/, '$1$2')])
  );
}

function readConfig() {
  const env = { ...parseEnvFile(path.join(repoRoot, '.env.local')), ...process.env };
  const supabaseUrl = String(env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
  const restUrl = String(env.CONTENT_DB_REST_URL || (supabaseUrl ? `${supabaseUrl}/rest/v1` : '')).replace(/\/+$/, '');
  const apiKey = env.CONTENT_DB_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!restUrl || !apiKey) throw new Error('Missing Supabase REST URL or API key.');
  return { restUrl, apiKey };
}

async function request(config, table, params) {
  const url = new URL(`${config.restUrl}/${table}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, { headers: { apikey: config.apiKey, authorization: `Bearer ${config.apiKey}` } });
  if (!response.ok) throw new Error(`${table} read failed: ${response.status} ${await response.text()}`);
  return response.json();
}

function priorityFor(verdict, cardSummary) {
  if (cardSummary?.status === 'published') return ['reference', '편집형 카드 요약 적용 완료'];
  if (verdict?.status === 'published' && verdict.level === 'full') return ['P0', '공개 full 판정이며 공식 사실과 후기 근거가 충분해 우선 편집'];
  if (verdict?.status === 'published') return ['P1', '공개 lite 판정으로 공식 특징과 후기 방향을 편집 검수'];
  if (verdict?.status === 'draft') return ['P2', '판정 근거 보강 전에는 카드 요약도 draft 유지'];
  return ['P3', '시설 판정 누락 또는 상태 재확인 필요'];
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(filePath, rows) {
  const columns = ['priority', 'slug', 'name_ko', 'region_group', 'prefecture', 'facility_type', 'verdict_status', 'verdict_level', 'direct_review_count', 'platform_count', 'card_summary_status', 'reason'];
  const lines = [columns.join(','), ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(','))];
  writeFileSync(filePath, `${lines.join('\n')}\n`);
}

async function main() {
  const config = readConfig();
  const [facilities, verdicts] = await Promise.all([
    request(config, 'onsen_facilities', {
      select: 'slug,name_ko,region_group,prefecture,facility_type,status',
      status: 'eq.active',
      order: 'region_group.asc,prefecture.asc,name_ko.asc',
    }),
    request(config, 'onsen_verdicts', {
      select: 'target_slug,level,status,briefing',
      target_type: 'eq.facility',
    }),
  ]);
  const verdictBySlug = new Map(verdicts.map((verdict) => [verdict.target_slug, verdict]));
  const rows = facilities.map((facility) => {
    const verdict = verdictBySlug.get(facility.slug);
    const cardSummary = verdict?.briefing?.editorial_card_summary;
    const [priority, reason] = priorityFor(verdict, cardSummary);
    return {
      priority,
      slug: facility.slug,
      name_ko: facility.name_ko,
      region_group: facility.region_group,
      prefecture: facility.prefecture ?? '',
      facility_type: facility.facility_type,
      verdict_status: verdict?.status ?? 'missing',
      verdict_level: verdict?.level ?? 'missing',
      direct_review_count: verdict?.briefing?.experiences_read ?? 0,
      platform_count: verdict?.briefing?.platform_count ?? 0,
      card_summary_status: cardSummary?.status ?? 'missing',
      reason,
    };
  });
  const order = { reference: 0, P0: 1, P1: 2, P2: 3, P3: 4 };
  rows.sort((a, b) => order[a.priority] - order[b.priority] || b.direct_review_count - a.direct_review_count || a.slug.localeCompare(b.slug));
  const counts = rows.reduce((result, row) => ({ ...result, [row.priority]: (result[row.priority] ?? 0) + 1 }), {});
  const payload = {
    generated_at: runDate,
    target_type: 'facility',
    policy: '공개 full을 우선 편집하고, 공식 사실과 직접 읽은 시설 후기를 분리합니다. draft 판정은 카드 요약도 공개하지 않습니다.',
    counts,
    rows,
  };
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(`${outputBase}.json`, `${JSON.stringify(payload, null, 2)}\n`);
  writeCsv(`${outputBase}.csv`, rows);
  const report = `# 온천시설 카드 요약 백필 감사\n\n- 생성일: ${runDate}\n- active 시설: ${rows.length}곳\n- 적용 완료: ${counts.reference ?? 0}곳\n- P0 공개 full: ${counts.P0 ?? 0}곳\n- P1 공개 lite: ${counts.P1 ?? 0}곳\n- P2 draft: ${counts.P2 ?? 0}곳\n- P3 판정 재확인: ${counts.P3 ?? 0}곳\n\n## 원칙\n\n- 공식 사실과 직접 읽은 시설 후기를 분리합니다.\n- 공개 full 시설부터 장소별 공식 특징을 편집합니다.\n- visible review count, 검색 스니펫, AI·플랫폼 요약은 직접 후기 수에 넣지 않습니다.\n- draft 판정은 카드 요약도 공개하지 않습니다.\n\n## P0\n\n${rows.filter((row) => row.priority === 'P0').map((row) => `- \`${row.slug}\` ${row.name_ko}: 후기 ${row.direct_review_count}건 · ${row.platform_count}개 플랫폼`).join('\n') || '- 없음'}\n`;
  writeFileSync(`${outputBase}.md`, report);
  console.log(JSON.stringify({ facilities: rows.length, counts, outputs: [`${outputBase}.json`, `${outputBase}.csv`, `${outputBase}.md`].map((file) => path.relative(repoRoot, file)) }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
