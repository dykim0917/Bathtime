import type { Metadata } from 'next';
import { Shell } from '@web/components/Shell';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL?.trim() || 'https://www.getbathtime.com'),
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
