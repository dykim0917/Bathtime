import type { Metadata } from 'next';
import { OnsenMethodologyExperience } from '@web/components/OnsenMethodologyExperience';
import { readOnsenCandidates } from '@web/lib/onsenData';

const PUBLIC_REVIEW_PLATFORMS = [
  'Jalan',
  'Rakuten Travel',
  'Google Maps',
  'Tripadvisor',
  'Agoda',
  'Yahoo! Travel Japan',
  'Relux',
];

export const metadata: Metadata = {
  title: 'How Bathtime checks an onsen',
  description: 'See how Bathtime combines official information and counted review signals to organize Japanese onsen stays and day-use baths.',
  alternates: {
    canonical: '/en/onsen/methodology',
    languages: { 'ko-KR': '/onsen/methodology', en: '/en/onsen/methodology', 'x-default': '/onsen/methodology' },
  },
};

export default async function EnglishOnsenMethodologyPage() {
  const candidates = await readOnsenCandidates();
  const published = candidates.filter((candidate) => candidate.verdict);

  return (
    <OnsenMethodologyExperience
      locale="en"
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
