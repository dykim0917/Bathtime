import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const distDir = path.join(rootDir, 'dist');
const fallbackTemplatePath = path.join(distDir, 'content', '[id].html');
const indexTemplatePath = path.join(distDir, 'index.html');

const archiveContentDbSelect = [
  'id',
  'title',
  'subtitle',
  'summary',
  'category',
  'content_type',
  'tags',
  'hero_image',
  'body',
  'seo',
  'is_published',
  'status',
  'content_updated_at',
  'updated_at',
].join(',');

function parseEnvFile(source) {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .reduce((acc, line) => {
      const separatorIndex = line.indexOf('=');
      const key = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();
      acc[key] = rawValue.replace(/^['"]|['"]$/g, '');
      return acc;
    }, {});
}

async function loadLocalEnv() {
  for (const fileName of ['.env.local', '.env']) {
    try {
      const values = parseEnvFile(await readFile(path.join(rootDir, fileName), 'utf8'));
      for (const [key, value] of Object.entries(values)) {
        if (process.env[key] === undefined) process.env[key] = value;
      }
    } catch (error) {
      if (error && error.code === 'ENOENT') continue;
      throw error;
    }
  }
}

function getSupabaseRequest() {
  const explicitRestUrl = process.env.CONTENT_DB_REST_URL?.trim();
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const serviceKey = process.env.CONTENT_DB_SERVICE_ROLE_KEY?.trim();
  const key = serviceKey || anonKey;

  const baseUrl = explicitRestUrl || (supabaseUrl ? `${supabaseUrl.replace(/\/+$/, '')}/rest/v1` : '');
  if (!baseUrl || !key) return null;

  const url = new URL(`${baseUrl.replace(/\/+$/, '')}/archive_content`);
  url.searchParams.set('select', archiveContentDbSelect);
  url.searchParams.set('status', 'eq.active');
  url.searchParams.set('is_published', 'eq.true');
  url.searchParams.set('order', 'content_updated_at.desc,id.asc');

  return {
    url,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
    },
  };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/\n/g, ' ');
}

