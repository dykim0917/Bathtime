import type { OnsenCandidate, OnsenDecisionAnswer, OnsenEntityType } from './onsenCatalog';

type OnsenDecisionAnswerRow = {
  target_type: OnsenEntityType;
  target_slug: string;
  journey: string;
  question_code: string;
  question_ko: string;
  answer_status: 'verified' | 'conditional' | 'needs_check';
  applicability: 'applicable' | 'not_applicable';
  answer_ko: string;
  check_what: string | null;
  official_source_url: string | null;
  official_source_checked_at: string | null;
  target_readiness: 'ready' | 'conditional' | 'hold';
};

type DecisionAnswerWithTarget = OnsenDecisionAnswer & {
  targetType: OnsenEntityType;
  targetSlug: string;
};

const questionOrder = [
  'together_private_eligibility',
  'bath_layout_scope',
  'private_bath_booking_flow',
  'private_bath_terms_limits',
  'day_use_operation',
  'bath_experience_richness',
  'water_operation_method',
];

const experienceCodes = new Set([
  'together_private_eligibility',
  'bath_layout_scope',
  'bath_experience_richness',
  'water_operation_method',
]);

const usageCodes = new Set([
  'private_bath_booking_flow',
  'private_bath_terms_limits',
]);

export const onsenPublicReadinessThresholds = {
  decisionAnswers: 6,
  verdictItems: 2,
} as const;

function normalizeAnswer(row: OnsenDecisionAnswerRow): DecisionAnswerWithTarget {
  return {
    targetType: row.target_type,
    targetSlug: row.target_slug,
    code: row.question_code,
    label: row.question_ko,
    value: row.answer_ko,
    status: row.answer_status === 'verified' ? 'confirmed' : row.answer_status,
    detail: row.check_what ?? undefined,
    sourceUrl: row.official_source_url ?? undefined,
    checkedAt: row.official_source_checked_at ?? undefined,
    applicability: row.applicability,
    journey: row.journey,
    targetReadiness: row.target_readiness,
  };
}

export async function readOnsenDecisionAnswers(config: { restUrl: string; apiKey: string }) {
  const url = new URL(`${config.restUrl}/onsen_decision_answers`);
  url.searchParams.set(
    'select',
    'target_type,target_slug,journey,question_code,question_ko,answer_status,applicability,answer_ko,check_what,official_source_url,official_source_checked_at,target_readiness'
  );
  url.searchParams.set('order', 'target_type.asc,target_slug.asc,question_code.asc');

  try {
    const response = await fetch(url, {
      headers: {
        apikey: config.apiKey,
        authorization: `Bearer ${config.apiKey}`,
      },
      next: { revalidate: 60, tags: ['onsen-decision-answers'] },
    });
    if (!response.ok) return [];
    return ((await response.json()) as OnsenDecisionAnswerRow[]).map(normalizeAnswer);
  } catch {
    return [];
  }
}

export function attachOnsenDecisionAnswers(
  candidates: OnsenCandidate[],
  answers: DecisionAnswerWithTarget[]
) {
  const answersByTarget = new Map<string, DecisionAnswerWithTarget[]>();
  for (const answer of answers) {
    const key = `${answer.targetType}:${answer.targetSlug}`;
    answersByTarget.set(key, [...(answersByTarget.get(key) ?? []), answer]);
  }
  return candidates.map((candidate) => ({
    ...candidate,
    decisionAnswers: [...(answersByTarget.get(`${candidate.entityType ?? 'accommodation'}:${candidate.slug}`) ?? [])]
      .sort((a, b) => questionOrder.indexOf(a.code) - questionOrder.indexOf(b.code))
      .map(({ targetType: _targetType, targetSlug: _targetSlug, ...answer }) => answer),
  }));
}

export function getOnsenDecisionAnswerGroups(answers: OnsenDecisionAnswer[] = []) {
  return {
    experience: answers.filter((answer) => experienceCodes.has(answer.code)),
    usage: answers.filter((answer) => usageCodes.has(answer.code)),
    trip: answers.filter((answer) => answer.code === 'day_use_operation'),
  };
}

export function getOnsenPublicationReadiness(candidate: OnsenCandidate) {
  const answers = candidate.decisionAnswers ?? [];
  const questionCount = new Set(answers.map((answer) => answer.code)).size;
  const answeredCount = answers.filter((answer) => answer.status !== 'needs_check').length;
  const verdictItemCount = candidate.verdict?.items.length ?? 0;
  const hasCompleteQuestionSet = questionCount === questionOrder.length;
  const decisionReady = hasCompleteQuestionSet
    && answeredCount >= onsenPublicReadinessThresholds.decisionAnswers
    && answers.every((answer) => answer.targetReadiness !== 'hold');
  const verdictReady = verdictItemCount >= onsenPublicReadinessThresholds.verdictItems;

  return {
    publicReady: decisionReady && verdictReady,
    decisionReady,
    verdictReady,
    answeredCount,
    questionCount,
    verdictItemCount,
  };
}

export function isPublicOnsenCandidate(candidate: OnsenCandidate) {
  return getOnsenPublicationReadiness(candidate).publicReady;
}
