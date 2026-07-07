import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import iconv from 'iconv-lite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36';

const terms = [
  '温泉', '露天', '露天風呂', '客室露天', '内風呂', '内湯', '部屋風呂', '足湯',
  '大浴場', '貸切', '家族風呂', '源泉', '社宮司温泉', '七栗', '泉質',
  'とろとろ', 'トロトロ', 'ヌルヌル', 'すべすべ', 'つるつる', 'ツルツル',
  'かけ流し', '循環', '塩素', 'カルキ', '温泉感', 'ぬるい', '熱い', '温度',
  '湯加減', '虫', '蚊', '掃除', '古い', 'カビ', '臭い', '匂い', '寒い',
  '景色', '眺め', '海', '鳥羽湾', '予約', '送迎', '説明', '部屋食',
  'ラウンジ', 'オールインクルーシブ'
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

  if (/露天風呂|客室露天|露天付き|半露天|外風呂/.test(combined)) {
    bathAreas.add('room_open_air_bath');
    signals.add('room_bath_hot_spring');
    signals.add('private_bath_experience');
  }
  if (/内風呂|内湯|部屋風呂/.test(combined)) {
    bathAreas.add('room_bath');
    signals.add('room_bath_hot_spring');
  }
  if (/足湯/.test(combined)) bathAreas.add('footbath');
  if (/大浴場/.test(bodyText)) {
    bathAreas.add('public_bath');
    signals.add('public_bath_hot_spring');
  }
  if (/貸切風呂|貸切露天/.test(bodyText)) bathAreas.add('private_bath');
  if (/家族風呂/.test(bodyText)) bathAreas.add('family_bath');
  if (/泉質|社宮司温泉|七栗|源泉|とろとろ|トロトロ|ヌルヌル|すべすべ|つるつる|ツルツル|肌/.test(bodyText)) {
    signals.add('water_texture');
  }
  if (/かけ流しではありません|循環|温泉感|普通のお湯|薄い/.test(bodyText)) signals.add('weak_onsen_feeling');
  if (/塩素|カルキ/.test(bodyText)) signals.add('chlorine_smell');
  if (/混雑|隣|ワイワイ|落ち着か/.test(bodyText)) signals.add('crowding');
  if (/予約|送迎|説明|チェックイン|案内|配膳|間隔/.test(bodyText)) signals.add('booking_confusion');

  for (const [name, pattern] of [
    ['temperature_control', /ぬるい|熱い|温度|湯加減|寒い/],
    ['insects', /虫|蚊/],
    ['cleanliness_aging', /掃除|古い|カビ|臭い|匂い|汚/],
    ['slippery_floor', /滑り|転倒/],
    ['meal_operation', /配膳|食事|朝食|夕食|ラウンジ|オードブル/],
    ['family_baby', /子供|赤ちゃん|妊娠|マタニティ|家族/],
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
    onsen_related_body: bodyKeywords.some((kw) => /温泉|露天|風呂|湯|泉質|源泉|足湯|ぬるい|熱い|虫|塩素|カルキ|滑り/.test(kw)),
    bath_area_tags: [...bathAreas],
    signal_type_tags: [...signals],
    caution_tags: [...cautions],
    language: 'ja'
  };
}

async function collectRakuten() {
  const reviews = [];
  const stats = {};
  const seen = new Set();
  for (let page = 1; page <= 5; page++) {
    const url = page === 1
      ? 'https://travel.rakuten.co.jp/HOTEL/172767/review.html'
      : `https://review.travel.rakuten.co.jp/hotel/voice/172767?page=${page}`;
    const html = await fetchHtml(url);
    const state = parseRakutenState(html);
    const contents = state?.reviewList?.data?.contents || [];
    stats[`rakuten_${page}`] = contents.length;
    for (const item of contents) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      reviews.push(tag({
        platform: 'Rakuten Travel',
        sourceUrl: 'https://travel.rakuten.co.jp/HOTEL/172767/review.html',
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
  let body = text.replace(/季さら別邸.*?からの返信[\s\S]*$/, '').replace(/返信日：[\s\S]*$/, '');
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
    roomType: text.match(/(和洋室|和室|ツイン|露天風呂付き客室|離れ)/)?.[1] || '',
    planName: text.match(/プラン\s*(.*?)\s*(和洋室|和室|ツイン|朝・夕|朝のみ|食事なし)/)?.[1] || ''
  });
}

async function collectJalan() {
  const reviews = [];
  const stats = {};
  const seen = new Set();
  for (const [i, url] of ['https://www.jalan.net/yad389295/kuchikomi/', 'https://www.jalan.net/yad389295/kuchikomi/archive/'].entries()) {
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

async function collectRelux() {
  const html = await fetchHtml('https://rlx.jp/23788/review/');
  const dom = new JSDOM(html);
  const text = norm(dom.window.document.body?.textContent || '');
  const visibleCount = Number(text.match(/レビューの総合点（(\d+)件）/)?.[1] || 0) || null;
  const parts = text.split(/(?=\d{2}代(?:前半|後半)|60歳以上)/).filter((part) => /宿泊日/.test(part) && /総合点/.test(part));
  const boundedParts = visibleCount ? parts.slice(0, visibleCount) : parts;
  const reviews = boundedParts.map((part, idx) => {
    const date = part.match(/宿泊日\s*(\d{4})年(\d{1,2})月(\d{1,2})日/);
    const room = part.match(/部屋タイプ\s*(.*?)\s*総合点/)?.[1] || '';
    const score = Number(part.match(/総合点\s*部屋\s*[1-5]\s*風呂\s*[1-5][\s\S]*?その他設備\s*([1-5])/)?.[1] || 0) || null;
    const body = part.replace(/^[\s\S]*?その他設備\s*[1-5]\s*/, '');
    return tag({
      platform: 'Relux',
      sourceUrl: 'https://rlx.jp/23788/review/',
      id: `relux_${idx + 1}_${hash(part)}`,
      title: body.split(/。|！|？/)[0],
      body,
      reviewDate: null,
      stayDate: date ? `${date[1]}-${date[2].padStart(2, '0')}-${date[3].padStart(2, '0')}` : null,
      score,
      roomType: room,
      planName: ''
    });
  });
  return { reviews, stats: { relux_1: reviews.length } };
}

function summary(reviews, stats) {
  const byPlatform = {};
  for (const r of reviews) {
    byPlatform[r.platform] ||= { direct: 0, onsen_body: 0 };
    byPlatform[r.platform].direct++;
    if (r.onsen_related_body) byPlatform[r.platform].onsen_body++;
  }
  return {
    generated_at: new Date().toISOString(),
    lodging: '季さら別邸 刻',
    total_direct_extracted_static: reviews.length,
    onsen_related_body_static: reviews.filter((r) => r.onsen_related_body).length,
    direct_body_platforms_static: Object.keys(byPlatform).length,
    by_platform: byPlatform,
    platform_page_stats: stats,
    note: 'Static/direct pages only. Browser-read Ikkyu/Yahoo/Google/Naver samples are recorded separately in platform_mapping and report.'
  };
}

const rakuten = await collectRakuten();
const jalan = await collectJalan();
const relux = await collectRelux();
const reviews = [...rakuten.reviews, ...jalan.reviews, ...relux.reviews];
const stats = { ...rakuten.stats, ...jalan.stats, ...relux.stats };
const sum = summary(reviews, stats);

await fs.writeFile(path.join(outDir, 'toki_static_review_tags_2026-07-04.json'), JSON.stringify({ summary: sum, reviews }, null, 2));
await fs.writeFile(path.join(outDir, 'toki_static_review_tags_summary_2026-07-04.json'), JSON.stringify(sum, null, 2));
console.log(JSON.stringify(sum, null, 2));
