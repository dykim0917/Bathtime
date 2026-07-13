import type { Metadata } from 'next';
import { OnsenLanding } from '@web/components/OnsenLanding';

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: 'Find an onsen worth making the trip for | Bathtime' },
  description: 'Explore Japanese onsen stays and day-use baths by private bathing, public baths, verified water systems, and the kind of moment you want.',
  alternates: {
    canonical: '/en',
    languages: {
      'ko-KR': '/',
      'en': '/en',
      'x-default': '/',
    },
  },
};

export default function EnglishHomePage() {
  return <OnsenLanding locale="en" />;
}
