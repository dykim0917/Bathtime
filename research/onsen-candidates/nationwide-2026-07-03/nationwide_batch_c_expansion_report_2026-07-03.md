# 일본 전국 후보군 확장 v0.4: 숙소 배치 C와 서일본·중부 시설 보강

작성일: 2026-07-03

## 요약

v0.4에서는 `도고`, `시라하마`, `유가와라`, `가와구치코`, `아키우`, `이카호`, `도바`, `이사와`를 숙소 배치 C로 추가했다. 시설은 같은 지역의 역사형 공중탕, 조망형 노천탕, 족탕, 대형 스파형 시설을 보강했다.

## 생성 파일

| 파일 | 내용 | 행 수 |
|---|---|---:|
| `nationwide_accommodation_batch_c_v0_4_2026-07-03.csv` | 도고·시라하마·유가와라·가와구치코·아키우·이카호·도바·이사와 숙소 후보 | 74 |
| `nationwide_west_facility_seed_v0_4_2026-07-03.csv` | 서일본·중부 온천시설 후보 | 34 |
| `nationwide_accommodation_master_v0_4_2026-07-03.csv` | v0.1-v0.4 숙소 후보 통합·중복 제거판 | 248 |
| `nationwide_facility_master_v0_4_2026-07-03.csv` | v0.1-v0.4 시설 후보 통합·중복 제거판 | 122 |

## 숙소 배치 C 기준

- 도고와 시라하마는 역사형 공중탕/외탕과 숙소를 함께 봐야 하는 지역이다.
- 유가와라와 가와구치코는 수도권 접근성과 객실 노천탕 고급숙 수요가 강하다.
- 아키우·이카호·이사와는 Rakuten/Jalan/Ikyu에서 객실 노천탕 및 대형 료칸 리뷰풀 신호가 보인다.
- 도바는 바다 전망 온천숙소와 이세시마 리조트형 후보로 보강했다.

## 시설 보강 기준

이번 시설 후보는 숙소형 데이터와 확실히 다른 사용자 질문을 가진 곳들이다.

- 도고: 본관, 飛鳥乃湯泉, 椿の湯처럼 요금/예약/이용 구역이 복잡한 역사형 외탕
- 시라하마: 崎の湯처럼 샴푸·비누 사용 불가, 계절별 영업시간, 조망이 핵심인 노천
- 유가와라: 惣湯처럼 사전예약제와 휴업 공지가 중요한 리트리트형 시설
- 가와구치코: 富士眺望の湯ゆらり처럼 후지산 조망과 16종 욕조/식음/휴게가 결합된 복합시설
- 이카호·이사와: 공중탕, 족탕, 건강랜드형 시설을 섞어 관광동선과 로컬 이용을 모두 포착

## 다음 단계

1. `needs_identity_crosscheck`, `needs_area_crosscheck` 후보를 정리한다.
2. 후보별 리뷰풀 매핑 컬럼을 추가한다: Google, Rakuten, Jalan, Ikkyu, Naver.
3. 전국 500-1,000개 목표에 맞춰 숙소 배치 D를 추가한다: 흑川, 이부스키, 운젠, 뉴토, 이즈나가오카, 아와라, 기노사키 등.
4. 시설은 Nifty TOP100 잔여분과 관광형 공중탕을 추가해 200개 이상으로 확장한다.

## 주요 참고 출처

- Ikkyu 도고 객실 노천탕: https://www.ikyu.com/onsen/380010/t503/
- Rakuten 도고 객실 노천탕: https://travel.rakuten.co.jp/share/batch/rrg_pg/pgenerator/hotel/id7/9227/index.html
- Ikkyu 시라하마 객실 노천탕: https://www.ikyu.com/onsen/300020/t503/
- Jalan 시라하마 객실 노천탕: https://www.jalan.net/onsen/heya_roten/OSN_50366/
- Ikkyu 유가와라 객실 노천탕: https://www.ikyu.com/onsen/140050/t503/
- Rakuten 유가와라 객실 노천탕: https://travel.rakuten.co.jp/onsen/rotsuki/hakone/OK00310.html
- Rakuten 가와구치코 객실 노천탕: https://travel.rakuten.co.jp/onsen/rotsuki/yamanashi/OK00441.html
- Ikkyu 야마나시 객실 노천탕: https://www.ikyu.com/koshinetsu/210501/t503/ranking/
- Ikkyu 아키우 객실 노천탕: https://www.ikyu.com/tohoku/12023002/t503/
- Ikkyu 이카호 객실 노천탕: https://www.ikyu.com/onsen/100010/t503/
- Rakuten 이사와 객실 노천탕: https://travel.rakuten.co.jp/onsen/rotsuki/yamanashi/OK00447.html
- Jalan 이사와 객실 노천탕: https://www.jalan.net/onsen/heya_roten/OSN_50154/
- 도고온천 공식 외탕: https://dogo.jp/
- 시라하마 崎の湯 공식: https://www.town.shirahama.wakayama.jp/soshiki/kanko/koen/shisetsu/pubric_spa/1450338115191.html
- 남기시라하마 관광협회 온천: https://www.nankishirahama.jp/onsen/
- 유가와라惣湯: https://www.yugawara.or.jp/sightseeing/722/
- 富士眺望の湯ゆらり: https://www.fuji-yurari.jp/

## 한계

- 공식 설비와 리뷰풀 수는 아직 후보 단계의 신호다.
- `needs_identity_crosscheck`, `needs_area_crosscheck` 후보는 딥리서치 전 병합/정규화가 필요하다.
- 시설 후보 중 일부는 운영상태가 바뀔 수 있어 최신 확인이 필요하다.
