import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, devices } from 'playwright';

const baseUrl = process.env.PERSONA_QA_BASE_URL ?? 'http://localhost:3200';
const outDir = path.resolve('outputs/persona-qa');
const screenshotDir = path.join(outDir, 'screenshots');

const personas = [
  {
    id: 'p01_desktop_evening_worker',
    name: '퇴근 후 회복을 찾는 30대 직장인',
    platform: 'web-desktop',
    viewport: { width: 1440, height: 1200 },
    path: '/',
    actions: [
      { type: 'clickLink', name: '상황별 콘텐츠 보기', fallbackPath: '/explore' },
      { type: 'search', query: '퇴근 후' },
      { type: 'firstContent' },
    ],
  },
  {
    id: 'p02_mobile_sleep_beginner',
    name: '수면 전 짧은 루틴을 찾는 입문자',
    platform: 'mobile-web',
    device: 'iPhone 15',
    path: '/',
    actions: [
      { type: 'clickLink', name: '수면 전', fallbackPath: '/explore?query=수면 전' },
      { type: 'firstContent' },
    ],
  },
  {
    id: 'p03_desktop_no_bathtub',
    name: '욕조 없는 원룸 거주자',
    platform: 'web-desktop',
    viewport: { width: 1366, height: 900 },
    path: '/explore?query=욕조 없음',
    actions: [{ type: 'firstContent' }],
  },
  {
    id: 'p04_mobile_item_curator',
    name: '욕실 아이템을 비교하는 큐레이터형 사용자',
    platform: 'mobile-web',
    device: 'Pixel 7',
    path: '/explore?query=아이템',
    actions: [{ type: 'firstContent' }],
  },
  {
    id: 'p05_desktop_submitter',
    name: '좋은 목욕 공간을 제보하려는 사용자',
    platform: 'web-desktop',
    viewport: { width: 1280, height: 1000 },
    path: '/submit',
    actions: [{ type: 'fillSubmit' }],
  },
  {
    id: 'p06_mobile_saved_returner',
    name: '출근길에 저장 목록을 확인하는 재방문자',
    platform: 'mobile-web',
    device: 'iPhone 15 Pro',
    path: '/saved',
    actions: [],
  },
  {
    id: 'p07_desktop_routine_planner',
    name: '주말 홈케어 루틴을 미리 고르는 사용자',
    platform: 'web-desktop',
    viewport: { width: 1440, height: 1000 },
    path: '/routines',
    actions: [],
  },
  {
    id: 'p08_tablet_trip_reader',
    name: '태블릿으로 긴 콘텐츠를 읽는 사용자',
    platform: 'tablet-web',
    device: 'iPad Pro 11',
    path: '/content/care-sleep-warm-shower-90',
    actions: [],
  },
  {
    id: 'p09_mobile_app_handoff',
    name: '모바일에서 앱으로 이어가려는 사용자',
    platform: 'mobile-web',
    device: 'iPhone 15',
    path: '/app',
    actions: [],
  },
  {
    id: 'p10_desktop_login_sensitive',
    name: '개인화/저장 기능 전에 로그인 맥락을 확인하는 사용자',
    platform: 'web-desktop',
    viewport: { width: 1280, height: 900 },
    path: '/auth/login',
    actions: [],
  },
];

function contextOptions(persona) {
  if (persona.device) {
    return { ...devices[persona.device] };
  }
  return { viewport: persona.viewport };
}

async function safeText(locator, limit = 3000) {
  try {
    const text = await locator.innerText({ timeout: 3000 });
    return text.replace(/\s+/g, ' ').trim().slice(0, limit);
  } catch {
    return '';
  }
}

async function snapshot(page) {
  const headings = await page
    .locator('h1, h2, h3')
    .evaluateAll((nodes) => nodes.slice(0, 18).map((node) => node.textContent?.trim()).filter(Boolean));
  const links = await page
    .locator('a')
    .evaluateAll((nodes) =>
      nodes
        .slice(0, 30)
        .map((node) => ({ text: node.textContent?.trim().replace(/\s+/g, ' '), href: node.href }))
        .filter((link) => link.text)
    );
  const buttons = await page
    .locator('button')
    .evaluateAll((nodes) => nodes.slice(0, 20).map((node) => node.textContent?.trim()).filter(Boolean));
  return {
    url: page.url(),
    title: await page.title(),
    headings,
    links,
    buttons,
    bodyExcerpt: await safeText(page.locator('body')),
  };
}

async function runAction(page, action) {
  if (action.type === 'clickLink') {
    const before = page.url();
    await page.getByRole('link', { name: new RegExp(action.name) }).first().click();
    await page.waitForLoadState('networkidle');
    if (action.fallbackPath && page.url() === before) {
      await page.goto(new URL(action.fallbackPath, baseUrl).toString(), { waitUntil: 'networkidle' });
    }
    return;
  }

  if (action.type === 'search') {
    const input = page.locator('input[name="query"]').first();
    await input.fill(action.query);
    await input.press('Enter');
    await page.waitForLoadState('networkidle');
    if (!page.url().includes('/explore')) {
      await page.goto(new URL(`/explore?query=${encodeURIComponent(action.query)}`, baseUrl).toString(), {
        waitUntil: 'networkidle',
      });
    }
    return;
  }

  if (action.type === 'firstContent') {
    const contentLink = page.locator('a[href^="/content/"]').first();
    if ((await contentLink.count()) > 0) {
      await contentLink.click();
      await page.waitForLoadState('networkidle');
    }
    return;
  }

  if (action.type === 'fillSubmit') {
    const fields = await page.locator('input, textarea').all();
    const values = ['페르소나 QA 제보 장소', '서울시 중구 테스트로 1', '조용한 저녁 족욕에 어울리는 곳입니다.'];
    for (let index = 0; index < Math.min(fields.length, values.length); index += 1) {
      await fields[index].fill(values[index]);
    }
  }
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const persona of personas) {
    const context = await browser.newContext(contextOptions(persona));
    const page = await context.newPage();
    const consoleMessages = [];
    const pageErrors = [];
    page.on('console', (message) => {
      if (['error', 'warning'].includes(message.type())) {
        consoleMessages.push({ type: message.type(), text: message.text() });
      }
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const steps = [];
    await page.goto(new URL(persona.path, baseUrl).toString(), { waitUntil: 'networkidle' });
    steps.push({ label: 'initial', snapshot: await snapshot(page) });

    for (const action of persona.actions) {
      await runAction(page, action);
      steps.push({ label: action.type, snapshot: await snapshot(page) });
    }

    const screenshotPath = path.join(screenshotDir, `${persona.id}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    results.push({
      ...persona,
      evidence: {
        screenshot: path.relative(outDir, screenshotPath),
        steps,
        consoleMessages,
        pageErrors,
      },
    });
    await context.close();
  }

  await browser.close();
  await fs.writeFile(
    path.join(outDir, 'persona-web-evidence.json'),
    JSON.stringify({ baseUrl, generatedAt: new Date().toISOString(), personas: results }, null, 2)
  );
  console.log(`Wrote ${results.length} persona web evidence records to ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
