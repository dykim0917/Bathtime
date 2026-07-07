export function normalizeOnsenPublicCopy(text: string) {
  return text
    .replaceAll('예약 화면에서', '상세 조건에서')
    .replaceAll('예약 단계에서', '상세 조건에서')
    .replaceAll('예약 전', '이용 전')
    .replaceAll('상품명을', '객실 타입을')
    .replaceAll('대여 가족탕', '대절탕')
    .replaceAll('가족탕/대절탕', '대절탕')
    .replaceAll('가족탕', '대절탕')
    .replaceAll('객실탕', '객실 내 프라이빗탕')
    .replaceAll('공용탕', '공용 온천')
    .replaceAll('공식 설명과 후기를 함께 검토', '공식 설명과 이용 조건을 함께 검토')
    .replaceAll('직수 온천 언급', '직수 온천 예약 전 확인')
    .replaceAll('체감 후기가 강하고', '온천 이용 만족도가 높고')
    .replaceAll('객실 노천탕 후기 비중이 매우 높아', '객실 노천탕 이용 경험이 뚜렷해')
    .replaceAll('공식 정보와 후기 모두에서 대욕장 언급이 많습니다.', '대욕장 이용 정보가 확인됩니다.')
    .replaceAll('넓은 대절탕이 확인되지만 선착순 대기 후기가 반복됩니다.', '넓은 대절탕이 확인되며, 선착순 이용이라 대기가 생길 수 있습니다.')
    .replaceAll('객실 노천탕 긍정 신호가 전체 후기에서 매우 강하게 잡힙니다.', '객실 노천탕 이용 만족도가 뚜렷합니다.')
    .replaceAll('직수 온천 관련 긍정 후기가 반복됩니다.', '직수 온천으로 이용하는 구조가 확인됩니다.')
    .replaceAll('흡연 객실 관련 확인 신호가 있어', '흡연 객실 관련 조건이 있어')
    .replaceAll('최근 후기를 같이 보는', '최근 이용 조건을 함께 보는')
    .replaceAll('겨울 여행이면 노천탕 온도 후기를 더 확인하세요.', '겨울 여행이면 노천탕 온도를 더 확인하세요.')
    .replaceAll('냉감 확인을 권장합니다', '냉감을 함께 확인하는 편이 좋습니다')
    .replaceAll('객실 노천탕 경험에 대한 직접 후기가 강합니다.', '객실 노천탕 이용 만족도가 뚜렷합니다.')
    .replaceAll('객실 온천에 대한 긍정 신호가 있으나 표본은 작습니다.', '객실 온천 이용 만족도는 보이지만, 아직 확인 정보는 적습니다.')
    .replaceAll('확인 신호', '확인할 조건')
    .replaceAll('긍정 신호', '만족도')
    .replaceAll('보조 신호', '보조 정보')
    .replaceAll('신호가', '정보가')
    .replaceAll('후기가 반복됩니다', '이용 팁으로 확인됩니다')
    .replaceAll('후기와', '이용 경험과')
    .replaceAll('후기', '이용 경험')
    .replaceAll('반복 언급', '반복 확인')
    .replaceAll('반복됩니다', '확인됩니다')
    .replaceAll('언급을 함께 확인했습니다', '내용을 함께 확인했습니다')
    .replaceAll('언급이 확인됩니다', '내용이 확인됩니다')
    .replaceAll('언급 있음', '예약 전 확인');
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
