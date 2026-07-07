import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const snapshotDate = '2026-07-07';
const outputDir = path.join(repoRoot, 'research', 'onsen-name-normalization');
const outputCsvPath = path.join(outputDir, 'onsen_accommodation_name_qa_reviewed_2026-07-07.csv');
const outputJsonPath = path.join(outputDir, 'onsen_accommodation_name_qa_reviewed_2026-07-07.json');

const nameQa = {
  'toyako-lake-suite-konosisu': {
    display_name_ko: '더 레이크 스위트 고노스미카',
    aliases_ko: ['도야코 더 레이크 스위트 고노스미카', '더 레이크 스위트 코노스미카'],
  },
  'jozankei-grand-blissen': {
    display_name_ko: '그랜드 블리센 호텔 조잔케이',
    aliases_ko: ['조잔케이 그랜드 블리센 호텔'],
  },
  'jozankei-chalet-ivy': {
    display_name_ko: '샬레 아이비 조잔케이',
    aliases_ko: ['조잔케이 샬레 아이비'],
  },
  'jozankei-suizantei': {
    display_name_ko: '조잔케이 다이이치 호텔 스이잔테이',
    aliases_ko: ['조잔케이 스이잔테이', '스이잔테이'],
  },
  'noboribetsu-mahoroba': {
    display_name_ko: '호텔 마호로바',
    aliases_ko: ['노보리베츠 호텔 마호로바'],
  },
  'noboribetsu-hanayura': {
    display_name_ko: '료테이 하나유라',
    aliases_ko: ['노보리베츠 하나유라'],
  },
  'noboribetsu-bourou-noguchi': {
    display_name_ko: '보로 노구치 노보리베츠',
    aliases_ko: ['노보리베츠 보로 노구치'],
  },
  'noboribetsu-manseikaku': {
    display_name_ko: '노보리베츠 만세이카쿠',
    aliases_ko: ['호텔 노보리베츠 만세이카쿠'],
  },
  'noboribetsu-takinoya': {
    display_name_ko: '노보리베츠 타키노야',
    aliases_ko: ['타키노야'],
  },
  'noboribetsu-grand': {
    display_name_ko: '노보리베츠 그랜드 호텔',
    aliases_ko: ['노보리베츠 그랜드'],
  },
  'noboribetsu-daiichi-takimotokan': {
    display_name_ko: '다이이치 타키모토칸',
    aliases_ko: ['노보리베츠 다이이치 타키모토칸'],
  },
  'tokachigawa-seijakubou': {
    display_name_ko: '도카치가와 온천 세이자쿠보',
    aliases_ko: ['세이자쿠보', '도카치가와 세이자쿠보'],
  },
  'yunokawa-hanabishi': {
    display_name_ko: '하코다테 유노카와 온천 하나비시 호텔',
    aliases_ko: ['하나비시 호텔', '유노카와 하나비시 호텔'],
  },
  'yunokawa-heiseikan-shiosaitei': {
    display_name_ko: '헤이세이칸 시오사이테이',
    aliases_ko: ['유노카와 헤이세이칸 시오사이테이'],
  },
  'yunokawa-heiseikan-hanatsuki': {
    display_name_ko: '헤이세이칸 시오사이테이 별관 하나츠키',
    aliases_ko: ['시오사이테이 별관 하나츠키', '헤이세이칸 하나츠키'],
  },
  'yunokawa-nagisatei': {
    display_name_ko: '유노카와 프린스 호텔 나기사테이',
    aliases_ko: ['나기사테이', '유노카와 나기사테이'],
  },
  'fujiyoshida-kaneyamaen': {
    display_name_ko: '후지산온센 호텔 카네야마엔',
    aliases_ko: ['호텔 카네야마엔', '후지산 온천 호텔 카네야마엔'],
  },
  'hakone-gen-gora': {
    display_name_ko: '겐 하코네 고라',
    aliases_ko: ['하코네 겐 고라'],
  },
  'hakone-gora-kadan': {
    display_name_ko: '고라 카단',
    aliases_ko: ['하코네 고라 카단'],
  },
  'hakone-matsuzakaya': {
    display_name_ko: '마츠자카야 혼텐',
    aliases_ko: ['하코네 마츠자카야 혼텐'],
  },
  'hakone-yama-no-chaya': {
    display_name_ko: '야마노차야',
    aliases_ko: ['하코네 야마노차야'],
  },
  'hakone-gora-karaku': {
    display_name_ko: '하코네 고라 가라쿠',
    aliases_ko: ['고라 가라쿠'],
  },
  'hakone-byakudan': {
    display_name_ko: '하코네 고라 백단',
    aliases_ko: ['하코네 백단', '고라 백단'],
  },
  'hakone-ginyu': {
    display_name_ko: '하코네 긴유',
    aliases_ko: ['긴유'],
  },
  'hakone-yuyado-zen': {
    display_name_ko: '하코네 유야도 젠',
    aliases_ko: ['유야도 젠'],
  },
  'hakone-kowakien-tenyu': {
    display_name_ko: '하코네 코와키엔 텐유',
    aliases_ko: ['텐유', '하코네 텐유'],
  },
  'hakone-fontainebleau': {
    display_name_ko: '하코네 퐁텐블로 센고쿠테이',
    aliases_ko: ['하코네 폰테느 블로 센고쿠테이', '퐁텐블로 센고쿠테이'],
  },
  'isawa-fujinoya': {
    display_name_ko: '샤토레제 호텔 료칸 후지노야',
    aliases_ko: ['이사와온천 후지노야', '후지노야'],
  },
  'isawa-itoyanagi': {
    display_name_ko: '이사와 메이토칸 이토야나기',
    aliases_ko: ['이토야나기', '이사와 이토야나기'],
  },
  'isawa-itoyanagi-yuwa': {
    display_name_ko: '이토야나기 고야도 유와',
    aliases_ko: ['고야도 유와', '이사와 고야도 유와'],
  },
  'kawaguchiko-kukuna': {
    display_name_ko: '더 쿠쿠나',
    aliases_ko: ['가와구치코 더 쿠쿠나'],
  },
  'kawaguchiko-fufu': {
    display_name_ko: '후후 가와구치코',
    aliases_ko: ['가와구치코 후후'],
  },
  'yugawara-ashikari': {
    display_name_ko: '유가와라 스파 료칸 아시카리',
    aliases_ko: ['아시카리', '유가와라 아시카리'],
  },
  'beppu-amane-resort-gahama': {
    display_name_ko: '아마네 리조트 가하마',
    aliases_ko: ['가하마 테라스', '아마네 리조트 가하마 테라스'],
  },
  'beppu-amane-resort-seikai': {
    display_name_ko: '아마네 리조트 세이카이',
    aliases_ko: ['아마네 리조트 하루미', '시오사이노야도 세이카이'],
  },
  'beppu-ana-intercontinental': {
    display_name_ko: 'ANA 인터컨티넨탈 벳푸 리조트 앤 스파',
    aliases_ko: ['ANA 인터컨티넨탈 벳푸', '인터컨티넨탈 벳푸'],
  },
  'beppu-kannawaen': {
    display_name_ko: '벳푸 칸나와엔',
    aliases_ko: ['산소 칸나와엔', '벳푸 철륜온천 칸나와엔'],
  },
  'beppu-kokoroan': {
    display_name_ko: '벳푸 코코로안',
    aliases_ko: ['쇼세이노야도 코코로안', '코코로안'],
  },
  'ibusuki-yurian': {
    display_name_ko: '이부스키 유리안',
    aliases_ko: ['유리안'],
  },
  'ibusuki-hakusuikan': {
    display_name_ko: '이부스키 하쿠스이칸',
    aliases_ko: ['하쿠스이칸'],
  },
  'kirishima-lavista': {
    display_name_ko: '라비스타 기리시마 힐즈',
    aliases_ko: ['기리시마 라비스타 힐즈'],
  },
  'kurokawa-takefue': {
    display_name_ko: '구로카와 다케후에',
    aliases_ko: ['다케후에', '산소 다케후에'],
  },
  'kurokawa-sanga': {
    display_name_ko: '료칸 산가',
    aliases_ko: ['구로카와 료칸 산가'],
  },
  'kurokawa-okunoyu': {
    display_name_ko: '료칸 오쿠노유',
    aliases_ko: ['구로카와 료칸 오쿠노유'],
  },
  'kurokawa-yamamizuki': {
    display_name_ko: '야마미즈키',
    aliases_ko: ['구로카와 야마미즈키'],
  },
  'takeo-koyokaku': {
    display_name_ko: '다케오온천 가이세키야도 오기야',
    aliases_ko: ['가이세키야도 오기야', '다케오 오기야'],
  },
  'ureshino-taishoya': {
    display_name_ko: '우레시노 온천 다이쇼야',
    aliases_ko: ['다이쇼야'],
  },
  'ureshino-shiibasanso': {
    display_name_ko: '우레시노 온천 시이바산소',
    aliases_ko: ['시이바산소'],
  },
  'ureshino-wataya-besso': {
    display_name_ko: '우레시노 온천 와타야벳소',
    aliases_ko: ['와타야벳소'],
  },
  'yufuin-ryoutiku': {
    display_name_ko: '유후 료치쿠',
    aliases_ko: ['유후인 료치쿠', '오야도 유후 료치쿠'],
  },
  'yufuin-baien': {
    display_name_ko: '유후인 바이엔 가든 리조트',
    aliases_ko: ['유후인 바이엔', '바이엔 가든 리조트'],
  },
  'yufuin-ubl-hotel': {
    display_name_ko: '유후인 유벨 호텔',
    aliases_ko: ['유후인 UBL 호텔'],
  },
  'yufuin-hanamura': {
    display_name_ko: '유후인 카오리노사토 하나무라',
    aliases_ko: ['유후인 카호리노사토 하나무라', '하나무라'],
  },
  'yufuin-poppoan': {
    display_name_ko: '유후인 팝포안',
    aliases_ko: ['팝포안'],
  },
  'yufuin-ryu-no-hige': {
    display_name_ko: '유후인 류노히게 벳테이 유무타',
    aliases_ko: ['류노히게', '벳테이 유무타', '쿠사야네노야도 류노히게'],
  },
};

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
    ...parseEnvFile(path.join(repoRoot, 'apps/web/.env.local')),
    ...process.env,
  };
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function unique(values) {
  return [...new Set(values.map((value) => String(value ?? '').trim()).filter(Boolean))];
}

