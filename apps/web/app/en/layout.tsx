import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Bathtime Onsen Guide',
    template: '%s | Bathtime',
  },
  description: 'Find Japanese onsen stays and day-use baths by the experience, bath setup, and verified water system.',
  openGraph: {
    siteName: 'Bathtime',
    locale: 'en_US',
    type: 'website',
  },
};

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div lang="en">{children}</div>;
}
