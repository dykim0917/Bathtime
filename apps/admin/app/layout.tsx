import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bath Sommelier Admin',
  description: 'PC content operations console for Bath Sommelier',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
