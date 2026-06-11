import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, devices } from 'playwright';

const baseUrl = process.env.PERSONA_QA_BASE_URL ?? 'http://localhost:3200';
const outDir = path.resolve('outputs/persona-qa-tc');
const screenshotDir = path.join(outDir, 'screenshots');

async function settle(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(800);
}

const testCases = [
  {
    id: 'TC-01',
    name: '욕조 없는 원룸 거주자',
    priority: 1,
    variants: [
      {
        id: 'mobile-home',
        platform: 'mobile-web',
        device: 'iPhone 15',
        startPath: '/',
        steps: [
          { type: 'clickText', text: '욕조 없는 집', fallbackPath: '/explore?query=욕조 없음' },
          { type: 'capture', label: 'result-first-screen' },
          { type: 'clickFirstContent' },
          { type: 'capture', label: 'detail-after-first-content' },
        ],
      },
      {
        id: 'desktop-home',
        platform: 'desktop-web',
        viewport: { width: 1366, height: 920 },
        startPath: '/',
        steps: [
          { type: 'clickText', text: '욕조 없는 집', fallbackPath: '/explore?query=욕조 없음' },
          { type: 'capture', label: 'result-first-screen' },
          { type: 'clickFirstContent' },
          { type: 'capture', label: 'detail-after-first-content' },
        ],
      },
    ],
    expectedText: ['욕조 없는 집', '욕조 없음', '샤워', '족욕'],
    targetAction: ['저장', '앱', '의식', '타이머'],
    scoreHints: {
      discovery: '첫 결과가 샤워/족욕/작은 욕실 도구인지 본다.',
      actionability: '30초 안에 오늘 할 수 있는 시간/행동이 보이는지 본다.',
    },
  },
  {
    id: 'TC-02',
    name: '수면 전 짧은 루틴 입문자',
    priority: 2,
    variants: [
      {
        id: 'mobile-home',
        platform: 'mobile-web',
        device: 'iPhone 15',
        startPath: '/',
        steps: [
          { type: 'clickText', text: '수면 전', fallbackPath: '/explore?query=수면 전' },
          { type: 'capture', label: 'result-first-screen' },
          { type: 'clickContentByText', text: '따뜻한 샤워', fallbackFirstContent: true },
          { type: 'capture', label: 'detail-routine-cta' },
        ],
      },
    ],
    expectedText: ['수면 전', '6분', '따뜻한 샤워', '욕조 없음'],
    mustNotSee: ['수면 보장', '불면증 치료'],
    targetAction: ['6분', '시작', '저장', '앱'],
    scoreHints: {
      trust: '수면 효능을 보장처럼 말하지 않는지 본다.',
      actionability: '아이템보다 오늘 밤 할 루틴이 먼저 보이는지 본다.',
    },
  },
  {
    id: 'TC-03',
    name: '퇴근 후 회복을 찾는 직장인',
    priority: 3,
    variants: [
      {
        id: 'desktop-search',
        platform: 'desktop-web',
        viewport: { width: 1440, height: 1000 },
        startPath: '/explore',
        steps: [
          { type: 'search', query: '퇴근 후' },
          { type: 'capture', label: 'result-first-screen' },
          { type: 'clickFirstContent' },
          { type: 'capture', label: 'detail-after-first-content' },
        ],
      },
      {
        id: 'mobile-search',
        platform: 'mobile-web',
        device: 'iPhone 15',
        startPath: '/explore',
        steps: [
          { type: 'search', query: '퇴근 후' },
          { type: 'capture', label: 'result-first-screen' },
        ],
      },
    ],
    expectedText: ['퇴근 후', '회복', '샤워', '족욕'],
    targetAction: ['5분', '7분', '10분', '15분', '시작'],
    scoreHints: {
      discovery: '퇴근 후라는 생활 상황이 결과 상단에서 직접 읽히는지 본다.',
      actionability: '피곤한 사용자가 긴 글 없이 선택할 수 있는지 본다.',
    },
  },
  {
    id: 'TC-04',
    name: '욕실 아이템 구매 전 판단 사용자',
    priority: 5,
    variants: [
      {
        id: 'mobile-item-query',
        platform: 'mobile-web',
        device: 'Pixel 7',
        startPath: '/explore?query=아이템',
        steps: [
          { type: 'capture', label: 'item-query-result' },
          { type: 'clickFirstContent' },
          { type: 'capture', label: 'item-detail' },
        ],
      },
      {
        id: 'mobile-footbath-query',
        platform: 'mobile-web',
        device: 'Pixel 7',
        startPath: '/explore?query=족욕',
        steps: [{ type: 'capture', label: 'footbath-query-result' }],
      },
      {
        id: 'mobile-chair-query',
        platform: 'mobile-web',
        device: 'Pixel 7',
        startPath: '/explore?query=욕실 의자',
        steps: [{ type: 'capture', label: 'chair-query-result' }],
      },
      {
        id: 'mobile-light-query',
        platform: 'mobile-web',
        device: 'Pixel 7',
        startPath: '/explore?query=조명',
        steps: [{ type: 'capture', label: 'light-query-result' }],
      },
    ],
    expectedText: ['체크리스트', '가격', '교체', '비교'],
    mustNotSee: ['1위', '무조건 추천', '최저가'],
    targetAction: ['구매 전', '확인', '비교', '후보'],
    scoreHints: {
      trust: '추천 순위가 아니라 판단 기준으로 읽히는지 본다.',
      discovery: '아이템 유형의 폭이 보이는지 본다.',
    },
  },
  {
    id: 'TC-05',
    name: '저장한 콘텐츠를 앱 의식으로 이어가려는 사용자',
    priority: 4,
    variants: [
      {
        id: 'mobile-saved-logged-out',
        platform: 'mobile-web',
        device: 'iPhone 15 Pro',
        startPath: '/saved',
        steps: [{ type: 'capture', label: 'saved-logged-out' }],
      },
      {
        id: 'mobile-app-page',
        platform: 'mobile-web',
        device: 'iPhone 15 Pro',
        startPath: '/app',
        steps: [{ type: 'capture', label: 'app-handoff' }],
      },
    ],
    expectedText: ['저장', '로그인', '앱', '의식'],
    targetAction: ['Google', '앱', '타이머', '보관함'],
    scoreHints: {
      conversion: '저장한 콘텐츠가 앱 실행으로 이어지는 그림이 보이는지 본다.',
    },
  },
  {
    id: 'TC-06',
    name: '좋은 목욕 공간을 제보하려는 사용자',
    priority: 6,
    variants: [
      {
        id: 'desktop-submit',
        platform: 'desktop-web',
        viewport: { width: 1280, height: 1000 },
        startPath: '/',
        steps: [
          { type: 'clickText', text: '좋은 공간 제보', fallbackPath: '/submit' },
          { type: 'capture', label: 'submit-page' },
          { type: 'fillSubmit' },
          { type: 'capture', label: 'submit-filled' },
        ],
      },
    ],
    expectedText: ['제보', '출처', '사진', '직접 촬영', '공개하지 않고'],
    targetAction: ['제보 보내기', 'Google 로그인'],
    scoreHints: {
      trust: '사진 권리, 출처, 공개 여부 안내가 보이는지 본다.',
    },
  },
  {
    id: 'TC-07',
    name: '긴 콘텐츠를 읽는 태블릿 사용자',
    priority: 9,
    variants: [
      {
        id: 'tablet-content-detail',
        platform: 'tablet-web',
        device: 'iPad Pro 11',
        startPath: '/content/care-sleep-warm-shower-90',
        steps: [
          { type: 'capture', label: 'detail-top' },
          { type: 'scroll', amount: 900 },
          { type: 'capture', label: 'detail-mid' },
          { type: 'scroll', amount: 1200 },
          { type: 'capture', label: 'detail-cta' },
        ],
      },
    ],
    expectedText: ['오늘의 발견', '찾아본 자료', '6분 수면 전 샤워', '참고한 자료'],
    mustNotSee: ['수면 보장'],
    targetAction: ['샤워 시작', '족욕 시작', '저장'],
    scoreHints: {
      trust: '근거와 행동 CTA가 한 흐름으로 이어지는지 본다.',
    },
  },
  {
    id: 'TC-08',
    name: '앱 설치/열기 전환 사용자',
    priority: 7,
    variants: [
      {
        id: 'mobile-app-direct',
        platform: 'mobile-web',
        device: 'iPhone 15',
        startPath: '/app',
        steps: [{ type: 'capture', label: 'app-page-direct' }],
      },
      {
        id: 'mobile-content-to-app',
        platform: 'mobile-web',
        device: 'iPhone 15',
        startPath: '/content/care-sleep-warm-shower-90',
        steps: [
          { type: 'capture', label: 'content-top' },
          { type: 'scroll', amount: 1800 },
          { type: 'capture', label: 'content-cta-area' },
        ],
      },
    ],
    expectedText: ['앱', '타이머', '보관함', '의식'],
    targetAction: ['앱 열기', '시작', '저장'],
    scoreHints: {
      conversion: '웹과 앱의 역할 차이가 기능이 아니라 행동으로 설명되는지 본다.',
    },
  },
  {
    id: 'TC-09',
    name: '개인정보에 민감한 로그인 사용자',
    priority: 8,
    variants: [
      {
        id: 'desktop-login',
        platform: 'desktop-web',
        viewport: { width: 1280, height: 900 },
        startPath: '/auth/login',
        steps: [{ type: 'capture', label: 'login-direct' }],
      },
      {
        id: 'mobile-saved-login-entry',
        platform: 'mobile-web',
        device: 'iPhone 15',
        startPath: '/saved',
        steps: [
          { type: 'capture', label: 'saved-login-entry' },
          { type: 'clickText', text: 'Google로 로그인', fallbackPath: '/auth/login' },
          { type: 'capture', label: 'after-login-cta' },
        ],
      },
    ],
    expectedText: ['Google', '저장한 콘텐츠', '제보', '개인정보처리방침'],
    targetAction: ['Google', '둘러보기'],
    scoreHints: {
      trust: '무엇이 저장되고 저장되지 않는지 설명되는지 본다.',
    },
  },
  {
    id: 'TC-10',
    name: '콘텐츠가 너무 블로그처럼 보이는지 의심하는 사용자',
    priority: 10,
    variants: [
      {
        id: 'desktop-home-content-compare',
        platform: 'desktop-web',
        viewport: { width: 1440, height: 1100 },
        startPath: '/',
        steps: [
          { type: 'capture', label: 'home-new-records' },
          { type: 'goto', path: '/content/item-filter-shower-head-checklist' },
          { type: 'capture', label: 'item-detail' },
          { type: 'goto', path: '/content/care-sleep-warm-shower-90' },
          { type: 'capture', label: 'care-detail' },
          { type: 'goto', path: '/routines' },
          { type: 'capture', label: 'routines' },
        ],
      },
    ],
    expectedText: ['체크리스트', '오늘의 발견', '찾아본 자료', '바로 해볼 수 있는 의식'],
    mustNotSee: ['무조건 추천', '1위', '효능 보장'],
    targetAction: ['시작', '저장', '타이머'],
    scoreHints: {
      understanding: '감성 글이 아니라 조건/근거/실행 구조로 보이는지 본다.',
    },
  },
];

