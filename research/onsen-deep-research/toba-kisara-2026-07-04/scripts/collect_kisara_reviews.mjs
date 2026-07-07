import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import iconv from 'iconv-lite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..');

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

const onsenTerms = [
  '温泉',
  '露天',
  '露天風呂',
  '客室露天',
  '部屋露天',
  '部屋付き',
  '部屋付',
  '部屋風呂',
  '内風呂',
  '内湯',
  '大浴場',
  '貸切',
  '家族風呂',
  '源泉',
  '社宮司温泉',
  '七栗',
  'アルカリ',
  '泉質',
  'とろとろ',
  'すべすべ',
  'ぬるい',
  '熱い',
  '温度',
  '塩素',
  'カルキ',
  '温泉感',
  '虫',
  '蚊',
  '臭い',
  '匂い',
  'カビ',
  '掃除',
  '古い',
  'プロジェクション',
  'プライベート',
  '個室',
  '混雑',
  '予約',
  '送迎',
];

const contextTerms = [
  '温泉露天風呂',
  '露天風呂付き',
  '客室露天風呂',
  '内風呂',
  '部屋食',
  'IRORI',
  'フォレストビュー',
  '懐古ロマン',
  '季さら',
  'Oneness',
];

function hashText(text) {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
}

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function unique(list) {
  return [...new Set(list.filter(Boolean))];
}

async function fetchText(url, encoding = 'utf8') {
  const response = await fetch(url, { headers: { 'user-agent': USER_AGENT } });
  const buffer = Buffer.from(await response.arrayBuffer());
  const html = encoding === 'shift_jis' ? iconv.decode(buffer, 'Shift_JIS') : buffer.toString('utf8');
  return { url, status: response.status, html };
}

function parsePreloadedState(html) {
  const marker = 'window.PRELOADED_STATE=';
  const start = html.indexOf(marker);
  if (start < 0) return null;
  let i = start + marker.length;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (; i < html.length; i += 1) {
    const ch = html[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') inString = true;
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        const json = html.slice(start + marker.length, i + 1);
        return JSON.parse(json);
      }
    }
  }
  return null;
}

function tagReview({ body, title, roomType, planName, platform, reviewId, sourceUrl, reviewDate, stayDate, score }) {
  const bodyText = normalizeText(body);
  const contextText = normalizeText([title, roomType, planName].join(' '));
  const combined = `${bodyText} ${contextText}`;
  const bodyKeywords = onsenTerms.filter((term) => bodyText.includes(term));
  const contextKeywords = contextTerms.filter((term) => contextText.includes(term));

  const bathAreas = new Set();
  const signalTypes = new Set();
  const cautions = new Set();

  if (/客室露天|部屋.*露天|露天風呂付き|温泉露天風呂|部屋付きの露天/.test(combined)) {
    bathAreas.add('room_open_air_bath');
    signalTypes.add('room_bath_hot_spring');
    signalTypes.add('private_bath_experience');
  }
  if (/内風呂|内湯|部屋風呂|客室風呂|プロジェクション/.test(combined)) {
    bathAreas.add('room_bath');
    signalTypes.add('room_bath_hot_spring');
  }
  if (/大浴場/.test(bodyText)) {
    bathAreas.add('public_bath');
    signalTypes.add('public_bath_hot_spring');
  }
  if (/貸切風呂|貸切露天/.test(bodyText)) {
    bathAreas.add('private_bath');
    signalTypes.add('private_bath_experience');
  }
  if (/家族風呂/.test(bodyText)) {
    bathAreas.add('family_bath');
  }
  if (/社宮司温泉|七栗|源泉|泉質|アルカリ|とろとろ|すべすべ|肌/.test(bodyText)) {
    signalTypes.add('water_texture');
  }
  if (/温泉感|普通のお湯|薄い/.test(bodyText)) {
    signalTypes.add('weak_onsen_feeling');
  }
  if (/塩素|カルキ/.test(bodyText)) {
    signalTypes.add('chlorine_smell');
  }
  if (/混雑|混んで|待ち/.test(bodyText)) {
    signalTypes.add('crowding');
  }
  if (/予約|説明|送迎|チェックイン|変更|間違/.test(bodyText)) {
    signalTypes.add('booking_confusion');
  }

  for (const [key, pattern] of [
    ['temperature_control', /ぬるい|熱い|温度|湯加減/],
    ['insects', /虫|蚊|蜂|クモ/],
    ['cleanliness_aging', /カビ|掃除|汚|古い|老朽|臭い|匂い/],
    ['view_privacy', /景色|鳥羽湾|海|眺め|目隠し|プライベート/],
    ['baby_family', /赤ちゃん|子供|子連れ|妊婦|家族/],
  ]) {
    if (pattern.test(bodyText)) cautions.add(key);
  }

  const onsenRelatedBody = bodyKeywords.some((term) =>
    /温泉|露天|風呂|湯|源泉|泉質|塩素|カルキ|ぬるい|熱い|虫|掃除|古い|プロジェクション/.test(term)
  );

  return {
    platform,
    source_url: sourceUrl,
    review_id: String(reviewId || hashText(`${platform}:${reviewDate}:${title}:${bodyText}`)),
    review_hash: hashText(bodyText),
    review_date: reviewDate || null,
    stay_date: stayDate || null,
    score: score ?? null,
    title: normalizeText(title).slice(0, 80),
    room_type: normalizeText(roomType).slice(0, 120),
    plan_name: normalizeText(planName).slice(0, 140),
    body_char_count: bodyText.length,
    body_keywords: unique(bodyKeywords),
    context_keywords: unique(contextKeywords),
    onsen_related_body: onsenRelatedBody,
    bath_area_tags: [...bathAreas],
    signal_type_tags: [...signalTypes],
    caution_tags: [...cautions],
    language: 'ja',
  };
}

