import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';

const require = createRequire(import.meta.url);

async function loadPlaywright() {
  const searchPaths = [
    process.cwd(),
    path.join(
      process.env.USERPROFILE ?? '',
      '.cache',
      'codex-runtimes',
      'codex-primary-runtime',
      'dependencies',
      'node',
      'node_modules'
    ),
  ];

  for (const basePath of searchPaths) {
    try {
      const resolved = require.resolve('playwright', { paths: [basePath] });
      return import(pathToFileURL(resolved).href);
    } catch {
      // Try the next candidate path.
    }
  }

  throw new Error('Unable to resolve playwright from local dependencies or Codex bundled runtime.');
}

const playwright = await loadPlaywright();
const { chromium } = playwright.default ?? playwright;

const BASE_URL = (process.env.STORE_SCREENSHOT_BASE_URL || 'http://localhost:3200').replace(/\/$/, '');
const OUT_DIR = path.resolve(
  process.cwd(),
  process.env.STORE_SCREENSHOT_OUT_DIR || 'tmp/store-assets/source-screenshots'
);

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1200, deviceScaleFactor: 1, appShell: false },
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 2, appShell: false },
  { name: 'app-shell', width: 390, height: 844, deviceScaleFactor: 2, appShell: true },
];

const STATIC_PATHS = [
  '/',
  '/explore',
  '/submit',
  '/saved',
  '/app',
  '/routines',
  '/auth/login',
  '/legal/privacy',
  '/legal/terms',
];

function resetOutDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

async function assertServerAvailable(url) {
  const client = url.startsWith('https') ? https : http;
  await new Promise((resolve, reject) => {
    const req = client.get(url, (res) => {
      res.resume();
      if (res.statusCode && res.statusCode < 500) {
        resolve();
      } else {
        reject(new Error(`Server returned status ${res.statusCode ?? 'unknown'} for ${url}`));
      }
    });
    req.on('error', reject);
    req.setTimeout(4000, () => req.destroy(new Error(`Timed out while connecting to ${url}`)));
  });
}

function withAppShell(pathname, enabled) {
  if (!enabled) return pathname;
  const joiner = pathname.includes('?') ? '&' : '?';
  return `${pathname}${joiner}appShell=1`;
}

function toUrl(pathname, appShell = false) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${BASE_URL}${withAppShell(normalizedPath, appShell)}`;
}

function slugifyPath(pathname) {
  if (pathname === '/') return 'home';
  return pathname
    .replace(/^\//, '')
    .replace(/[?#].*$/, '')
    .replace(/\/$/g, '')
    .replace(/[^a-zA-Z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

async function newPage(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.deviceScaleFactor,
    isMobile: viewport.name !== 'desktop',
    hasTouch: viewport.name !== 'desktop',
    userAgent:
      viewport.name === 'app-shell'
        ? 'Mozilla/5.0 BathtimeApp AppleWebKit/605.1.15 Mobile/15E148'
        : undefined,
  });
  const page = await context.newPage();
  return { context, page };
}

async function gotoAndSettle(page, url) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.addStyleTag({
    content: `
      nextjs-portal,
      [data-nextjs-toast],
      [data-nextjs-dialog-overlay],
      [data-next-badge-root] {
        display: none !important;
        visibility: hidden !important;
      }
    `,
  });
  await page.waitForTimeout(900);
}

async function collectContentPaths(browser) {
  const { context, page } = await newPage(browser, VIEWPORTS[0]);
  const paths = new Set();

  try {
    for (const pathname of ['/', '/explore']) {
      await gotoAndSettle(page, toUrl(pathname));
      const hrefs = await page.$$eval('a[href^="/content/"]', (links) =>
        links.map((link) => link.getAttribute('href')).filter(Boolean)
      );
      hrefs.forEach((href) => {
        const url = new URL(href, BASE_URL);
        paths.add(url.pathname);
      });
    }
  } finally {
    await context.close();
  }

  return [...paths].sort();
}

async function capturePath(browser, viewport, pathname, manifest) {
  const { context, page } = await newPage(browser, viewport);
  const viewportDir = path.join(OUT_DIR, viewport.name);
  fs.mkdirSync(viewportDir, { recursive: true });

  try {
    const url = toUrl(pathname, viewport.appShell);
    await gotoAndSettle(page, url);
    const file = `${slugifyPath(pathname)}.png`;
    const filepath = path.join(viewportDir, file);
    await page.screenshot({ path: filepath, fullPage: false });
    manifest.push({
      file: path.relative(OUT_DIR, filepath),
      viewport: viewport.name,
      width: viewport.width,
      height: viewport.height,
      path: pathname,
      url,
    });
    console.log(`saved ${viewport.name}/${file}`);
  } finally {
    await context.close();
  }
}

async function main() {
  resetOutDir(OUT_DIR);
  await assertServerAvailable(BASE_URL);

  const browser = await chromium.launch({ headless: true });
  const manifest = [];

  try {
    const contentPaths = await collectContentPaths(browser);
    const paths = [...STATIC_PATHS, ...contentPaths];

    for (const viewport of VIEWPORTS) {
      for (const pathname of paths) {
        await capturePath(browser, viewport, pathname, manifest);
      }
    }
  } finally {
    await browser.close();
  }

  fs.writeFileSync(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify({ baseUrl: BASE_URL, generatedAt: new Date().toISOString(), shots: manifest }, null, 2)
  );

  console.log(`generated ${manifest.length} screenshots in ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
