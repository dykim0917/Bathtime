import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { chromium } from 'playwright';

const BASE_URL = process.env.SCREENSHOT_BASE_URL || 'http://localhost:8082';
const OUT_DIR = path.resolve(process.cwd(), process.env.SCREENSHOT_OUT_DIR || 'output/screenshots/ui-states');
const STORAGE_KEYS = {
  USER_PROFILE: '@bath_sommelier/user_profile',
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
    createdAt: '2026-04-08T00:00:00.000Z',
    updatedAt: '2026-04-08T00:00:00.000Z',
  };
}

function ensureDir(dir) {
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

async function newPage(browser, { profile = null } = {}) {
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.addInitScript(
    ({ profileData, storageKeys }) => {
      localStorage.clear();
      if (profileData) {
        localStorage.setItem(storageKeys.USER_PROFILE, JSON.stringify(profileData));
      }
    },
    { profileData: profile, storageKeys: STORAGE_KEYS }
  );

  return { context, page };
}

async function waitForPaint(page, ms = 500) {
  await page.waitForTimeout(ms);
}

async function capture(page, manifest, file, description) {
  const filepath = path.join(OUT_DIR, file);
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

async function clickFirstExisting(page, labels) {
  for (const label of labels) {
    const locator = page.getByText(label, { exact: true });
    if (await locator.count()) {
      await locator.first().click();
      return label;
    }
  }
  throw new Error(`None of the candidate labels were found: ${labels.join(', ')}`);
}

async function captureOnboarding(browser, manifest) {
  const { context, page } = await newPage(browser);
  try {
    await page.goto(`${BASE_URL}/onboarding/welcome`, { waitUntil: 'networkidle' });
    await waitForPaint(page);
    await capture(page, manifest, 'onboarding-welcome.png', 'Welcome landing');

    await page.getByText('시작하기', { exact: true }).click();
    await page.waitForURL(/\/onboarding$/, { timeout: 10000 });
    await waitForPaint(page);
    await capture(page, manifest, 'onboarding-environment.png', 'Onboarding environment selection');

    await page.getByText('전신욕, 반신욕 가능', { exact: true }).click();
    await waitForPaint(page, 250);
    await capture(page, manifest, 'onboarding-environment-selected.png', 'Onboarding environment selected');

    await page.getByText('다음', { exact: true }).click();
    await page.waitForURL(/\/onboarding\/health/, { timeout: 10000 });
    await waitForPaint(page);
    await capture(page, manifest, 'onboarding-health.png', 'Onboarding health selection');

    await page.getByText('해당 없음', { exact: true }).first().click();
    await waitForPaint(page, 250);
    await capture(page, manifest, 'onboarding-health-selected.png', 'Onboarding health selected');

    await page.getByText('진단 완료', { exact: true }).click();
    await page.waitForURL(/\/onboarding\/greeting/, { timeout: 10000 });
    await waitForPaint(page);
    await capture(page, manifest, 'onboarding-greeting.png', 'Onboarding greeting');
  } finally {
    await context.close();
  }
}

async function captureMyEmpty(browser, manifest) {
  const { context, page } = await newPage(browser, {
    profile: createProfile(),
  });
  try {
    await page.goto(`${BASE_URL}/my`, { waitUntil: 'networkidle' });
    await waitForPaint(page);
    await capture(page, manifest, 'my-history-empty.png', 'My tab history empty state');
  } finally {
    await context.close();
  }
}

async function captureRiskModals(browser, manifest) {
  const riskyProfile = createProfile({ healthConditions: ['hypertension_heart'] });

  {
    const { context, page } = await newPage(browser, { profile: riskyProfile });
    try {
      await page.goto(`${BASE_URL}/care`, { waitUntil: 'networkidle' });
      await page.getByText('술 드셨다면 지금 이 조합이 좋아요', { exact: true }).first().click();
      await page.getByText('두통이 있고 민감해요', { exact: true }).first().click();
      await page.getByText('안전 체크리스트', { exact: true }).waitFor({ timeout: 10000 });
      await waitForPaint(page);
      await capture(page, manifest, 'care-safety-warning.png', 'Care flow safety warning modal');
    } finally {
      await context.close();
    }
  }

  {
    const { context, page } = await newPage(browser, { profile: riskyProfile });
    try {
      await page.goto(`${BASE_URL}/trip`, { waitUntil: 'networkidle' });
      await page.getByText('교토 숲으로 잠깐 떠나볼까요?', { exact: true }).first().click();
      await page.getByText('기본 몰입', { exact: true }).first().click();
      await page.getByText('안전 체크리스트', { exact: true }).waitFor({ timeout: 10000 });
      await waitForPaint(page);
      await capture(page, manifest, 'trip-safety-warning.png', 'Trip flow safety warning modal');
    } finally {
      await context.close();
    }
  }
}

async function captureMainFlow(browser, manifest) {
  const { context, page } = await newPage(browser, {
    profile: createProfile(),
  });

  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await waitForPaint(page, 1500);
    await capture(page, manifest, 'home-empty.png', 'Home tab with empty recent history');

    await page.goto(`${BASE_URL}/care`, { waitUntil: 'networkidle' });
    await waitForPaint(page);
    await capture(page, manifest, 'care-default.png', 'Care tab default state');

    await page.getByText('운동 후 근육을 풀어볼까요?', { exact: true }).first().click();
    await page.getByText('혹시 이런 느낌도 있나요?', { exact: true }).waitFor({ timeout: 10000 });
    await waitForPaint(page);
    await capture(page, manifest, 'care-subprotocol-modal.png', 'Care subprotocol modal');

    await page.getByText('전신이 무거워요', { exact: true }).first().click();
    await page.waitForURL(/\/result\/recipe\//, { timeout: 10000 });
    await page.getByText('이번 루틴은 이렇게 진행돼요', { exact: true }).waitFor({ timeout: 10000 });
    await waitForPaint(page);
    await capture(page, manifest, 'recipe-care.png', 'Care recipe screen');

    await page.getByText('준비물 제품 보기', { exact: true }).click();
    await page.getByText('준비물로 볼 제품', { exact: true }).first().waitFor({ timeout: 10000 });
    await waitForPaint(page);
    await capture(page, manifest, 'recipe-product-matching-modal.png', 'Recipe product matching modal');

    await page.getByText('제품 보기', { exact: true }).first().click();
    await page.getByText('구매 링크 열기', { exact: true }).waitFor({ timeout: 10000 });
    await waitForPaint(page);
    await capture(page, manifest, 'recipe-product-detail-modal.png', 'Recipe product detail modal');

    await closePossibleModal(page, '루틴으로 돌아가기');
    await page.getByText('목욕 시작하기', { exact: true }).click();
    await page.waitForURL(/\/result\/timer\//, { timeout: 10000 });
    await waitForPaint(page, 800);
    await capture(page, manifest, 'timer-running.png', 'Timer screen running state');

    await page.mouse.click(215, 540);
    await page.getByText('잠시 멈춤', { exact: true }).waitFor({ timeout: 5000 });
    await waitForPaint(page, 250);
    await capture(page, manifest, 'timer-paused.png', 'Timer screen paused state');

    await page.mouse.click(215, 540);
    await waitForPaint(page, 250);

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByText('끝내기', { exact: true }).click();
    await page.waitForURL(/\/result\/completion\//, { timeout: 10000 });
    await page.getByText('기록 보기', { exact: true }).waitFor({ timeout: 10000 });
    await waitForPaint(page, 600);
    await capture(page, manifest, 'completion-default.png', 'Completion screen before feedback');

    await page.getByText('좋아요', { exact: true }).click();
    await page.getByText('의견 고마워요. 다음 추천에 반영할게요.', { exact: true }).waitFor({ timeout: 5000 });
    await waitForPaint(page, 250);
    await capture(page, manifest, 'completion-feedback-good.png', 'Completion screen after positive feedback');

    await page.getByText('홈으로 가기', { exact: true }).click();
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '', { timeout: 10000 }).catch(() => {});
    await waitForPaint(page, 1500);
    await capture(page, manifest, 'home-with-history.png', 'Home tab with recent history');

    await page.goto(`${BASE_URL}/trip`, { waitUntil: 'networkidle' });
    await waitForPaint(page);
    await capture(page, manifest, 'trip-default.png', 'Trip tab default state');

    await page.getByText('교토 숲으로 잠깐 떠나볼까요?', { exact: true }).first().click();
    await page.getByText('어떤 방식으로 즐겨볼까요?', { exact: true }).waitFor({ timeout: 10000 });
    await waitForPaint(page);
    await capture(page, manifest, 'trip-subprotocol-modal.png', 'Trip subprotocol modal');

    await page.getByText('기본 몰입', { exact: true }).first().click();
    await page.waitForURL(/\/result\/recipe\//, { timeout: 10000 });
    await page.waitForTimeout(200);

    await page.goto(`${BASE_URL}/product`, { waitUntil: 'networkidle' });
    await waitForPaint(page);
    await capture(page, manifest, 'product-default.png', 'Product tab default state');

    await clickFirstExisting(page, ['릴렉싱 바디워시', '샤워 스티머', '라벤더 배스 솔트']);
    await page.getByText('구매 링크 열기', { exact: true }).waitFor({ timeout: 10000 });
    await waitForPaint(page);
    await capture(page, manifest, 'product-detail-modal.png', 'Product tab detail modal');

    await closePossibleModal(page, '루틴으로 돌아가기');
    await closePossibleModal(page, '제품 목록으로 돌아가기');

    await page.goto(`${BASE_URL}/my`, { waitUntil: 'networkidle' });
    await page.getByText('기록', { exact: true }).first().waitFor({ timeout: 10000 });
    await waitForPaint(page);
    await capture(page, manifest, 'my-history-filled.png', 'My tab history filled state');

    await page.getByText('설정', { exact: true }).first().click();
    await page.getByText('PROFILE SETTINGS', { exact: true }).waitFor({ timeout: 10000 });
    await waitForPaint(page);
    await capture(page, manifest, 'my-settings.png', 'My tab settings state');

    await page.getByText('프로필 다시 설정하기', { exact: true }).click();
    await page.getByText('프로필 초기화', { exact: true }).waitFor({ timeout: 10000 });
    await waitForPaint(page);
    await capture(page, manifest, 'my-settings-reset-modal.png', 'My tab reset confirmation modal');
  } finally {
    await context.close();
  }
}

async function main() {
  ensureDir(OUT_DIR);
  await assertServerAvailable(BASE_URL);

  const browser = await chromium.launch({ headless: true });
  const manifest = [];

  try {
    await captureOnboarding(browser, manifest);
    await captureMyEmpty(browser, manifest);
    await captureMainFlow(browser, manifest);
    await captureRiskModals(browser, manifest);
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
