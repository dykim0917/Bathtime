import type { Metadata } from 'next';
import { LegalDocument } from '@web/components/LegalDocument';
import { LEGAL_META, PRIVACY_LABELS, PRIVACY_POLICY_SECTIONS } from '@/src/legal/legalContent';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '바스타임이 어떤 정보를 왜 처리하는지, 이용자가 어떤 권리를 가지는지 안내합니다.',
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="개인정보처리방침"
      subtitle="바스타임이 어떤 정보를 왜 처리하는지, 이용자가 어떤 권리를 가지는지 안내합니다."
      effectiveDate={LEGAL_META.effectiveDate}
      labels={PRIVACY_LABELS}
      sections={PRIVACY_POLICY_SECTIONS}
    />
  );
}
