# 온천 카드 요약 작성 가이드

## 목적

카드 요약은 판정 라벨을 나열하는 문장이 아니라, 이 숙소나 시설을 기억하게 만드는 구체적인 온천 특징을 소개하는 문장입니다.

## 기본 구조

1. 첫 문장은 공식 정보에서 확인한 장소별 특징을 씁니다.
2. 둘째 문장은 직접 읽은 후기에서 같은 특징에 대한 만족이나 주의가 반복되는지 설명합니다.
3. 공식 사실과 후기 근거는 데이터에서 분리해 저장합니다.

좋은 예:

> 유후다케를 바라보는 넓은 노천탕이 이 숙소의 중심입니다. 탕의 크기와 산 전망을 좋게 본 후기가 여러 플랫폼에서 반복됩니다.

> 전 객실이 독채이고 반노천탕에서 유후인 분지를 바라볼 수 있습니다. 다른 사람과 마주치지 않고 조용히 쉬기 좋았다는 후기가 반복됩니다.

나쁜 예:

> 여러 후기에서 객실 노천탕과 물의 감촉에 대한 만족이 돋보입니다.

> 객실 노천탕 중심 숙소입니다.

## 근거 계약

- `official_basis`: 공식 사이트나 공식 PDF에서 확인한 특징, 출처 URL, 로컬 원장 파일을 저장합니다.
- `review_basis`: 직접 읽은 후기에서 확인한 경향, 직접 읽은 수, 온천 관련 수, 본문 확인 플랫폼 수, 로컬 원장 파일을 저장합니다.
- 검색 스니펫, AI 요약, OTA 요약은 `review_basis.direct_review_count`에 넣지 않습니다.
- 공식 근거가 없는 전망, 객실 구조, 탕 범위는 첫 문장의 사실로 쓰지 않습니다.
- 후기만 있는 특징은 `후기에서는`, `후기가 반복됩니다`처럼 후기 근거임을 문장 안에서 밝힙니다.
- 직수·순수직수·순환식 온천은 온천 용어 가이드의 공식 원문 기준을 통과했을 때만 씁니다.

## 판정 파이프라인 게이트

새 숙소를 공개할 때는 판정 DB 적재 뒤 카드 요약 시드를 반드시 검사하고 적용합니다.

```bash
npm run onsen:card-summary -- --input=<card-summary-seed.json>
npm run onsen:card-summary -- --input=<card-summary-seed.json> --apply
npm run onsen:verdict:check -- --require-card-summary --target-slugs=<slug,...>
```

- 첫 번째 명령은 dry-run이며 문구, 공식 근거, 후기 분모, 출처 파일을 검사합니다.
- 두 번째 명령은 모든 검사를 통과한 뒤에만 `editorialCardSummary`를 DB에 적재합니다.
- 마지막 명령은 대상 숙소에 published 카드 요약이 없으면 실패합니다.
- 세 명령을 통과하기 전에는 새 숙소를 active로 공개하지 않습니다.

시설은 카드 요약을 판정 `briefing.editorial_card_summary`에 함께 저장합니다. `--apply`는 published 시설 판정에 published 카드 요약이 하나라도 빠지면 실패합니다.

```bash
node scripts/build_onsen_facility_verdict_pipeline.mjs \
  --target-slugs=<slug,...> \
  --card-summary-input=<facility-card-summary-seed.json> \
  --require-card-summary

node scripts/build_onsen_facility_verdict_pipeline.mjs \
  --target-slugs=<slug,...> \
  --card-summary-input=<facility-card-summary-seed.json> \
  --apply

npm run onsen:verdict:check -- \
  --target-type=facility \
  --require-card-summary \
  --target-slugs=<slug,...>
```

- 시설 첫 문장은 객실 구조가 아니라 욕조 규모, 노천탕 경관, 목욕 방식, 역사적 공간, 사우나·휴게 구성처럼 당일 방문 이유가 되는 공식 사실을 씁니다.
- 둘째 문장은 직접 읽은 시설 후기에서 같은 체감이 반복되는지 연결합니다.
- 공식 프로필만 풍부하고 후기 근거가 얕다면 카드 요약과 판정은 draft로 남깁니다.

## 문체

- `이용 경험` 대신 `후기`를 씁니다.
- 장소명이나 지역명을 기계적으로 반복하지 않습니다.
- `강점입니다`, `비교 가치가 높습니다` 같은 공통 결론보다 사용자가 장면을 떠올릴 수 있는 특징을 우선합니다.
- 두 문장, 140자 안팎을 기본으로 합니다.
- `畳`, 평, 리처럼 한국 사용자에게 낯선 지역 단위는 ㎡나 km로 환산하고, 원문 단위와 환산 기준은 근거 데이터에 보존합니다.
- 카드 요약은 검수를 마친 결론이므로 `확인됩니다`를 반복하지 않습니다. 공식 사실과 후기 근거가 같은 방향일 때는 `핵심입니다`, `잘 맞습니다`, `두드러집니다`처럼 확정형으로 씁니다.
