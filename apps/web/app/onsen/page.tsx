import type { Metadata } from 'next';
import { OnsenLanding } from '@web/components/OnsenLanding';

export const metadata: Metadata = {
  title: '온천 검색기',
  description: '일본 료칸 이용 전 객실탕, 가족탕, 대욕장, 온천수 체감과 주의할 점을 확인하는 바스타임 온천 검색기입니다.',
  alternates: {
    canonical: '/onsen',
  },
};

export default function OnsenPage() {
  return <OnsenLanding />;
}
