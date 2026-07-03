import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const out = path.resolve('.superloopy/evidence/global-header-ui-final');
fs.mkdirSync(out, { recursive: true });

const cases = [
  ['home', '/'],
  ['explore', '/explore'],
  ['onsen', '/onsen'],
];

const browser = await chromium.launch({ headless: true });
const results = [];

for (const [name, route] of cases) {
  for (const width of [390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 1100 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });

    const response = await page.goto(`http://127.0.0.1:3127${route}`, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.screenshot({ path: path.join(out, `${name}-${width}.png`), fullPage: true });

    const metrics = await page.evaluate(() => {
      const headerNode = document.querySelector('.sidebar');
      const header = headerNode?.getBoundingClientRect();
      return {
        shell: document.querySelector('.site-shell')?.className,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        headerDisplay: headerNode ? getComputedStyle(headerNode).display : null,
        headerHeight: header ? Math.round(header.height) : null,
        navLinks: Array.from(document.querySelectorAll('.nav-link'))
          .map((node) => node.textContent?.trim())
          .filter(Boolean),
      };
    });

    results.push({ name, route, width, status: response?.status(), errors, metrics });
    await page.close();
  }
}

await browser.close();

const failures = results.filter(
  (item) =>
    item.status !== 200 ||
    item.errors.length > 0 ||
    item.metrics.scrollWidth !== item.metrics.viewportWidth ||
    (item.width >= 768 && item.metrics.headerDisplay !== 'grid')
);

fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ failures, results }, null, 2));

if (failures.length > 0) {
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ checked: results.length, screenshots: out, failures: 0 }, null, 2));
