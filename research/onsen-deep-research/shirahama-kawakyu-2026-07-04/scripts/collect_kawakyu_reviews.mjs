import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import iconv from 'iconv-lite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..');
const TODAY = '2026-07-04';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36';
const RAKUTEN_ID = 14111;
const JALAN_ID = 321757;
const JTB_ID = '6506001';

const terms = [
  '温泉', '白浜温泉', '源泉', 'かけ流し', '掛け流し', '泉質', '湯質',
  'すべすべ', 'スベスベ', 'つるつる', 'ヌルヌル', '美肌',
  '温泉サロン', 'ロイヤルスパ', 'ROYAL SPA', '王様の湯', '露天', '露天風呂',
  'オープンテラス', 'テラスデッキ', '岩露天', '大浴場', '内湯', '浴場',
  '男女入替', '入替', '入れ替え', 'スパスイート', '天然温泉露天風呂',
  '客室露天', '客室露天風呂', '露天風呂付', '露天風呂付き', '部屋風呂',
  '貸切', '貸切風呂', '家族風呂', 'サウナ', '水風呂',
  'ぬるい', '熱い', '温度', '湯加減', '塩素', 'カルキ', '温泉感',
  '混雑', '混んで', '空いて', '待ち', '清潔', '掃除', '古い', '老朽',
  '臭い', '匂い', 'カビ', '黴', '虫', '狭い', '広い', '海', '田辺湾',
  '眺望', '景色', 'オーシャンビュー', '子連れ', '家族', 'バイキング',
  'ビュッフェ', '予約', '送迎', '駐車場', '館内', '階段'
];

function norm(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function hash(text) {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
}

async function fetchHtml(url, encoding = 'utf8') {
  const res = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'ja,en;q=0.8' } });
  const buf = Buffer.from(await res.arrayBuffer());
  return encoding === 'shift_jis' ? iconv.decode(buf, 'Shift_JIS') : buf.toString('utf8');
}

async function fetchRakutenApi(providerId, offset, limit, sortBy = 'RECOMMENDED') {
  const body = JSON.stringify({
    providerId,
    sortBy,
    offset,
    limit,
    keywords: [],
    topics: [],
    stayedMonths: [],
    overallScores: [],
    purposes: [],
    companions: [],
    additionalInformation: [],
    ageRanges: [],
    genders: [],
    requestFrom: 'PROVIDER_REVIEW'
  });
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch('https://api.travel.rakuten.com/travel/consumer/reviews/review/list', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': UA,
        'origin': 'https://review.travel.rakuten.co.jp',
        'referer': `https://review.travel.rakuten.co.jp/hotel/voice/${providerId}`,
        'trv-request-source': 'domestic',
        'trv-language': 'ja-JP',
        'trv-market': 'JPN',
        'trv-designation': 'standard',
        'trv-currency': 'JPY'
      },
      body
    });
    if (res.ok) return res.json();
    const text = await res.text();
    if (![429, 500, 502, 503, 504].includes(res.status) || attempt === 4) {
      throw new Error(`Rakuten API ${res.status}: ${text}`);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
  }
}

