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

const terms = [
  '温泉', '有馬温泉', '金泉', '銀泉', '赤湯', '赤褐色', '茶褐色',
  '濁り湯', '濁る', '源泉', 'かけ流し', '循環', '加温', '加水',
  '含鉄', 'ラドン', '炭酸', '泉質', '湯質', '美肌', 'すべすべ',
  '露天', '露天風呂', '客室露天', '客室露天風呂', '露天風呂付',
  '露天風呂付き', '露天風呂付客室', '温泉付き客室', '温泉付客室',
  '部屋風呂', '客室風呂', '内湯', '内風呂', '部屋の風呂',
  '貸切', '貸切風呂', '貸切露天', '貸切露天風呂', '家族風呂',
  '無料貸切', '大浴場', '館内風呂', '展望風呂', '湯巡り',
  'ぬるい', '熱い', '温度', '湯加減', '塩素', 'カルキ', '温泉感',
  '混雑', '混んで', '空いて', '静か', '待ち', '予約',
  '送迎', '駅', '徒歩', '坂', '高台', '館内', '古い', '清潔',
  '掃除', '臭い', '匂い', '虫', '狭い', '広い', '高い'
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

function tag({ platform, sourceUrl, id, title, body, roomType, planName, reviewDate, stayDate, score, language = 'ja' }) {
  const bodyText = norm(body);
  const contextText = norm([title, roomType, planName].join(' '));
  const combined = `${bodyText} ${contextText}`;
  const bodyKeywords = terms.filter((term) => bodyText.includes(term));
  const contextKeywords = terms.filter((term) => contextText.includes(term));
  const bathAreas = new Set();
  const signals = new Set();
  const cautions = new Set();

  if (/客室.*露天|部屋.*露天|お部屋.*露天|露天風呂付き|露天風呂付|露天.*客室|温泉付き客室|温泉付客室|客室露天/.test(combined)) {
    bathAreas.add('room_open_air_bath');
    signals.add('room_bath_hot_spring');
  }
  if (/部屋風呂|客室風呂|部屋の風呂|内風呂|内湯|部屋.*風呂/.test(combined)) {
    bathAreas.add('room_bath');
    signals.add('room_bath_hot_spring');
  }
  if (/大浴場|館内風呂|展望風呂/.test(bodyText)) {
    bathAreas.add('public_bath');
    signals.add('public_bath_hot_spring');
  }
  if (/露天風呂|露天/.test(bodyText) && /大浴場|館内風呂|展望風呂|貸切ではない/.test(bodyText)) {
    bathAreas.add('open_air_public_bath');
    signals.add('public_bath_hot_spring');
  }
  if (/貸切風呂|貸切露天|貸切|無料貸切/.test(bodyText)) {
    bathAreas.add('private_bath');
    signals.add('private_bath_experience');
  }
  if (/家族風呂/.test(bodyText)) {
    bathAreas.add('family_bath');
    signals.add('private_bath_experience');
  }
  if (/有馬温泉|金泉|銀泉|赤湯|赤褐色|茶褐色|含鉄|鉄分|ラドン|炭酸|源泉|泉質|湯質|美肌|すべすべ|つるつる|濁り湯|濁る/.test(bodyText)) {
    signals.add('water_texture');
  }
  if (/温泉感|普通のお湯|薄い|循環|塩素|カルキ|かけ流しではない/.test(bodyText)) signals.add('weak_onsen_feeling');
  if (/塩素|カルキ/.test(bodyText)) signals.add('chlorine_smell');
  if (/混雑|混んで|空いて|静か|待ち|並|貸切状態|人も少なく|人が少な/.test(bodyText)) signals.add('crowding');
  if (/予約|送迎|駅|徒歩|坂|高台|説明|チェックイン|案内|部屋違い|館内|遠い|階段|タクシー|電話/.test(bodyText)) signals.add('booking_confusion');

  for (const [name, pattern] of [
    ['temperature_control', /ぬるい|熱い|温度|湯加減/],
    ['cleanliness_aging', /掃除|古い|臭い|匂い|汚|老朽|清潔/],
    ['insects', /虫|蚊/],
    ['access_booking', /予約|送迎|駅|徒歩|坂|高台|有馬温泉駅|チェックイン|館内|遠い|階段|タクシー|電話/],
    ['bath_waiting', /待ち|空き|順番|混雑|混んで|空いて/],
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
    onsen_related_body: bodyKeywords.some((kw) => /温泉|風呂|湯|金泉|銀泉|赤湯|源泉|泉質|貸切|家族風呂|入浴/.test(kw)),
    bath_area_tags: [...bathAreas],
    signal_type_tags: [...signals],
    caution_tags: [...cautions],
    language
  };
}

async function collectRakuten(maxPages = 20) {
  const reviews = [];
  const stats = {};
  const seen = new Set();
  let visibleTotal = null;
  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1
      ? 'https://travel.rakuten.co.jp/HOTEL/2093/review.html'
      : `https://review.travel.rakuten.co.jp/hotel/voice/2093?page=${page}`;
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
        sourceUrl: 'https://travel.rakuten.co.jp/HOTEL/2093/review.html',
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

async function collectJalan() {
  const reviews = [];
  const stats = {};
  let visibleTotal = null;
  for (const [i, url] of ['https://www.jalan.net/yad327145/kuchikomi/'].entries()) {
    const html = await fetchHtml(url, 'shift_jis');
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    visibleTotal ||= Number(text.match(/クチコミ\s*([0-9,]+)\s*件/)?.[1]?.replace(/,/g, '')) || null;
    const blocks = [...new JSDOM(html).window.document.querySelectorAll('.jlnpc-kuchikomiCassette')];
    stats[`jalan_${i + 1}`] = blocks.length;
    for (const block of blocks) {
      const body = norm(block.textContent);
      if (!body || /エラー画面|情報の準備中/.test(body)) continue;
      reviews.push(tag({
        platform: 'Jalan',
        sourceUrl: url,
        title: body.slice(0, 30),
        body,
        reviewDate: null,
        score: null
      }));
    }
  }
  return { reviews, stats, visibleTotal };
}

function parseJtbReviews(html) {
  const text = norm(new JSDOM(html).window.document.body.textContent);
  const visibleTotal = Number(text.match(/全\s*([0-9,]+)\s*件の評価/)?.[1]?.replace(/,/g, '')) || Number(text.match(/口コミ\s*\\(\\s*([0-9,]+)\\s*\\)/)?.[1]?.replace(/,/g, '')) || null;
  const reviews = [];
  const seen = new Set();

  for (const chunk of text.split(/\s閉じる\s/)) {
    const part = norm(chunk);
    if (!/投稿日：\s*\d{4}年\d{2}月\d{2}日/.test(part) && !/宿泊日：\s*\d{4}年\d{2}月\d{2}日/.test(part)) continue;
    if (!/もっと見る/.test(part) && !/プラン名：/.test(part)) continue;
    const reviewDateRaw = part.match(/投稿日：\s*(\d{4})年(\d{2})月(\d{2})日/);
    const stayRaw = part.match(/宿泊日：\s*(\d{4})年(\d{2})月(\d{2})日/);
    const score = Number(part.match(/\s([1-5]\.\d)\s+(?:[0-9]{2}代|男性|女性|家族|恋人)/)?.[1]) || null;
    const title = norm(part.match(/([^。！？]{0,40})\s+[1-5]\.\d\s+(?:[0-9]{2}代|男性|女性|家族|恋人|グループ|その他|投稿日：)/)?.[1] || part.split('もっと見る')[0]).slice(0, 60);
    let body = part.match(/もっと見る\s*(.*?)\s*プラン名：/)?.[1] || '';
    if (!body) body = part.match(/もっと見る\s*(.*?)(?:閉じる|$)/)?.[1] || '';
    const planName = part.match(/プラン名：\s*(.*?)\s*部屋タイプ：/)?.[1] || '';
    const roomType = part.match(/部屋タイプ：\s*(.*?)\s*宿泊料金：/)?.[1] || '';
    body = norm(body);
    if (body.length < 10) continue;
    const key = hash(body);
    if (seen.has(key)) continue;
    seen.add(key);
    reviews.push(tag({
      platform: 'JTB/Rurubu',
      sourceUrl: 'https://www.jtb.co.jp/kokunai-hotel/htl/6435A16/review/',
      title,
      body,
      reviewDate: reviewDateRaw ? `${reviewDateRaw[1]}-${reviewDateRaw[2]}-${reviewDateRaw[3]}` : null,
      stayDate: stayRaw ? `${stayRaw[1]}-${stayRaw[2]}-${stayRaw[3]}` : null,
      score,
      roomType,
      planName
    }));
  }
  return { reviews, visibleTotal };
}

async function collectJtb() {
  const url = 'https://www.jtb.co.jp/kokunai-hotel/htl/6435A16/review/';
  const html = await fetchHtml(url);
  const { reviews, visibleTotal } = parseJtbReviews(html);
  return { reviews, stats: { jtb_blocks: reviews.length }, visibleTotal };
}

function summarize(rows, platformMeta) {
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
    slug: 'arima-maruyama',
    total_direct_extracted_static: rows.length,
    onsen_related_body_static: rows.filter((r) => r.onsen_related_body).length,
    direct_body_platforms_static: Object.keys(byPlatform).length,
    by_platform: byPlatform,
    visible_review_pool_static: platformMeta,
    bath_area_tags: bathAreaTags,
    signal_type_tags: signalTypeTags,
    caution_tags: cautionTags,
    body_keywords_top: Object.fromEntries(Object.entries(bodyKeywordsTop).sort((a, b) => b[1] - a[1]).slice(0, 40)),
    scores
  };
}

const rakuten = await collectRakuten();
const jalan = await collectJalan();
const jtb = await collectJtb();

const all = [...rakuten.reviews, ...jalan.reviews, ...jtb.reviews];
const summary = summarize(all, {
  rakuten: rakuten.visibleTotal,
  jalan: jalan.visibleTotal,
  jtb: jtb.visibleTotal
});
summary.collection_stats = {
  ...rakuten.stats,
  ...jalan.stats,
  ...jtb.stats
};

await fs.writeFile(path.join(outDir, `maruyama_static_review_tags_${TODAY}.json`), JSON.stringify(all, null, 2));
await fs.writeFile(path.join(outDir, `maruyama_static_review_tags_summary_${TODAY}.json`), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
