# Tier 1 Verification Batch 05 Complete Report

## Scope

- Date: 2026-07-03
- Target file: `tier1_verification_batch_05_target_v0_1_2026-07-03.csv`
- Complete file: `tier1_verification_batch_05_complete_v0_1_2026-07-03.csv`
- Queue range: accommodation 201-250
- Mode: Tier 1 candidate verification, not deep review-signal tagging

## QA

| check | result |
|---|---:|
| total rows | 50 |
| accommodation rows | 50 |
| missing official_url | 0 |
| missing primary_review_or_ota_url | 0 |
| missing source_urls | 0 |
| duplicate kind + queue_rank | 0 |
| queue coverage | 201-250, no gaps |

## Verification Result Distribution

| verification_result | rows |
|---|---:|
| official_and_high_volume_ota_bath_surface_confirmed | 20 |
| official_and_multi_ota_bath_surface_confirmed | 17 |
| official_and_multi_review_surface_confirmed | 3 |
| official_and_high_volume_multi_ota_bath_surface_confirmed | 2 |
| official_and_review_surface_confirmed | 2 |
| official_and_multi_surface_confirmed | 2 |
| duplicate_identity_confirmed | 1 |
| official_and_review_surface_confirmed_with_room_bath_source_issue | 1 |
| official_and_global_review_surface_confirmed | 1 |
| official_and_high_volume_multi_review_surface_confirmed | 1 |

## Key Findings

- Batch 05 verifies 50 accommodation candidates across Yamanashi, Okayama, Iwate, Ehime, Niigata, Tochigi, Ishikawa, Kanagawa, Fukui, Fukushima, Gunma, Nagano, Aomori, and Shizuoka.
- One duplicate identity is confirmed: `fujiyoshida-kaneyamaen` and `kawaguchiko-kaneyamaen` are the same `ホテル鐘山苑`. Keep the Fujiyoshida row as the primary candidate and merge the Kawaguchiko duplicate.
- One likely slug mismatch requires cleanup: `bessho-nanjo-ryokan` points to `別所温泉 旅館花屋`, not a Nanjo ryokan identity. Recheck the original candidate source and likely rename to `bessho-hanaya`.
- Several rows require bath-source caution before `room_bath_hot_spring` tagging: `Sunnide Resort` room open-air appears non-onsen while public bath is onsen; `グランディア芳泉` has room semi-open-air types that may not be onsen.
- Strong room-bath clusters appear in Kawaguchiko/Fuji, Dogo, Yugawara, Awara, Minakami, Matsumoto, Suwa, and Izu Nagaoka. These are valuable Bathtime candidates because official surfaces often expose all-room source-flow or room-open-air propositions.
- Public-bath/view-bath heavy rows should be evaluated on a different axis: `鬼怒川温泉 あさや`, `南部屋・海扇閣`, `庄助の宿 瀧の湯`, `那須温泉 山楽`, `まつや千千`, and `大沢温泉 山水閣`.
- `酸ヶ湯温泉旅館` is a special hybrid. It belongs in accommodation verification because it is a lodging row, but the strongest user decision is facility-like: `ヒバ千人風呂`, mixed bathing, women-only time, bathing clothes, `玉の湯`, strong acidic milky water, and rustic toji lodging.
- Negative-signal expansion is needed for a few high-value rows before confident user-facing claims: `若竹の庄 別邸笹音` for chlorine/cleanliness, `扉温泉 明神館` for low water pressure/lukewarm/insects/washing area, `星のあかり` for insects, `奥湯河原 結唯` for stairs/temperature/privacy, and `湯原温泉 八景` for older cleanliness/service negatives.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `kawaguchiko-kaneyamaen` | Duplicate of `fujiyoshida-kaneyamaen`. | Merge into 203 and exclude from unique Tier 1 count. |
| `bessho-nanjo-ryokan` | Slug/name mismatch; row points to `旅館花屋`. | Recheck source and likely rename to `bessho-hanaya`. |
| `kawaguchiko-sunnide` | Room open-air likely not onsen; public bath is onsen. | Do not tag as `room_bath_hot_spring`; split view-room-bath and public-bath signals. |
| `awara-grandia-housen` | Some room baths may not be onsen. | Split public bath, room bath by room type, and family/resort flow. |
| `sukayu-onsen` | Accommodation/facility hybrid. | Add bridge note for facility dataset and deep-review with facility model fields. |
| `tobira-myojinkan` | Bath operation negatives appear despite luxury positioning. | Expand low-rated review sampling before confidence. |
| `ikaho-kaichoro` / `ikaho-kanouya` / `ikaho-kokuya` / `ikaho-oyado-tamaki` | Ikaho water names differ. | Keep `黄金の湯` and `白銀の湯` as separate source tags. |

## Data Quality Note

Batch 05 is clean enough to support the nationwide candidate directory, but it also shows why the next stage must not flatten candidates into generic onsen hotels. The useful Bathtime data is product-level: source-flow room bath, non-onsen room open-air, public view bath, private/family bath, mixed communal bath, footbath, sauna/spa, and nearby public bath should be separate bath-area records before review-signal counting.

## Next Batch

- Current verified cumulative after Batch 05: accommodation Tier 1 ranks 1-250 and facility Tier 1 ranks 1-143 have verification files.
- Remaining accommodation Tier 1 queue after this batch: ranks 251-284.
- Next target should be accommodation ranks 251-284, likely as Batch 06 or final accommodation verification batch.
