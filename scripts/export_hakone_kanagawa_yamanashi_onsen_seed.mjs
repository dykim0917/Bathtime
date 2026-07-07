import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { applyOnsenNameQa } from './onsen_name_qa_overrides.mjs';
import { applyOnsenCopyQa } from './onsen_copy_qa_overrides.mjs';

const repoRoot = process.cwd();
const researchRoot = path.join(repoRoot, 'research', 'onsen-review-signals');
const qaPath = path.join(researchRoot, 'hakone_kanagawa_yamanashi_db_seed_qa_2026-07-06.csv');
const outputDir = path.join(repoRoot, 'output');
const snapshotDate = '2026-07-07';
const jsonOutputPath = path.join(outputDir, 'hakone-kanagawa-yamanashi-onsen-mvp-accommodations.v1.json');
const sqlOutputPath = path.join(outputDir, 'hakone-kanagawa-yamanashi-onsen-mvp-accommodations.v1.postgres.upserts.sql');
const reportOutputPath = path.join(researchRoot, 'hakone_kanagawa_yamanashi_db_load_report_2026-07-07.md');

const curatedCopy = {
  'hakone-gora-kadan': {
    summary: '고라 지역의 고급 료칸형 숙소로, 객실 온천과 예약제 대절탕, 공용 대욕장 경험이 함께 확인된다. 후기 표본에서는 객실 노천탕 만족이 강하게 반복되지만 객실 타입에 따른 온천 구성 차이도 보여, 객실탕과 대절탕을 분리해 안내하는 편이 맞다.',
    primary_bath: '객실 온천 + 대절탕',
    bath_scope: 'some_rooms',
    bath_contexts: ['room_bath', 'private_bath', 'public_bath'],
    operation_notes: ['객실 타입별 온천 구성 확인 필요', '대절탕은 예약제 공용탕으로 객실탕과 분리'],
  },
  'hakone-byakudan': {
    summary: '전 객실 노천탕을 앞세우는 하코네 고급 료칸형 숙소다. 직접 확인 표본에서는 객실에서 프라이빗하게 온천을 즐기는 경험이 강하게 반복되고, 온천물 자체의 약한 느낌이나 염소 냄새가 핵심 불만으로 반복되지는 않는다.',
    primary_bath: '전 객실 노천탕 중심',
    bath_scope: 'all_rooms',
    bath_contexts: ['room_bath', 'public_bath'],
    operation_notes: ['객실 노천탕 중심으로 안내', '벌레/냉감 등 계절성 이용 신호 일부 있음'],
  },
  'hakone-fontainebleau': {
    summary: '오베르주형 숙박과 객실 노천탕을 함께 소비하는 하코네 숙소다. 후기에서는 전 객실 오와쿠다니 온천탕과 식사 경험이 결합되어 반복되며, 대욕장보다 객실 안 온천을 중심으로 기대치를 잡는 편이 정확하다.',
    primary_bath: '전 객실 노천탕 중심',
    bath_scope: 'all_rooms',
    bath_contexts: ['room_bath'],
    operation_notes: ['대욕장 부재 기대치 확인 필요', '객실 노천탕의 프라이버시/동선 신호 일부 있음'],
  },
  'hakone-gen-gora': {
    summary: '고라의 신상 고급 숙소 계열로, 후기 표본에서는 객실 단위의 프라이빗한 온천 체류와 조용한 숙박 경험이 중심으로 잡힌다. 대형 대욕장형 숙소라기보다 객실 온천과 서비스 완성도를 함께 보는 쪽이 자연스럽다.',
    primary_bath: '객실 온천탕 중심',
    bath_scope: 'some_rooms',
    bath_contexts: ['room_bath'],
    operation_notes: ['객실 타입별 욕장 구성 확인 필요', '신상 고급 숙소로 가격 기대치 관리 필요'],
  },
  'hakone-ginyu': {
    summary: '하코네에서 객실 노천탕과 전망형 체류감으로 강하게 인식되는 숙소다. 후기 표본은 객실에서 온천을 쓰는 경험과 조용한 고급 료칸 분위기에 집중되어, 공용탕보다 객실 노천탕 중심으로 분류하는 편이 맞다.',
    primary_bath: '객실 노천탕 중심',
    bath_scope: 'some_rooms',
    bath_contexts: ['room_bath', 'public_bath'],
    operation_notes: ['객실별 전망/욕장 차이 확인 필요', '고가 숙소 기대치 관리 필요'],
  },
  'hakone-gora-karaku': {
    summary: '객실 노천탕, 전망 대욕장, 예약제 대절탕이 모두 반복 확인되는 복합 온천 숙소다. 전 객실 온천탕만 강조하기보다 객실탕과 공용 전망탕, 대절탕을 나눠 보여줄 때 데이터 가치가 가장 크다.',
    primary_bath: '객실 노천탕 + 전망 대욕장',
    bath_scope: 'all_rooms',
    bath_contexts: ['room_bath', 'private_bath', 'public_bath'],
    operation_notes: ['대절탕 예약 신호 있음', '객실탕과 가족탕/대절탕을 혼동하지 않도록 안내'],
  },
  'hakone-kowakien-tenyu': {
    summary: '하코네 고와키엔권의 대형 리조트형 온천 숙소다. 후기 표본에서는 객실 노천탕과 인피니티형 공용 노천탕, 시설형 체류감이 함께 언급되어 조용한 소규모 료칸보다 리조트 온천 경험으로 보는 편이 맞다.',
    primary_bath: '객실 노천탕 + 리조트 대욕장',
    bath_scope: 'all_rooms',
    bath_contexts: ['room_bath', 'public_bath'],
    operation_notes: ['대형 리조트형 동선/혼잡 기대치 확인', '객실 노천탕과 공용탕을 분리 안내'],
  },
  'hakone-matsuzakaya': {
    summary: '온천 수질과 역사성 신호가 강한 하코네 숙소다. 객실 노천탕, 객실 내탕, 대절탕, 대욕장이 함께 확인되어 하나의 “온천 있음”으로 뭉치기보다 욕장 축을 나눠 보여주는 편이 적합하다.',
    primary_bath: '객실탕 + 대절탕 + 대욕장',
    bath_scope: 'some_rooms',
    bath_contexts: ['room_bath', 'private_bath', 'public_bath'],
    operation_notes: ['수질 만족 신호 강함', '계절별 온도감과 동선 주의 신호 있음'],
  },
  'hakone-yama-no-chaya': {
    summary: '하코네의 조용한 료칸 체류와 객실 노천탕 신호가 강한 숙소다. 다만 모든 객실을 같은 욕장 구성으로 보면 안 되며, 객실 타입별 노천탕 여부와 공용탕 운영 신호를 함께 확인하는 것이 중요하다.',
    primary_bath: '객실 노천탕 중심',
    bath_scope: 'some_rooms',
    bath_contexts: ['room_bath', 'public_bath'],
    operation_notes: ['객실 타입별 노천탕 여부 확인 필요', '계단/동선 주의 신호 있음'],
  },
  'hakone-yuyado-zen': {
    summary: '전 객실 반노천탕을 중심으로 온천 경험이 형성되는 하코네 숙소다. 후기에서는 객실 안에서 원천을 쓰는 만족이 강하게 반복되지만, 대욕장 부재와 온도 조절, 벌레 같은 이용성 신호도 함께 관리해야 한다.',
    primary_bath: '전 객실 반노천탕 중심',
    bath_scope: 'all_rooms',
    bath_contexts: ['room_bath'],
    operation_notes: ['대욕장 없음 기대치 확인 필요', '온도 조절/벌레 등 이용성 신호 일부 있음'],
  },
  'isawa-fujinoya': {
    summary: '이사와 온천에서 객실탕과 대욕장, 대절탕 신호가 모두 두껍게 확인되는 숙소다. 특히 객실탕도 온천으로 인식되는 반응이 강해, 객실탕·공용탕·대절탕을 분리해 비교해야 정보 손실이 적다.',
    primary_bath: '객실탕 + 대욕장 + 대절탕',
    bath_scope: 'some_rooms',
    bath_contexts: ['room_bath', 'private_bath', 'public_bath'],
    operation_notes: ['객실 타입별 욕장 구성 확인 필요', '대절탕 예약/온도 신호 있음'],
  },
  'isawa-itoyanagi': {
    summary: '자가원천 수질, 대욕장, 대절탕, 약석욕이 함께 반복되는 이사와 온천의 복합형 숙소다. 온천 하나만 보는 것보다 물성·대절탕·시설형 체험을 나눠 보여줄 때 선택 기준이 선명해진다.',
    primary_bath: '자가원천 + 대절탕/대욕장',
    bath_scope: 'some_rooms',
    bath_contexts: ['private_bath', 'public_bath'],
    operation_notes: ['대절탕 예약/시간 확인 필요', '약석욕은 온천탕과 별도 축으로 안내'],
  },
  'isawa-itoyanagi-yuwa': {
    summary: '객실탕, 공용 노천 대욕장, 대절탕, 약석욕이 분리 확인되는 이사와의 소규모 숙소다. 후기 표본에서는 대절탕과 약석욕 존재감이 강하고, 객실탕은 만족과 온도 기대차가 함께 나타난다.',
    primary_bath: '객실탕 + 대절탕 + 약석욕',
    bath_scope: 'some_rooms',
    bath_contexts: ['room_bath', 'private_bath', 'public_bath'],
    operation_notes: ['객실탕과 예약제 대절탕을 분리 안내', '온도감 기대차 신호 있음'],
  },
  'yugawara-ashikari': {
    summary: '유가와라에서 객실 노천탕 중심의 조용한 체류를 기대하는 숙소다. 후기에서는 객실마다 붙은 원천가케나가시 노천탕 만족이 강하게 반복되고, 공용 대욕장은 보조 욕장으로 보는 편이 정확하다.',
    primary_bath: '객실 노천탕 중심',
    bath_scope: 'all_rooms',
    bath_contexts: ['room_bath', 'public_bath'],
    operation_notes: ['객실 노천탕 중심으로 안내', '공용 대욕장은 소규모/혼잡 신호 일부 있음'],
  },
  'kawaguchiko-fufu': {
    summary: '후지산 조망과 객실 온천을 함께 기대하는 가와구치코 고급 숙소다. 후기에서는 객실탕/객실 노천탕을 전망과 결합해 평가하는 흐름이 강해, 가족탕이 아니라 객실 내 프라이빗 온천으로 분리해야 한다.',
    primary_bath: '객실 온천 + 후지산 조망',
    bath_scope: 'all_rooms',
    bath_contexts: ['room_bath', 'public_bath'],
    operation_notes: ['조망은 날씨 영향 있음', '프라이빗 온천을 가족탕으로 오역하지 않도록 안내'],
  },
  'kawaguchiko-kukuna': {
    summary: '후지산 전망 대욕장과 일부 객실 노천탕이 함께 강하게 언급되는 전망형 온천 호텔이다. 객실 노천탕은 특정 객실 카테고리 중심이므로, 공용 전망탕과 객실탕을 분리해 보여주는 것이 맞다.',
    primary_bath: '전망 대욕장 + 일부 객실 노천탕',
    bath_scope: 'some_rooms',
    bath_contexts: ['room_bath', 'private_bath', 'public_bath'],
    operation_notes: ['객실 노천탕은 일부 객실 중심', '전망/날씨 기대치 확인 필요'],
  },
  'fujiyoshida-kaneyamaen': {
    summary: '후지산 전망 노천탕과 대욕장 경험이 중심인 후지요시다의 대형 숙소다. 객실 노천탕은 일부 객실 축으로 분리하고, 핵심은 공용 전망 노천탕과 정원·족탕·시설 체류감으로 보는 편이 데이터에 맞다.',
    primary_bath: '후지산 전망 대욕장 중심',
    bath_scope: 'some_rooms',
    bath_contexts: ['room_bath', 'public_bath'],
    operation_notes: ['객실 노천탕은 일부 객실 중심', '전망/정원/대형 시설 동선 기대치 확인'],
  },
};

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

