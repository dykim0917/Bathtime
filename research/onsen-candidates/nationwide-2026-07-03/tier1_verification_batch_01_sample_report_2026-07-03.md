# Tier 1 Verification Batch 01 Sample Report

Date: 2026-07-03

## Scope

This is a verification-method sample, not a completed T1-01 batch.

Checked rows:

- Accommodation: first 9 rows from `tier1_accommodation_verification_queue_v0_1_2026-07-03.csv`
- Facility: first 10 rows from `tier1_facility_verification_queue_v0_1_2026-07-03.csv`

Output:

- `tier1_verification_batch_01_sample_v0_1_2026-07-03.csv`

## Why This Step Matters

The v0.6 master is a national candidate seed list. It should not be treated as a verified service database until each Tier 1 row has:

- official URL
- map/listing URL
- at least one review/OTA surface
- official bath or product facts
- current-operation status
- review-pool count fields

This sample confirms that the verification pass catches high-value corrections, not just URL filling.

## Results

| kind | checked_rows | confirmed | hold/current-operation issue | needs review-count lock |
|---|---:|---:|---:|---:|
| accommodation | 9 | 8 | 1 | 9 |
| facility | 10 | 10 | 0 | 10 |

## Important Finding

`有馬温泉 元湯 古泉閣` should not move directly into deep review research.

Observed signals:

- Candidate official domain `https://www.kosenkaku.com/` currently shows an empty server/default page.
- Instagram and Facebook surfaces indicate closure/operation-ended status.
- Historic review surfaces still exist, but these should not be used as a current service signal without operation verification.

Action:

- Set this row to `hold_needs_current_operation_verification`.
- If confirmed closed, remove from active Tier 1 accommodation master or move to an archive/closed-property table.

## Accommodation Verification Notes

Rows with useful bath/product confirmation:

- `arima-hanamusubi`: official site and Jalan/Rakuten surfaces confirm a stable accommodation identity. Jalan surface shows `金泉・銀泉`, `露天風呂付き客室`, and `貸切風呂` signals.
- `arima-maruyama`: official/Jalan/Rakuten surfaces confirm 8 private rental baths and `金泉/銀泉` signals. Must separate `貸切風呂` from guest-room bath.
- `arima-nakanobo`: official site explicitly says no day-use bath operation and distinguishes `金泉/銀泉` source labels. Keep as accommodation, not facility.
- `arima-okuno-hosomichi`: official site confirms room open-air bath context, but external surfaces suggest room-by-room bath-source differences. Needs room-type bath-detail check.
- `arima-shisui`: official site confirms `金泉/銀泉`, women-only aroma mist sauna, age/access restrictions. Good candidate for expectation-gap tagging later.

## Facility Verification Notes

Rows with useful product confirmation:

- `arima-kin-no-yu`: official/municipal-tourism surfaces confirm `金泉` public bath and footbath. Nifty surface exists for review collection.
- `arima-suzurannoyu`: official/Nifty surfaces confirm large day-use onsen identity.
- `arima-taikounoyu`: official/Nifty/tourism surfaces confirm complex facility structure: `金泉`, 26 bath/ganbanyoku-style product variety, restaurant/rest areas. This is a high-value facility-model row.
- Kinosaki seven public baths: common official page confirms shared spring quality, one-day bath pass, and the official congestion page. Individual map/review URLs still need row-level separation.

## Verification Rule Updates

Apply these rules to the rest of T1-01:

1. If an official domain is dead, parked, or replaced, do not keep the row as `needs_official_crosscheck`; downgrade to `hold_needs_current_operation_verification`.
2. If a facility is part of a shared external-bath route, keep one row per bath only when separate map/review collection is feasible.
3. Do not count review snippets as direct review samples. Use them only to identify surfaces.
4. For accommodation rows, distinguish:
   - guest-room open-air bath
   - guest-room indoor bath
   - shared private/rental bath
   - public bath
   - day-use plan
5. For facility rows, distinguish:
   - public bath
   - bath-pass route
   - family/private rental bath
   - footbath
   - restaurant/rest/ganbanyoku add-ons
   - current congestion/closure notices

## Next Step

Continue T1-01 verification in two lanes:

- Accommodation rows 10-50: Kinosaki, Gero, Hakone, Kurokawa, Ibusuki, Unzen, Yufuin/Beppu-adjacent high-value rows.
- Facility rows 11-50: Kurokawa day-use baths, Unzen/Ibusuki facilities, Hakone/Yufuin/Beppu/Kusatsu core facilities.

The next output should be a full `tier1_verification_batch_01_v0_1` with row-level official URL, map/review URL, review-pool fields, and updated status.
