import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const outputDir = path.join(repoRoot, 'research/onsen-db-seed');
const outputBase = 'onsen_water_term_p0_official_audit_2026-07-09';

const rows = [
  {
    slug: 'echigo-yuzawa-nakaya',
    name_ko: '오유야도 나카야',
    name_ja: '越後湯沢温泉 一望千里 御湯宿 中屋',
    water_system: 'kakenagashi',
    scope: 'public_bath',
    kasui: 'not_confirmed',
    kaon: 'not_confirmed',
    disinfection: 'not_confirmed',
    source_type: 'official_ota',
    official_original_text: '当館の大浴場は源泉かけ流しとなっており、湧き出たままの温泉に浸かることができます。消毒・足し湯等は一切行っておりません。',
    official_source_url: 'https://travel.rakuten.co.jp/HOTEL/28757/THEME/1/',
    note_ko: '라쿠텐 테마 페이지 기준 대욕장 중심 직수입니다. 객실탕 범위는 별도 확정하지 않습니다.',
    qa_status: 'ready_for_qa',
  },
  {
    slug: 'echigo-yuzawa-quattro',
    name_ko: '시키 유자와 콰트로',
    name_ja: '四季Yuzawa QUATTRO',
    water_system: 'kakenagashi',
    scope: 'room_bath',
    kasui: 'unknown',
    kaon: 'unknown',
    disinfection: 'unknown',
    source_type: 'official',
    official_original_text: '全室に源泉かけ流しの露天風呂が付いております。',
    official_source_url: 'https://www.quattro-yuzawa.jp/room/index.html',
    note_ko: '공식 객실 페이지 기준 전 객실 노천탕 직수입니다. 가수·가온·소독 조건은 공식 표면에서 분리 확인하지 못했습니다.',
    qa_status: 'ready_for_qa',
  },
  {
    slug: 'echigo-yuzawa-takahan',
    name_ko: '유키구니노야도 다카한',
    name_ja: '越後湯沢温泉 雪国の宿 高半',
    water_system: 'kakenagashi',
    scope: 'public_bath',
    kasui: 'not_confirmed',
    kaon: 'not_confirmed',
    disinfection: 'confirmed',
    source_type: 'official',
    official_original_text: '源泉温度は約43℃、加水も加温も必要なくお入りいただける源泉そのままの温泉となっております。全ての浴槽の温泉を24時間以内に必ず抜いて清掃しています。また毎日、浴槽を次亜塩素酸消毒しています。',
    official_source_url: 'https://www.takahan.co.jp/spa/',
    note_ko: '공식 온천 페이지 기준 가수·가온은 필요 없지만 욕조 소독 표기가 있어 순수직수로 승격하지 않습니다.',
    qa_status: 'ready_for_qa',
  },
  {
    slug: 'ito-gensen-tsuki',
    name_ko: '겐센토 하나레노오야도 츠키',
    name_ja: '伊東温泉 源泉と離れのお宿 月',
    water_system: 'kakenagashi',
    scope: 'room_bath_and_public_bath',
    kasui: 'confirmed_conditional',
    kaon: 'not_confirmed',
    disinfection: 'not_confirmed',
    source_type: 'official',
    official_original_text: '源泉名 対馬30号泉（自家源泉掛け流し式）。加水の有無 季節により若干調整。加温の有無 無。循環の有無 無。消毒の有無 無。',
    official_source_url: 'https://tsuki.cc/hotspring/',
    note_ko: '공식 온천 페이지가 계절별 약간의 가수를 명시합니다. 직수는 가능하지만 순수직수는 제외합니다.',
    qa_status: 'ready_for_qa',
  },
  {
    slug: 'matsumoto-jujo',
    name_ko: '마쓰모토 주조',
    name_ja: '松本十帖',
    water_system: 'kakenagashi',
    scope: 'room_bath_and_public_bath',
    kasui: 'unknown',
    kaon: 'confirmed',
    disinfection: 'unknown',
    source_type: 'official_ota',
    official_original_text: '源泉100%（加温）。客室の露天風呂も源泉かけ流しですが、「小柳之湯」は貯湯タンクを通さず、送湯管直結。',
    official_source_url: 'https://www.ikyu.com/00002912/',
    note_ko: '공식 OTA 표면에서 가온이 함께 확인됩니다. 방식은 직수로 두고 순수직수는 제외합니다.',
    qa_status: 'ready_for_qa',
  },
  {
    slug: 'hakone-byakudan',
    name_ko: '하코네 고라 백단',
    name_ja: '箱根強羅 白檀',
    water_system: 'kakenagashi',
    scope: 'room_bath_and_public_bath',
    kasui: 'unknown',
    kaon: 'unknown',
    disinfection: 'unknown',
    source_type: 'official',
    official_original_text: '白檀のすべてのお風呂は、循環などのまったくない、源泉掛け流しのみによる新鮮な温泉のご入浴をお楽しみいただけます。',
    official_source_url: 'https://www.byakudan.co.jp/onsen/',
    note_ko: '공식 온천 페이지 기준 모든 욕장 직수 및 무순환은 확인됩니다. 가수·가온·소독은 별도 미확인입니다.',
    qa_status: 'ready_for_qa',
  },
  {
    slug: 'hakone-gen-gora',
    name_ko: '겐 하코네 고라',
    name_ja: '玄 箱根強羅',
    water_system: 'kakenagashi',
    scope: 'room_bath_and_public_bath',
    kasui: 'unknown',
    kaon: 'unknown',
    disinfection: 'unknown',
    source_type: 'official',
    official_original_text: '玄では全てのご入浴にて、強羅の豊富で良質な源泉を、清潔安心な掛け流しでご提供しております。',
    official_source_url: 'https://www.gen-hakone.com/spa/index.html',
    note_ko: '공식 온천 페이지 기준 전 욕장 직수입니다. 조건 필드는 공식 표면에서 분리 확인하지 못했습니다.',
    qa_status: 'ready_for_qa',
  },
  {
    slug: 'yufuin-baien',
    name_ko: '유후인 바이엔 가든 리조트',
    name_ja: '由布院 梅園 GARDEN RESORT',
    water_system: 'kakenagashi',
    scope: 'public_bath_and_private_bath',
    kasui: 'confirmed',
    kaon: 'unknown',
    disinfection: 'unknown',
    source_type: 'official_and_official_ota',
    official_original_text: '湧き出したままの新鮮な源泉かけ流しの「美人の湯」をご堪能いただけます。楽天表面では「100％かけ流し温泉。源泉が70℃以上と温度が高いため、加水をしております」と表記。',
    official_source_url: 'https://www.yufuin-baien.com/onsen/ ; https://travel.rakuten.co.jp/HOTEL/39494/39494_onsen.html',
    note_ko: '공식은 직수, 라쿠텐은 가수를 명시합니다. 가수 조건이 있으므로 순수직수는 제외합니다.',
    qa_status: 'ready_for_qa',
  },
  {
    slug: 'yufuin-sakuratei',
    name_ko: '오야도 사쿠라테이',
    name_ja: '全室露天付き離れ宿 御宿 さくら亭',
    water_system: 'kakenagashi_pure_candidate',
    scope: 'room_bath',
    kasui: 'not_confirmed',
    kaon: 'not_confirmed',
    disinfection: 'unknown',
    source_type: 'official_and_official_ota',
    official_original_text: '全１０棟、源泉かけ流し「全室露天風呂付き離れ宿 御宿 さくら亭」。一休プラン表面では「加水加温一切なしの源泉かけ流し」と表記。',
    official_source_url: 'https://sakuratei.info/ ; https://www.ikyu.com/00030348/10892859/10061560/',
    note_ko: '공식과 공식 OTA 기준 전 객실 직수, 무가수·무가온까지 확인됩니다. 소독/순환 조건은 최종 QA에서 한 번 더 확인해야 합니다.',
    qa_status: 'needs_condition_qa_before_pure',
  },
  {
    slug: 'yufuin-warabino',
    name_ko: '산소 와라비노',
    name_ja: '山荘 わらび野',
    water_system: 'kakenagashi',
    scope: 'room_bath',
    kasui: 'unknown',
    kaon: 'unknown',
    disinfection: 'unknown',
    source_type: 'local_prior_official_or_ota_summary',
    official_original_text: '전 객실 원천가케나가시 온천 포함',
    official_source_url: 'research/onsen-review-signals/yufuin-tier2-deep-research/yufuin-warabino/review_signal_summary_curated_2026-07-02.json',
    note_ko: '로컬 이전 큐의 공식/OTA 요약 근거만 확인했습니다. 적용 전 현재 공식/OTA 원문 URL 재확인이 필요합니다.',
    qa_status: 'needs_url_recheck',
  },
  {
    slug: 'ureshino-shiibasanso',
    name_ko: '우레시노 온천 시이바산소',
    name_ja: '嬉野温泉 椎葉山荘 / 大正屋 椎葉山荘',
    water_system: null,
    scope: 'public_bath',
    kasui: 'unknown',
    kaon: 'unknown',
    disinfection: 'unknown',
    source_type: 'official',
    official_original_text: '泉質 ナトリウム・炭酸水素塩・塩化物温泉。泉温 48.8度。',
    official_source_url: 'https://www.shiibasanso.com/spa/',
    note_ko: '공식 온천 페이지에서는 수질·온도만 확인되고 직수 방식은 확인하지 못했습니다. 기존 후보는 보류합니다.',
    qa_status: 'hold_no_method_badge',
  },
  {
    slug: 'tokachigawa-seijakubou',
    name_ko: '도카치가와 온천 세이자쿠보',
    name_ja: '全室源泉かけ流し露天風呂付きの宿 清寂房《十勝川モール温泉》',
    water_system: 'kakenagashi',
    scope: 'room_bath',
    kasui: 'unknown',
    kaon: 'unknown',
    disinfection: 'unknown',
    source_type: 'official_name_surface_and_official',
    official_original_text: '全室源泉かけ流し露天風呂付きの宿。公式サイトは十勝川モール温泉の宿として案内。',
    official_source_url: 'https://seijyakubow.jp/',
    note_ko: '공식명 표면에서 전 객실 직수 노천탕은 확인됩니다. 조건 필드는 공식 사이트 표면에서 분리 확인하지 못했습니다.',
    qa_status: 'ready_for_qa',
  },
  {
    slug: 'shirahama-yanagiya',
    name_ko: '시라하마 야나기야',
    name_ja: '白浜温泉 家族とすごす白浜の宿 柳屋',
    water_system: 'kakenagashi_pure_candidate',
    scope: 'public_bath',
    kasui: 'not_confirmed',
    kaon: 'not_confirmed_by_yumomi_method',
    disinfection: 'unknown',
    source_type: 'official_and_tourism_association',
    official_original_text: '湧き出した源泉のみで湯舟を満たしています。観光協会表面では「水を加えることなく、また濾過器による循環利用をすることもなく、源泉100%の湯が絶えず湯船にあふれ出る」と表記。',
    official_source_url: 'https://www.yanagiya-hotel.jp/onsen/ ; https://www.wakayama-kanko.or.jp/features/onsen_resort',
    note_ko: '공식은 원천만으로 채운다고 설명합니다. 소독 조건은 미확인이라 적용 전 순수직수 QA가 필요합니다.',
    qa_status: 'needs_condition_qa_before_pure',
  },
  {
    slug: 'hakone-yuyado-zen',
    name_ko: '하코네 유야도 젠',
    name_ja: '箱根湯宿 然-ZEN-',
    water_system: 'kakenagashi',
    scope: 'room_bath',
    kasui: 'unknown',
    kaon: 'unknown',
    disinfection: 'unknown',
    source_type: 'official_and_tourism_association',
    official_original_text: '天然かけ流しにごり湯。箱根町観光協会表面では「全部屋に設置された半露天風呂は、強羅温泉を、掛け流しでお愉しみいただけます」と表記。',
    official_source_url: 'https://www.hakone-zen.com/ ; https://www.hakone.or.jp/1585',
    note_ko: '공식/관광협회 표면 기준 전 객실 반노천탕 직수입니다. 조건 필드는 미확인입니다.',
    qa_status: 'ready_for_qa',
  },
  {
    slug: 'beppu-yunosato-hayama',
    name_ko: '유노사토 하야마',
    name_ja: '別府 鉄輪温泉 湯の里 葉山',
    water_system: 'kakenagashi',
    scope: 'public_bath_and_private_bath',
    kasui: 'unknown',
    kaon: 'unknown',
    disinfection: 'unknown',
    source_type: 'official_and_official_ota',
    official_original_text: '源泉かけ流しの4つの鉄輪温泉湯巡りを楽しめる旅館です。3種類の貸切湯が自慢の天然温泉かけ流しの宿です。KNT表面では「天然温泉100％の源泉掛け流し」と表記。',
    official_source_url: 'https://yunosato-hayama.co.jp/ ; https://yado.knt.co.jp/st/S440030/',
    note_ko: '공식/공식 OTA 기준 대욕장과 대절탕 중심 직수입니다. 조건 필드는 미확인입니다.',
    qa_status: 'ready_for_qa',
  },
  {
    slug: 'beppu-yutorelo',
    name_ko: '유토리로 벳푸',
    name_ja: '和モダン湯宿 ゆとりろ別府',
    water_system: 'kakenagashi',
    scope: 'public_bath',
    kasui: 'confirmed_for_temperature_adjustment',
    kaon: 'unknown',
    disinfection: 'unknown',
    source_type: 'official_and_official_ota',
    official_original_text: '自家源泉を堪能できる和モダン湯宿。楽天表面では「ゆとりろ別府の温泉は、自家源泉かけ流し。源泉の温度が非常に高いため、加水をしながら温度調整」と表記。',
    official_source_url: 'https://www.yutorelo-beppu.com/ ; https://travel.rakuten.co.jp/HOTEL/108141/108141.html',
    note_ko: '직수는 확인되지만 온도 조정 가수가 함께 확인됩니다. 순수직수는 제외합니다.',
    qa_status: 'ready_for_qa',
  },
  {
    slug: 'ibusuki-ginsyo',
    name_ko: '이부스키 긴쇼',
    name_ja: '夫婦露天風呂の宿 吟松',
    water_system: 'kakenagashi',
    scope: 'room_bath_and_public_bath',
    kasui: 'unknown',
    kaon: 'unknown',
    disinfection: 'unknown',
    source_type: 'local_prior_official_summary',
    official_original_text: '대욕장 내탕/노천 + 객실 노천 源泉かけ流し',
    official_source_url: 'research/onsen-review-signals/ibusuki-ginsyo/platform_mapping_2026-07-04.json',
    note_ko: '로컬 이전 공식 요약 근거만 확인했습니다. 현재 공식 URL 원문 재확인이 필요합니다.',
    qa_status: 'needs_url_recheck',
  },
  {
    slug: 'unzen-fukudaya',
    name_ko: '운젠 후쿠다야',
    name_ja: '雲仙福田屋',
    water_system: 'kakenagashi',
    scope: 'public_bath_and_some_room_bath',
    kasui: 'unknown',
    kaon: 'unknown',
    disinfection: 'unknown',
    source_type: 'official_and_official_ota',
    official_original_text: '公式表面では硫黄の香りがする温泉。Yahoo表面では白濁源泉掛け流し八湯めぐりの湯と表記。',
    official_source_url: 'https://www.fukudaya.co.jp/ ; https://travel.yahoo.co.jp/00001761/',
    note_ko: '직수 표면은 확인되지만 조건 필드는 공식/공식 OTA에서 분리 확인하지 못했습니다.',
    qa_status: 'ready_for_qa',
  },
  {
    slug: 'yufuin-konjakuan',
    name_ko: '벳소 콘자쿠안',
    name_ja: '別荘 今昔庵',
    water_system: 'kakenagashi',
    scope: 'some_rooms_and_private_bath',
    kasui: 'unknown',
    kaon: 'unknown',
    disinfection: 'unknown',
    source_type: 'official',
    official_original_text: '源泉かけ流しの温泉を堪能。露天風呂付離れの2タイプの客室。',
    official_source_url: 'https://konjakuan.co.jp/onsen/',
    note_ko: '공식 표면 기준 직수입니다. 객실탕과 대절 가족탕 범위는 분리 QA가 필요합니다.',
    qa_status: 'ready_for_qa',
  },
  {
    slug: 'yufuin-wazanho',
    name_ko: '유후인 료안 와잔호',
    name_ja: 'ゆふいん旅庵 和山豊',
    water_system: 'kakenagashi_pure_candidate',
    scope: 'room_bath_and_public_bath',
    kasui: 'unknown',
    kaon: 'unknown',
    disinfection: 'unknown',
    source_type: 'official',
    official_original_text: '露天風呂、内風呂ともに源泉掛け流しとなっております。大浴場、部屋風呂ともにトロッとした肌触りの源泉100％掛け流しの湯をご堪能いただけます。',
    official_source_url: 'https://wazanho.jp/onsen/index.html',
    note_ko: '공식 원문에 원천 100% 직수 표기가 있습니다. 다만 가수·가온·소독 필드가 별도 표기되지 않아 순수직수 적용 전 QA가 필요합니다.',
    qa_status: 'needs_condition_qa_before_pure',
  },
  {
    slug: 'yunohira-gyounso',
    name_ko: '유노히라 교운소',
    name_ja: '湯平温泉 宿彩暁雲荘 源泉掛け流し大人限定宿',
    water_system: 'kakenagashi',
    scope: 'room_bath',
    kasui: 'unknown',
    kaon: 'unknown',
    disinfection: 'unknown',
    source_type: 'official_name_surface',
    official_original_text: '源泉掛け流し大人限定宿',
    official_source_url: 'research/onsen-db-seed/kyushu_qa_seed_3rd_2026-07-08.json',
    note_ko: '공식명 표면의 직수 신호만 현재 보존합니다. 조건과 현행 공식 URL 재확인이 필요합니다.',
    qa_status: 'needs_url_recheck',
  },
];

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(items) {
  const headers = Object.keys(items[0]);
  return [
    headers.join(','),
    ...items.map((item) => headers.map((header) => csvEscape(item[header])).join(',')),
  ].join('\n');
}

