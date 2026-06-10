import fs from 'fs';
import path from 'path';
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

const OUT_DIR = path.resolve(process.cwd(), 'tmp/store-assets');
const SCREENSHOT_PATH = path.resolve(OUT_DIR, 'source-screenshots/app-shell/home.png');
const BACKGROUND_PATH = path.resolve(OUT_DIR, 'bathroom-background-clean.png');
const SYMBOL_PATH = path.resolve(process.cwd(), 'assets/images/bathtime.svg');
const OUTPUT_PATH = path.resolve(OUT_DIR, 'feature-graphic-archive-2026.png');

function dataUrl(filepath) {
  const ext = path.extname(filepath).toLowerCase();
  const mime = ext === '.svg' ? 'image/svg+xml' : ext === '.webp' ? 'image/webp' : 'image/png';
  return `data:${mime};base64,${fs.readFileSync(filepath).toString('base64')}`;
}

function assertFile(filepath) {
  if (!fs.existsSync(filepath)) {
    throw new Error(`Missing required file: ${filepath}`);
  }
}

async function main() {
  assertFile(SCREENSHOT_PATH);
  assertFile(BACKGROUND_PATH);
  assertFile(SYMBOL_PATH);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 });

  await page.setContent(
    `<!doctype html>
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          html, body {
            width: 1024px;
            height: 500px;
            margin: 0;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard", "Noto Sans KR", sans-serif;
          }
          .canvas {
            position: relative;
            width: 1024px;
            height: 500px;
            overflow: hidden;
            color: #f9f5ee;
            background: #102f2c;
          }
          .bathroom-bg,
          .tone,
          .depth {
            position: absolute;
            inset: 0;
          }
          .bathroom-bg {
            background-image: url("${dataUrl(BACKGROUND_PATH)}");
            background-size: cover;
            background-position: center;
            transform: scale(1.02);
          }
          .tone {
            background:
              linear-gradient(90deg, rgba(8, 37, 34, 0.76) 0%, rgba(8, 37, 34, 0.56) 44%, rgba(8, 37, 34, 0.16) 72%, rgba(8, 37, 34, 0.42) 100%),
              linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(12, 49, 45, 0.22) 100%);
          }
          .depth {
            background:
              radial-gradient(circle at 16% 20%, rgba(155, 230, 213, 0.18), transparent 28%),
              radial-gradient(circle at 82% 55%, rgba(255, 245, 220, 0.16), transparent 35%);
          }
          .copy {
            position: absolute;
            left: 66px;
            top: 72px;
            width: 520px;
            z-index: 2;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 30px;
            color: #fffaf2;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 0;
            text-shadow: 0 4px 18px rgba(0, 0, 0, 0.24);
          }
          .brand-icon {
            display: grid;
            place-items: center;
            width: 42px;
            height: 42px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.94);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.16);
          }
          .brand-icon img {
            width: 27px;
            height: 29px;
            object-fit: contain;
          }
          h1 {
            margin: 0;
            color: #fffaf2;
            font-size: 55px;
            line-height: 1.12;
            font-weight: 850;
            letter-spacing: 0;
            text-shadow: 0 4px 22px rgba(0, 0, 0, 0.28);
          }
          h1 strong {
            color: #9fe5d3;
            font-weight: 850;
          }
          p {
            width: 610px;
            margin: 26px 0 0;
            color: rgba(255, 250, 242, 0.84);
            font-size: 21px;
            line-height: 1.5;
            font-weight: 560;
            letter-spacing: 0;
            text-shadow: 0 3px 18px rgba(0, 0, 0, 0.26);
          }
          .phone {
            position: absolute;
            right: 72px;
            top: 24px;
            z-index: 3;
            width: 288px;
            height: 620px;
            border-radius: 39px;
            padding: 10px;
            background:
              linear-gradient(145deg, #242927 0%, #0e1413 52%, #343938 100%);
            box-shadow:
              0 48px 80px rgba(0, 0, 0, 0.38),
              0 10px 30px rgba(30, 95, 84, 0.22),
              inset 0 0 0 1px rgba(255, 255, 255, 0.14);
          }
          .phone::after {
            content: "";
            position: absolute;
            left: 50%;
            top: 19px;
            width: 13px;
            height: 13px;
            transform: translateX(-50%);
            border-radius: 999px;
            background: #090d0c;
            box-shadow: inset 0 0 0 2px #202625, 0 0 0 1px rgba(255,255,255,0.06);
            z-index: 7;
          }
          .screen {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            border-radius: 31px;
            background: #f8f3eb;
          }
          .statusbar {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 6;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24px 0 22px;
            color: #1f2826;
            font-size: 11px;
            font-weight: 760;
            background: rgba(248, 243, 235, 0.94);
          }
          .icons {
            display: flex;
            align-items: center;
            gap: 7px;
          }
          .signal {
            display: inline-flex;
            align-items: flex-end;
            gap: 2px;
            width: 16px;
            height: 11px;
            opacity: 0.78;
          }
          .signal::before,
          .signal::after {
            content: "";
            display: block;
            width: 3px;
            border-radius: 2px;
            background: currentColor;
          }
          .signal::before {
            height: 7px;
            box-shadow: 5px -3px 0 currentColor;
          }
          .signal::after {
            height: 11px;
            margin-left: 5px;
          }
          .wifi {
            position: relative;
            width: 14px;
            height: 10px;
            opacity: 0.78;
            overflow: hidden;
          }
          .wifi::before,
          .wifi::after {
            content: "";
            position: absolute;
            left: 50%;
            bottom: 0;
            transform: translateX(-50%);
            border: 1.8px solid currentColor;
            border-bottom: 0;
            border-radius: 999px 999px 0 0;
          }
          .wifi::before {
            width: 14px;
            height: 9px;
          }
          .wifi::after {
            width: 7px;
            height: 5px;
          }
          .battery {
            position: relative;
            width: 20px;
            height: 10px;
            border: 1.5px solid currentColor;
            border-radius: 4px;
            opacity: 0.78;
          }
          .battery::after {
            content: "";
            position: absolute;
            right: -4px;
            top: 3px;
            width: 2px;
            height: 4px;
            border-radius: 0 2px 2px 0;
            background: currentColor;
          }
          .battery::before {
            content: "";
            position: absolute;
            left: 2px;
            top: 2px;
            width: 13px;
            height: 4px;
            border-radius: 2px;
            background: currentColor;
          }
          .screen img {
            display: block;
            width: 100%;
            height: auto;
            margin-top: 30px;
          }
          .nav-hint {
            position: absolute;
            left: 50%;
            bottom: 10px;
            z-index: 7;
            width: 82px;
            height: 4px;
            transform: translateX(-50%);
            border-radius: 999px;
            background: rgba(20, 30, 28, 0.72);
          }
        </style>
      </head>
      <body>
        <main class="canvas">
          <div class="bathroom-bg"></div>
          <div class="tone"></div>
          <div class="depth"></div>

          <section class="copy">
            <div class="brand"><span class="brand-icon"><img src="${dataUrl(SYMBOL_PATH)}" alt="" /></span> 바스타임</div>
            <h1>씻고 쉬는 시간을<br /><strong>발견하고 저장하는</strong><br />아카이브</h1>
            <p>사우나부터 홈케어까지,<br />오늘의 몸과 공간에 맞는 바스타임을 찾아보세요.</p>
          </section>

          <aside class="phone" aria-hidden="true">
            <div class="screen">
              <div class="statusbar">
                <span>9:30</span>
                <span class="icons"><i class="signal"></i><i class="wifi"></i><i class="battery"></i></span>
              </div>
              <img src="${dataUrl(SCREENSHOT_PATH)}" />
              <div class="nav-hint"></div>
            </div>
          </aside>
        </main>
      </body>
    </html>`,
    { waitUntil: 'load' }
  );

  await page.screenshot({ path: OUTPUT_PATH });
  await browser.close();
  console.log(OUTPUT_PATH);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
