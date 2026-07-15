import { existsSync } from 'node:fs';
import path from 'node:path';

const bannedPublicCopyPatterns = [
  { pattern: /이용 경험/, reason: '`후기` 대신 내부 용어 `이용 경험`을 사용했습니다.' },
  { pattern: /확인(?:됩|했)니다/, reason: '카드 결론에 근거 보고형 표현을 사용했습니다.' },
  { pattern: /비교 가치가 높습니다/, reason: '장소성이 없는 공통 결론을 사용했습니다.' },
  { pattern: /(?:객실 노천탕|대욕장|공용 노천탕|수질 체감) 중심 숙소입니다/, reason: '판정 라벨을 그대로 문장으로 사용했습니다.' },
  { pattern: /온천욕과 .+을 함께 이용하는 .+시설입니다/, reason: '시설 유형 템플릿을 그대로 문장으로 사용했습니다.' },
  { pattern: /공용 온천욕을 중심으로 이용하는 당일입욕 시설입니다/, reason: '시설 유형 템플릿을 그대로 문장으로 사용했습니다.' },
  { pattern: /역사적 공중탕과 당일입욕 경험.+온천 시설입니다/, reason: '시설 유형 템플릿을 그대로 문장으로 사용했습니다.' },
  { pattern: /선택 이유인 .+시설입니다/, reason: '판정 라벨을 그대로 문장으로 사용했습니다.' },
  { pattern: /\d[\d,]*(?:\.\d+)?\s*(?:조|畳|평|리)(?:\s|[,.]|$)/, reason: '한국 사용자에게 낯선 지역 단위를 변환하지 않았습니다.' },
];

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function localSourceExists(repoRoot, sourceFile) {
  if (!sourceFile || /^https?:\/\//.test(sourceFile)) return false;
  return existsSync(path.resolve(repoRoot, sourceFile));
}

export function validateEditorialCardSummary(summary, options = {}) {
  const { repoRoot = process.cwd(), canonicalCounts = {}, slug = 'unknown', targetType = 'accommodation' } = options;
  const errors = [];

  if (!isRecord(summary)) return [`${slug}: editorialCardSummary가 객체가 아닙니다.`];

  const text = typeof summary.text === 'string' ? summary.text.trim() : '';
  const status = summary.status;
  if (!text) errors.push(`${slug}: 카드 요약 문장이 없습니다.`);
  if (status !== 'published' && status !== 'draft') errors.push(`${slug}: status는 published 또는 draft여야 합니다.`);
  if (text.length > 160) errors.push(`${slug}: 카드 요약이 160자를 넘습니다 (${text.length}자).`);

  const sentenceCount = (text.match(/[.!?](?:\s|$)/g) ?? []).length;
  if (text && (sentenceCount < 1 || sentenceCount > 2)) {
    errors.push(`${slug}: 카드 요약은 1~2개의 완결 문장이어야 합니다.`);
  }

  for (const { pattern, reason } of bannedPublicCopyPatterns) {
    if (pattern.test(text)) errors.push(`${slug}: ${reason}`);
  }

  if (status === 'published') {
    const official = summary.official_basis;
    const review = summary.review_basis;

    if (!isRecord(official)) {
      errors.push(`${slug}: published 문장에 official_basis가 없습니다.`);
    } else {
      if (typeof official.fact_ko !== 'string' || !official.fact_ko.trim()) errors.push(`${slug}: official_basis.fact_ko가 없습니다.`);
      if (typeof official.source_url !== 'string' || !/^https?:\/\//.test(official.source_url)) errors.push(`${slug}: official_basis.source_url이 없습니다.`);
      if (typeof official.source_file !== 'string' || !localSourceExists(repoRoot, official.source_file)) errors.push(`${slug}: official_basis.source_file을 확인할 수 없습니다.`);
    }

    if (!isRecord(review)) {
      errors.push(`${slug}: published 문장에 review_basis가 없습니다.`);
    } else {
      const directReviewCount = positiveNumber(review.direct_review_count);
      const onsenRelatedCount = positiveNumber(review.onsen_related_count);
      const platformCount = positiveNumber(review.platform_count);
      if (typeof review.finding_ko !== 'string' || !review.finding_ko.trim()) errors.push(`${slug}: review_basis.finding_ko가 없습니다.`);
      if (!directReviewCount) errors.push(`${slug}: review_basis.direct_review_count가 없습니다.`);
      if (targetType === 'accommodation' && !onsenRelatedCount) errors.push(`${slug}: review_basis.onsen_related_count가 없습니다.`);
      if (!platformCount) errors.push(`${slug}: review_basis.platform_count가 없습니다.`);
      if (directReviewCount && onsenRelatedCount && onsenRelatedCount > directReviewCount) errors.push(`${slug}: 온천 관련 후기 수가 직접 읽은 후기 수보다 큽니다.`);
      if (typeof review.source_file !== 'string' || !localSourceExists(repoRoot, review.source_file)) errors.push(`${slug}: review_basis.source_file을 확인할 수 없습니다.`);

      const canonicalDirect = positiveNumber(canonicalCounts.directReviewCount);
      const canonicalOnsen = positiveNumber(canonicalCounts.onsenReviewCount);
      if (canonicalDirect && directReviewCount && canonicalDirect !== directReviewCount) {
        errors.push(`${slug}: 직접 읽은 후기 수가 canonical ${canonicalDirect}건과 다릅니다 (${directReviewCount}건).`);
      }
      if (canonicalOnsen && onsenRelatedCount && canonicalOnsen !== onsenRelatedCount) {
        errors.push(`${slug}: 온천 관련 후기 수가 canonical ${canonicalOnsen}건과 다릅니다 (${onsenRelatedCount}건).`);
      }
    }
  }

  return errors;
}

export function mergeEditorialCardSummary(evidenceCounts, summary) {
  return {
    ...(isRecord(evidenceCounts) ? evidenceCounts : {}),
    editorialCardSummary: summary,
  };
}
