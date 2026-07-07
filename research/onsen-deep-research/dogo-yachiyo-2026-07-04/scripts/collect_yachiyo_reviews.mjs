import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import iconv from 'iconv-lite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36';
const TODAY = '2026-07-04';

const terms = [
  '温泉', '道後温泉', '引き湯', '源泉', 'かけ流し', '循環', '加水', '加温',
  'アルカリ', '単純泉', '泉質', '湯質', '美肌', 'すべすべ', 'つるつる',
  '露天', '露天風呂', '客室露天', '客室露天風呂', '露天風呂付',
  '露天風呂付き', '露天風呂付客室', '温泉露天風呂付客室', '全客室',
  '部屋風呂', '客室風呂', 'お部屋のお風呂', '内風呂', '温泉付き客室',
  '大浴場', '湯処', 'サウナ', '水風呂', '足湯', '貸切', '貸切風呂',
  '家族風呂', '道後本館', '道後温泉本館', '外湯', '商店街',
  'ぬるい', '熱い', '温度', '湯加減', '塩素', 'カルキ', '温泉感',
  '混雑', '混んで', '空いて', '静か', '眺望', '庭園', '中庭', '目隠し',
  '予約', '送迎', '駅', '徒歩', '館内', '古い', '歴史', '清潔', '掃除',
  '臭い', '匂い', '下水', '虫', '露天は狭い', '狭い', '駐車場', '高い'
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

function parseRakutenState(html) {
  const marker = 'window.PRELOADED_STATE=';
  const start = html.indexOf(marker);
  if (start < 0) return null;
  let depth = 0, inString = false, escaped = false;
  for (let i = start + marker.length; i < html.length; i++) {
    const ch = html[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    if (ch === '{') depth++;
    if (ch === '}' && --depth === 0) return JSON.parse(html.slice(start + marker.length, i + 1));
  }
  return null;
}

function tag({ platform, sourceUrl, id, title, body, roomType, planName, reviewDate, stayDate, score }) {
  const bodyText = norm(body);
  const contextText = norm([title, roomType, planName].join(' '));
  const combined = `${bodyText} ${contextText}`;
  const bodyKeywords = terms.filter((term) => bodyText.includes(term));
  const contextKeywords = terms.filter((term) => contextText.includes(term));
  const bathAreas = new Set();
  const signals = new Set();
  const cautions = new Set();

  if (/客室.*露天|部屋.*露天|お部屋.*露天|露天風呂付き|露天風呂付|露天.*客室|温泉付き客室|温泉露天風呂付客室/.test(combined)) {
    bathAreas.add('room_open_air_bath');
    signals.add('room_bath_hot_spring');
  }
  if (/部屋風呂|客室風呂|お部屋のお風呂|内風呂|部屋.*風呂/.test(combined)) {
    bathAreas.add('room_bath');
    signals.add('room_bath_hot_spring');
  }
  if (/大浴場|湯処/.test(bodyText)) {
    bathAreas.add('public_bath');
    signals.add('public_bath_hot_spring');
  }
  if (/露天風呂|露天/.test(bodyText) && /大浴場|湯処|サウナ/.test(bodyText)) {
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
  if (/道後温泉|引き湯|源泉|泉質|湯質|アルカリ|単純泉|美肌|すべすべ|つるつる|やわらか|柔らか|腰痛/.test(bodyText)) {
    signals.add('water_texture');
  }
  if (/温泉感|普通のお湯|薄い|循環|塩素|カルキ/.test(bodyText)) signals.add('weak_onsen_feeling');
  if (/塩素|カルキ/.test(bodyText)) signals.add('chlorine_smell');
  if (/混雑|混んで|空いて|静か|待ち|貸切状態/.test(bodyText)) signals.add('crowding');
  if (/予約|送迎|駅|徒歩|道後本館|外湯|説明|チェックイン|案内|部屋違い|館内|遠い|階段|タクシー/.test(bodyText)) {
    signals.add('booking_confusion');
  }

  for (const [name, pattern] of [
    ['temperature_control', /ぬるい|熱い|温度|湯加減/],
    ['cleanliness_aging', /掃除|古い|臭い|匂い|汚|老朽|下水|清潔/],
    ['insects', /虫|蚊/],
    ['view_garden', /眺望|庭園|中庭|目隠し|景色/],
    ['access_booking', /予約|送迎|駅|徒歩|道後本館|道後温泉本館|外湯|商店街|チェックイン|館内|遠い|階段|タクシー|駐車場/],
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
    room_type: norm(roomType).slice(0, 140),
    plan_name: norm(planName).slice(0, 140),
    body_char_count: bodyText.length,
    body_keywords: [...new Set(bodyKeywords)],
    context_keywords: [...new Set(contextKeywords)],
    onsen_related_body: bodyKeywords.some((kw) => /温泉|風呂|湯|源泉|泉質|サウナ|貸切|家族風呂|足湯|外湯|入浴/.test(kw)),
    bath_area_tags: [...bathAreas],
    signal_type_tags: [...signals],
    caution_tags: [...cautions],
    language: 'ja'
  };
}

async function collectRakuten(maxPages = 18) {
  const reviews = [];
  const stats = {};
  const seen = new Set();
  let visibleTotal = null;
  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1
      ? 'https://travel.rakuten.co.jp/HOTEL/166206/review.html'
      : `https://review.travel.rakuten.co.jp/hotel/voice/166206?page=${page}`;
    const html = await fetchHtml(url);
    const data = parseRakutenState(html)?.reviewList?.data;
    const contents = data?.contents || [];
    visibleTotal ||= data?.total || null;
    stats[`rakuten_${page}`] = contents.length;
    for (const item of contents) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      reviews.push(tag({
        platform: 'Rakuten Travel',
        sourceUrl: 'https://travel.rakuten.co.jp/HOTEL/166206/review.html',
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
    if (contents.length < 20) break;
  }
  return { reviews, stats, visibleTotal };
}

function parseJalanBlock(block, sourceUrl) {
  const text = norm(block.textContent);
  let body = text
    .replace(/道後温泉　八千代からの返信[\s\S]*$/, '')
    .replace(/道後温泉 八千代からの返信[\s\S]*$/, '')
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
    score: Number(text.match(/価格帯[\s\S]*?\s([1-5])\s投稿日：/)?.[1] || 0) || null,
    roomType: text.match(/(和室|和洋室|ツイン|露天風呂付|温泉付き客室|道後町並側|庭側)/)?.[1] || '',
    planName: text.match(/プラン\s*(.*?)\s*(和洋室|和室|ツイン|朝・夕|朝のみ|夕のみ|食事なし)/)?.[1] || ''
  });
}

async function collectJalan() {
  const reviews = [];
  const stats = {};
  const seen = new Set();
  let visibleTotal = null;
  const urls = [0, 30, 60, 90, 120, 150].map((idx) => idx === 0
    ? 'https://www.jalan.net/yad325976/kuchikomi/'
    : `https://www.jalan.net/yad325976/kuchikomi/?screenId=UWW3701&idx=${idx}`);
  for (const [i, url] of urls.entries()) {
    const html = await fetchHtml(url, 'shift_jis');
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    visibleTotal ||= Number(text.match(/クチコミ\s*([0-9,]+)\s*件/)?.[1]?.replace(/,/g, '')) || null;
    const blocks = [...new JSDOM(html).window.document.querySelectorAll('.jlnpc-kuchikomiCassette')];
    stats[`jalan_${i + 1}`] = blocks.length;
    for (const block of blocks) {
      const row = parseJalanBlock(block, url);
      if (seen.has(row.review_hash)) continue;
      seen.add(row.review_hash);
      reviews.push(row);
    }
  }
  return { reviews, stats, visibleTotal };
}

function parseJtbBlock(block, sourceUrl) {
  const text = norm(block.textContent);
  const body = norm(block.querySelector('.f-detail-review-result__text')?.textContent || text);
  const stay = text.match(/利用時期：\s*(\d{4})年(\d{1,2})月(\d{1,2})日/);
  const attrs = [...block.querySelectorAll('.f-detail-review-result-block__item')].map((el) => norm(el.textContent));
  return tag({
    platform: 'JTB',
    sourceUrl,
    title: body.split(/。|！|？|\s/).find(Boolean) || '',
    body,
    reviewDate: null,
    stayDate: stay ? `${stay[1]}-${stay[2].padStart(2, '0')}-${stay[3].padStart(2, '0')}` : null,
    score: null,
    roomType: '',
    planName: attrs.join(' / ')
  });
}

async function collectJtb(maxPages = 8) {
  const reviews = [];
  const stats = {};
  const seen = new Set();
  let visibleText = null;
  for (let page = 1; page <= maxPages; page++) {
    const url = 'https://www.jtb.co.jp/kokunai-hotel/htl/7461010/review/?area=38&room=1&dateunspecified=1&staynight=1&roomassign=m2'
      + (page > 1 ? `&page=${page}` : '');
    const html = await fetchHtml(url);
    const cleanText = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    visibleText ||= cleanText.match(/([0-9,]+ 件のうち、\s*1\s*〜\s*[0-9,]+ 件を表示|全\s*[0-9,]+\s*件の評価)/g)?.join(' / ') || null;
    const blocks = [...new JSDOM(html).window.document.querySelectorAll('section.f-detail-review-result-block')];
    stats[`jtb_${page}`] = blocks.length;
    for (const block of blocks) {
      const row = parseJtbBlock(block, url);
      if (!row.body_char_count || seen.has(row.review_hash)) continue;
      seen.add(row.review_hash);
      reviews.push(row);
    }
    if (!blocks.length) break;
  }
  return { reviews, stats, visibleText };
}

function summarize(reviews, stats, visible) {
  const byPlatform = {};
  for (const review of reviews) {
    byPlatform[review.platform] ||= { direct: 0, onsen_body: 0 };
    byPlatform[review.platform].direct++;
    if (review.onsen_related_body) byPlatform[review.platform].onsen_body++;
  }
  const count = (field) => reviews.flatMap((review) => review[field] || [])
    .reduce((acc, key) => ((acc[key] = (acc[key] || 0) + 1), acc), {});
  const keywords = reviews.flatMap((review) => review.body_keywords || [])
    .reduce((acc, key) => ((acc[key] = (acc[key] || 0) + 1), acc), {});
  return {
    generated_at: new Date().toISOString(),
    lodging: '道後温泉 八千代',
    total_direct_extracted_static: reviews.length,
    onsen_related_body_static: reviews.filter((review) => review.onsen_related_body).length,
    direct_body_platforms_static: Object.keys(byPlatform).length,
    by_platform: byPlatform,
    platform_page_stats: stats,
    visible_review_pool_static: visible,
    bath_area_tags: count('bath_area_tags'),
    signal_type_tags: count('signal_type_tags'),
    caution_tags: count('caution_tags'),
    body_keywords: Object.fromEntries(Object.entries(keywords).sort((a, b) => b[1] - a[1]).slice(0, 60)),
    scores: reviews.reduce((acc, review) => ((acc[String(review.score)] = (acc[String(review.score)] || 0) + 1), acc), {}),
    note: 'Review bodies are not stored; hashes, metadata, short keywords and tags only. Official bath facts are not counted as review signals.'
  };
}

const rakuten = await collectRakuten();
const jalan = await collectJalan();
const jtb = await collectJtb();
const reviews = [...rakuten.reviews, ...jalan.reviews, ...jtb.reviews];
const stats = { ...rakuten.stats, ...jalan.stats, ...jtb.stats };
const visible = {
  rakuten: rakuten.visibleTotal,
  jalan: jalan.visibleTotal,
  jtb: jtb.visibleText
};
const summary = summarize(reviews, stats, visible);

await fs.writeFile(path.join(outDir, `yachiyo_static_review_tags_${TODAY}.json`), JSON.stringify({ summary, reviews }, null, 2));
await fs.writeFile(path.join(outDir, `yachiyo_static_review_tags_summary_${TODAY}.json`), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
