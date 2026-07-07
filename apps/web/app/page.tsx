import type { Metadata } from 'next';
import { OnsenLanding } from '@web/components/OnsenLanding';

export const revalidate = 300;

export const metadata: Metadata = {
  title: '바스타임 온천 검색기',
  description: '일본 료칸 이용 전 객실 내 프라이빗탕, 대절탕, 대욕장, 온천수 사용 범위와 확인할 점을 정리합니다.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return <OnsenLanding />;
}
