import React from 'react';
import { LegalDocumentScreen } from '@/src/components/legal/LegalDocumentScreen';
import { LEGAL_META, PRIVACY_LABELS, PRIVACY_POLICY_SECTIONS } from '@/src/legal/legalContent';

export default function PrivacyScreen() {
  return (
    <LegalDocumentScreen
      title="개인정보 처리방침"
      subtitle="배쓰타임이 어떤 정보를 왜 처리하는지, 그리고 이용자가 어떤 권리를 가지는지 안내합니다."
      effectiveDate={LEGAL_META.effectiveDate}
      labels={PRIVACY_LABELS}
      sections={PRIVACY_POLICY_SECTIONS}
    />
  );
}
