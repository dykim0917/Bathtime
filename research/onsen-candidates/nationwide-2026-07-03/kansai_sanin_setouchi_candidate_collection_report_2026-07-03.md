# 간사이·산인·세토우치 온천 후보 검증/정규화 리포트 (2026-07-03)

## 작업 범위

- 담당 지역: 兵庫県, 和歌山県, 三重県, 京都府, 大阪府, 鳥取県, 島根県, 岡山県, 山口県, 愛媛県
- 입력 숙소 파일: `nationwide_accommodation_master_v0_6_2026-07-03.csv`
- 입력 시설 파일: `nationwide_facility_master_v0_6_2026-07-03.csv`
- 출력 숙소 CSV: `kansai_sanin_setouchi_accommodation_candidate_shortlist_2026-07-03.csv`
- 출력 시설 CSV: `kansai_sanin_setouchi_facility_candidate_shortlist_2026-07-03.csv`
- 작업 모드: 후보 검증/정규화. 딥리뷰 신호 수집 아님.
- 처리 원칙: 숙소와 온천시설을 별도 CSV로 분리하고, 지정 도부현 밖 후보는 확장하지 않음.

## 수집 브리핑

- 지정 범위 전체 후보: 숙소 74개, 온천시설 41개
- 이번 처리 후보: Tier 1 숙소 50개, Tier 1 온천시설 27개, 합계 77개
- 기존 Tier 1 검증 결과와 매칭된 후보: 77개
- 이번 단계의 직접 확인 리뷰 수: 0건
- 이번 단계의 온천 관련 직접 리뷰 수: 0건
- 플랫폼상 리뷰풀: 기존 검증 파일의 `visible_review_pool_observation`만 별도 필드에 보존. 직접 확인 리뷰 수로 계산하지 않음.
- 접근 실패 플랫폼: 이번 정규화 단계에서는 신규 브라우저/로그인 샘플링을 수행하지 않아 차단 판정을 새로 내리지 않음.

## 지역 특성

- 兵庫県은 아리마의 금천/은천 숙소와 기노사키 외탕 순례가 함께 있어, 숙소 내부 욕장과 외탕 접근성을 분리해야 한다.
- 和歌山県은 난키시라하마의 바다 전망 객실 노천탕, 대형 리조트 대욕장, 당일온천/족탕 동선이 섞인다.
- 三重県은 도바·유노야마 계열의 호텔 대욕장, 객실탕, 당일이용 상품이 혼재한다.
- 鳥取県·島根県은 미사사 라듐/라돈, 가이케 해안 온천, 다마쓰쿠리 미인탕처럼 수질 기대 신호가 강하다.
- 岡山県·山口県·愛媛県은 강변 노천, 도심형 온천, 역사형 공중탕/료칸을 별도 축으로 봐야 한다.

## 상태 기준

- `ready`: 공식/검증 표면이 후보 단계에서 확인되어 다음 딥리서치로 넘길 수 있음.
- `hold`: 공식 세부, 욕장 단위, 리뷰풀 수가 부족해 보류.
- `split_needed`: 객실탕/공용탕/당일입욕/외탕/상품 단위가 섞여 있어 행 또는 태깅 축 분리 필요.
- `route_or_pass`: 정체성 충돌, 폐업/전환 가능성, 숙소 row와 시설 row 재라우팅이 필요한 후보.
- `footbath_only`: 전신 입욕 시설이 아닌 족탕/스톱오버 후보. 공중탕에 족탕이 병설된 경우에는 적용하지 않음.
- `operation_recheck`: 요금, 운영시간, 당일입욕, 휴업/재개처럼 변동성이 큰 정보 재확인 필요.
- `merge`: 이번 Tier 1 범위에서는 확정 적용 후보 없음.

## 숙소 상태 요약

- 상태 분포: {'hold': 16, 'split_needed': 16, 'ready': 34, 'operation_recheck': 1, 'route_or_pass': 1}
- 도부현 분포: {'兵庫県': 18, '和歌山県': 7, '三重県': 4, '鳥取県': 7, '島根県': 4, '岡山県': 1, '山口県': 2, '愛媛県': 7}

