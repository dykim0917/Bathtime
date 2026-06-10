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

const ROOT_DIR = process.cwd();
const ASSET_DIR = path.resolve(ROOT_DIR, 'tmp/store-assets');
const SOURCE_DIR = path.resolve(ASSET_DIR, 'source-screenshots/app-shell');
const OUT_DIR = path.resolve(ASSET_DIR, 'listing-screenshots');
const BACKGROUND_PATH = path.resolve(ASSET_DIR, 'bathroom-background-clean.png');

const shots = [
  {
    number: '01',
    file: 'home.png',
    source: 'home.png',
    headline: '오늘 필요한\n바스타임을 고르세요',
  },
  {
    number: '02',
    file: 'explore.png',
    source: 'explore.png',
    headline: '사우나부터\n홈케어까지 한곳에서',
  },
  {
    number: '03',
    file: 'content-detail.png',
    source: 'content-care-cold-gentle-warmth.png',
    headline: '읽고 끝나지 않게\n기록으로 남겨요',
  },
  {
    number: '04',
    file: 'rituals.png',
    source: 'routines.png',
    headline: '필요할 때\n의식으로 이어가세요',
  },
  {
    number: '05',
    file: 'submit.png',
    source: 'submit.png',
    headline: '좋았던 공간과\n도구를 남겨주세요',
  },
];

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

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function multiline(value) {
  return escapeHtml(value).replace(/\n/g, '<br />');
}

function renderShot(shot) {
  const sourcePath = path.resolve(SOURCE_DIR, shot.source);
  assertFile(sourcePath);

  return `<!doctype html>
  <html lang="ko">
    <head>
      <meta charset="utf-8" />
      <style>
        * { box-sizing: border-box; }
        html,
        body {
          width: 1080px;
          height: 1920px;
          margin: 0;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard", "Noto Sans KR", sans-serif;
        }
        .canvas {
          position: relative;
          width: 1080px;
          height: 1920px;
          overflow: hidden;
          color: #fffaf2;
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
          transform: scale(1.08);
          filter: saturate(0.9);
        }
        .tone {
          background:
            linear-gradient(180deg, rgba(8, 37, 34, 0.74) 0%, rgba(8, 37, 34, 0.5) 42%, rgba(8, 37, 34, 0.24) 72%, rgba(8, 37, 34, 0.58) 100%),
            linear-gradient(90deg, rgba(8, 37, 34, 0.34), rgba(8, 37, 34, 0.08));
        }
        .depth {
          background:
            radial-gradient(circle at 22% 10%, rgba(155, 230, 213, 0.18), transparent 32%),
            radial-gradient(circle at 82% 56%, rgba(255, 245, 220, 0.12), transparent 42%);
        }
        .copy {
          position: absolute;
          left: 52px;
          right: 52px;
          top: 86px;
          z-index: 3;
          text-align: center;
        }
        h1 {
          margin: 0;
          color: #fffaf2;
          font-size: 76px;
          line-height: 1.12;
          font-weight: 860;
          letter-spacing: 0;
          text-shadow: 0 6px 28px rgba(0, 0, 0, 0.32);
        }
        h1 strong {
          color: #9fe5d3;
          font-weight: 860;
        }
        .phone {
          position: absolute;
          left: 50%;
          bottom: -160px;
          z-index: 4;
          width: 792px;
          height: 1716px;
          transform: translateX(-50%);
          border-radius: 96px;
          padding: 26px;
          background: linear-gradient(145deg, #242927 0%, #0e1413 52%, #343938 100%);
          box-shadow:
            0 70px 120px rgba(0, 0, 0, 0.42),
            0 22px 60px rgba(30, 95, 84, 0.24),
            inset 0 0 0 2px rgba(255, 255, 255, 0.14);
        }
        .phone::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 49px;
          width: 32px;
          height: 32px;
          transform: translateX(-50%);
          border-radius: 999px;
          background: #090d0c;
          box-shadow: inset 0 0 0 5px #202625, 0 0 0 1px rgba(255, 255, 255, 0.06);
          z-index: 8;
        }
        .screen {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 72px;
          background: #f8f3eb;
        }
        .statusbar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 7;
          height: 92px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 62px 0 59px;
          color: #1f2826;
          font-size: 27px;
          font-weight: 760;
          background: rgba(248, 243, 235, 0.95);
        }
        .icons {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .signal {
          display: inline-flex;
          align-items: flex-end;
          gap: 4px;
          width: 34px;
          height: 24px;
          opacity: 0.78;
        }
        .signal::before,
        .signal::after {
          content: "";
          display: block;
          width: 6px;
          border-radius: 4px;
          background: currentColor;
        }
        .signal::before {
          height: 15px;
          box-shadow: 10px -7px 0 currentColor;
        }
        .signal::after {
          height: 23px;
          margin-left: 10px;
        }
        .wifi {
          position: relative;
          width: 30px;
          height: 21px;
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
          border: 3px solid currentColor;
          border-bottom: 0;
          border-radius: 999px 999px 0 0;
        }
        .wifi::before {
          width: 29px;
          height: 19px;
        }
        .wifi::after {
          width: 14px;
          height: 9px;
        }
        .battery {
          position: relative;
          width: 42px;
          height: 21px;
          border: 3px solid currentColor;
          border-radius: 8px;
          opacity: 0.78;
        }
        .battery::after {
          content: "";
          position: absolute;
          right: -8px;
          top: 6px;
          width: 4px;
          height: 8px;
          border-radius: 0 3px 3px 0;
          background: currentColor;
        }
        .battery::before {
          content: "";
          position: absolute;
          left: 4px;
          top: 4px;
          width: 27px;
          height: 8px;
          border-radius: 4px;
          background: currentColor;
        }
        .screen img {
          display: block;
          width: 100%;
          height: auto;
          margin-top: 72px;
        }
        .nav-hint {
          position: absolute;
          left: 50%;
          bottom: 22px;
          z-index: 8;
          width: 178px;
          height: 8px;
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
          <h1>${multiline(shot.headline).replace(/(바스타임|홈케어|기록|의식)/g, '<strong>$1</strong>')}</h1>
        </section>
        <aside class="phone" aria-hidden="true">
          <div class="screen">
            <div class="statusbar">
              <span>9:30</span>
              <span class="icons"><i class="signal"></i><i class="wifi"></i><i class="battery"></i></span>
            </div>
            <img src="${dataUrl(sourcePath)}" alt="" />
            <div class="nav-hint"></div>
          </div>
        </aside>
      </main>
    </body>
  </html>`;
}

async function main() {
  assertFile(BACKGROUND_PATH);
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const manifest = [];

  try {
    for (const shot of shots) {
      const outputPath = path.resolve(OUT_DIR, `${shot.number}-${shot.file}`);
      await page.setContent(renderShot(shot), { waitUntil: 'load' });
      await page.screenshot({ path: outputPath });
      manifest.push({
        file: path.relative(OUT_DIR, outputPath),
        source: shot.source,
        headline: shot.headline,
      });
      console.log(outputPath);
    }
  } finally {
    await browser.close();
  }

  fs.writeFileSync(
    path.resolve(OUT_DIR, 'manifest.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), shots: manifest }, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
