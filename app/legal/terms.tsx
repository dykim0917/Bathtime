import React from 'react';
import { LegalDocumentScreen } from '@/src/components/legal/LegalDocumentScreen';
import { LEGAL_META, TERMS_OF_SERVICE_SECTIONS } from '@/src/legal/legalContent';

export default function TermsScreen() {
  return (
    <LegalDocumentScreen
      title="이용약관"
      subtitle="배쓰타임 서비스 이용 조건, 책임 범위, 이용자와 운영자의 기본 의무를 정리한 문서입니다."
      effectiveDate={LEGAL_META.effectiveDate}
      sections={TERMS_OF_SERVICE_SECTIONS}
    />
  );
}