### 숙소 兵庫県
- `hold` 月光園 鴻朧館 (arima-gekkoen-korokan) - room_bath;open_air_public_bath
- `hold;split_needed` 有馬山叢 御所別墅 (arima-goshobessho) - private_bath_or_family_bath_unclear;facility_wide_sotoyu_access
- `hold` 陶泉 御所坊 (arima-goshoboh) - public_bath
- `hold` 有馬グランドホテル (arima-grand-hotel) - room_open_air_bath;public_bath
- `ready` 有馬温泉 御幸荘 花結び (arima-hanamusubi) - room_open_air_bath;private_bath_or_family_bath_unclear
- `hold` 有馬温泉 四季の彩 旅篭 (arima-hatago) - room_bath;open_air_public_bath
- `hold` 兵衛向陽閣 (arima-hyoe-koyokaku) - public_bath;open_air_public_bath
- `hold` 有馬温泉 欽山 (arima-kinzan) - public_bath;open_air_public_bath
- `hold;operation_recheck` 有馬温泉 元湯 古泉閣 (arima-kosenkaku) - unclear
- `ready` 有馬温泉 竹取亭円山 (arima-maruyama) - room_bath;private_bath_or_family_bath_unclear
- `ready` 中の坊瑞苑 (arima-nakanobo) - room_bath;public_bath;open_air_public_bath
- `hold;split_needed` 天地の宿 奥の細道 (arima-okuno-hosomichi) - room_open_air_bath
- `hold` SPA TERRACE紫翠 (arima-shisui) - room_open_air_bath
- `hold` 川口屋城崎リバーサイドホテル (kinosaki-kawaguchiya-riverside) - room_open_air_bath;public_bath;private_bath_or_family_bath_unclear;facility_wide_sotoyu_access
- `hold;split_needed` 城崎温泉 三木屋 (kinosaki-mikiya) - room_bath;facility_wide_sotoyu_access
- `hold` 西村屋本館 (kinosaki-nishimuraya-honkan) - room_open_air_bath;public_bath;facility_wide_sotoyu_access
- `ready` 西村屋ホテル招月庭 (kinosaki-nishimuraya-shogetsutei) - room_open_air_bath;public_bath;private_bath_or_family_bath_unclear
- `hold;split_needed` きのさきの宿 緑風閣 (kinosaki-ryokufukaku) - room_open_air_bath;facility_wide_sotoyu_access

### 숙소 和歌山県
- `ready` 南紀白浜 和みの湯 花鳥風月 (shirahama-kachofugetsu) - room_open_air_bath;public_bath;private_bath_or_family_bath_unclear
- `ready` 白浜温泉 浜千鳥の湯 海舟 (shirahama-kaishu) - room_open_air_bath;room_bath;public_bath;private_bath_or_family_bath_unclear
- `ready;split_needed` ホテル川久 (shirahama-kawakyu) - room_open_air_bath
- `ready;split_needed` SHIRAHAMA KEY TERRACE HOTEL SEAMORE (shirahama-key-terrace) - public_bath;open_air_public_bath
- `ready` 白浜温泉 ホテル三楽荘 (shirahama-sanrakuso) - room_open_air_bath;public_bath
- `ready` 海絶景とギネス認定の宿 全室露天風呂付離れ XYZスペチアーレ (shirahama-xyz-speciale) - room_open_air_bath;room_bath
- `ready;split_needed` 白浜温泉 家族とすごす白浜の宿 柳屋 (shirahama-yanagiya) - room_open_air_bath;public_bath;private_bath_or_family_bath_unclear

### 숙소 三重県
- `ready` 季さら (toba-kisara) - room_open_air_bath;room_bath;public_bath;private_bath_or_family_bath_unclear
- `ready` 季さら別邸 刻 (toba-kisara-bettei-toki) - room_open_air_bath;room_bath
- `ready` 鳥羽国際ホテル 潮路亭 (toba-toba-kokusai) - public_bath;open_air_public_bath
- `ready;split_needed` 戸田家 (toba-todaya) - public_bath;private_bath_or_family_bath_unclear

### 숙소 鳥取県
- `ready;split_needed` 皆生温泉 華水亭 (kaike-kasuitei) - room_open_air_bath;room_bath;public_bath;private_bath_or_family_bath_unclear
- `ready;split_needed` 皆生温泉 やど紫苑亭 (kaike-shiontei) - room_open_air_bath;room_bath;private_bath_or_family_bath_unclear
- `ready;split_needed` 皆生游月 (kaike-yugetsu) - room_open_air_bath;public_bath
- `hold;route_or_pass` 皆生温泉 海色・湯の宿 松月 (kaike-yurari) - room_open_air_bath;room_bath;public_bath;private_bath_or_family_bath_unclear
- `ready` 三朝温泉 依山楼岩崎 (misasa-izanro-iwasaki) - public_bath;open_air_public_bath
- `ready` 三朝温泉 万翆楼 (misasa-mansuirou) - room_open_air_bath;public_bath
- `hold` 三朝温泉 斉木別館 (misasa-saiki-bekkan) - room_open_air_bath;room_bath;public_bath

### 숙소 島根県
- `ready` 玉造温泉 湯之助の宿 長楽園 (tamatsukuri-chorakuen) - room_open_air_bath
- `ready` 玉造温泉 佳翠苑皆美 (tamatsukuri-kasuien-minami) - public_bath;open_air_public_bath
- `ready` 玉造温泉 曲水の庭 ホテル玉泉 (tamatsukuri-konya) - public_bath;open_air_public_bath
- `ready` 玉造グランドホテル長生閣 (tamatsukuri-yunosuke) - public_bath