async function readRows(restUrl, serviceKey) {
  const url = new URL(`${restUrl}/onsen_accommodations`);
  url.searchParams.set('select', 'slug,region_group,region,area,name,display_name_ko,ja_name,name_ja,name_en,name_romaji,aliases_ko,aliases_ja,aliases_en,name_verification_status,status');
  url.searchParams.set('status', 'eq.active');
  url.searchParams.set('order', 'region_group.asc,region.asc,display_name_ko.asc');

  const response = await fetch(url, {
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to read onsen_accommodations: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function updateRow(restUrl, serviceKey, row) {
  const qa = nameQa[row.slug];
  if (!qa) return;
  const previousDisplayName = row.display_name_ko && row.display_name_ko !== qa.display_name_ko ? row.display_name_ko : '';
  const aliasesKo = unique([qa.display_name_ko, ...(qa.aliases_ko ?? []), ...(row.aliases_ko ?? []), previousDisplayName]);
  const aliasesJa = unique([row.name_ja, row.ja_name, ...(row.aliases_ja ?? [])]);
  const aliasesEn = unique([row.name_en, row.name_romaji, ...(row.aliases_en ?? [])]);
  const url = new URL(`${restUrl}/onsen_accommodations`);
  url.searchParams.set('slug', `eq.${row.slug}`);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      'content-type': 'application/json',
      prefer: 'return=minimal',
    },
    body: JSON.stringify({
      name: qa.display_name_ko,
      display_name_ko: qa.display_name_ko,
      aliases_ko: aliasesKo,
      aliases_ja: aliasesJa,
      aliases_en: aliasesEn,
      name_verification_status: 'verified',
      name_source_note: `한국어 서비스 대표명 1차 QA 완료(${snapshotDate}). 일본 공식명/영문명은 별칭으로 보존.`,
      content_updated_at: snapshotDate,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update ${row.slug}: ${response.status} ${await response.text()}`);
  }
}

async function main() {
  const shouldApply = process.argv.includes('--apply');
  const env = readLocalEnv();
  const restUrl = (env.CONTENT_DB_REST_URL || `${env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1`).replace(/\/+$/, '');
  const serviceKey = env.CONTENT_DB_SERVICE_ROLE_KEY;
  if (!restUrl || !serviceKey || restUrl.startsWith('undefined')) {
    throw new Error('Missing CONTENT_DB_REST_URL/SUPABASE_URL or CONTENT_DB_SERVICE_ROLE_KEY.');
  }

  const rows = await readRows(restUrl, serviceKey);
  const missingMappings = rows.filter((row) => !nameQa[row.slug]);
  if (missingMappings.length > 0) {
    throw new Error(`Missing name QA mappings: ${missingMappings.map((row) => row.slug).join(', ')}`);
  }

  await mkdir(outputDir, { recursive: true });
  const reviewedRows = rows.map((row) => {
    const qa = nameQa[row.slug];
    return {
      slug: row.slug,
      region_group: row.region_group,
      region: row.region,
      area: row.area,
      previous_display_name_ko: row.display_name_ko,
      verified_display_name_ko: qa.display_name_ko,
      name_ja: row.name_ja ?? row.ja_name,
      name_en: row.name_en ?? '',
      aliases_ko: unique([qa.display_name_ko, ...(qa.aliases_ko ?? []), ...(row.aliases_ko ?? [])]).join(' | '),
      name_verification_status: 'verified',
      review_note: `한국어 서비스 대표명 1차 QA 완료(${snapshotDate})`,
    };
  });

  const headers = Object.keys(reviewedRows[0] ?? {});
  await writeFile(outputCsvPath, [headers, ...reviewedRows.map((row) => headers.map((header) => row[header]))].map((line) => line.map(csvCell).join(',')).join('\n') + '\n');
  await writeFile(outputJsonPath, JSON.stringify(reviewedRows, null, 2) + '\n');

  if (shouldApply) {
    for (const row of rows) {
      await updateRow(restUrl, serviceKey, row);
    }
  }

  console.log(`Reviewed ${reviewedRows.length} names.`);
  console.log(outputCsvPath);
  console.log(outputJsonPath);
  if (shouldApply) console.log(`Applied ${reviewedRows.length} name updates.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
