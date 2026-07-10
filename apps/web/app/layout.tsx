import type { Metadata } from 'next';
import { GoogleAnalytics } from '@web/components/GoogleAnalytics';
import { Shell } from '@web/components/Shell';
import { readOnsenCandidates } from '@web/lib/onsenData';
import { buildOnsenSearchSuggestions } from '@web/lib/onsenSearch';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_WEB_URL?.trim() || 'https://www.getbathtime.com';
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: '바스타임 - 온천 검색기',
    template: '%s | 바스타임',
  },
  description: '일본 온천 숙소와 당일입욕 시설의 목욕 구성, 공식 정보, 온천수 사용 범위와 확인할 점을 정리하는 온천 검색기입니다.',
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
        target: `${siteUrl}/onsen/results?query={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/#webpage`,
      name: '바스타임 - 온천 검색기',
      url: siteUrl,
      inLanguage: 'ko-KR',
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#organization` },
      description: '일본 온천 숙소와 당일입욕 시설의 목욕 구성, 공식 정보, 온천수 사용 범위와 확인할 점을 정리하는 온천 검색기입니다.',
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const onsenSearchSuggestions = buildOnsenSearchSuggestions(await readOnsenCandidates());

  return (
    <html lang="ko">
      <head>
        {process.env.NODE_ENV === 'production' ? (
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4842787621878661"
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd).replace(/</g, '\\u003c') }}
        />
        <GoogleAnalytics measurementId={gaMeasurementId} />
        <Shell onsenSearchSuggestions={onsenSearchSuggestions}>{children}</Shell>
      </body>
    </html>
  );
}