### 숙소 岡山県
- `ready` 湯原温泉 八景 (yubara-aburaya) - open_air_public_bath;private_bath_or_family_bath_unclear

### 숙소 山口県
- `ready;split_needed` 湯田温泉 ユウベルホテル松政 (yuda-kamefuku) - public_bath;open_air_public_bath;private_bath_or_family_bath_unclear
- `ready;split_needed` 湯田温泉 松田屋ホテル (yuda-matsudaya) - room_bath;public_bath;open_air_public_bath;private_bath_or_family_bath_unclear

### 숙소 愛媛県
- `ready;split_needed` 道後舘 (dogo-dogokan) - room_open_air_bath;room_bath;public_bath
- `ready;split_needed` 道後温泉 ふなや (dogo-funaya) - room_open_air_bath;public_bath
- `ready` 道後温泉 琴の庭 (dogo-kotononiwa) - room_open_air_bath;public_bath
- `ready;split_needed` ホテル古湧園 遥 (dogo-kowakuen-haruka) - room_bath;public_bath
- `ready` 道後御湯 (dogo-miyu) - room_open_air_bath
- `ready` 別邸 朧月夜 (dogo-oborozukiyo) - room_open_air_bath
- `ready` 道後温泉 八千代 (dogo-yachiyo) - room_open_air_bath;room_bath

## 온천시설 상태 요약

- 상태 분포: {'ready': 12, 'hold': 10, 'operation_recheck': 2, 'route_or_pass': 3, 'split_needed': 1, 'footbath_only': 2}
- 도부현 분포: {'兵庫県': 10, '和歌山県': 2, '三重県': 3, '鳥取県': 4, '島根県': 2, '岡山県': 2, '山口県': 2, '愛媛県': 2}

### 시설 兵庫県
- `ready` 有馬本温泉 金の湯 (arima-kin-no-yu) - footbath;public_bath
- `ready` 有馬街道温泉すずらんの湯 (arima-suzurannoyu) - open_air_public_bath;public_bath
- `ready` 有馬温泉 太閤の湯 (arima-taikounoyu) - public_bath
- `hold` 城崎温泉 御所の湯 (kinosaki-goshono-yu) - open_air_public_bath
- `hold` 城崎温泉 一の湯 (kinosaki-ichino-yu) - public_bath;family_bath_or_private_bath_unclear
- `hold` 城崎温泉 地蔵湯 (kinosaki-jizou-yu) - public_bath;family_bath_or_private_bath_unclear
- `hold` 城崎温泉 鴻の湯 (kinosaki-kouno-yu) - open_air_public_bath
- `hold` 城崎温泉 まんだら湯 (kinosaki-mandara-yu) - public_bath
- `hold` 城崎温泉 さとの湯 (kinosaki-satono-yu) - public_bath
- `hold` 城崎温泉 柳湯 (kinosaki-yanagi-yu) - public_bath

### 시설 和歌山県
- `ready` 崎の湯 (shirahama-sakinoyu) - open_air_public_bath;public_bath
- `ready` とれとれの湯 (shirahama-toretore) - open_air_public_bath;public_bath

### 시설 三重県
- `ready` アクアイグニス片岡温泉 (toba-aquaignis-kataoka) - public_bath
- `hold;operation_recheck` 鳥羽シーサイドホテル 日帰り温泉 (toba-toba-seaside-hotel-dayuse) - public_bath
- `route_or_pass;operation_recheck` 戸田家 日帰り温泉 (toba-todaya-dayuse) - family_bath_or_private_bath_unclear;public_bath

### 시설 鳥取県
- `ready` 皆生温泉 おーゆ・ランド (kaike-ou-land) - footbath;open_air_public_bath;family_bath_or_private_bath_unclear;public_bath
- `hold` 三朝温泉 株湯 (misasa-kabuyu) - footbath;public_bath
- `ready` 三朝温泉 河原風呂 (misasa-kawara-buro) - open_air_public_bath
- `split_needed;route_or_pass` 三朝温泉 ラドン熱気浴 (misasa-radium-nettaiki) - public_bath;facility_wide_special_experience

### 시설 島根県
- `footbath_only` 玉造温泉 姫神広場 足湯 (tamatsukuri-himegami-hiroba) - footbath
- `hold` 玉造温泉 ゆーゆ (tamatsukuri-yu-yu) - open_air_public_bath;public_bath

### 시설 岡山県
- `ready` 湯原温泉 砂湯 (yubara-sunayu) - open_air_public_bath
- `ready` 湯原温泉 湯本温泉館 (yubara-yumoto-onsenkan) - family_bath_or_private_bath_unclear;public_bath

