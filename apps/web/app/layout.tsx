import type { Metadata } from 'next';
import { Shell } from '@web/components/Shell';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_WEB_URL?.trim() || 'https://www.getbathtime.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: '바스타임 - 씻고 쉬는 시간 아카이브',
    template: '%s | 바스타임',
  },
  description: '사우나, 홈케어, 족욕, 욕실 아이템을 같은 기준으로 정리한 바스타임 아카이브. 찾고, 저장하고, 실행합니다.',
  openGraph: {
    siteName: '바스타임',
    locale: 'ko_KR',
    type: 'website',
  },
};

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: '바스타임',
      alternateName: 'Bathtime',
      url: siteUrl,
      sameAs: ['https://play.google.com/store/apps/details?id=com.bathtimestudio.bathtime'],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: '바스타임',
      url: siteUrl,
      inLanguage: 'ko-KR',
      publisher: { '@id': `${siteUrl}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/explore?query={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/#webpage`,
      name: '바스타임 - 씻고 쉬는 시간 아카이브',
      url: siteUrl,
      inLanguage: 'ko-KR',
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#organization` },
      description: '사우나, 홈케어, 족욕, 욕실 아이템을 같은 기준으로 정리한 바스타임 아카이브입니다.',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd).replace(/</g, '\\u003c') }}
        />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