function toMarkdown(items) {
  const counts = items.reduce((acc, item) => {
    const key = item.water_system || 'null';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const qaCounts = items.reduce((acc, item) => {
    acc[item.qa_status] = (acc[item.qa_status] || 0) + 1;
    return acc;
  }, {});
  const table = items.map((item) => (
    `| ${item.slug} | ${item.name_ko} | ${item.water_system || 'null'} | ${item.scope} | ${item.kasui} | ${item.kaon} | ${item.disinfection} | ${item.qa_status} |`
  )).join('\n');

  return `# P0 온천수 방식 공식 근거 보강 - 2026-07-09

## 범위

- 입력: \`research/onsen-db-seed/onsen_water_term_backfill_audit_2026-07-09.json\`의 P0 21건
- DB 쓰기: 없음
- 원칙: 공식 사실과 후기 신호를 분리하고, 후기/검색 스니펫은 방식 확정 근거로 쓰지 않음
- 주의: \`kakenagashi_pure_candidate\`는 바로 배지 적용값이 아니라 최종 QA 후보입니다.

## 방식 후보 분포

${Object.entries(counts).map(([key, count]) => `- ${key}: ${count}`).join('\n')}

## QA 상태 분포

${Object.entries(qaCounts).map(([key, count]) => `- ${key}: ${count}`).join('\n')}

## 요약 테이블

| slug | name | water_system | scope | kasui | kaon | disinfection | qa_status |
| --- | --- | --- | --- | --- | --- | --- | --- |
${table}

## 적용 전 QA 규칙

- \`ready_for_qa\`: 공식/공식 OTA 원문과 URL은 보존했지만, DB 적용 전 원문 URL 접근성과 scope를 한 번 더 확인합니다.
- \`needs_condition_qa_before_pure\`: 순수직수 후보입니다. 소독/순환/가수/가온 조건을 최종 확인하기 전에는 \`kakenagashi_pure\`로 적용하지 않습니다.
- \`needs_url_recheck\`: 로컬 이전 요약 근거만 있어 현재 공식 URL 원문 보강이 먼저 필요합니다.
- \`hold_no_method_badge\`: 공식 표면에서 방식 배지 근거가 없어 무배지로 보류합니다.
`;
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, `${outputBase}.json`), JSON.stringify({ generated_at: '2026-07-09', row_count: rows.length, rows }, null, 2));
writeFileSync(path.join(outputDir, `${outputBase}.csv`), `${toCsv(rows)}\n`);
writeFileSync(path.join(outputDir, `${outputBase}.md`), toMarkdown(rows));

console.log(`wrote ${rows.length} rows to ${path.join(outputDir, outputBase)}.{json,csv,md}`);