### 시설 山口県
- `route_or_pass` 湯田温泉 亀乃湯 (yuda-kame-no-yu) - public_bath
- `footbath_only` 湯田温泉 狐の足あと (yuda-kitsune-no-ashiato) - footbath

### 시설 愛媛県
- `ready` 道後温泉別館 飛鳥乃湯泉 (dogo-asukanoyu) - open_air_public_bath;public_bath
- `ready` 道後温泉本館 (dogo-honkan) - public_bath

## 제외/분리 기준

- 기노사키 숙소는 숙소 내부 욕장과 칠외탕 접근성을 합산하지 않는다. 딥리서치에서는 `facility_wide_sotoyu_access`와 숙소 내 `public_bath`를 분리한다.
- 호텔 당일입욕은 숙소 row와 병합하지 않고 시설 row로 유지한다. 다만 운영시간·접수마감 변동성이 큰 후보는 `operation_recheck`를 먼저 수행한다.
- 족탕은 시설 후보가 족탕 중심일 때만 `footbath_only`로 보존한다. 공중탕 병설 족탕은 욕장 축으로만 남긴다.
- 라돈 열기욕, 외탕 순례, 도심형 족욕 카페처럼 온천지 체험 상품에 가까운 항목은 숙소/시설 비교와 별도 축으로 라우팅한다.

## 다음 딥리서치 우선순위

### 숙소
1. 白浜温泉 浜千鳥の湯 海舟 (shirahama-kaishu): room_open_air_bath;room_bath;public_bath;private_bath_or_family_bath_unclear
2. 季さら (toba-kisara): room_open_air_bath;room_bath;public_bath;private_bath_or_family_bath_unclear
3. 皆生温泉 華水亭 (kaike-kasuitei): room_open_air_bath;room_bath;public_bath;private_bath_or_family_bath_unclear
4. 道後舘 (dogo-dogokan): room_open_air_bath;room_bath;public_bath
5. 中の坊瑞苑 (arima-nakanobo): room_bath;public_bath;open_air_public_bath
6. 海絶景とギネス認定の宿 全室露天風呂付離れ XYZスペチアーレ (shirahama-xyz-speciale): room_open_air_bath;room_bath
7. 季さら別邸 刻 (toba-kisara-bettei-toki): room_open_air_bath;room_bath
8. 道後温泉 八千代 (dogo-yachiyo): room_open_air_bath;room_bath
9. 西村屋ホテル招月庭 (kinosaki-nishimuraya-shogetsutei): room_open_air_bath;public_bath;private_bath_or_family_bath_unclear
10. 南紀白浜 和みの湯 花鳥風月 (shirahama-kachofugetsu): room_open_air_bath;public_bath;private_bath_or_family_bath_unclear
11. 白浜温泉 ホテル三楽荘 (shirahama-sanrakuso): room_open_air_bath;public_bath
12. 皆生温泉 やど紫苑亭 (kaike-shiontei): room_open_air_bath;room_bath;private_bath_or_family_bath_unclear

### 온천시설
1. 有馬街道温泉すずらんの湯 (arima-suzurannoyu): open_air_public_bath;public_bath
2. 崎の湯 (shirahama-sakinoyu): open_air_public_bath;public_bath
3. とれとれの湯 (shirahama-toretore): open_air_public_bath;public_bath
4. 皆生温泉 おーゆ・ランド (kaike-ou-land): footbath;open_air_public_bath;family_bath_or_private_bath_unclear;public_bath
5. 三朝温泉 河原風呂 (misasa-kawara-buro): open_air_public_bath
6. 湯原温泉 砂湯 (yubara-sunayu): open_air_public_bath
7. 道後温泉別館 飛鳥乃湯泉 (dogo-asukanoyu): open_air_public_bath;public_bath
8. 有馬本温泉 金の湯 (arima-kin-no-yu): footbath;public_bath

## 다음 에이전트 액션

1. 숙소 CSV에서 `candidate_status`에 `ready`가 포함된 Tier 1 후보를 먼저 선택한다.
2. 각 후보별 Google Maps/Hotels, Rakuten, Jalan, Ikkyu, Yahoo Travel, Booking/Agoda/Trip.com, Naver Blog/Cafe를 플랫폼별로 매핑한다.
3. 플랫폼상 `visible_review_count`와 실제 `direct_reviews_checked`를 절대 합치지 않는다.
4. 객실 내탕, 객실 노천탕, 대욕장, 공용 노천탕, 대절탕/가족탕, 외탕 접근성을 리뷰 본문 태깅에서 분리한다.
5. `operation_recheck`, `route_or_pass`, `footbath_only` 후보는 딥리뷰보다 공식 운영/정체성 재확인을 먼저 수행한다.
