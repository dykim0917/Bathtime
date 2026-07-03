# Tier 1 Verification Batch 03 Segment 131-140 Report

## Scope

- Date: 2026-07-03
- Segment file: `tier1_verification_batch_03_segment_131_140_v0_1_2026-07-03.csv`
- Queue range: accommodation 131-140, facility 131-140
- Mode: Tier 1 candidate verification, not deep review-signal tagging

## QA

| check | result |
|---|---:|
| total rows | 20 |
| accommodation rows | 10 |
| facility rows | 10 |
| missing official_url | 0 |
| missing primary_review_or_ota_url | 0 |
| missing source_urls | 0 |
| duplicate kind + queue_rank | 0 |

## Key Findings

### Accommodation

- Senami remains a strong ocean-view bath cluster. `静雲荘` is room-bath centered, with visible signals around guest-room indoor/open-air baths facing the Sea of Japan. `大観荘せなみの湯` is more public-bath/open-air centered, with strong sunset and large-bath visibility.
- Tsukioka is one of the cleanest high-priority spring-character clusters in this batch. `白玉の湯 華鳳` and `月岡温泉 摩周` both expose official emerald-green sulfur spring facts and visible review signals around sulfur smell, smooth skin, and beauty-water framing.
- Yamanaka/Yamashiro entries are deep-review-ready but need bath-area separation. `かがり吉祥亭` and `吉祥やまなか` mix public baths, private baths, room baths, and service-heavy review language. `花紫`, `あらや滔々庵`, and `べにや無何有` are high-end, lower-volume properties where official bath facts and fewer high-quality reviews will matter more than raw count.
- `和倉温泉 加賀屋` must be held. Official information says the property is still in post-earthquake rebuild planning, with reopening targeted for the end of fiscal 2027. It should not be treated as a currently bookable operating onsen ryokan candidate.

### Facility

- `富士眺望の湯 ゆらり`, `那須温泉 鹿の湯`, `石段の湯`, `伊香保露天風呂`, `下大湯`, and `日光山温泉寺` are all useful facility-model candidates because their decision signals are facility-specific rather than accommodation-like.
- `鹿の湯` is especially strong for historic public bath/touji modeling: acidic sulfur, white turbidity, temperature-stepped hot baths, local bathing rules, and crowding avoidance all appear on the review surface.
- `伊香保露天風呂` should be modeled as a small source-site open-air bath, not as a full day-use spa. Washing-area absence and crowding sensitivity are part of the product.
- `アクアイグニス片岡温泉` is a strong source-flow wellness-spa candidate, but the current `area_slug=toba` is inaccurate. It should be corrected toward Yunoyama/Komono/Mie before broader publication.
- `湯田温泉 亀乃湯` is an identity-conflict row. The old public bath closed on 2020-10-31; current candidates should be split into successor/related facilities such as `ふくふくの湯` or the guest-only Super Hotel bath if relevant.
- `鬼怒川公園岩風呂` is officially closed as of 2024-03-31 and should be excluded or held as historical data only.

## Cleanup / Follow-Up Queue

| slug | issue | next action |
|---|---|---|
| `wakura-kagaya` | Post-earthquake rebuild; reopening target is fiscal 2027 end. | Hold until reopening, then reverify as a new/current property. |
| `toba-aquaignis-kataoka` | Area slug is misleading; facility is not Toba-centered. | Correct geography to Yunoyama/Komono/Mie cluster. |
| `yuda-kame-no-yu` | Old public bath closed; current web has stale conflicting listings. | Exclude old row or split into `ふくふくの湯` and guest-only successor bath. |
| `kinugawa-kinutaki` | Officially closed on 2024-03-31. | Remove from active candidate pool or keep only as historical reference. |
| `yamashiro-beniya-mukayu` | Review surface includes non-source-flow disappointment. | Deep review should explicitly check source-flow/circulation/weak-onsen-feeling signals. |
| `ikaho-rotenburo` | Small open-air source bath, not full spa. | Mark washing-area absence and small-capacity crowding as core facility signals. |

## Data Quality Note

This segment reinforces why candidate verification cannot rely on old directories or visible review volume alone. Several rows are famous or reviewable but not currently usable as active candidates. For later deep review, directly read review counts must be tracked separately from legacy review surfaces, and current operation status should be rechecked before any user-facing recommendation.
