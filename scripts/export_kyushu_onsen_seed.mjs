import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { applyOnsenNameQa } from './onsen_name_qa_overrides.mjs';
import { applyOnsenCopyQa } from './onsen_copy_qa_overrides.mjs';

const repoRoot = process.cwd();
const snapshotDate = '2026-07-07';
const researchRoot = path.join(repoRoot, 'research', 'onsen-review-signals');
const finalQaPath = path.join(researchRoot, 'kyushu_db_seed_ready_final_2026-07-06.csv');
const outputDir = path.join(repoRoot, 'output');
const jsonOutputPath = path.join(outputDir, 'kyushu-onsen-mvp-accommodations.v1.json');
const sqlOutputPath = path.join(outputDir, 'kyushu-onsen-mvp-accommodations.v1.postgres.upserts.sql');
const reportOutputPath = path.join(researchRoot, 'kyushu_db_seed_load_report_2026-07-07.md');

const curatedCopy = {
  'kurokawa-okunoyu': {
    summary:
      '구로카와 온천 안쪽에서 대욕장과 노천탕을 중심으로 즐기는 숙소다. 직접 확인 표본에서는 숙소 안에서 여러 탕을 오가며 오래 온천을 즐겼다는 반응이 강하게 반복되고, 객실탕보다는 공용 온천 경험을 중심에 두고 보는 편이 맞다.',
    primary_bath: '대욕장/노천탕 중심',
    bath_scope: 'public_bath_only',
    bath_contexts: ['public_bath', 'private_bath'],
    operation_notes: ['공용 노천탕과 대욕장 중심으로 해석', '객실탕 여부는 객실 타입별 확인 필요'],
  },
  'kurokawa-sanga': {
    summary:
      '구로카와 특유의 숲속 노천탕 경험이 강하게 잡히는 료칸이다. 후기 표본에서는 노천탕의 분위기, 자연 속 체류감, 온천을 위해 일부러 찾는다는 반응이 반복되어 공용 노천탕 중심 숙소로 분류하는 것이 자연스럽다.',
    primary_bath: '숲속 노천탕 중심',
    bath_scope: 'public_bath_only',
    bath_contexts: ['public_bath', 'private_bath'],
    operation_notes: ['공용 노천탕 경험이 핵심', '객실탕 기대보다는 노천탕/대욕장 기대치로 안내'],
  },
  'kurokawa-takefue': {
    summary:
      '프라이빗한 고급 체류와 객실/전용탕 경험을 함께 기대하는 숙소다. 직접 확인 표본에서는 온천 자체보다 객실별 체류감, 전용성, 고급 료칸 경험이 함께 언급되며, 대중적인 대욕장형 숙소와는 다른 축으로 비교해야 한다.',
    primary_bath: '객실/전용 온천탕 중심',
    bath_scope: 'some_rooms',
    bath_contexts: ['room_bath', 'private_bath'],
    operation_notes: ['객실 타입별 욕장 구성이 중요', '고급 프라이빗 체류형으로 해석'],
  },
  'kurokawa-yamamizuki': {
    summary:
      '구로카와를 대표하는 야외 노천탕형 숙소로, 후기에서는 넓은 노천탕과 자연 속 온천감이 강하게 반복된다. 객실 설비보다 공용 노천탕의 매력이 선택 이유로 드러나는 표본이 많아 노천탕 중심으로 보여주는 것이 적합하다.',
    primary_bath: '대형 노천탕 중심',
    bath_scope: 'public_bath_only',
    bath_contexts: ['public_bath'],
    operation_notes: ['공용 노천탕 만족 신호가 중심', '객실탕 중심 숙소로 오해하지 않도록 안내'],
  },
  'ibusuki-hakusuikan': {
    summary:
      '이부스키의 대형 온천 리조트형 숙소다. 표본 규모가 특히 크고, 대욕장과 온천 시설 전반에 대한 언급이 두껍게 쌓여 있어 객실탕보다 시설형 온천 경험을 기대하는 여행자에게 맞는 데이터로 읽힌다.',
    primary_bath: '대욕장/온천시설 중심',
    bath_scope: 'public_bath_only',
    bath_contexts: ['public_bath'],
    operation_notes: ['대형 시설형 온천 숙소로 해석', '객실탕보다 대욕장/시설 동선 기대치가 중요'],
  },
  'ibusuki-yurian': {
    summary:
      '이부스키에서 프라이빗한 객실 온천 체류를 기대하는 숙소다. 후기 표본에서는 객실 노천탕과 독립된 체류감, 조용히 온천을 쓰는 경험이 반복되어 가족/커플 단위의 개인탕 수요와 잘 맞는다.',
    primary_bath: '객실 노천탕 중심',
    bath_scope: 'some_rooms',
    bath_contexts: ['room_bath', 'private_bath'],
    operation_notes: ['객실별 욕장 구성 확인 필요', '프라이빗 체류형 숙소로 안내'],
  },
  'ureshino-shiibasanso': {
    summary:
      '우레시노 온천의 물성과 조용한 산장형 체류감이 함께 드러나는 숙소다. 표본에서는 온천 물의 부드러운 느낌과 대욕장/노천탕 만족이 반복되어, 객실탕보다 우레시노 온천 자체를 즐기는 숙소로 해석하는 편이 좋다.',
    primary_bath: '대욕장/노천탕 중심',
    bath_scope: 'public_bath_only',
    bath_contexts: ['public_bath'],
    operation_notes: ['우레시노 수질 기대치와 함께 안내', '객실탕 여부는 객실 타입별 확인 필요'],
  },
  'ureshino-taishoya': {
    summary:
      '우레시노의 전통 료칸형 온천 경험이 두껍게 확인되는 숙소다. 후기에서는 온천 물의 부드러운 질감, 대욕장 이용, 식사와 접객을 함께 평가하는 흐름이 뚜렷해 온천지 체류형 숙소로 분류하기 좋다.',
    primary_bath: '대욕장 중심',
    bath_scope: 'public_bath_only',
    bath_contexts: ['public_bath'],
    operation_notes: ['우레시노 수질 만족 신호가 중요', '전통 료칸 체류형으로 안내'],
  },
  'ureshino-wataya-besso': {
    summary:
      '우레시노에서 규모감 있는 온천 체류를 원하는 여행자에게 맞는 숙소다. 표본에서는 온천 이용과 시설 체류, 객실/동선 경험이 함께 언급되며, 수질 만족 신호와 운영형 숙소 특유의 평가가 같이 나타난다.',
    primary_bath: '대욕장/시설형 온천 중심',
    bath_scope: 'public_bath_only',
    bath_contexts: ['public_bath'],
    operation_notes: ['규모 있는 시설형 숙소로 안내', '객실 타입과 동선 기대치 확인 필요'],
  },
  'takeo-koyokaku': {
    summary:
      '다케오 온천권에서는 희소한 고급 료칸형 표본이다. 후기 표본에서는 대규모 온천시설보다 조용한 숙박 경험과 온천 이용이 함께 언급되어, 다케오 지역의 정숙한 료칸 선택지로 보는 것이 적합하다.',
    primary_bath: '소규모 료칸 온천 중심',
    bath_scope: 'unclear',
    bath_contexts: ['public_bath'],
    operation_notes: ['다케오 표본은 아직 1곳뿐이라 지역 확장 필요', '객실별 욕장 구성은 추가 확인 권장'],
  },
  'kirishima-lavista': {
    summary:
      '기리시마의 리조트형 온천 숙소로, 후기에서는 대욕장과 전망, 시설형 체류감이 함께 반복된다. 객실탕 중심의 조용한 료칸이라기보다 대욕장과 리조트 편의성을 함께 보는 숙소로 분류하는 것이 맞다.',
    primary_bath: '대욕장/리조트 온천 중심',
    bath_scope: 'public_bath_only',
    bath_contexts: ['public_bath'],
    operation_notes: ['대욕장과 리조트형 시설 경험이 중심', '객실탕 중심 숙소로 오해하지 않도록 안내'],
  },
  'yufuin-ryoutiku': {
    summary:
      '유후인 중심부 접근성과 료칸 체류감을 함께 보는 숙소다. 직접 확인 표본은 충분하며, 온천 관련 언급도 두껍지만 객실탕 하나로 설명하기보다는 유후인 숙박 경험과 온천 이용을 함께 묶어 해석하는 편이 맞다.',
    primary_bath: '유후인 료칸 온천 중심',
    bath_scope: 'some_rooms',
    bath_contexts: ['room_bath', 'public_bath'],
    operation_notes: ['객실 타입별 욕장 구성 확인 필요', '유후인 중심부 체류형으로 안내'],
  },
  'yufuin-hanamura': {
    summary:
      '유후인 역세권과 온천 료칸 경험을 함께 기대하는 숙소다. 후기 표본에서는 온천 이용, 위치 편의, 숙박 만족이 함께 반복되어 객실탕 특화 숙소라기보다 균형형 유후인 숙소로 보는 것이 적합하다.',
    primary_bath: '균형형 유후인 온천숙소',
    bath_scope: 'some_rooms',
    bath_contexts: ['room_bath', 'public_bath'],
    operation_notes: ['위치 편의와 온천 이용을 함께 안내', '객실탕 여부는 객실 타입별 확인 필요'],
  },
  'yufuin-ryu-no-hige': {
    summary:
      '유후인에서 객실 노천탕과 조용한 독립 체류를 기대하는 숙소다. 표본에서는 객실 안에서 온천을 즐기는 경험과 프라이빗한 분위기가 강하게 반복되어, 개인탕 수요가 뚜렷한 여행자에게 맞는 후보로 볼 수 있다.',
    primary_bath: '객실 노천탕 중심',
    bath_scope: 'some_rooms',
    bath_contexts: ['room_bath', 'private_bath'],
    operation_notes: ['객실 타입별 노천탕 구성 확인 필요', '프라이빗 체류형으로 안내'],
  },
  'yufuin-poppoan': {
    summary:
      '유후인에서 객실탕 중심의 조용한 숙박을 기대하는 표본이 강하게 잡힌다. 후기에서는 방 안에서 온천을 쓰는 편안함과 프라이빗한 체류감이 반복되어 대욕장보다 객실 온천 경험을 앞세우는 것이 적합하다.',
    primary_bath: '객실 온천탕 중심',
    bath_scope: 'some_rooms',
    bath_contexts: ['room_bath', 'private_bath'],
    operation_notes: ['객실탕 중심 기대치로 안내', '객실별 욕장 형태 확인 필요'],
  },
  'yufuin-baien': {
    summary:
      '유후인의 정원형 리조트 감성과 온천 이용이 함께 언급되는 숙소다. 표본에서는 온천 관련 반응이 충분히 반복되며, 객실탕 특화보다는 넓은 부지와 대욕장/노천탕을 함께 즐기는 숙소로 해석하는 편이 좋다.',
    primary_bath: '대욕장/정원형 온천 중심',
    bath_scope: 'public_bath_only',
    bath_contexts: ['public_bath'],
    operation_notes: ['정원형 리조트 체류감과 온천을 함께 안내', '객실탕 여부는 객실 타입별 확인 필요'],
  },
  'yufuin-ubl-hotel': {
    summary:
      '유후인에서 비교적 차분한 호텔형 온천 숙소로 읽힌다. 표본 규모는 A 기준을 충족하며, 온천 관련 언급도 충분하지만 객실탕 특화보다는 대욕장과 숙박 편의성을 함께 보는 쪽이 자연스럽다.',
    primary_bath: '호텔형 대욕장 중심',
    bath_scope: 'public_bath_only',
    bath_contexts: ['public_bath'],
    operation_notes: ['호텔형 온천 숙소로 안내', '객실탕 기대보다는 대욕장 이용 중심'],
  },
  'beppu-amane-resort-seikai': {
    summary:
      '벳푸 해안가에서 객실 노천탕과 바다 전망을 함께 기대하는 대표 숙소다. 표본에서는 객실에서 온천을 쓰는 경험과 공용 온천 시설 이용이 함께 반복되어, 객실 노천탕 중심으로 보여주되 대욕장 축도 분리해야 한다.',
    primary_bath: '객실 노천탕 + 공용 온천',
    bath_scope: 'all_rooms',
    bath_contexts: ['room_bath', 'public_bath'],
    operation_notes: ['객실 노천탕과 공용 온천을 분리 안내', '해안 전망 기대치가 중요'],
  },
  'beppu-amane-resort-gahama': {
    summary:
      '세이카이보다 더 프라이빗한 별장형 체류에 가까운 벳푸 숙소다. 후기 표본에서는 객실탕 중심의 조용한 온천 경험과 리조트형 서비스가 함께 확인되어, 객실 온천을 우선하는 여행자에게 맞는 후보로 볼 수 있다.',
    primary_bath: '객실 온천탕 중심',
    bath_scope: 'all_rooms',
    bath_contexts: ['room_bath', 'private_bath'],
    operation_notes: ['객실탕 중심 프라이빗 체류형으로 안내', 'SEIKAI와 공용 시설 이용 축 분리 필요'],
  },
  'beppu-ana-intercontinental': {
    summary:
      '벳푸의 글로벌 럭셔리 리조트형 온천 숙소다. 표본에서는 객실탕보다 대욕장, 전망, 리조트 서비스가 함께 평가되며, 전통 료칸 온천보다는 고급 호텔 안의 온천 경험으로 기대치를 잡는 편이 맞다.',
    primary_bath: '럭셔리 리조트 대욕장 중심',
    bath_scope: 'public_bath_only',
    bath_contexts: ['public_bath'],
    operation_notes: ['리조트형 온천 경험으로 안내', '전통 료칸/객실탕 중심 기대와 구분'],
  },
  'beppu-kannawaen': {
    summary:
      '벳푸 철륜온천권의 온천 리조트형 숙소로, 객실 온천과 공용 온천 경험이 함께 확인된다. 후기에서는 온천 이용 만족이 두껍게 반복되어 객실 타입별 욕장과 대욕장을 나누어 보여주는 것이 중요하다.',
    primary_bath: '객실 온천 + 대욕장',
    bath_scope: 'some_rooms',
    bath_contexts: ['room_bath', 'public_bath'],
    operation_notes: ['객실 타입별 욕장 구성 확인 필요', '철륜온천권 숙소로 안내'],
  },
  'beppu-kokoroan': {
    summary:
      '벳푸에서 객실 안 온천 경험을 강하게 기대하는 숙소다. 직접 확인 표본에서는 객실탕과 프라이빗한 체류감이 뚜렷하게 반복되어, 대욕장보다 객실 온천을 중시하는 여행자에게 맞는 후보로 분류할 수 있다.',
    primary_bath: '객실 온천탕 중심',
    bath_scope: 'all_rooms',
    bath_contexts: ['room_bath', 'private_bath'],
    operation_notes: ['객실탕 중심 숙소로 안내', '대욕장 기대보다 프라이빗 온천 기대치가 중요'],
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
  const cleanHeaders = headers.map((header) => header.replace(/^\uFEFF/, ''));
  return body.map((values) =>
    Object.fromEntries(cleanHeaders.map((header, index) => [header, values[index] ?? '']))
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

function toInt(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.floor(parsed) : 0;
}

function splitPlatforms(value, count) {
  const platforms = String(value ?? '')
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);
  if (platforms.length > 0) return platforms;
  return Array.from({ length: count }, (_, index) => `direct_body_platform_${index + 1}`);
}

function metaForArea(areaBucket) {
  const area = areaBucket.toLowerCase();
  if (area === 'yufuin') {
    return {
      region: 'yufuin',
      area: '오이타 유후인',
      prefecture: 'oita',
      city: 'yufu',
      onsen_area: 'yufuin',
    };
  }
  if (area === 'beppu') {
    return {
      region: 'beppu',
      area: '오이타 벳푸',
      prefecture: 'oita',
      city: 'beppu',
      onsen_area: 'beppu',
    };
  }
  if (area === 'kurokawa') {
    return {
      region: 'kurokawa',
      area: '구마모토 구로카와',
      prefecture: 'kumamoto',
      city: 'minamioguni',
      onsen_area: 'kurokawa',
    };
  }
  if (area === 'ibusuki') {
    return {
      region: 'ibusuki',
      area: '가고시마 이부스키',
      prefecture: 'kagoshima',
      city: 'ibusuki',
      onsen_area: 'ibusuki',
    };
  }
  if (area === 'ureshino') {
    return {
      region: 'ureshino',
      area: '사가 우레시노',
      prefecture: 'saga',
      city: 'ureshino',
      onsen_area: 'ureshino',
    };
  }
  if (area === 'takeo') {
    return {
      region: 'takeo',
      area: '사가 다케오',
      prefecture: 'saga',
      city: 'takeo',
      onsen_area: 'takeo',
    };
  }
  if (area === 'kirishima') {
    return {
      region: 'kirishima',
      area: '가고시마 기리시마',
      prefecture: 'kagoshima',
      city: 'kirishima',
      onsen_area: 'kirishima',
    };
  }
  return {
    region: area,
    area: `규슈 ${areaBucket}`,
    prefecture: 'kyushu',
    city: null,
    onsen_area: area,
  };
}

function primaryBathForRow(row) {
  if (curatedCopy[row.slug]?.primary_bath) return curatedCopy[row.slug].primary_bath;
  const text = `${row.name_ja} ${row.name_ko_or_en} ${row.track} ${row.notes}`;
  if (/(全室|전 객실|객실마다).*(露天|노천|温泉|온천)|AMANE RESORT SEIKAI|Gahama|心庵|龍のひげ|ぽっぽ庵/i.test(text)) {
    return '객실 온천탕 중심';
  }
  if (/(大浴場|대욕장|공용|白水館|라비스타|Lavista)/i.test(text)) return '대욕장 중심';
  if (/(貸切|가족탕|대절|프라이빗)/i.test(text)) return '대절탕/프라이빗탕 있음';
  return '온천 숙박 경험 중심';
}

function bathScopeForRow(row) {
  if (curatedCopy[row.slug]?.bath_scope) return curatedCopy[row.slug].bath_scope;
  const text = `${row.name_ja} ${row.name_ko_or_en} ${row.track} ${row.notes}`;
  if (/(全室|전 객실|객실마다|AMANE RESORT SEIKAI|Gahama|心庵)/i.test(text)) return 'all_rooms';
  if (/(객실|部屋|露天付き|龍のひげ|ぽっぽ庵|由布両築|悠離庵)/i.test(text)) return 'some_rooms';
  if (/(大浴場|대욕장|공용)/i.test(text)) return 'public_bath_only';
  return 'unclear';
}

function bathContextsForRow(row, bathScope) {
  if (curatedCopy[row.slug]?.bath_contexts) return curatedCopy[row.slug].bath_contexts;
  const text = `${row.name_ja} ${row.name_ko_or_en} ${row.track} ${row.notes}`;
  const values = new Set();
  if (['all_rooms', 'some_rooms', 'room_signal_only'].includes(bathScope)) values.add('room_bath');
  if (/(貸切|가족탕|대절|프라이빗|private)/i.test(text)) values.add('private_bath');
  if (/(大浴場|대욕장|공용|public|白水館|라비스타|Lavista)/i.test(text) || values.size === 0) values.add('public_bath');
  return [...values];
}

function waterCriteriaForRow(row) {
  const text = `${row.name_ja} ${row.name_ko_or_en} ${row.visible_review_pool_signal} ${row.notes}`;
  const values = new Set(['spring_confirmed']);
  if (/(源泉|かけ流し|掛け流し|원천)/.test(text)) values.add('direct_source');
  if (/(100%|１００％|天然温泉100)/.test(text)) values.add('natural_100');
  if (/(수질|탕질|피부|泉質|とろ|ツル|美人)/.test(text)) values.add('water_texture');
  return [...values];
}

function summaryForRow(row) {
  if (curatedCopy[row.slug]?.summary) return curatedCopy[row.slug].summary;
  const direct = toInt(row.direct_read);
  const onsen = toInt(row.onsen_related);
  const platforms = toInt(row.platform_count);
  const koreanName = row.name_ko_or_en ? ` / ${row.name_ko_or_en}` : '';
  return `${row.name_ja}${koreanName}는 규슈 ${row.area_bucket}권 MVP 숙소로, QA 통과 표본 기준 직접 확인 리뷰 ${direct.toLocaleString('ko-KR')}건 중 온천 관련 ${onsen.toLocaleString('ko-KR')}건이 분리 집계됐다. 직접 본문 플랫폼은 ${platforms}개이며, visible review pool과 검색 스니펫은 직접 리뷰 수에 합산하지 않았다.`;
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

function createNameFields(row) {
  const nameParts = splitNameParts(row.name_ko_or_en);
  const sourceName = String(row.name_ko_or_en ?? '').trim();
  const displayNameKo = nameParts.find(hasHangul) ?? (sourceName || row.name_ja);
  const nameEn = nameParts.find((part) => hasLatin(part) && !hasHangul(part)) ?? null;
  return {
    display_name_ko: displayNameKo,
    name_ja: row.name_ja,
    name_en: nameEn,
    name_romaji: null,
    aliases_ko: displayNameKo !== row.name_ja ? [displayNameKo] : [],
    aliases_ja: [row.name_ja].filter(Boolean),
    aliases_en: nameEn ? [nameEn] : [],
    name_verification_status: 'needs_review',
    name_source_note: 'Kyushu QA seed에서 자동 이관. 한국어 대표명은 별도 이름 QA 필요.',
  };
}

function createRow(row) {
  const directReviewCount = toInt(row.direct_read);
  const onsenReviewCount = toInt(row.onsen_related);
  const platformCount = toInt(row.platform_count);
  const meta = metaForArea(row.area_bucket);
  const bathScope = bathScopeForRow(row);
  const waterCriteria = waterCriteriaForRow(row);
  const waterSourceType = waterCriteria.includes('natural_100')
    ? 'natural_100'
    : waterCriteria.includes('direct_source')
      ? 'free_flowing_source'
      : 'hot_spring_confirmed';
  const nameFields = createNameFields(row);

  return applyOnsenCopyQa(applyOnsenNameQa({
    slug: row.slug,
    name: nameFields.display_name_ko,
    ja_name: row.name_ja,
    ...nameFields,
    ...meta,
    country: 'JP',
    region_group: 'kyushu',
    travel_contexts: ['ryokan_stay'],
    bath_contexts: bathContextsForRow(row, bathScope),
    water_criteria: waterCriteria,
    summary: summaryForRow(row),
    primary_bath: primaryBathForRow(row),
    water_use_status: 'review_supported',
    water_source_type: waterSourceType,
    bath_scope: bathScope,
    operation_notes: [
      ...(curatedCopy[row.slug]?.operation_notes ?? []),
      '공식 시설 사실과 후기 신호를 분리해 해석',
      'visible review pool은 직접 확인 리뷰 수와 별도 관리',
    ],
    evidence_counts: {
      directReviewCount,
      onsenReviewCount,
      directBodyPlatformCount: platformCount,
      directBodyPlatforms: splitPlatforms(row.direct_body_platforms, platformCount),
      visibleReviewPoolSignal: row.visible_review_pool_signal || null,
      qaStatus: row.qa_status,
      sourceBucket: row.source_bucket,
      mvpDataset: 'kyushu_onsen_mvp_v1',
    },
    evidence_grade: row.grade,
    evidence_note: `A: 직접 확인 ${directReviewCount}건, 온천 관련 ${onsenReviewCount}건, 직접 본문 플랫폼 ${platformCount}개`,
    status: 'active',
    source_file: row.final_file_basis || 'research/onsen-review-signals/kyushu_db_seed_ready_final_2026-07-06.csv',
    content_updated_at: snapshotDate,
  }));
}

function buildSql(rows) {
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
    'country',
    'region_group',
    'prefecture',
    'city',
    'onsen_area',
    'travel_contexts',
    'bath_contexts',
    'water_criteria',
  ];
  const values = rows.map((row) => `(${[
    sqlString(row.slug),
    sqlString(row.name),
    sqlString(row.ja_name),
    sqlString(row.display_name_ko),
    sqlString(row.name_ja),
    sqlString(row.name_en),
    sqlString(row.name_romaji),
    sqlTextArray(row.aliases_ko),
    sqlTextArray(row.aliases_ja),
    sqlTextArray(row.aliases_en),
    sqlString(row.name_verification_status),
    sqlString(row.name_source_note),
    sqlString(row.region),
    sqlString(row.area),
    sqlString(row.summary),
    sqlString(row.primary_bath),
    sqlString(row.water_use_status),
    sqlString(row.water_source_type),
    sqlString(row.bath_scope),
    sqlJson(row.operation_notes),
    sqlJson(row.evidence_counts),
    sqlString(row.evidence_grade),
    sqlString(row.evidence_note),
    sqlString(row.status),
    sqlString(row.source_file),
    sqlString(row.content_updated_at),
    sqlString(row.country),
    sqlString(row.region_group),
    sqlString(row.prefecture),
    sqlString(row.city),
    sqlString(row.onsen_area),
    sqlJson(row.travel_contexts),
    sqlJson(row.bath_contexts),
    sqlJson(row.water_criteria),
  ].join(', ')})`);

  return [
    '-- Generated by scripts/export_kyushu_onsen_seed.mjs',
    `-- Snapshot: ${snapshotDate}`,
    '-- Scope: Kyushu MVP accommodations only. Facility candidates are excluded.',
    '',
    `INSERT INTO onsen_accommodations (${columns.join(', ')})`,
    'VALUES',
    values.join(',\n'),
    'ON CONFLICT (slug) DO UPDATE SET',
    columns
      .filter((column) => column !== 'slug')
      .map((column) => `  ${column} = EXCLUDED.${column}`)
      .join(',\n') + ',',
    '  updated_at = NOW();',
    '',
  ].join('\n');
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
  const qaRows = parseCsv(await readFile(finalQaPath, 'utf8')).filter((row) => row.qa_status === 'ready_for_db');
  const rows = qaRows.map(createRow);
  await mkdir(outputDir, { recursive: true });
  await writeFile(jsonOutputPath, `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(sqlOutputPath, buildSql(rows));

  if (shouldApply) {
    await upsertRows(rows);
  }

  const byRegion = rows.reduce((acc, row) => {
    acc[row.region] = (acc[row.region] ?? 0) + 1;
    return acc;
  }, {});
  const directTotal = rows.reduce((sum, row) => sum + row.evidence_counts.directReviewCount, 0);
  const onsenTotal = rows.reduce((sum, row) => sum + row.evidence_counts.onsenReviewCount, 0);
  const report = [
    '# Kyushu MVP DB Load Report',
    '',
    `- 생성일: ${snapshotDate}`,
    `- 입력 QA 파일: \`${path.relative(repoRoot, finalQaPath)}\``,
    `- 출력 JSON: \`${path.relative(repoRoot, jsonOutputPath)}\``,
    `- 출력 SQL: \`${path.relative(repoRoot, sqlOutputPath)}\``,
    `- DB 적재 대상: ${rows.length}곳`,
    `- DB 적용 여부: ${shouldApply ? 'applied via PostgREST upsert' : 'export only'}`,
    `- 직접 확인 리뷰 합계: ${directTotal.toLocaleString('ko-KR')}건`,
    `- 온천 관련 직접 리뷰 합계: ${onsenTotal.toLocaleString('ko-KR')}건`,
    '',
    '## 지역 구성',
    '',
    ...Object.entries(byRegion).map(([region, count]) => `- ${region}: ${count}`),
    '',
    '## 적재 행',
    '',
    '| slug | region | grade | direct | onsen | platforms |',
    '|---|---|---:|---:|---:|---:|',
    ...rows.map((row) => `| ${row.slug} | ${row.region} | ${row.evidence_grade} | ${row.evidence_counts.directReviewCount} | ${row.evidence_counts.onsenReviewCount} | ${row.evidence_counts.directBodyPlatformCount} |`),
    '',
    '## QA Gate',
    '',
    '- 숙소용 `onsen_accommodations` 대상만 포함했고, 온천시설 후보는 제외했다.',
    '- `qa_status=ready_for_db`인 22건만 적재 대상으로 삼았다.',
    '- 모든 행은 `status=active`, `region_group=kyushu`로 생성했다.',
    '- visible review pool 및 검색 스니펫은 직접 리뷰 수와 합산하지 않았다.',
    '',
  ].join('\n');
  await writeFile(reportOutputPath, report);

  console.log(`Exported ${rows.length} Kyushu rows.`);
  if (shouldApply) console.log(`Upserted ${rows.length} Kyushu rows.`);
  console.log(path.relative(repoRoot, jsonOutputPath));
  console.log(path.relative(repoRoot, sqlOutputPath));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
