import React from 'react';
import { Platform } from 'react-native';
import { LegalDocumentScreen } from '@/src/components/legal/LegalDocumentScreen';
import { WebLegalDocumentPage } from '@/src/components/web/WebLegalDocumentPage';
import { LEGAL_META, TERMS_OF_SERVICE_SECTIONS } from '@/src/legal/legalContent';

const title = '이용약관';
const subtitle = '바스타임 서비스 이용 조건, 책임 범위, 이용자와 운영자의 기본 의무를 정리한 문서입니다.';

export default function TermsScreen() {
  if (Platform.OS === 'web') {
    return (
      <WebLegalDocumentPage
        title={title}
        subtitle={subtitle}
        effectiveDate={LEGAL_META.effectiveDate}
        sections={TERMS_OF_SERVICE_SECTIONS}
      />
    );
  }

  return (
    <LegalDocumentScreen
      title={title}
      subtitle={subtitle}
      effectiveDate={LEGAL_META.effectiveDate}
      sections={TERMS_OF_SERVICE_SECTIONS}
    />
  );
}
