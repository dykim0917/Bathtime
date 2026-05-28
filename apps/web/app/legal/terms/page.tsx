import type { Metadata } from 'next';
import { LegalDocument } from '@web/components/LegalDocument';
import { LEGAL_META, TERMS_OF_SERVICE_SECTIONS } from '@/src/legal/legalContent';

export const metadata: Metadata = {
  title: '이용약관',
  description: '바스타임 서비스 이용 조건, 책임 범위, 이용자와 운영자의 기본 의무를 정리한 문서입니다.',
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="이용약관"
      subtitle="바스타임 서비스 이용 조건, 책임 범위, 이용자와 운영자의 기본 의무를 정리한 문서입니다."
      effectiveDate={LEGAL_META.effectiveDate}
      sections={TERMS_OF_SERVICE_SECTIONS}
    />
  );
}
