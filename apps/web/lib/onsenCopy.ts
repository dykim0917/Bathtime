export function normalizeOnsenPublicCopy(text: string) {
  const normalized = text
    .replaceAll('예약 화면에서', '상세 조건에서')
    .replaceAll('예약 단계에서', '상세 조건에서')
    .replaceAll('예약 전', '이용 전')
    .replaceAll('상품명을', '객실 타입을')
    .replaceAll('대여 가족탕', '대절탕')
    .replaceAll('가족탕/대절탕', '대절탕')
    .replaceAll('가족탕', '대절탕')
    .replaceAll('대절탕·대절탕', '대절탕')
    .replaceAll('객실탕', '객실 내 프라이빗탕')
    .replaceAll('공용탕', '공용 온천')
    .replaceAll('공식 설명과 후기를 함께 검토', '공식 설명과 이용 조건을 함께 검토')
    .replaceAll('직수 온천 언급', '원천 직수 예약 전 확인')
    .replaceAll('체감 후기가 강하고', '온천 이용 만족도가 높고')
    .replaceAll('객실 노천탕 후기 비중이 매우 높아', '여러 후기에서 객실 노천탕 만족도가 뚜렷해')
    .replaceAll('공식 정보와 후기 모두에서 대욕장 언급이 많습니다.', '대욕장 이용 정보가 확인됩니다.')
    .replaceAll('넓은 대절탕이 확인되지만 선착순 대기 후기가 반복됩니다.', '넓은 대절탕이 확인되며, 선착순 이용이라 대기가 생길 수 있습니다.')
    .replaceAll('객실 노천탕 긍정 신호가 전체 후기에서 매우 강하게 잡힙니다.', '객실 노천탕 이용 만족도가 뚜렷합니다.')
    .replaceAll('직수 온천 관련 긍정 후기가 반복됩니다.', '원천을 흘려보내는 구조가 확인됩니다.')
    .replaceAll('흡연 객실 관련 확인 신호가 있어', '흡연 객실 관련 조건이 있어')
    .replaceAll('최근 후기를 같이 보는', '최근 이용 조건을 함께 보는')
    .replaceAll('겨울 여행이면 노천탕 온도 후기를 더 확인하세요.', '겨울 여행이면 노천탕 온도를 더 확인하세요.')
    .replaceAll('냉감 확인을 권장합니다', '냉감을 함께 확인하세요')
    .replaceAll('객실 노천탕 경험에 대한 직접 후기가 강합니다.', '객실 노천탕 이용 만족도가 뚜렷합니다.')
    .replaceAll('객실 온천에 대한 긍정 신호가 있으나 표본은 작습니다.', '객실 온천 이용 만족도는 보이지만, 아직 확인 정보는 적습니다.')
    .replaceAll('확인 신호', '확인할 조건')
    .replaceAll('긍정 신호', '만족도')
    .replaceAll('보조 신호', '보조 정보')
    .replaceAll('신호가', '정보가')
    .replaceAll('반복 언급', '반복 확인')
    .replaceAll('언급을 함께 확인했습니다', '내용을 함께 확인했습니다')
    .replaceAll('언급이 확인됩니다', '내용이 확인됩니다')
    .replaceAll('언급 있음', '예약 전 확인');

  return normalized
    .replace(/보는 편이 맞습니다/g, '보는 것이 맞습니다')
    .replace(/보는 편이 정확합니다/g, '보는 것이 정확합니다')
    .replace(/보는 편이 자연스럽습니다/g, '보는 것이 자연스럽습니다')
    .replace(/확인하는 편이 좋습니다/g, '확인하세요')
    .replace(/확인하는 편이 안전합니다/g, '확인하세요')
    .replace(/확인하는 편이 필요합니다/g, '확인하세요')
    .replace(/확인하는 편이 낫습니다/g, '확인하세요');
}

type OnsenCardCopyCandidate = {
  summary: string;
  fit: string[];
  primaryBath: string;
  cardSummary?: {
    text: string;
    status: 'published' | 'draft';
  };
  verdict?: {
    items: {
      type: 'positive' | 'conditional' | 'minor';
      chipLabel?: string;
      headline: string;
    }[];
  };
};

