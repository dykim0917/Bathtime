import type { Metadata } from 'next';
import { OnsenMethodologyExperience } from '@web/components/OnsenMethodologyExperience';
import { readOnsenCandidates } from '@web/lib/onsenData';

const PUBLIC_REVIEW_PLATFORMS = [
  '자란',
  '라쿠텐 트래블',
  '구글 지도',
  '트립어드바이저',
  '아고다',
  '야후 트래블',
  '리럭스',
];

export const metadata: Metadata = {
  title: '바스타임이 온천을 확인하는 방법',
  description: '바스타임 온천 검색기가 후기와 공식 정보를 읽고 온천 숙소와 당일온천 시설을 판정하는 기준을 설명합니다.',
  alternates: {
    canonical: '/onsen/methodology',
  },
};

export default async function OnsenMethodologyPage() {
  const candidates = await readOnsenCandidates();
  const published = candidates.filter((candidate) => candidate.verdict);

  return (
    <OnsenMethodologyExperience
      totals={{
        experiencesRead: published.reduce(
          (total, candidate) => total + (candidate.verdict?.briefing.experiencesRead ?? candidate.directReviews ?? 0),
          0
        ),
        publishedCount: published.length,
        platformCount: PUBLIC_REVIEW_PLATFORMS.length,
      }}
      platforms={PUBLIC_REVIEW_PLATFORMS}
    />
  );
}
