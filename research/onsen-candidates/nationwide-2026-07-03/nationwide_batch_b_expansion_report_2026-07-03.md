# 일본 전국 후보군 확장 v0.3: 숙소 배치 B와 동일본 시설 보강

작성일: 2026-07-03

## 요약

v0.2에서 `하코네·구사쓰·아타미·게로·아리마`를 확장한 데 이어, 이번에는 `노보리베쓰`, `조잔케이`, `유노카와/하코다테`, `나스`, `기누가와`, `이토/이즈고원`을 숙소 배치 B로 추가했다. 시설은 북해도와 동일본의 당일치기 온천·공중탕·족탕·조망형 노천탕을 보강했다.

## 생성 파일

| 파일 | 내용 | 행 수 |
|---|---|---:|
| `nationwide_accommodation_batch_b_v0_3_2026-07-03.csv` | 노보리베쓰·조잔케이·유노카와·나스·기누가와·이토/이즈 숙소 후보 | 69 |
| `nationwide_east_facility_seed_v0_3_2026-07-03.csv` | 북해도·동일본 온천시설 후보 | 31 |

## 숙소 배치 B 기준

- 한국인 여행 수요가 큰 홋카이도 온천지와, 수도권 접근성이 강한 나스·기누가와·이토/이즈를 우선했다.
- 객실 노천탕, 전실 온천, 대욕장, 유황천/백탁천, 바다·계곡·산 조망, 대형 리뷰풀 가능성을 기준으로 남겼다.
- 대형 호텔형은 고급 료칸보다 온천 설비의 세부 구분이 흐릴 수 있으므로 `needs_bath_detail_crosscheck`를 많이 붙였다.
- 일부 후보는 공식명/운영브랜드가 혼재되어 `needs_identity_crosscheck`로 남겼다.

## 지역별 숙소 후보 수

| area | 후보 수 | 성격 |
|---|---:|---|
| 노보리베쓰 | 10 | 유황천·다泉질·대형 호텔온천·고급 료칸 |
| 조잔케이 | 10 | 삿포로 접근형 온천호텔·스파리조트·고급숙 |
| 유노카와/하코다테 | 10 | 공항/시내 접근성, 바다 전망 객실 노천탕 |
| 나스 | 11 | 리조트형·백탁 유황천·전실 노천탕 숙소 |
| 기누가와 | 12 | 계곡 조망, 대형 온천호텔, 객실 노천탕 |
| 이토/이즈고원 | 16 | 바다 전망 객실탕, 전실 노천離れ, 고급·대형 리뷰풀 혼재 |

## 시설 보강 기준

시설은 숙소와 다르게 `그날 이용할 수 있는가`, `대기/접수마감`, `수건/샤워/결제`, `계절성`, `관광객 기대치`가 중요하다. 이번 보강은 다음 유형을 의도적으로 섞었다.

- 노보리베쓰: 夢元さぎり湯, 第一滝本館, 登別グランドホテル 등 일일입욕 가능 시설
- 조잔케이: 豊平峡温泉, 湯の花 定山渓殿, 森の謌 등 대형 노천·스파형
- 유노카와/하코다테: 무료 족탕, 열대식물원 족탕, 谷地頭温泉
- 나스: 鹿の湯와 鹿の湯源泉계 료칸 당일입욕
- 기누가와/닛코: 공공탕·탕치형 시설 seed
- 이토/이즈: 東海館, マリンタウン, 赤沢日帰り温泉館, 해안 노천탕

## 누적 방향

이번 v0.3까지는 “전국 후보를 수집하기 위한 확장판”이다. 아직 후보별 리뷰 수와 공식 설비를 전부 검증한 것은 아니지만, 일본 전국으로 넓히기 위한 지역 축과 숙소/시설 분리 축은 작동한다.

현재 파일 기준 누적 규모는 다음과 같다.

| category | raw rows | unique slugs |
|---|---:|---:|
| 온천 숙소 | 204 | 184 |
| 온천시설 | 106 | 94 |

다음 단계에서는 두 가지 중 하나를 선택하면 된다.

1. `숙소 배치 C`: 도고, 시라하마, 유가와라, 가와구치코, 아키우, 이카호, 도바, 이사와 등으로 확장
2. `통합 후보판 v0.4`: 현재 seed/batch 파일들을 병합해 중복 제거하고, 숙소/시설 각각 고유 후보 수를 산정

## 주요 참고 출처

- Ikkyu 노보리베쓰 객실 노천탕: https://www.ikyu.com/onsen/010050/t503/
- Jalan 노보리베쓰 객실 노천탕: https://www.jalan.net/onsen/heya_roten/OSN_50006/
- Rakuten 조잔케이 숙소 목록: https://travel.rakuten.co.jp/yado/hokkaido/jozankei.html
- Ikkyu 조잔케이 랭킹: https://www.ikyu.com/onsen/010010/ranking/
- Jalan 유노카와 객실 노천탕: https://www.jalan.net/onsen/heya_roten/OSN_50010/
- Ikkyu 나스 객실 노천탕: https://www.ikyu.com/onsen/090020/acr262144/ranking/
- Jalan 기누가와 객실 노천탕: https://www.jalan.net/onsen/heya_roten/OSN_50086/
- Ikkyu 기누가와 객실 노천탕: https://www.ikyu.com/onsen/090010/t503/
- Rakuten 이토 객실 노천탕: https://travel.rakuten.co.jp/onsen/rotsuki/izu/OK00599.html
- Ikkyu 이즈고원 객실 노천탕: https://www.ikyu.com/hakone/16061402/t503/
- Jalan 이즈고원 객실 노천탕: https://www.jalan.net/onsen/heya_roten/OSN_50268/
- 노보리베쓰 관광협회 일일입욕: https://noboribetsu-spa.jp/oneday/
- 夢元さぎり湯 공식: https://sagiriyu-noboribetsu.com/access/
- 조잔케이 관광협회 일일입욕: https://jozankei.jp/oneday/
- 유노카와 족탕 공식: https://hakodate-yunokawa.jp/spots/spots_01.html
- 하코부라 온천 목록: https://www.hakobura.jp/charm-tags/41
- 鹿の湯 공식: https://www.shikanoyu.jp/
- 나스 관광협회 일일입욕: https://www.nasukogen.org/spotsearch/spot.php?cate=G

## 한계

- 이번 파일은 공식 설비 검증 전 후보 확장판이다.
- 공식명·브랜드명·계열명 혼재 후보가 일부 있어 신원 정규화가 필요하다.
- 리뷰 수/평점은 아직 붙이지 않았다.
- 시설 후보의 경우 호텔 당일입욕은 운영일·접수마감이 변동될 수 있어 실제 서비스 반영 전 최신 확인이 필요하다.