const cardFitCopy: Record<string, string> = {
  '객실 안에서 온천을 끝내고 싶음': '객실 안에서 온천을 즐기고 싶다면',
  '대절탕을 따로 쓰고 싶음': '일행끼리 온천을 이용하고 싶다면',
  '대욕장이나 큰 노천탕을 먼저 봄': '대욕장이나 큰 노천탕을 먼저 보고 싶다면',
  '온천수 느낌까지 확인하고 싶음': '물의 감촉까지 중요하게 보고 싶다면',
  '온천 구성을 먼저 확인하고 싶음': '욕장별 구성을 먼저 보고 싶다면',
};

const cardStrengthCopy: Record<string, { label: string; fit: string }> = {
  '수질 체감': { label: '물의 감촉', fit: '온천수의 촉감을 중요하게 볼 때' },
  '객실 노천탕': { label: '객실 노천탕', fit: '방 안에서 누리는 온천을 우선할 때' },
  '객실 내 프라이빗탕': { label: '프라이빗한 객실 온천', fit: '다른 사람과 동선을 나누지 않고 쉬고 싶을 때' },
  '대욕장': { label: '대욕장', fit: '넉넉한 탕 구성을 중요하게 볼 때' },
  '공용 노천탕': { label: '공용 노천탕', fit: '바깥 공기를 느끼는 노천탕을 찾을 때' },
  '공용 온천': { label: '공용 온천', fit: '여러 탕을 차례로 즐기고 싶을 때' },
  '대절탕': { label: '대절탕', fit: '일행끼리 온천을 이용하고 싶을 때' },
  '가족탕': { label: '대절탕', fit: '일행끼리 온천을 이용하고 싶을 때' },
  '시설 전반': { label: '시설 전반', fit: '온천 외 편의시설까지 함께 볼 때' },
  '온천 이용 경험': { label: '온천 이용', fit: '머무는 동안 온천을 충분히 즐기고 싶을 때' },
};

function isTemplateOnsenSummary(summary: string) {
  return (
    (/의 온천 (?:숙소|시설)입니다\./.test(summary) && /을 기준으로/.test(summary)) ||
    summary.includes('직접 읽은 이용 경험 수는 확보했지만')
  );
}

export function getOnsenCardSummary(candidate: OnsenCardCopyCandidate) {
  if (candidate.cardSummary?.status === 'published') return candidate.cardSummary.text;
  if (!isTemplateOnsenSummary(candidate.summary)) return candidate.summary;

  const strengths = candidate.verdict?.items
    .filter((item) => item.type === 'positive')
    .map((item) => item.chipLabel?.trim() || item.headline.replace(/(?:이|가) 이 숙소의 주요 판단 기준입니다\.$/, '').trim())
    .map((label) => cardStrengthCopy[label] ?? { label, fit: `${label} 중심으로 비교할 때` })
    .filter((strength, index, items) => strength.label.length > 0 && items.findIndex((item) => item.label === strength.label) === index)
    .slice(0, 2);

  if (!strengths?.length) {
    const fit = cardFitCopy[candidate.fit[0]] ?? '욕장별 구성을 먼저 보고 싶다면';
    const primaryBath = candidate.primaryBath.replace(/ 중심$/, '').replaceAll('/', '과 ');
    if (primaryBath.includes('확인형')) {
      return `${fit}, 세부 온천 구성을 확인하며 비교하는 편이 좋습니다.`;
    }
    if (primaryBath.includes('비교형')) {
      return `${fit}, 객실 온천과 공용 온천을 나눠 비교하는 편이 좋습니다.`;
    }
    const focus = primaryBath.includes('수질 체감') ? primaryBath : `${primaryBath} 구성`;
    return `${fit}, ${focus}이 이곳의 핵심 비교 항목입니다.`;
  }
  if (strengths.length === 1) {
    return `여러 후기에서 ${strengths[0].label}에 대한 만족이 뚜렷해, ${strengths[0].fit} 눈여겨볼 만합니다.`;
  }

  const firstLabel = strengths[0].label;
  const finalCode = firstLabel.charCodeAt(firstLabel.length - 1);
  const conjunction = finalCode >= 0xac00 && finalCode <= 0xd7a3 && (finalCode - 0xac00) % 28 === 0 ? '와' : '과';
  return `여러 후기에서 ${firstLabel}${conjunction} ${strengths[1].label}에 대한 만족이 함께 돋보여, ${strengths[0].fit} 눈여겨볼 만합니다.`;
}

export function normalizeOnsenSourceLabel(label: string) {
  if (label === '이용자 확인') {
    return '이용 정보 정리';
  }

  if (label === '운용 참고') {
    return '운용 정보';
  }

  return label;
}
