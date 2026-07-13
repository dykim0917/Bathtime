import type { Metadata } from 'next';
import { OnsenLanding } from '@web/components/OnsenLanding';

export const metadata: Metadata = {
  title: 'Japanese onsen guide',
  description: 'Compare Japanese onsen stays and day-use facilities by bath setup, official facts, water system, and review signals.',
  alternates: {
    canonical: '/en/onsen',
    languages: {
      'ko-KR': '/onsen',
      'en': '/en/onsen',
      'x-default': '/onsen',
    },
  },
};

export default function EnglishOnsenPage() {
  return <OnsenLanding locale="en" />;
}
