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
const SYMBOL_PATH = path.resolve(ROOT_DIR, 'assets/images/bathtime.svg');
const OUTPUTS = [
  { path: 'assets/images/icon.png', size: 1024, symbolWidth: 690, background: '#FFFFFF' },
  { path: 'assets/images/adaptive-icon.png', size: 1024, symbolWidth: 690, background: '#FFFFFF' },
  { path: 'assets/images/adaptive-foreground.png', size: 1024, symbolWidth: 600, background: 'transparent' },
  { path: 'assets/images/splash-icon.png', size: 1024, symbolWidth: 520, background: '#FFFFFF' },
  { path: 'assets/images/favicon.png', size: 48, symbolWidth: 32, background: '#FFFFFF' },
  { path: 'tmp/store-assets/splash-preview.png', size: 1024, symbolWidth: 520, background: '#FFFFFF' },
];

function dataUrl(filepath) {
  const ext = path.extname(filepath).toLowerCase();
  const mime = ext === '.svg' ? 'image/svg+xml' : 'image/png';
  return `data:${mime};base64,${fs.readFileSync(filepath).toString('base64')}`;
}

function assertFile(filepath) {
  if (!fs.existsSync(filepath)) {
    throw new Error(`Missing required file: ${filepath}`);
  }
}

async function render(page, asset) {
  const outputPath = path.resolve(ROOT_DIR, asset.path);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  await page.setViewportSize({ width: asset.size, height: asset.size });
  await page.setContent(
    `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          html,
          body {
            width: ${asset.size}px;
            height: ${asset.size}px;
            margin: 0;
            overflow: hidden;
            background: ${asset.background};
          }
          .canvas {
            position: absolute;
            inset: 0;
            display: grid;
            place-items: center;
          }
          img {
            width: ${asset.symbolWidth}px;
            height: auto;
            display: block;
          }
        </style>
      </head>
      <body>
        <main class="canvas">
          <img src="${dataUrl(SYMBOL_PATH)}" alt="" />
        </main>
      </body>
    </html>`,
    { waitUntil: 'load' }
  );

  await page.screenshot({
    path: outputPath,
    omitBackground: asset.background === 'transparent',
  });
  console.log(outputPath);
}

async function main() {
  assertFile(SYMBOL_PATH);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });

  try {
    for (const asset of OUTPUTS) {
      await render(page, asset);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