function stripHtml(value) {
  return String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(value, maxLength) {
  const text = stripHtml(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeJsonObject(value) {
  return isRecord(value) ? value : {};
}

function normalizeBody(value) {
  return Array.isArray(value) ? value : [];
}

function toAbsoluteUrl(value, webOrigin) {
  if (!value || typeof value !== 'string') return undefined;
  try {
    const url = new URL(value, webOrigin);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function renderBodyBlock(block, index) {
  if (!isRecord(block)) return '';

  if (block.type === 'heading' && typeof block.text === 'string') {
    return `<h2>${escapeHtml(block.text)}</h2>`;
  }

  if (block.type === 'paragraph' && typeof block.text === 'string') {
    return `<p>${escapeHtml(block.text)}</p>`;
  }

  if (block.type === 'quote' && typeof block.text === 'string') {
    return `<blockquote>${escapeHtml(block.text)}</blockquote>`;
  }

  if (block.type === 'list' && Array.isArray(block.items)) {
    const items = block.items
      .filter((item) => typeof item === 'string')
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join('');
    return items ? `<ul>${items}</ul>` : '';
  }

  if (block.type === 'image' && typeof block.uri === 'string') {
    const alt = typeof block.caption === 'string' ? block.caption : `바스타임 콘텐츠 이미지 ${index + 1}`;
    const caption = typeof block.caption === 'string' ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : '';
    return `<figure><img src="${escapeAttribute(block.uri)}" alt="${escapeAttribute(alt)}" loading="lazy"/>${caption}</figure>`;
  }

  if (block.type === 'heroIntro') {
    const title = typeof block.title === 'string' ? `<h2>${escapeHtml(block.title)}</h2>` : '';
    const intro = Array.isArray(block.intro)
      ? block.intro.filter((item) => typeof item === 'string').map((item) => `<p>${escapeHtml(item)}</p>`).join('')
      : '';
    return `${title}${intro}`;
  }

  if (block.type === 'aha' && typeof block.text === 'string') {
    const title = typeof block.title === 'string' ? `<h2>${escapeHtml(block.title)}</h2>` : '';
    return `${title}<p>${escapeHtml(block.text)}</p>`;
  }

  if (block.type === 'mechanism' && Array.isArray(block.steps)) {
    const title = typeof block.title === 'string' ? `<h2>${escapeHtml(block.title)}</h2>` : '';
    const items = block.steps
      .filter(isRecord)
      .map((step) => `<li><strong>${escapeHtml(step.label ?? '')}</strong> ${escapeHtml(step.description ?? '')}</li>`)
      .join('');
    return `${title}${items ? `<ul>${items}</ul>` : ''}`;
  }

  if (block.type === 'ritualTimer' && Array.isArray(block.steps)) {
    const title = typeof block.title === 'string' ? `<h2>${escapeHtml(block.title)}</h2>` : '';
    const items = block.steps
      .filter(isRecord)
      .map((step) => `<li><strong>${escapeHtml(step.timeLabel ?? '')}</strong> ${escapeHtml(step.title ?? '')} ${escapeHtml(step.instruction ?? '')}</li>`)
      .join('');
    return `${title}${items ? `<ol>${items}</ol>` : ''}`;
  }

  if (block.type === 'safetyBox' && Array.isArray(block.items)) {
    const title = typeof block.title === 'string' ? `<h2>${escapeHtml(block.title)}</h2>` : '';
    const items = block.items
      .filter((item) => typeof item === 'string')
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join('');
    return `${title}${items ? `<ul>${items}</ul>` : ''}`;
  }

  return '';
}

function collectPlainBodyText(body) {
  return body
    .map((block) => stripHtml(renderBodyBlock(block, 0)))
    .filter(Boolean)
    .join(' ');
}

function createJsonLd(content, canonicalUrl, description, imageUrl) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.title,
    description,
    url: canonicalUrl,
    image: imageUrl ? [imageUrl] : undefined,
    dateModified: content.content_updated_at ?? content.updated_at,
    publisher: {
      '@type': 'Organization',
      name: 'Bathtime',
      url: new URL('/', canonicalUrl).toString(),
    },
  };

  return JSON.stringify(jsonLd).replace(/</g, '\\u003c');
}

function buildStaticArticle(content, canonicalUrl) {
  const body = normalizeBody(content.body);
  const renderedBody = body.map(renderBodyBlock).filter(Boolean).join('\n');
  const tags = Array.isArray(content.tags) ? content.tags.filter((tag) => typeof tag === 'string') : [];
  const tagList = tags.length ? `<p class="bath-static-tags">${tags.map((tag) => `#${escapeHtml(tag)}`).join(' ')}</p>` : '';

  return `<noscript>
  <article class="bath-static-article">
    <p class="bath-static-eyebrow">BATH TIME ARCHIVE</p>
    <h1>${escapeHtml(content.title)}</h1>
    ${content.subtitle ? `<p class="bath-static-subtitle">${escapeHtml(content.subtitle)}</p>` : ''}
    <p class="bath-static-summary">${escapeHtml(content.summary)}</p>
    ${tagList}
    ${renderedBody}
    <p><a href="${escapeAttribute(canonicalUrl)}">바스타임에서 콘텐츠 보기</a></p>
  </article>
</noscript>
<div id="bathtime-static-content" hidden>
  <article>
    <h1>${escapeHtml(content.title)}</h1>
    ${content.subtitle ? `<p>${escapeHtml(content.subtitle)}</p>` : ''}
    <p>${escapeHtml(content.summary)}</p>
    ${renderedBody}
  </article>
</div>`;
}

function buildMetaTags({ title, description, canonicalUrl, imageUrl, jsonLd }) {
  const imageTags = imageUrl
    ? [
        `<meta property="og:image" content="${escapeAttribute(imageUrl)}"/>`,
        `<meta name="twitter:image" content="${escapeAttribute(imageUrl)}"/>`,
      ].join('')
    : '';

  return [
    `<title data-rh="true">${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeAttribute(description)}"/>`,
    `<meta property="og:type" content="article"/>`,
    `<meta property="og:site_name" content="Bathtime"/>`,
    `<meta property="og:title" content="${escapeAttribute(title)}"/>`,
    `<meta property="og:description" content="${escapeAttribute(description)}"/>`,
    `<meta property="og:url" content="${escapeAttribute(canonicalUrl)}"/>`,
    imageTags,
    `<meta name="twitter:card" content="${imageUrl ? 'summary_large_image' : 'summary'}"/>`,
    `<meta name="twitter:title" content="${escapeAttribute(title)}"/>`,
    `<meta name="twitter:description" content="${escapeAttribute(description)}"/>`,
    `<link rel="canonical" href="${escapeAttribute(canonicalUrl)}"/>`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].join('');
}

function injectStaticContent(template, content, webOrigin) {
  const seo = normalizeJsonObject(content.seo);
  const heroImage = normalizeJsonObject(content.hero_image);
  const title = seo.seoTitle || `${content.title} - 바스타임`;
  const bodyText = collectPlainBodyText(normalizeBody(content.body));
  const description = truncate(seo.seoDescription || content.subtitle || content.summary || bodyText, 158);
  const canonicalUrl = toAbsoluteUrl(seo.canonicalUrl, webOrigin) || `${webOrigin}/content/${encodeURIComponent(content.id)}`;
  const imageUrl = toAbsoluteUrl(seo.ogImage || heroImage.uri, webOrigin);
  const jsonLd = createJsonLd(content, canonicalUrl, description, imageUrl);
  const metaTags = buildMetaTags({ title, description, canonicalUrl, imageUrl, jsonLd });
  const staticArticle = buildStaticArticle(content, canonicalUrl);

  let html = template.replace(/<title\b[^>]*>.*?<\/title>/i, metaTags);

  if (html.includes('</head>') && !html.includes('bath-static-article')) {
    html = html.replace(
      '</head>',
      `<style id="bathtime-static-content-style">
        .bath-static-article{max-width:760px;margin:0 auto;padding:48px 20px;font-family:Pretendard,system-ui,sans-serif;line-height:1.72;color:#252A2A;background:#FAF7F1}
        .bath-static-article h1{font-size:32px;line-height:1.25;margin:8px 0 16px}
        .bath-static-article h2{font-size:22px;line-height:1.35;margin:32px 0 12px}
        .bath-static-eyebrow,.bath-static-tags{font-size:13px;font-weight:700;color:#1F6662}
        .bath-static-subtitle,.bath-static-summary{font-size:17px;color:#3F4745}
        .bath-static-article img{max-width:100%;height:auto}
      </style></head>`
    );
  }

  return html.replace('</body>', `${staticArticle}</body>`);
}

async function fetchPublishedContents(request) {
  const response = await fetch(request.url, { headers: request.headers });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`archive_content fetch failed with status ${response.status}: ${detail}`);
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error('archive_content response must be an array');
  return rows.filter((row) => row?.id && row.is_published === true && row.status === 'active');
}

async function readTemplate() {
  try {
    return await readFile(fallbackTemplatePath, 'utf8');
  } catch (error) {
    if (error && error.code !== 'ENOENT') throw error;
    return readFile(indexTemplatePath, 'utf8');
  }
}

async function main() {
  await loadLocalEnv();

  const request = getSupabaseRequest();
  if (!request) {
    console.warn('[archive-static] Supabase env is missing. Skipping static archive content page generation.');
    return;
  }

  const template = await readTemplate();
  const contents = await fetchPublishedContents(request);
  const webOrigin = (process.env.EXPO_PUBLIC_WEB_URL || process.env.NEXT_PUBLIC_WEB_URL || 'https://www.getbathtime.com').replace(/\/+$/, '');

  for (const content of contents) {
    const html = injectStaticContent(template, content, webOrigin);
    const outputDir = path.join(distDir, 'content', content.id);
    await mkdir(outputDir, { recursive: true });
    await writeFile(path.join(outputDir, 'index.html'), html, 'utf8');
  }

  console.log(`[archive-static] Generated ${contents.length} static archive content page(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
