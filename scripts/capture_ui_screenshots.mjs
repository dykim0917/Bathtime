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

const BASE_URL = process.env.SCREENSHOT_BASE_URL || 'http://localhost:8082';
const OUT_DIR = path.resolve(
  process.cwd(),
  process.env.SCREENSHOT_OUT_DIR || 'output/screenshots/ui-states'
);
const CAPTURE_SETTLE_MS = 1000;
const STORAGE_KEYS = {
  USER_PROFILE: '@bath_sommelier/user_profile',
  COOKIE_NOTICE_ACK: '@bath_sommelier/cookie_notice_ack',
};

function createProfile({
  bathEnvironment = 'bathtub',
  healthConditions = ['none'],
  onboardingComplete = true,
} = {}) {
  return {
    bathEnvironment,
    healthConditions,
    onboardingComplete,
    createdAt: '2026-04-23T00:00:00.000Z',
    updatedAt: '2026-04-23T00:00:00.000Z',
  };
}

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
    req.setTimeout(4000, () => {
      req.destroy(new Error(`Timed out while connecting to ${url}`));
    });
  });
}

async function newPage(browser, { profile = null, cookieAck = false } = {}) {
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.addInitScript(
    ({ profileData, cookieAckValue, storageKeys }) => {
      localStorage.clear();
      if (profileData) {
        localStorage.setItem(storageKeys.USER_PROFILE, JSON.stringify(profileData));
      }
      if (cookieAckValue) {
        localStorage.setItem(storageKeys.COOKIE_NOTICE_ACK, 'true');
      }
    },
    { profileData: profile, cookieAckValue: cookieAck, storageKeys: STORAGE_KEYS }
  );

  return { context, page };
}

