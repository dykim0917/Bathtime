// Reviewed examples, not live analysis output. Field provenance is preserved below.
const savedPlaces = [
  {
    id: 'heosimcheong', name: '허심청', subtitle: '부산 · 동래', city: '부산', country: '한국', kind: '온천',
    hook: '다양한 탕을 갖춘 동래의 대형 온천 목욕탕',
    summary: '부산 동래의 온천 목욕탕이에요. 영상에서는 넓은 대욕장과 여러 탕을 차례로 둘러보며 내부의 규모와 분위기를 보여줘요.',
    tags: ['온천', '대욕장', '다양한 탕'], highlights: ['대욕장', '다양한 탕'],
    condition: null, conditionSource: null,
    facts: [
      { label: '시설', value: '대욕장 · 여러 종류의 탕', basis: '영상 소개' },
      { label: '규모', value: '약 1,300평', basis: '영상에서 소개한 규모' },
      { label: '요금·시간', value: '게시물에 안내된 정보가 없어요.', basis: null }
    ],
    search: '허심청 부산 동래 온천 목욕탕 대욕장 따뜻한 뜨끈한 탕 물 목욕 온천장 계곡은개골개골',
    mapQuery: '허심청 부산 동래',
    source: { platform: 'YouTube', creator: '계곡은개골개골', title: '1,300평 초럭셔리 목욕탕, 이런 곳이 진짜 있다고?', url: 'https://www.youtube.com/shorts/ZZdGwLauM00', date: null, checked: '2026-09-22', image: 'https://i.ytimg.com/vi/ZZdGwLauM00/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AG2CIACgA-KAgwIABABGGUgZShlMA8=&rs=AOn4CLDpvQKyXmQd14fcdn8YwIg7Ult1mQ', imageAlt: '허심청을 소개하는 유튜브 영상 표지', imagePosition: 'center' },
    official: null
  },
  {
    id: 'shiagaru-kanda', name: 'SHIAGARU SAUNA', subtitle: '도쿄 · 간다 × 아키하바라', city: '도쿄', country: '일본', kind: '사우나',
    hook: '사우나와 냉탕, 휴식 공간을 잇는 짧은 동선',
    summary: '도쿄 간다·아키하바라에 있는 사우나예요. 게시물에서는 사우나에서 냉탕까지 이어지는 짧은 동선과 등받이가 있는 냉탕을 소개해요.',
    tags: ['냉탕', '짧은 동선', '휴식 공간'], highlights: ['냉탕', '휴식 공간'],
    condition: '남성 전용 · 온탕 없음', conditionSource: '남성 전용: 공식 안내 / 온탕 없음: 게시물',
    facts: [
      { label: '이용 대상', value: '남성 전용', basis: '공식 안내', official: true },
      { label: '온탕', value: '없음', basis: '2026.06.02 게시물 소개' },
      { label: '시설', value: '사우나 2종 · 냉탕 3종 · 실내 휴식 공간', basis: '공식 안내', official: true },
      { label: '입장', value: '예약 우선 · QR 입퇴장', basis: '공식 안내', official: true },
      { label: '결제·비품', value: '현금 결제 불가 · 수건과 어메니티 비치', basis: '공식 안내', official: true },
      { label: '주소', value: '東京都千代田区岩本町３丁目４−１', basis: '공식 안내', official: true },
      { label: '요금·시간', value: '요일·이용 시간에 따라 달라요.', basis: '공식 안내에서 확인', official: true }
    ],
    search: 'SHIAGARU 시아가루 시아가루사우나 도쿄 일본 간다 칸다 아키하바라 냉탕 사우나 짧은 동선 남성 남자 전용 예약 QR 현금불가 휴식 먼데이사우나 mondaysauna zongmuk',
    mapQuery: 'SHIAGARU SAUNA 神田 秋葉原 東京都千代田区岩本町3丁目4-1',
    source: { platform: 'Instagram', creator: '@mondaysauna', title: '냉탕까지 3걸음? 도쿄 사우나의 동선', url: 'https://www.instagram.com/p/DZG2aGRD1na/', date: '2026.06.02', checked: '2026-09-22', image: 'assets/shiagaru.jpg', imageAlt: '먼데이사우나가 게시한 SHIAGARU SAUNA 소개 이미지', imagePosition: 'center 54%', credit: '먼데이사우나 · @zongmuk의 기록 / 게시물 내 시설 자료 출처 @shiagarusauna.kanda' },
    official: { label: 'SHIAGARU SAUNA 간다×아키하바라점', url: 'https://shiagaru-sauna.com/tokyo-kanda-akihabara', checked: '2026.09.22' }
  },
  {
    id: 'cheongdam-bulhanjeungmak', name: '청담 불한증막', subtitle: '서울 · 강남', city: '서울', country: '한국', kind: '사우나',
    hook: '세신과 식사까지 함께할 수 있는 청담의 사우나',
    summary: '청담에 있는 여성 사우나를 다녀온 기록이에요. 고독한사우너가 세신·마사지와 식당·카페를 소개하고, 오디즙을 추천해요.',
    tags: ['한증막', '세신', '식당·카페'], highlights: ['세신', '식당·카페'],
    condition: '여성 사우나', conditionSource: '게시물 소개 기준',
    facts: [
      { label: '이용 대상', value: '여성 사우나', basis: '게시물 소개' },
      { label: '시설·서비스', value: '세신 · 마사지 · 네일아트 · 식당 · 카페', basis: '게시물 소개 · 서비스별 요금은 별도 확인 필요' },
      { label: '주소', value: '서울 강남구 학동로 419', basis: '게시물 안내' },
      { label: '입장료', value: '성인 22,000원', basis: '2026.04.25 게시 당시 요금 · 현재 요금은 방문 전 확인' },
      { label: '운영시간', value: '08:00–22:00', basis: '2026.04.25 게시 당시 운영시간 · 방문 전 확인' }
    ],
    search: '청담 불한증막 서울 강남 학동 여성 여자 전용 사우나 한증막 찜질 세신 식당 카페 오디즙 마사지 네일아트 고독한사우너 godoghan_sauner',
    mapQuery: '청담 불한증막 서울 강남구 학동로 419',
    source: { platform: 'Instagram', creator: '@godoghan_sauner', title: '청담 한복판에 숨겨진 사우나에 다녀온 기록', url: 'https://www.instagram.com/p/DXk6crGE-Y8/', date: '2026.04.25', checked: '2026-09-22', image: 'assets/cheongdam.jpg', imageAlt: '고독한사우너가 소개한 청담 불한증막 입구', imagePosition: 'center 38%' },
    official: null
  }
];
