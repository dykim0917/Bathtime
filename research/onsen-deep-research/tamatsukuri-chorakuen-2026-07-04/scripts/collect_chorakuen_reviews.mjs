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
const RAKUTEN_ID = 12628;
const JALAN_ID = 323049;

const terms = [
  '温泉', '玉造温泉', '美肌', '美人湯', '神の湯', '源泉', '源泉掛け流し', '源泉かけ流し', '掛け流し', 'かけ流し',
  '泉質', '湯質', 'すべすべ', 'つるつる', '龍宮の湯', '竜宮の湯', '大露天風呂', '露天風呂', '露天',
  '混浴', '湯浴み着', '湯あみ着', '水着', '120坪', '日本一', '庭園露天', '庭園', '大浴場', '内湯',
  '部屋風呂', '客室風呂', '客室露天', '専用露天', '露天風呂付', '露天風呂付き', '離れ', '知心庵', '相生',
  '貸切風呂', '貸切露天', '家族風呂', 'ぬるい', '熱い', '温度', '湯加減', '塩素', 'カルキ', '温泉感',
  '循環', '混雑', '混んで', '洗い場', 'シャワー', '空いて', '貸切状態', '清潔', '掃除', '古い', '老朽',
  'カビ', '臭い', '匂い', '虫', '眺望', '景色', '静か', '高級', '落ち着', '予約', '送迎', '駐車場',
  '案内', '階段', 'エレベーター', '子供', 'ファミリー'
];

function norm(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function hash(text) {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
}

async function fetchText(url, encoding = 'utf8') {
  const res = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'ja,en;q=0.8' } });
  const buf = Buffer.from(await res.arrayBuffer());
  const text = encoding === 'shift_jis' ? iconv.decode(buf, 'Shift_JIS') : buf.toString('utf8');
  if (!res.ok) throw new Error(`${res.status} ${url}: ${text.slice(0, 200)}`);
  return text;
}