function tag({ platform, sourceUrl, id, title, body, roomType, planName, reviewDate, stayDate, score, language = 'ja' }) {
  const bodyText = norm(body);
  const contextText = norm([title, roomType, planName].join(' '));
  const combined = `${bodyText} ${contextText}`;
  const bodyKeywords = terms.filter((term) => bodyText.includes(term));
  const contextKeywords = terms.filter((term) => contextText.includes(term));
  const bathAreas = new Set();
  const signals = new Set();
  const cautions = new Set();

  if (/客室.*露天|部屋.*露天|部屋付き露天|露天風呂付き|露天風呂付|スパスイート|天然温泉露天風呂/.test(combined)) {
    bathAreas.add('room_open_air_bath');
    signals.add('room_bath_hot_spring');
  }
  if (/部屋風呂|客室風呂|部屋の風呂|内風呂|部屋.*風呂/.test(combined)) {
    bathAreas.add('room_bath');
    signals.add('room_bath_hot_spring');
  }
  if (/大浴場|温泉サロン|ロイヤルスパ|ROYAL SPA|王様の湯|浴場|内湯|サウナ|水風呂/.test(bodyText)) {
    bathAreas.add('public_bath');
    signals.add('public_bath_hot_spring');
  }
  if (/露天|露天風呂|岩露天|テラスデッキ|オープンテラス/.test(bodyText) && /大浴場|温泉サロン|ロイヤルスパ|ROYAL SPA|浴場|男女|入替|入れ替え/.test(bodyText)) {
    bathAreas.add('open_air_public_bath');
    signals.add('public_bath_hot_spring');
  }
  if (/貸切風呂|貸切/.test(bodyText)) {
    bathAreas.add('private_bath');
    signals.add('private_bath_experience');
  }
  if (/家族風呂/.test(bodyText)) {
    bathAreas.add('family_bath');
    signals.add('private_bath_experience');
  }
  if (/白浜温泉|源泉|かけ流し|掛け流し|泉質|湯質|すべすべ|スベスベ|つるつる|ヌルヌル|美肌|温ま/.test(bodyText)) {
    signals.add('water_texture');
  }
  if (/温泉感|普通のお湯|薄い|循環|温泉ではない|源泉かけ流しではない/.test(bodyText)) signals.add('weak_onsen_feeling');
  if (/塩素|カルキ/.test(bodyText)) signals.add('chlorine_smell');
  if (/混雑|混んで|空いて|待ち|貸切状態|人も少なく|人が少な/.test(bodyText)) signals.add('crowding');
  if (/予約|送迎|駅|駐車場|説明|チェックイン|案内|館内|階段|入替|男女入替|入れ替え/.test(bodyText)) signals.add('booking_confusion');

  for (const [name, pattern] of [
    ['temperature_control', /ぬるい|熱い|温度|湯加減/],
    ['cleanliness_aging', /掃除|古い|老朽|臭い|匂い|汚|清潔|カビ|黴/],
    ['insects', /虫|蚊/],
    ['view_privacy', /眺望|景色|海|田辺湾|オーシャンビュー|見え|テラス/],
    ['access_booking', /予約|送迎|駅|駐車場|チェックイン|館内|階段|電話|入替|案内/],
    ['public_bath_size_expectation', /大浴場.*狭|大浴場.*広|浴場.*狭|浴場.*広|狭い|広い/],
    ['children_family', /子連れ|赤ちゃん|幼児|子供|孫|家族/],
    ['buffet_crowding', /バイキング|ビュッフェ|混雑|時間をずら|行列/],
    ['price_expectation', /高い|価格|値段|コスパ/]
  ]) if (pattern.test(bodyText)) cautions.add(name);

  return {
    platform,
    source_url: sourceUrl,
    review_id: id || hash(`${platform}:${reviewDate}:${title}:${bodyText}`),
    review_hash: hash(bodyText),
    review_date: reviewDate || null,
    stay_date: stayDate || null,
    score: score ?? null,
    title: norm(title).slice(0, 80),
    room_type: norm(roomType).slice(0, 160),
    plan_name: norm(planName).slice(0, 180),
    body_char_count: bodyText.length,
    body_keywords: [...new Set(bodyKeywords)],
    context_keywords: [...new Set(contextKeywords)],
    onsen_related_body: bodyKeywords.some((kw) => /温泉|風呂|湯|源泉|泉質|露天|大浴場|浴場|サウナ|スパ/.test(kw)),
    bath_area_tags: [...bathAreas],
    signal_type_tags: [...signals],
    caution_tags: [...cautions],
    language
  };
}