async function collectRakuten() {
  const reviews = [];
  const pageStats = {};
  const seenIds = new Set();

  for (let page = 1; page <= 12; page += 1) {
    const url =
      page === 1
        ? 'https://travel.rakuten.co.jp/HOTEL/108775/review.html'
        : `https://review.travel.rakuten.co.jp/hotel/voice/108775?page=${page}`;
    const { html } = await fetchText(url);
    const state = parsePreloadedState(html);
    const contents = state?.reviewList?.data?.contents || [];
    pageStats[`rakuten_${page}`] = contents.length;
    if (!contents.length) break;
    for (const item of contents) {
      if (seenIds.has(item.id)) continue;
      seenIds.add(item.id);
      const reservation = item.reservation || {};
      reviews.push(
        tagReview({
          platform: 'Rakuten Travel',
          sourceUrl: 'https://travel.rakuten.co.jp/HOTEL/108775/review.html',
          reviewId: item.id,
          reviewDate: item.postDateTime ? item.postDateTime.slice(0, 10) : null,
          stayDate: reservation.checkInDate || null,
          score: item.overallScore || item.totalScore || item.rating || null,
          title: item.title,
          body: item.comment,
          roomType: reservation.item?.name || '',
          planName: reservation.plan?.name || '',
        })
      );
    }
    if (contents.length < 20) break;
  }

  return { reviews, pageStats };
}