async function fetchRakutenApi(offset, limit, sortBy = 'RECOMMENDED') {
  const body = JSON.stringify({
    providerId: RAKUTEN_ID,
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
  const res = await fetch('https://api.travel.rakuten.com/travel/consumer/reviews/review/list', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': UA,
      'origin': 'https://review.travel.rakuten.co.jp',
      'referer': `https://review.travel.rakuten.co.jp/hotel/voice/${RAKUTEN_ID}`,
      'trv-request-source': 'domestic',
      'trv-language': 'ja-JP',
      'trv-market': 'JPN',
      'trv-designation': 'standard',
      'trv-currency': 'JPY'
    },
    body
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Rakuten API ${res.status}: ${text.slice(0, 400)}`);
  return JSON.parse(text);
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

  if (/大浴場|内湯|男女別.*風呂/.test(combined)) {
    bathAreas.add('public_bath');
    signals.add('public_bath_hot_spring');
  }
  if (/龍宮の湯|竜宮の湯|大露天風呂|庭園露天|混浴|120坪|露天風呂|露天/.test(combined) && !/客室露天|部屋.*露天|専用露天|露天風呂付|露天風呂付き/.test(combined)) {
    bathAreas.add('open_air_public_bath');
    signals.add('public_bath_hot_spring');
  }
  if (/客室露天|部屋.*露天|専用露天|露天風呂付|露天風呂付き/.test(combined)) {
    bathAreas.add('room_open_air_bath');
    signals.add('room_bath_hot_spring');
  }
  if (/部屋風呂|客室風呂|内湯|部屋.*風呂/.test(combined) && /部屋|客室|離れ|知心庵|和春亭|相生|山荘/.test(combined)) {
    bathAreas.add('room_bath');
    signals.add('room_bath_hot_spring');
  }
  if (/貸切風呂|貸切露天|貸切湯/.test(bodyText) && !/部屋|客室/.test(bodyText)) {
    bathAreas.add('private_bath');
    signals.add('private_bath_experience');
  }
  if (/家族風呂/.test(bodyText)) {
    bathAreas.add('family_bath');
    signals.add('private_bath_experience');
  }
  if (/温泉|玉造温泉|美肌|美人湯|神の湯|源泉|掛け流し|かけ流し|泉質|湯質|すべすべ|つるつる/.test(bodyText)) {
    signals.add('water_texture');
  }
  if (/温泉感|普通のお湯|薄い|循環|温泉ではない/.test(bodyText)) signals.add('weak_onsen_feeling');
  if (/塩素|カルキ/.test(bodyText)) signals.add('chlorine_smell');
  if (/混雑|混んで|人が多い|待ち|空いて|貸切状態|洗い場|シャワー/.test(bodyText)) signals.add('crowding');
  if (/予約|送迎|駐車場|説明|案内|チェックイン|エレベーター|階段|鍵|湯浴み着|湯あみ着|水着/.test(bodyText)) signals.add('booking_confusion');

  for (const [name, pattern] of [
    ['temperature_control', /ぬるい|熱い|温度|湯加減|冷えて/],
    ['cleanliness_aging', /古い|老朽|掃除|臭い|匂い|汚|清潔|カビ/],
    ['insects', /虫|蚊|カメムシ/],
    ['view_garden_open_air', /眺望|景色|庭園|庭|龍宮の湯|竜宮の湯|120坪|大露天/],
    ['quiet_luxury', /静か|高級|落ち着|ゆっくり|贅沢/],
    ['beauty_water_framing', /美肌|美人湯|神の湯|すべすべ|つるつる/],
    ['mixed_bath_clothing', /混浴|湯浴み着|湯あみ着|水着/],
    ['wash_area_shower', /洗い場|シャワー/],
    ['access_booking', /予約|送迎|駐車場|チェックイン|階段|案内|エレベーター|鍵/],
    ['room_bath_presence', /客室露天|部屋風呂|客室風呂|専用露天|露天風呂付|露天風呂付き/]
  ]) if (pattern.test(bodyText)) cautions.add(name);

  return {
    platform,
    source_url: sourceUrl,
    review_id: id || hash(`${platform}:${reviewDate}:${title}:${bodyText}`),
    review_hash: hash(bodyText),
    review_date: reviewDate || null,
    stay_date: stayDate || null,
    score: score ?? null,
    title: norm(title).slice(0, 100),
    room_type: norm(roomType).slice(0, 180),
    plan_name: norm(planName).slice(0, 220),
    body_char_count: bodyText.length,
    body_keywords: [...new Set(bodyKeywords)],
    context_keywords: [...new Set(contextKeywords)],
    onsen_related_body: bodyKeywords.some((kw) => /温泉|湯|源泉|泉質|露天|風呂|美肌|美人湯|混浴|龍宮|竜宮|120坪|湯浴み|湯あみ|大浴場/.test(kw)),
    bath_area_tags: [...bathAreas],
    signal_type_tags: [...signals],
    caution_tags: [...cautions],
    language
  };
}

async function collectRakuten(maxReviews = 440) {
  const reviews = [];
  const stats = {};
  const seen = new Set();
  let visibleTotal = null;
  for (let offset = 0; offset < maxReviews; offset += 20) {
    const data = await fetchRakutenApi(offset, 20);
    visibleTotal ||= data.total || null;
    stats[`rakuten_offset_${offset}`] = data.contents?.length || 0;
    for (const item of data.contents || []) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      reviews.push(tag({
        platform: 'Rakuten Travel',
        sourceUrl: 'https://travel.rakuten.co.jp/HOTEL/12628/review.html',
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
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return { reviews, stats, visibleTotal };
}

function parseJalanBlock(block, sourceUrl) {
  const text = norm(block.textContent);
  let body = text
    .replace(/湯之助の宿　長楽園.*?からの返信[\s\S]*$/, '')
    .replace(/長楽園.*?からの返信[\s\S]*$/, '')
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
    roomType: text.match(/(露天風呂付|露天風呂付き|半露天|和室|和洋室|離れ|別邸|知心庵|相生|山荘|禁煙)/)?.[1] || '',
    planName: text.match(/プラン\s*(.*?)\s*(価格帯|和室|和洋室|ツイン|投稿日|部屋)/)?.[1] || ''
  });
}

async function collectJalan(maxPages = 16) {
  const reviews = [];
  const stats = {};
  const seen = new Set();
  let visibleTotal = null;
  const urls = [];
  for (let i = 0; i < maxPages; i += 1) {
    urls.push(i === 0
      ? `https://www.jalan.net/yad${JALAN_ID}/kuchikomi/`
      : `https://www.jalan.net/yad${JALAN_ID}/kuchikomi/${i + 1}.HTML`);
  }
  for (const [i, url] of urls.entries()) {
    try {
      const html = await fetchText(url, 'shift_jis');
      const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      visibleTotal ||= Number(text.match(/クチコミ\s*([0-9,]+)\s*件/)?.[1]?.replace(/,/g, '')) ||
        Number(text.match(/([0-9,]+)\s*件/)?.[1]?.replace(/,/g, '')) || null;
      const doc = new JSDOM(html).window.document;
      const blocks = [...doc.querySelectorAll('.jlnpc-kuchikomiCassette')];
      stats[`jalan_page_${i + 1}`] = blocks.length;
      for (const block of blocks) {
        const row = parseJalanBlock(block, url);
        if (!row.body_char_count || seen.has(row.review_hash)) continue;
        seen.add(row.review_hash);
        reviews.push(row);
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    } catch (err) {
      stats[`jalan_page_${i + 1}_error`] = String(err.message).slice(0, 200);
    }
  }
  return { reviews, stats, visibleTotal };
}

function tally(rows, key) {
  const out = {};
  for (const row of rows) {
    const values = Array.isArray(row[key]) ? row[key] : [row[key]];
    for (const value of values.filter(Boolean)) out[value] = (out[value] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(out).sort((a, b) => b[1] - a[1]));
}

async function main() {
  const rakuten = await collectRakuten();
  const jalan = await collectJalan();
  const rows = [...rakuten.reviews, ...jalan.reviews];
  const summary = {
    research_date: TODAY,
    slug: 'tamatsukuri-chorakuen',
    total_direct_extracted_static: rows.length,
    onsen_related_body_static: rows.filter((r) => r.onsen_related_body).length,
    direct_body_platforms_static: new Set(rows.map((r) => r.platform)).size,
    by_platform: Object.fromEntries([...new Set(rows.map((r) => r.platform))].map((p) => [
      p,
      {
        direct: rows.filter((r) => r.platform === p).length,
        onsen_body: rows.filter((r) => r.platform === p && r.onsen_related_body).length
      }
    ])),
    visible_review_pool_static: {
      rakuten: rakuten.visibleTotal,
      jalan: jalan.visibleTotal
    },
    bath_area_tags: tally(rows, 'bath_area_tags'),
    signal_type_tags: tally(rows, 'signal_type_tags'),
    caution_tags: tally(rows, 'caution_tags'),
    body_keywords_top: tally(rows.flatMap((r) => r.body_keywords).map((body_keyword) => ({ body_keyword })), 'body_keyword'),
    scores: tally(rows.map((r) => ({ score: String(r.score ?? 'null') })), 'score'),
    collection_stats: { ...rakuten.stats, ...jalan.stats }
  };
  await fs.writeFile(path.join(outDir, `chorakuen_static_review_tags_${TODAY}.json`), JSON.stringify(rows, null, 2));
  await fs.writeFile(path.join(outDir, `chorakuen_static_review_tags_summary_${TODAY}.json`), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