async function gotoAndSettle(page, pathname, ms = CAPTURE_SETTLE_MS) {
  const url = pathname.startsWith('http') ? pathname : `${BASE_URL}${pathname}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(ms);
}

async function waitForText(page, text, timeout = 10000) {
  await page.getByText(text, { exact: true }).first().waitFor({ timeout });
}

async function capture(page, manifest, file, description) {
  const filepath = path.join(OUT_DIR, file);
  await page.waitForTimeout(CAPTURE_SETTLE_MS);
  await page.screenshot({ path: filepath });
  manifest.push({ file, description, url: page.url() });
  console.log(`saved ${file}`);
}

async function closePossibleModal(page, label) {
  const locator = page.getByText(label, { exact: true });
  if (await locator.count()) {
    await locator.first().click();
    await page.waitForTimeout(350);
  }
}

async function clickGlyph(page, glyph) {
  const locator = page.getByText(glyph, { exact: true }).first();
  await locator.waitFor({ timeout: 5000 });
  await locator.click();
}

async function captureOnboarding(browser, manifest) {
  const { context, page } = await newPage(browser);
  try {
    await gotoAndSettle(page, '/onboarding/welcome');
    await capture(page, manifest, 'onboarding-welcome.png', 'Welcome onboarding step 1');

    await page.getByText('다음', { exact: true }).click();
    await page.waitForTimeout(300);
    await page.getByText('다음', { exact: true }).click();
    await waitForText(page, '시작 전에 함께 확인할 내용');
    await capture(page, manifest, 'onboarding-legal.png', 'Welcome onboarding legal notice step');

    await page.getByText('내용 확인하고 시작하기', { exact: true }).click();
    await page.waitForURL(/\/onboarding$/, { timeout: 10000 });
    await page.waitForTimeout(500);
    await capture(page, manifest, 'onboarding-environment.png', 'Onboarding environment selection');

    await page.getByText('전신욕, 반신욕 가능', { exact: true }).click();
    await page.waitForTimeout(250);
    await capture(page, manifest, 'onboarding-environment-selected.png', 'Onboarding environment selected');

    await page.getByText('다음', { exact: true }).click();
    await page.waitForURL(/\/onboarding\/health/, { timeout: 10000 });
    await waitForText(page, '설정 완료');
    await capture(page, manifest, 'onboarding-health.png', 'Onboarding health selection');

    await page.getByText('해당 없음', { exact: true }).first().click();
    await page.waitForTimeout(250);
    await capture(page, manifest, 'onboarding-health-selected.png', 'Onboarding health selected');

    await page.getByText('설정 완료', { exact: true }).click();
    await page.waitForURL(/\/onboarding\/greeting/, { timeout: 10000 });
    await page.waitForTimeout(500);
    await capture(page, manifest, 'onboarding-greeting.png', 'Onboarding greeting');
  } finally {
    await context.close();
  }
}

async function captureLegalDocs(browser, manifest) {
  const { context, page } = await newPage(browser, {
    profile: createProfile(),
    cookieAck: true,
  });
  try {
    await gotoAndSettle(page, '/legal/privacy');
    await waitForText(page, '개인정보 처리방침');
    await capture(page, manifest, 'legal-privacy.png', 'Privacy policy screen');

    await gotoAndSettle(page, '/legal/terms');
    await waitForText(page, '이용약관');
    await capture(page, manifest, 'legal-terms.png', 'Terms of service screen');
  } finally {
    await context.close();
  }
}

async function captureCookieBanner(browser, manifest) {
  const { context, page } = await newPage(browser, {
    profile: createProfile(),
    cookieAck: false,
  });
  try {
    await gotoAndSettle(page, '/care', 1200);
    await waitForText(page, '쿠키 및 접속정보 안내');
    await capture(page, manifest, 'cookie-banner.png', 'Cookie banner over app shell');
  } finally {
    await context.close();
  }
}

async function captureMyEmpty(browser, manifest) {
  const { context, page } = await newPage(browser, {
    profile: createProfile(),
    cookieAck: true,
  });
  try {
    await gotoAndSettle(page, '/my');
    await waitForText(page, '아직 기록이 없어요');
    await capture(page, manifest, 'my-history-empty.png', 'My tab history empty state');
  } finally {
    await context.close();
  }
}

async function captureTripPreBathGate(browser, manifest) {
  const { context, page } = await newPage(browser, {
    profile: createProfile(),
    cookieAck: true,
  });
  try {
    await gotoAndSettle(page, '/trip');
    await capture(page, manifest, 'trip-default.png', 'Trip tab default state');

    await page.getByText('노르딕 무드로 리셋해볼까요?', { exact: true }).click();
    await page.waitForURL(/\/result\/recipe\//, { timeout: 10000 });
    await waitForText(page, '오늘의 휴식을 위한 준비');
    await page.getByText('목욕 시작하기', { exact: true }).click();
    await waitForText(page, '시작 전 꼭 확인하세요');
    await capture(page, manifest, 'recipe-prebath-gate.png', 'Pre-bath safety gate modal');
  } finally {
    await context.close();
  }
}

async function captureMainFlow(browser, manifest) {
  const { context, page } = await newPage(browser, {
    profile: createProfile(),
    cookieAck: true,
  });

  try {
    await gotoAndSettle(page, '/', 1500);
    await capture(page, manifest, 'home-empty.png', 'Home tab with empty history');

    await gotoAndSettle(page, '/care');
    await capture(page, manifest, 'care-default.png', 'Care tab default state');

    await page.getByText('운동 후 뻐근함을 풀어볼까요?', { exact: true }).click();
    await waitForText(page, '혹시 이런 느낌도 있나요?');
    await capture(page, manifest, 'care-subprotocol-modal.png', 'Care subprotocol modal');

    await page.getByText('전신이 무거워요', { exact: true }).click();
    await page.waitForURL(/\/result\/recipe\//, { timeout: 10000 });
    await waitForText(page, '오늘의 휴식을 위한 준비');
    await capture(page, manifest, 'recipe-care.png', 'Care recipe screen');

    await page.getByText('추천 제품 보기', { exact: true }).click();
    await waitForText(page, '루틴에 더할 제품');
    await capture(page, manifest, 'recipe-product-matching-modal.png', 'Recipe product matching modal');

    await page.getByText('제품 보기', { exact: true }).first().click();
    await waitForText(page, '구매 링크 열기');
    await capture(page, manifest, 'recipe-product-detail-modal.png', 'Recipe product detail modal');

    await closePossibleModal(page, '루틴으로 돌아가기');
    await page.getByText('목욕 시작하기', { exact: true }).click();
    await page.waitForURL(/\/result\/timer\//, { timeout: 10000 });
    await waitForText(page, '화면을 터치하면 바로 시작합니다');
    await capture(page, manifest, 'timer-intro.png', 'Timer intro state');

    await page.mouse.click(215, 540);
    await waitForText(page, '루틴 마치기');
    await page.waitForTimeout(700);
    await capture(page, manifest, 'timer-running.png', 'Timer running state');

    await clickGlyph(page, '');
    await waitForText(page, '잠시 멈춤');
    await capture(page, manifest, 'timer-paused.png', 'Timer paused state');

    await clickGlyph(page, '');
    await page.waitForTimeout(400);
    await clickGlyph(page, '');
    await waitForText(page, '몰입 사운드 조절');
    await capture(page, manifest, 'timer-sound-modal.png', 'Timer sound control modal');
    await closePossibleModal(page, '닫기');

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByText('루틴 마치기', { exact: true }).click();
    await page.waitForURL(/\/result\/completion\//, { timeout: 10000 });
    await waitForText(page, '오늘 바스타임은 어떠셨나요?');
    await capture(page, manifest, 'completion-default.png', 'Completion feedback step');

    await page.getByText('좋아요', { exact: true }).click();
    await waitForText(page, '잘 쉬었습니다');
    await capture(page, manifest, 'completion-summary.png', 'Completion summary step');

    await page.getByText('홈으로 가기', { exact: true }).click();
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1200);
    await capture(page, manifest, 'home-with-history.png', 'Home tab with recent history');

    await gotoAndSettle(page, '/product');
    await capture(page, manifest, 'product-default.png', 'Product tab default state');

    await page.getByText('›', { exact: true }).first().click();
    await waitForText(page, '구매 링크 열기');
    await capture(page, manifest, 'product-detail-modal.png', 'Product detail modal');

    await closePossibleModal(page, '제품 목록으로 돌아가기');

    await gotoAndSettle(page, '/my');
    await waitForText(page, '기록');
    await page.waitForTimeout(1000);
    await capture(page, manifest, 'my-history-filled.png', 'My tab history filled state');

    await page.getByText('설정', { exact: true }).first().click();
    await waitForText(page, '내 정보');
    await capture(page, manifest, 'my-settings.png', 'My tab settings top state');

    await page.getByText('개인정보 처리방침', { exact: true }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await capture(page, manifest, 'my-settings-legal.png', 'My tab settings legal section');
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
    await captureOnboarding(browser, manifest);
    await captureCookieBanner(browser, manifest);
    await captureLegalDocs(browser, manifest);
    await captureMyEmpty(browser, manifest);
    await captureTripPreBathGate(browser, manifest);
    await captureMainFlow(browser, manifest);
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
