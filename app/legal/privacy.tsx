import React from 'react';
import { Platform } from 'react-native';
import { LegalDocumentScreen } from '@/src/components/legal/LegalDocumentScreen';
import { WebLegalDocumentPage } from '@/src/components/web/WebLegalDocumentPage';
import { LEGAL_META, PRIVACY_LABELS, PRIVACY_POLICY_SECTIONS } from '@/src/legal/legalContent';

const title = '개인정보처리방침';
const subtitle = '바스타임이 어떤 정보를 왜 처리하는지, 이용자가 어떤 권리를 가지는지 안내합니다.';

export default function PrivacyScreen() {
  if (Platform.OS === 'web') {
    return (
      <WebLegalDocumentPage
        title={title}
        subtitle={subtitle}
        effectiveDate={LEGAL_META.effectiveDate}
        labels={PRIVACY_LABELS}
        sections={PRIVACY_POLICY_SECTIONS}
      />
    );
  }

  return (
    <LegalDocumentScreen
      title={title}
      subtitle={subtitle}
      effectiveDate={LEGAL_META.effectiveDate}
      labels={PRIVACY_LABELS}
      sections={PRIVACY_POLICY_SECTIONS}
    />
  );
}
