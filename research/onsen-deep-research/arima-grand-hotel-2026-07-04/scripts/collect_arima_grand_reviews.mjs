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
  '温泉', '金泉', '銀泉', '赤湯', 'ラドン', '露天', '露天風呂', '客室露天', '部屋露天',
  '部屋風呂', '客室風呂', '内風呂', '大浴場', '展望大浴苑', '雲海', 'ゆらり',
  'アクアテラス', 'プライベートスパ', '貸切', '貸切風呂', '家族風呂', '源泉',
  'かけ流し', '循環', '加水', '加温', '塩素', 'カルキ', '温泉感', '濃い',
  '茶色', '鉄', 'しょっぱい', 'ぬるい', '熱い', '温度', '湯加減', 'サウナ',
  '混雑', '混んで', '空いて', '静か', '眺望', '景色', '夜景', '予約', '送迎',
  'シャトル', '坂', '日帰り', '入浴', '虫', '掃除', '古い', '臭い', '匂い'
];

function norm(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function hash(text) {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
}

async function fetchHtml(url, encoding = 'utf8') {
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  const buf = Buffer.from(await res.arrayBuffer());
  return encoding === 'shift_jis' ? iconv.decode(buf, 'Shift_JIS') : buf.toString('utf8');
}

function parseRakutenState(html) {
  const marker = 'window.PRELOADED_STATE=';
  const start = html.indexOf(marker);
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
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

  if (/客室.*露天|部屋.*露天|露天風呂付き|露天.*客室/.test(combined)) {
    bathAreas.add('room_open_air_bath');
    signals.add('room_bath_hot_spring');
  }
  if (/部屋風呂|客室風呂|内風呂/.test(combined)) {
    bathAreas.add('room_bath');
    signals.add('room_bath_hot_spring');
  }
  if (/大浴場|展望大浴苑|雲海|ゆらり/.test(bodyText)) {
    bathAreas.add('public_bath');
    signals.add('public_bath_hot_spring');
  }
  if (/露天風呂|露天/.test(bodyText) && /大浴場|展望大浴苑|雲海|ゆらり|9階|地下|B2/.test(bodyText)) {
    bathAreas.add('open_air_public_bath');
    signals.add('public_bath_hot_spring');
  }
  if (/貸切風呂|貸切|プライベートスパ/.test(bodyText)) {
    bathAreas.add('private_bath');
    signals.add('private_bath_experience');
  }
  if (/家族風呂/.test(bodyText)) {
    bathAreas.add('family_bath');
    signals.add('private_bath_experience');
  }
  if (/アクアテラス/.test(bodyText)) {
    bathAreas.add('facility_wide');
    signals.add('public_bath_hot_spring');
  }
  if (/金泉|銀泉|赤湯|ラドン|源泉|泉質|濃い|茶色|鉄|しょっぱ|温泉成分/.test(bodyText)) {
    signals.add('water_texture');
  }
  if (/温泉感|普通のお湯|薄い|循環|塩素|カルキ/.test(bodyText)) signals.add('weak_onsen_feeling');
  if (/塩素|カルキ/.test(bodyText)) signals.add('chlorine_smell');
  if (/混雑|混んで|空いて|静か|待ち/.test(bodyText)) signals.add('crowding');
  if (/予約|送迎|シャトル|坂|説明|チェックイン|案内|部屋違い|日帰り/.test(bodyText)) signals.add('booking_confusion');

  for (const [name, pattern] of [
    ['temperature_control', /ぬるい|熱い|温度|湯加減/],
    ['cleanliness_aging', /掃除|古い|臭い|匂い|汚|老朽/],
    ['insects', /虫|蚊/],
    ['view', /眺望|景色|夜景|見晴らし|山々|温泉街/],
    ['access_booking', /予約|送迎|シャトル|駅|坂|チェックイン/]
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
    onsen_related_body: bodyKeywords.some((kw) => /温泉|金泉|銀泉|露天|風呂|湯|源泉|泉質|サウナ|貸切|家族風呂|雲海|ゆらり|アクアテラス|入浴/.test(kw)),
    bath_area_tags: [...bathAreas],
    signal_type_tags: [...signals],
    caution_tags: [...cautions],
    language: 'ja'
  };
}

async function collectRakuten(maxPages = 16) {
  const reviews = [];
  const stats = {};
  const seen = new Set();
  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1
      ? 'https://travel.rakuten.co.jp/HOTEL/25128/review.html'
      : `https://review.travel.rakuten.co.jp/hotel/voice/25128?page=${page}`;
    const html = await fetchHtml(url);
    const state = parseRakutenState(html);
    const contents = state?.reviewList?.data?.contents || [];
    stats[`rakuten_${page}`] = contents.length;
    for (const item of contents) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      reviews.push(tag({
        platform: 'Rakuten Travel',
        sourceUrl: 'https://travel.rakuten.co.jp/HOTEL/25128/review.html',
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
  return { reviews, stats };
}

function parseJalanBlock(block, sourceUrl) {
  const text = norm(block.textContent);
  let body = text
    .replace(/有馬温泉 有馬グランドホテルからの返信[\s\S]*$/, '')
    .replace(/有馬温泉　有馬グランドホテルからの返信[\s\S]*$/, '')
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
    roomType: text.match(/(和洋室|和室|ツイン|露天風呂付き客室|洋室|別墅結楽|中央館|北館)/)?.[1] || '',
    planName: text.match(/プラン\s*(.*?)\s*(和洋室|和室|ツイン|朝・夕|朝のみ|夕のみ|食事なし)/)?.[1] || ''
  });
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

async function collectJalan() {
  const reviews = [];
  const stats = {};
  const seen = new Set();
  const urls = [
    'https://www.jalan.net/yad313952/kuchikomi/',
    'https://www.jalan.net/yad313952/kuchikomi/?screenId=UWW3701&idx=30',
    'https://www.jalan.net/yad313952/kuchikomi/?screenId=UWW3701&idx=60'
  ];
  for (const [i, url] of urls.entries()) {
    const html = await fetchHtml(url, 'shift_jis');
    const dom = new JSDOM(html);
    const blocks = [...dom.window.document.querySelectorAll('.jlnpc-kuchikomiCassette')];
    stats[`jalan_${i + 1}`] = blocks.length;
    for (const block of blocks) {
      const row = parseJalanBlock(block, url);
      if (seen.has(row.review_hash)) continue;
      seen.add(row.review_hash);
      reviews.push(row);
    }
  }
  return { reviews, stats };
}

async function collectJtb(maxPages = 7) {
  const reviews = [];
  const stats = {};
  const seen = new Set();
  for (let page = 1; page <= maxPages; page++) {
    const url = 'https://www.jtb.co.jp/kokunai-hotel/htl/6435003/review/?area=28&room=1&dateunspecified=1&staynight=1&roomassign=m2'
      + (page > 1 ? `&page=${page}` : '');
    const html = await fetchHtml(url);
    const dom = new JSDOM(html);
    const blocks = [...dom.window.document.querySelectorAll('section.f-detail-review-result-block')];
    stats[`jtb_${page}`] = blocks.length;
    for (const block of blocks) {
      const row = parseJtbBlock(block, url);
      if (!row.body_char_count || seen.has(row.review_hash)) continue;
      seen.add(row.review_hash);
      reviews.push(row);
    }
  }
  return { reviews, stats };
}

function summarize(reviews, stats) {
  const byPlatform = {};
  for (const review of reviews) {
    byPlatform[review.platform] ||= { direct: 0, onsen_body: 0 };
    byPlatform[review.platform].direct++;
    if (review.onsen_related_body) byPlatform[review.platform].onsen_body++;
  }
  return {
    generated_at: new Date().toISOString(),
    lodging: '有馬グランドホテル',
    total_direct_extracted_static: reviews.length,
    onsen_related_body_static: reviews.filter((review) => review.onsen_related_body).length,
    direct_body_platforms_static: Object.keys(byPlatform).length,
    by_platform: byPlatform,
    platform_page_stats: stats,
    note: 'Review bodies are not stored; hashes, metadata, short keywords and tags only. Official bath facts are not counted as review signals.'
  };
}

await fs.mkdir(outDir, { recursive: true });
const rakuten = await collectRakuten(16);
const jalan = await collectJalan();
const jtb = await collectJtb(7);
const reviews = [...rakuten.reviews, ...jalan.reviews, ...jtb.reviews];
const stats = { ...rakuten.stats, ...jalan.stats, ...jtb.stats };
const summary = summarize(reviews, stats);
await fs.writeFile(path.join(outDir, `arima_grand_static_review_tags_${TODAY}.json`), JSON.stringify({ summary, reviews }, null, 2));
await fs.writeFile(path.join(outDir, `arima_grand_static_review_tags_summary_${TODAY}.json`), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