function sqlString(value) {
  if (value == null) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

function sqlTextArray(value) {
  const items = Array.isArray(value) ? value.filter(Boolean) : [];
  return `ARRAY[${items.map(sqlString).join(', ')}]::text[]`;
}

function splitNameParts(value) {
  return String(value ?? '')
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);
}

function hasHangul(value) {
  return /[가-힣]/.test(value);
}

function hasLatin(value) {
  return /[A-Za-z]/.test(value);
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
  const sourceName = lodging?.name_ko_or_en ?? title ?? nameJa;
  const nameParts = splitNameParts(sourceName);
  const displayName = nameParts.find(hasHangul) ?? sourceName;
  const nameEn = nameParts.find((part) => hasLatin(part) && !hasHangul(part)) ?? null;
  return {
    name: displayName,
    ja_name: nameJa,
    display_name_ko: displayName,
    name_ja: nameJa,
    name_en: nameEn,
    name_romaji: null,
    aliases_ko: displayName !== nameJa ? [displayName] : [],
    aliases_ja: [nameJa].filter(Boolean),
    aliases_en: nameEn ? [nameEn] : [],
    name_verification_status: 'needs_review',
    name_source_note: 'Hakone/Kanagawa/Yamanashi QA seed에서 자동 이관. 한국어 대표명은 별도 이름 QA 필요.',
  };
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
    'display_name_ko',
    'name_ja',
    'name_en',
    'name_romaji',
    'aliases_ko',
    'aliases_ja',
    'aliases_en',
    'name_verification_status',
    'name_source_note',
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
      if (['aliases_ko', 'aliases_ja', 'aliases_en'].includes(column)) {
        return sqlTextArray(row[column]);
      }
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
  const summary = curatedCopy[slug]?.summary ?? firstSentenceBlock(interpretation || facts || `${slug} 온천 리뷰 신호 요약`);
  const combinedText = `${facts} ${interpretation}`;
  const names = pickName(mapping, markdown, slug);
  const meta = areaMeta(qaRow.area_label, slug);
  const bathScope = classifyBathScope(combinedText);
  const waterSourceType = classifyWaterSourceType(combinedText);
  const platforms = directBodyPlatforms(mapping);
  const directReviewCount = toInt(qaRow.direct_read_count);
  const onsenReviewCount = toInt(qaRow.onsen_related_count);

  return applyOnsenCopyQa(applyOnsenNameQa({
    slug,
    name: names.name,
    ja_name: names.ja_name,
    display_name_ko: names.display_name_ko,
    name_ja: names.name_ja,
    name_en: names.name_en,
    name_romaji: names.name_romaji,
    aliases_ko: names.aliases_ko,
    aliases_ja: names.aliases_ja,
    aliases_en: names.aliases_en,
    name_verification_status: names.name_verification_status,
    name_source_note: names.name_source_note,
    ...meta,
    country: 'JP',
    travel_contexts: ['ryokan_stay'],
    bath_contexts: curatedCopy[slug]?.bath_contexts ?? deriveBathContexts(combinedText, bathScope),
    water_criteria: deriveWaterCriteria(combinedText, waterSourceType),
    summary,
    primary_bath: curatedCopy[slug]?.primary_bath ?? classifyPrimaryBath(combinedText),
    water_use_status: /온천|温泉|源泉|泉質|天然温泉|自家源泉/.test(facts) ? 'official_confirmed' : 'review_supported',
    water_source_type: waterSourceType,
    bath_scope: curatedCopy[slug]?.bath_scope ?? bathScope,
    operation_notes: [...(curatedCopy[slug]?.operation_notes ?? []), ...operationNotes(combinedText)],
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
  }));
}