function parseJalanDate(text) {
  const match = text.match(/投稿日：(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (!match) return null;
  return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
}

function parseJalanStayDate(text) {
  const match = text.match(/時期\s*(\d{4})年(\d{1,2})月宿泊/);
  if (!match) return null;
  return `${match[1]}-${match[2].padStart(2, '0')}`;
}

function parseJalanScore(text) {
  const match = text.match(/価格帯[^0-9]*[0-9,円以上未満()税込１名あたり\/\s]*\s([1-5])\s投稿日：/);
  return match ? Number(match[1]) : null;
}

function splitJalanBody(text) {
  let withoutReply = text
    .replace(/懐古ロマンの宿 季さらからの返信[\s\S]*$/, '')
    .replace(/季さらからの返信[\s\S]*$/, '')
    .replace(/返信日：[\s\S]*$/, '');
  const cleanMarker = withoutReply.match(/清潔感\s*[1-5]\s*/);
  if (cleanMarker?.index != null) {
    withoutReply = withoutReply.slice(cleanMarker.index + cleanMarker[0].length);
  }
  return normalizeText(withoutReply);
}

function extractJalanTitleAndBody(text) {
  const body = splitJalanBody(text);
  const sentences = body.split(/(?<=。)|(?<=！)|(?<=？)|\s/).map((s) => s.trim()).filter(Boolean);
  const title = sentences[0] || '';
  const rest = body.startsWith(title) ? body.slice(title.length).trim() : body;
  return { title, body: rest || body };
}

async function collectJalan() {
  const reviews = [];
  const pageStats = {};
  const seen = new Set();
  const urls = ['https://www.jalan.net/yad359266/kuchikomi/'];
  urls.push('https://www.jalan.net/yad359266/kuchikomi/archive/');
  for (let page = 2; page <= 25; page += 1) {
    urls.push(`https://www.jalan.net/yad359266/kuchikomi/archive/${page}.HTML`);
  }

  for (const [index, url] of urls.entries()) {
    const { html } = await fetchText(url, 'shift_jis');
    const dom = new JSDOM(html);
    const blocks = [...dom.window.document.querySelectorAll('.jlnpc-kuchikomiCassette')];
    pageStats[`jalan_${index + 1}`] = blocks.length;
    if (index > 1 && !blocks.length) break;

    let newOnPage = 0;
    for (const block of blocks) {
      const text = normalizeText(block.textContent);
      const { title, body } = extractJalanTitleAndBody(text);
      const reviewDate = parseJalanDate(text);
      const stayDate = parseJalanStayDate(text);
      const plan = text.match(/プラン\s*(.*?)\s*(和洋室|和室|ツイン|ダブル|その他|朝・夕|朝食|夕食)/)?.[1] || '';
      const roomType = text.match(/(和洋室|和室|ツイン|ダブル|露天風呂付き客室|温泉露天風呂付き客室)/)?.[1] || '';
      const id = hashText(`jalan:${reviewDate}:${stayDate}:${title}:${body}`);
      if (seen.has(id)) continue;
      seen.add(id);
      newOnPage += 1;
      reviews.push(
        tagReview({
          platform: 'Jalan',
          sourceUrl: url,
          reviewId: id,
          reviewDate,
          stayDate,
          score: parseJalanScore(text),
          title,
          body,
          roomType,
          planName: plan,
        })
      );
    }
    pageStats[`jalan_${index + 1}_new`] = newOnPage;
    if (index > 1 && blocks.length && newOnPage === 0) break;
  }

  return { reviews, pageStats };
}

function aggregate(reviews) {
  const byPlatform = {};
  for (const review of reviews) {
    byPlatform[review.platform] ||= { direct: 0, onsen_body: 0 };
    byPlatform[review.platform].direct += 1;
    if (review.onsen_related_body) byPlatform[review.platform].onsen_body += 1;
  }

  const signalMap = new Map();
  for (const review of reviews) {
    const areas = review.bath_area_tags.length ? review.bath_area_tags : ['unclear'];
    const signals = review.signal_type_tags.length ? review.signal_type_tags : [];
    for (const area of areas) {
      for (const signal of signals) {
        const key = `${area}|${signal}`;
        if (!signalMap.has(key)) {
          signalMap.set(key, {
            accommodation_name: '季さら',
            bath_area: area,
            bath_area_confidence: area === 'unclear' ? 'unclear' : 'specific',
            signal_type: signal,
            signal_direction: 'positive',
            mention_count: 0,
            source_count: 0,
            platforms: new Set(),
            contradiction_level: 'low',
            review_signal_status: 'weak_signal',
          });
        }
        const row = signalMap.get(key);
        row.mention_count += 1;
        row.source_count += 1;
        row.platforms.add(review.platform);
      }
    }
  }

  return [...signalMap.values()].map((row) => {
    const platformCount = row.platforms.size;
    const status =
      platformCount >= 3 || row.source_count >= 30
        ? 'strong_signal'
        : platformCount >= 2 || row.source_count >= 10
          ? 'moderate_signal'
          : 'weak_signal';
    let direction = row.signal_direction;
    let contradiction = row.contradiction_level;
    if (['weak_onsen_feeling', 'chlorine_smell'].includes(row.signal_type)) {
      direction = 'negative';
    }
    if (row.signal_type === 'booking_confusion' || row.signal_type === 'crowding') {
      direction = 'mixed';
      contradiction = 'medium';
    }
    return {
      ...row,
      signal_direction: direction,
      platform_count: platformCount,
      contradiction_level: contradiction,
      review_signal_status: status,
      platforms: [...row.platforms],
    };
  });
}

const rakuten = await collectRakuten();
const jalan = await collectJalan();
const reviews = [...rakuten.reviews, ...jalan.reviews];
const summary = {
  generated_at: new Date().toISOString(),
  lodging: '季さら',
  total_direct_extracted: reviews.length,
  onsen_related_body: reviews.filter((review) => review.onsen_related_body).length,
  direct_body_platforms: Object.keys(
    reviews.reduce((acc, review) => {
      acc[review.platform] = true;
      return acc;
    }, {})
  ).length,
  by_platform: aggregateByPlatform(reviews),
  platform_page_stats: { ...rakuten.pageStats, ...jalan.pageStats },
  note:
    'Review bodies are not stored; hashes, metadata, short keywords and tags only. Room/plan context is separated from body keyword counts.',
};

function aggregateByPlatform(rows) {
  const result = {};
  for (const row of rows) {
    result[row.platform] ||= { direct: 0, onsen_body: 0 };
    result[row.platform].direct += 1;
    if (row.onsen_related_body) result[row.platform].onsen_body += 1;
  }
  return result;
}

await fs.writeFile(
  path.join(outDir, 'kisara_direct_review_tags_2026-07-04.json'),
  JSON.stringify({ summary, reviews }, null, 2)
);
await fs.writeFile(
  path.join(outDir, 'kisara_direct_review_tags_summary_2026-07-04.json'),
  JSON.stringify(summary, null, 2)
);
await fs.writeFile(
  path.join(outDir, 'kisara_signal_aggregate_2026-07-04.json'),
  JSON.stringify(aggregate(reviews), null, 2)
);

console.log(JSON.stringify(summary, null, 2));
