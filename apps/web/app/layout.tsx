import type { Metadata } from 'next';
import { Shell } from '@web/components/Shell';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL?.trim() || 'https://www.getbathtime.com'),
  title: {
    default: '바스타임 - 좋은 바스타임을 발견하는 아카이브',
    template: '%s | 바스타임',
  },
  description: '집 안팎의 씻고 쉬는 시간을 더 좋게 만드는 콘텐츠, 장소, 아이템, 의식을 정리합니다.',
  openGraph: {
    siteName: '바스타임',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
