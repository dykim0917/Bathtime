import type { Metadata } from 'next';
import { OnsenLanding } from '@web/components/OnsenLanding';

export const metadata: Metadata = {
  title: '온천 검색기',
  description: '일본 온천 숙소와 당일입욕 시설의 목욕 구성, 공식 시설 정보, 온천수 근거와 후기를 확인하는 바스타임 온천 검색기입니다.',
  alternates: {
    canonical: '/onsen',
  },
};

export default function OnsenPage() {
  return <OnsenLanding />;
}