async function collectRakuten(maxReviews = 360) {
  const reviews = [];
  const stats = {};
  const seen = new Set();
  let visibleTotal = null;
  for (let offset = 0; offset < maxReviews; offset += 20) {
    const data = await fetchRakutenApi(RAKUTEN_ID, offset, 20);
    visibleTotal ||= data.total || null;
    stats[`rakuten_offset_${offset}`] = data.contents?.length || 0;
    for (const item of data.contents || []) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      reviews.push(tag({
        platform: 'Rakuten Travel',
        sourceUrl: 'https://travel.rakuten.co.jp/HOTEL/14111/review.html',
        id: item.id,
        title: item.title,
        body: item.comment,
        reviewDate: item.postDateTime?.slice(0, 10),
        stayDate: item.reservation?.checkInDate,
        score: item.overallScore || null,
        roomType: item.reservation?.item?.name || '',
        planName: item.reservation?.plan?.name || ''
      }));
    }
    if ((data.contents || []).length < 20) break;
  }
  return { reviews, stats, visibleTotal };
}

function parseJalanBlock(block, sourceUrl) {
  const text = norm(block.textContent);
  let body = text
    .replace(/ホテル川久からの返信[\s\S]*$/, '')
    .replace(/返信日：[\s\S]*$/, '');
  const clean = body.match(/清潔感\s*[1-5]\s*/);
  if (clean?.index != null) body = body.slice(clean.index + clean[0].length);
  const title = body.split(/。|！|？|\s/).find(Boolean) || '';
  const date = text.match(/投稿日：(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  const stay = text.match(/時期\s*(\d{4})年(\d{1,2})月宿泊/);
  return tag({
    platform: 'Jalan',
    sourceUrl,
    title,
    body,
    reviewDate: date ? `${date[1]}-${date[2].padStart(2, '0')}-${date[3].padStart(2, '0')}` : null,
    stayDate: stay ? `${stay[1]}-${stay[2].padStart(2, '0')}` : null,
    score: Number(text.match(/総合\s*([1-5])/)?.[1] || 0) || null,
    roomType: text.match(/(スパ・スイート|スパスイート|露天風呂付|ロイヤルスイート|カワキュウスイート|和洋室|洋室|スイート)/)?.[1] || '',
    planName: text.match(/プラン\s*(.*?)\s*(価格帯|ツイン|和洋室|洋室|スイート|投稿日|部屋)/)?.[1] || ''
  });
}

async function collectJalan(maxPages = 8) {
  const reviews = [];
  const stats = {};
  const seen = new Set();
  let visibleTotal = null;
  const urls = Array.from({ length: maxPages }, (_, i) => i === 0
    ? `https://www.jalan.net/yad${JALAN_ID}/kuchikomi/`
    : `https://www.jalan.net/yad${JALAN_ID}/kuchikomi/?screenId=UWW3701&idx=${i * 30}`);
  for (const [i, url] of urls.entries()) {
    const html = await fetchHtml(url, 'shift_jis');
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    visibleTotal ||= Number(text.match(/クチコミ\s*([0-9,]+)\s*件/)?.[1]?.replace(/,/g, '')) || Number(text.match(/([0-9,]+)\s*件/)?.[1]?.replace(/,/g, '')) || null;
    const blocks = [...new JSDOM(html).window.document.querySelectorAll('.jlnpc-kuchikomiCassette')];
    stats[`jalan_${i + 1}`] = blocks.length;
    for (const block of blocks) {
      const row = parseJalanBlock(block, url);
      if (!row.body_char_count || seen.has(row.review_hash)) continue;
      seen.add(row.review_hash);
      reviews.push(row);
    }
  }
  return { reviews, stats, visibleTotal };
}

async function collectJtb() {
  const url = `https://www.jtb.co.jp/kokunai-hotel/htl/${JTB_ID}/review/`;
  const html = await fetchHtml(url);
  const text = norm(new JSDOM(html).window.document.body.textContent);
  const visibleTotal = Number(text.match(/口コミ\s*\(\s*([0-9,]+)\s*\)/)?.[1]?.replace(/,/g, '')) || null;
  const reviews = [];
  const chunks = text.split(/(?=投稿日：\s*\d{4}年\d{2}月\d{2}日|[^\s]{2,40}\s+[1-5]\.\d\s+[0-9]{2}代)/g);
  const seen = new Set();
  for (const chunk of chunks) {
    if (!/もっと見る/.test(chunk) || !/宿泊日：/.test(chunk)) continue;
    const body = norm(chunk.match(/もっと見る\s*(.*?)\s*プラン名：/)?.[1] || chunk.match(/もっと見る\s*(.*?)(?:閉じる|$)/)?.[1] || '');
    if (body.length < 10) continue;
    const key = hash(body);
    if (seen.has(key)) continue;
    seen.add(key);
    const rd = chunk.match(/投稿日：\s*(\d{4})年(\d{2})月(\d{2})日/);
    const sd = chunk.match(/宿泊日：\s*(\d{4})年(\d{2})月(\d{2})日/);
    reviews.push(tag({
      platform: 'JTB',
      sourceUrl: url,
      title: norm(chunk.split('もっと見る')[0]).slice(0, 60),
      body,
      reviewDate: rd ? `${rd[1]}-${rd[2]}-${rd[3]}` : null,
      stayDate: sd ? `${sd[1]}-${sd[2]}-${sd[3]}` : null,
      score: Number(chunk.match(/\s([1-5]\.\d)\s/)?.[1]) || null,
      roomType: chunk.match(/部屋タイプ：\s*(.*?)\s*宿泊料金：/)?.[1] || '',
      planName: chunk.match(/プラン名：\s*(.*?)\s*部屋タイプ：/)?.[1] || ''
    }));
  }
  return { reviews, stats: { jtb_blocks: reviews.length }, visibleTotal };
}

function summarize(rows, platformMeta, stats) {
  const byPlatform = {};
  const bathAreaTags = {};
  const signalTypeTags = {};
  const cautionTags = {};
  const bodyKeywordsTop = {};
  const scores = {};
  for (const row of rows) {
    byPlatform[row.platform] ||= { direct: 0, onsen_body: 0 };
    byPlatform[row.platform].direct++;
    if (row.onsen_related_body) byPlatform[row.platform].onsen_body++;
    for (const key of row.bath_area_tags) bathAreaTags[key] = (bathAreaTags[key] || 0) + 1;
    for (const key of row.signal_type_tags) signalTypeTags[key] = (signalTypeTags[key] || 0) + 1;
    for (const key of row.caution_tags) cautionTags[key] = (cautionTags[key] || 0) + 1;
    for (const key of row.body_keywords) bodyKeywordsTop[key] = (bodyKeywordsTop[key] || 0) + 1;
    scores[row.score ?? 'null'] = (scores[row.score ?? 'null'] || 0) + 1;
  }
  return {
    research_date: TODAY,
    slug: 'shirahama-kawakyu',
    total_direct_extracted_static: rows.length,
    onsen_related_body_static: rows.filter((r) => r.onsen_related_body).length,
    direct_body_platforms_static: Object.keys(byPlatform).length,
    by_platform: byPlatform,
    visible_review_pool_static: platformMeta,
    bath_area_tags: bathAreaTags,
    signal_type_tags: signalTypeTags,
    caution_tags: cautionTags,
    body_keywords_top: Object.fromEntries(Object.entries(bodyKeywordsTop).sort((a, b) => b[1] - a[1]).slice(0, 50)),
    scores,
    collection_stats: stats
  };
}

const rakuten = await collectRakuten(360);
const jalan = await collectJalan(10);
const jtb = await collectJtb();
const rows = [...rakuten.reviews, ...jalan.reviews, ...jtb.reviews];
const summary = summarize(rows, {
  rakuten: rakuten.visibleTotal,
  jalan: jalan.visibleTotal,
  jtb: jtb.visibleTotal
}, { ...rakuten.stats, ...jalan.stats, ...jtb.stats });

await fs.writeFile(path.join(outDir, `kawakyu_static_review_tags_${TODAY}.json`), JSON.stringify(rows, null, 2));
await fs.writeFile(path.join(outDir, `kawakyu_static_review_tags_summary_${TODAY}.json`), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
