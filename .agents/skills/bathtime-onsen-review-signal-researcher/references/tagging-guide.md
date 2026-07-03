# Tagging Guide

## Bath Area

Use the most specific area supported by the review text, room name, plan name, or official context.

| value | Use when |
|---|---|
| `room_bath` | Indoor bath inside the booked guest room is clearly referenced. Korean: 객실 내탕/객실탕. Japanese: 客室風呂, 部屋風呂, 内湯. |
| `room_open_air_bath` | Guest-room open-air/semi-open-air bath attached to the booked room is clearly referenced. Korean: 객실 노천탕/개별 노천탕. Japanese: 客室露天風呂, 露天風呂付き客室, 半露天. |
| `public_bath` | Shared indoor public bath or large bath is referenced. |
| `open_air_public_bath` | Shared open-air public bath is referenced. |
| `private_bath` | Private-use or reservable bath is referenced but the bath form is not precise. Use this for 貸切風呂/貸切露天風呂 when not clearly family-bath branded. Do not use this for clearly in-room baths. |
| `family_bath` | Shared facility bath reserved by a family/group for a time slot is explicitly referenced. Japanese: 家族風呂. Korean: 가족탕. This is different from a guest-room bath. |
| `facility_wide` | Official or review text refers to the whole facility's onsen. |
| `unclear` | Bath area cannot be inferred safely. |

## Room Bath vs Family/Private Bath

Keep these separate:

| Korean concept | Japanese clues | Tag |
|---|---|---|
| 객실탕 / 객실 내탕 | 客室風呂, 部屋風呂, 内湯, 客室内 | `room_bath` |
| 객실 노천탕 / 개별 노천탕 | 客室露天風呂, 露天風呂付き客室, 半露天, 部屋付き露天 | `room_open_air_bath` |
| 가족탕 | 家族風呂 | `family_bath` |
| 대여탕 / 전세탕 / 프라이빗 공용탕 | 貸切風呂, 貸切露天風呂, 貸切湯 | `private_bath` |
| 대욕장 | 大浴場, 男女別大浴場 | `public_bath` |

Do not translate every Korean `개인탕` or `프라이빗탕` directly to `family_bath`. Korean reviewers often use these words for guest-room baths. Use room context, room name, and facility layout to decide.

## Bath Area Confidence

| value | Meaning |
|---|---|
| `specific` | The area is explicit in body text, room name, plan name, or official page. |
| `probable` | The area is very likely from context, but not directly named. |
| `facility_wide` | Signal applies to the whole facility. |
| `unclear` | Insufficient evidence. |

## Signal Types

Use the user's model:

1. `room_bath_hot_spring`
2. `public_bath_hot_spring`
3. `water_texture`
4. `weak_onsen_feeling`
5. `chlorine_smell`
6. `private_bath_experience`
7. `crowding`
8. `booking_confusion`

Add a short note outside the model for recurring operational issues when useful, such as room-bath temperature control, cleanliness, or access guidance.

## Direction

| value | Meaning |
|---|---|
| `positive` | Guest frames the bath signal favorably. |
| `negative` | Guest frames it as a problem. |
| `mixed` | Same review includes both benefit and drawback, or platform signals split. |
| `neutral` | Mention exists but sentiment is not evaluative. |

## Counting Rules

- `mention_count`: count related mentions. One review can contain multiple signal types, but do not double-count the same signal repeated in one review unless distinct bath areas are discussed.
- `source_count`: count independent reviewers/authors. Same author across duplicated OTA mirrors should count once if detectable.
- `platform_count`: count platforms where the signal appears in directly read review text. Search snippets count only if explicitly labeled as snippet evidence.
- Separate **facility evidence** from **experience evidence**:
  - Room names and plan names such as `露天・内湯・岩盤浴` can establish bath_area and bath_area_confidence.
  - Review body phrases such as `何度も入った`, `肌がつるつる`, `温泉感なしかな`, `寒い` count as experiential signal mentions.
  - Do not let repeated room names inflate water texture, weak onsen feeling, crowding, chlorine, or satisfaction counts.
- Keep separate:
  - visible platform review count
  - directly read reviews
  - onsen-related directly read reviews
  - tagged signal mentions
  - search/snippet-only signals
  - Aside Browser snapshot-only signals

## Review Signal Status

| status | Suggested threshold |
|---|---|
| `strong_signal` | Repeats across 3+ platforms or 30+ independent authors, with low contradiction. |
| `moderate_signal` | Repeats across 2+ platforms or 10-29 authors. |
| `weak_signal` | Appears in 2-9 authors or one platform only. |
| `conflicting` | Positive and negative signals both repeat meaningfully. |
| `insufficient` | Too few direct mentions to infer. |

## Contradiction Level

| level | Meaning |
|---|---|
| `none` | No meaningful opposing signal found. |
| `low` | Isolated opposing reviews. |
| `medium` | Opposing signal repeats but is smaller than the main signal. |
| `high` | Opposing signal is similarly frequent or source-specific evidence conflicts. |

## Data Quality Grade

| grade | Conditions |
|---|---|
| `A` | 300+ directly read reviews, 3+ platforms, stratified, latest and low-rated coverage. |
| `B` | 100-299 directly read reviews, 2+ platforms, some stratification. |
| `C` | 50-99 directly read reviews, useful but limited. |
| `D` | Under 50 directly read reviews or one-platform-only. |

## Negative Signal Checklist

Always explicitly search or filter for:

- chlorine: `塩素`, `カルキ`, `염소`, `소독`, `chlorine`
- weak onsen: `温泉感`, `普通のお湯`, `薄い`, `온천 느낌`, `그냥 물`
- temperature: `ぬるい`, `熱い`, `温度調整`, `미지근`, `너무 뜨거`
- crowding: `混雑`, `混んで`, ` crowded`, `혼잡`
- booking/room confusion: `予約`, `部屋違い`, `変更`, `예약`, `객실 변경`, `송영`
- room-bath caution: `段差`, `脱衣所`, `寒い`, `虫`, `蚊`, `掃除`, `臭い`, `古い`, `温度調整`
- Korean demand/context: `객실탕`, `개인노천탕`, `개별노천탕`, `프라이빗 온천`, `대욕탕 없음`, `송영서비스`, `한국인 직원`