function contextOptions(variant) {
  if (variant.device) {
    return { ...devices[variant.device] };
  }
  return { viewport: variant.viewport };
}

function normalize(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

async function safeText(locator, limit = 6000) {
  try {
    return normalize(await locator.innerText({ timeout: 3000 })).slice(0, limit);
  } catch {
    return '';
  }
}

async function visibleTextInViewport(page, limit = 5000) {
  return page.evaluate((max) => {
    const viewportHeight = window.innerHeight;
    const nodes = [...document.querySelectorAll('h1,h2,h3,p,a,button,label,input,textarea,article,section')];
    const chunks = [];
    for (const node of nodes) {
      const rect = node.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewportHeight || rect.width === 0 || rect.height === 0) continue;
      const text = (node.innerText || node.getAttribute('aria-label') || node.getAttribute('placeholder') || '').replace(/\s+/g, ' ').trim();
      if (text) chunks.push(text);
    }
    return chunks.join(' | ').slice(0, max);
  }, limit);
}

async function collectCards(page) {
  return page.locator('a[href^="/content/"], article').evaluateAll((nodes) =>
    nodes.slice(0, 10).map((node, index) => ({
      index,
      text: (node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 700),
      href: node.href || node.querySelector?.('a[href]')?.href || '',
    }))
  );
}