async function upsertRows(rows) {
  const env = readLocalEnv();
  const restUrl = (env.CONTENT_DB_REST_URL || `${env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1`).replace(/\/+$/, '');
  const serviceKey = env.CONTENT_DB_SERVICE_ROLE_KEY;
  if (!restUrl || !serviceKey || restUrl.startsWith('undefined')) {
    throw new Error('Missing CONTENT_DB_REST_URL/SUPABASE_URL or CONTENT_DB_SERVICE_ROLE_KEY.');
  }
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
    body: JSON.stringify(rows),
  });
  if (!response.ok) {
    throw new Error(`onsen_accommodations upsert failed: ${response.status} ${await response.text()}`);
  }
}

async function main() {
  const shouldApply = process.argv.includes('--apply');
  const qaRows = parseCsv(await readFile(qaPath, 'utf8')).filter((row) => row.db_ready === 'true');
  const rows = [];
  for (const row of qaRows) rows.push(await createRow(row));
  await mkdir(outputDir, { recursive: true });
  await writeFile(jsonOutputPath, `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(sqlOutputPath, createSql(rows));
  if (shouldApply) await upsertRows(rows);
  const report = [
    '# 하코네/가나가와/야마나시 MVP 숙소 DB 로드 리포트',
    '',
    `- 생성일: ${snapshotDate}`,
    `- 입력 QA 파일: \`${path.relative(repoRoot, qaPath)}\``,
    `- 출력 JSON: \`${path.relative(repoRoot, jsonOutputPath)}\``,
    `- 출력 SQL: \`${path.relative(repoRoot, sqlOutputPath)}\``,
    `- DB 적재 대상: ${rows.length}곳`,
    `- DB 적용 여부: ${shouldApply ? 'applied via PostgREST upsert' : 'export only'}`,
    `- 제외: ${parseCsv(await readFile(qaPath, 'utf8')).filter((row) => row.db_ready !== 'true').length}곳`,
    '',
    '| slug | area | grade | direct | onsen | platforms |',
    '|---|---|---:|---:|---:|---:|',
    ...rows.map((row) => `| ${row.slug} | ${row.region} | ${row.evidence_grade} | ${row.evidence_counts.directReviewCount} | ${row.evidence_counts.onsenReviewCount} | ${row.evidence_counts.directBodyPlatformCount} |`),
    '',
  ].join('\n');
  await writeFile(reportOutputPath, report);
  console.log(`Exported ${rows.length} rows`);
  if (shouldApply) console.log(`Upserted ${rows.length} rows`);
  console.log(jsonOutputPath);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
