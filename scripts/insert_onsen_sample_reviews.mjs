import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const sampleReviews = [
  {
    accommodation_slug: 'yufuin-baien',
    bath_type: 'public_bath',
    water_feel: 'soft',
    visit_season: '2026년 초봄 평일',
    body: '[샘플] 대욕장은 넓고 조망이 좋아서 숙소 전체의 온천 인상이 먼저 남았습니다. 가족탕은 시간대에 따라 기다릴 수 있어 여유 있게 보는 편이 좋겠습니다.',
  },
  {
    accommodation_slug: 'yufuin-baien',
    bath_type: 'private_bath',
    water_feel: 'clear',
    visit_season: '2026년 봄',
    body: '[샘플] 가족탕은 프라이빗하게 쓰기 좋지만 선착순 운영이라 체크인 직후 이용 가능 여부를 먼저 확인하는 쪽이 편했습니다.',
  },
  {
    accommodation_slug: 'yufuin-den-rikyu',
    bath_type: 'room_bath',
    water_feel: 'strong',
    visit_season: '2026년 겨울',
    body: '[샘플] 객실 안에서 실내탕과 노천탕을 오가며 쓰는 구조라 공용탕보다 방 안 온천 경험이 중심으로 느껴졌습니다. 겨울에는 노천탕 온도를 먼저 확인하면 좋겠습니다.',
  },
  {
    accommodation_slug: 'yufuin-sumika',
    bath_type: 'room_bath',
    water_feel: 'soft',
    visit_season: '2026년 봄 주말',
    body: '[샘플] 객실 노천탕 중심으로 조용히 쉬기 좋은 유형입니다. 객실 타입과 금연 여부는 예약 조건에서 따로 확인하는 편이 안전합니다.',
  },
];

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const line of readFileSync(filePath, 'utf8').split(/\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
}

function readLocalEnv() {
  return {
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
    ...parseEnvFile(path.join(repoRoot, 'apps/admin/.env.local')),
    ...process.env,
  };
}

async function readFirstUserProfile(restUrl, serviceKey) {
  const response = await fetch(`${restUrl}/user_profiles?select=id&limit=1`, {
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to read user profile: ${response.status} ${await response.text()}`);
  }

  const rows = await response.json();
  if (!rows[0]?.id) throw new Error('No user profile found for sample reviews.');
  return rows[0].id;
}

async function deletePreviousSamples(restUrl, serviceKey) {
  const response = await fetch(`${restUrl}/onsen_reviews?body=like.%5B%EC%83%98%ED%94%8C%5D*`, {
    method: 'DELETE',
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      prefer: 'return=minimal',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete previous sample reviews: ${response.status} ${await response.text()}`);
  }
}

async function insertSamples(restUrl, serviceKey, userId) {
  const now = new Date().toISOString();
  const rows = sampleReviews.map((review) => ({
    ...review,
    user_id: userId,
    status: 'approved',
    created_at: now,
    updated_at: now,
  }));

  const response = await fetch(`${restUrl}/onsen_reviews`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      'content-type': 'application/json',
      prefer: 'return=minimal',
    },
    body: JSON.stringify(rows),
  });

  if (!response.ok) {
    throw new Error(`Failed to insert sample reviews: ${response.status} ${await response.text()}`);
  }
}

async function main() {
  const env = readLocalEnv();
  const restUrl = (env.CONTENT_DB_REST_URL || `${env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1`).replace(/\/+$/, '');
  const serviceKey = env.CONTENT_DB_SERVICE_ROLE_KEY;
  if (!restUrl || !serviceKey) {
    throw new Error('Missing CONTENT_DB_REST_URL/SUPABASE_URL or CONTENT_DB_SERVICE_ROLE_KEY.');
  }

  const userId = await readFirstUserProfile(restUrl, serviceKey);
  await deletePreviousSamples(restUrl, serviceKey);
  await insertSamples(restUrl, serviceKey, userId);
  console.log(`Inserted ${sampleReviews.length} approved onsen sample reviews.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