async function collectSnapshot(page, label, testCase, variant) {
  const body = await safeText(page.locator('body'));
  const viewportText = await visibleTextInViewport(page);
  const headings = await page
    .locator('h1,h2,h3')
    .evaluateAll((nodes) => nodes.slice(0, 25).map((node) => node.textContent?.trim()).filter(Boolean));
  const links = await page.locator('a').evaluateAll((nodes) =>
    nodes.slice(0, 50).map((node) => ({
      text: (node.textContent || '').replace(/\s+/g, ' ').trim(),
      href: node.href,
    }))
  );
  const buttons = await page
    .locator('button')
    .evaluateAll((nodes) => nodes.slice(0, 30).map((node) => (node.textContent || node.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim()).filter(Boolean));
  const inputs = await page.locator('input,textarea,select').evaluateAll((nodes) =>
    nodes.slice(0, 30).map((node) => ({
      tag: node.tagName.toLowerCase(),
      name: node.getAttribute('name') || '',
      placeholder: node.getAttribute('placeholder') || '',
      value: node.value || '',
      text: node.textContent?.trim() || '',
    }))
  );
  const cards = await collectCards(page);
  const checks = {
    expectedText: (testCase.expectedText || []).map((text) => ({ text, present: body.includes(text) })),
    mustNotSee: (testCase.mustNotSee || []).map((text) => ({ text, present: body.includes(text) })),
    targetAction: (testCase.targetAction || []).map((text) => ({ text, present: body.includes(text) })),
  };

  const screenshotName = `${testCase.id}_${variant.id}_${label}.png`.replaceAll('/', '-');
  const screenshotPath = path.join(screenshotDir, screenshotName);
  await page.screenshot({ path: screenshotPath, fullPage: false });

  return {
    label,
    url: page.url(),
    title: await page.title(),
    viewportText,
    headings,
    cards,
    links,
    buttons,
    inputs,
    bodyExcerpt: body.slice(0, 2200),
    checks,
    screenshot: path.relative(outDir, screenshotPath),
  };
}

async function runStep(page, step) {
  if (step.type === 'capture') return;

  if (step.type === 'goto') {
    await page.goto(new URL(step.path, baseUrl).toString(), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await settle(page);
    return;
  }

  if (step.type === 'clickText') {
    const before = page.url();
    const target = page.getByText(step.text, { exact: false }).first();
    if ((await target.count()) > 0) {
      await target.click({ timeout: 5000 }).catch(async () => {
        if (step.fallbackPath) {
          await page.goto(new URL(step.fallbackPath, baseUrl).toString(), { waitUntil: 'domcontentloaded', timeout: 120000 });
        }
      });
      await settle(page);
    }
    if (step.fallbackPath && page.url() === before) {
      await page.goto(new URL(step.fallbackPath, baseUrl).toString(), { waitUntil: 'domcontentloaded', timeout: 120000 });
      await settle(page);
    }
    return;
  }

  if (step.type === 'search') {
    const input = page.locator('input[name="query"]').first();
    if ((await input.count()) > 0 && (await input.isVisible().catch(() => false))) {
      await input.fill(step.query);
      await input.press('Enter');
      await settle(page);
    }
    if (!page.url().includes('/explore') || !decodeURIComponent(page.url()).includes(step.query)) {
      await page.goto(new URL(`/explore?query=${encodeURIComponent(step.query)}`, baseUrl).toString(), {
        waitUntil: 'domcontentloaded',
        timeout: 120000,
      });
      await settle(page);
    }
    return;
  }

  if (step.type === 'clickFirstContent') {
    const link = page.locator('a[href^="/content/"]').first();
    if ((await link.count()) > 0) {
      await link.click({ timeout: 5000 });
      await settle(page);
    }
    return;
  }

  if (step.type === 'clickContentByText') {
    const byText = page.locator('a[href^="/content/"]').filter({ hasText: step.text }).first();
    if ((await byText.count()) > 0) {
      await byText.click({ timeout: 5000 });
      await settle(page);
      return;
    }
    if (step.fallbackFirstContent) {
      await runStep(page, { type: 'clickFirstContent' });
    }
    return;
  }

  if (step.type === 'scroll') {
    await page.mouse.wheel(0, step.amount);
    await page.waitForTimeout(500);
    return;
  }

  if (step.type === 'fillSubmit') {
    const fields = await page.locator('input, textarea').all();
    const values = [
      '목욕 공간',
      '테스트 사우나 / https://example.com',
      '조용하고 물 온도가 안정적이며 혼자 쉬기 좋은 저녁 바스타임 경험이었습니다. 직접 촬영한 사진만 제공할 수 있습니다.',
      '페르소나QA',
    ];
    for (let index = 0; index < Math.min(fields.length, values.length); index += 1) {
      await fields[index].fill(values[index]);
    }
  }
}

async function runVariant(browser, testCase, variant) {
  const context = await browser.newContext(contextOptions(variant));
  const page = await context.newPage();
  const consoleMessages = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      consoleMessages.push({ type: message.type(), text: message.text() });
    }
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const snapshots = [];
  await page.goto(new URL(variant.startPath, baseUrl).toString(), { waitUntil: 'domcontentloaded', timeout: 120000 });
  await settle(page);
  snapshots.push(await collectSnapshot(page, 'start', testCase, variant));

  for (const step of variant.steps) {
    await runStep(page, step);
    const label = step.label || step.type;
    snapshots.push(await collectSnapshot(page, label, testCase, variant));
  }

  await context.close();

  return {
    ...variant,
    snapshots,
    consoleMessages,
    pageErrors,
  };
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const testCase of testCases) {
    const variants = [];
    for (const variant of testCase.variants) {
      variants.push(await runVariant(browser, testCase, variant));
    }
    results.push({
      id: testCase.id,
      name: testCase.name,
      priority: testCase.priority,
      expectedText: testCase.expectedText || [],
      mustNotSee: testCase.mustNotSee || [],
      targetAction: testCase.targetAction || [],
      scoreHints: testCase.scoreHints || {},
      variants,
    });
  }

  await browser.close();
  await fs.writeFile(
    path.join(outDir, 'persona-tc-evidence.json'),
    JSON.stringify({ baseUrl, generatedAt: new Date().toISOString(), testCases: results }, null, 2)
  );

  const summary = results.map((testCase) => ({
    id: testCase.id,
    name: testCase.name,
    variants: testCase.variants.map((variant) => ({
      id: variant.id,
      platform: variant.platform,
      finalUrl: variant.snapshots.at(-1).url,
      finalHeadings: variant.snapshots.at(-1).headings.slice(0, 6),
      firstCards: variant.snapshots.find((snapshot) => snapshot.label.includes('result'))?.cards.slice(0, 4) || [],
      expectedMisses: variant.snapshots.at(-1).checks.expectedText.filter((check) => !check.present).map((check) => check.text),
      forbiddenHits: variant.snapshots.at(-1).checks.mustNotSee.filter((check) => check.present).map((check) => check.text),
      targetHits: variant.snapshots.at(-1).checks.targetAction.filter((check) => check.present).map((check) => check.text),
      pageErrors: variant.pageErrors.length,
      consoleMessages: variant.consoleMessages.length,
    })),
  }));
  await fs.writeFile(path.join(outDir, 'persona-tc-summary.json'), JSON.stringify(summary, null, 2));
  console.log(`Wrote ${results.length} TC evidence records to ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
