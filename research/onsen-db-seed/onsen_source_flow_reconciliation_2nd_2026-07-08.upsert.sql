BEGIN;

-- yufuin-wazanho: 대욕장과 객실탕 모두 源泉100%掛け流し
UPDATE public.onsen_accommodations
SET water_use_status = 'official_confirmed',
    water_source_type = 'free_flowing_source',
    water_criteria = '["spring_confirmed","direct_source"]'::jsonb,
    operation_notes = '["객실 노천탕 중심으로 정리했습니다","대욕장과 객실탕 모두 원천 100% 가케나가시로 표기됩니다"]'::jsonb,
    content_updated_at = '2026-07-08',
    updated_at = NOW()
WHERE slug = 'yufuin-wazanho';

UPDATE public.onsen_verdicts
SET fact_statuses = '[{"code":"water_kakenagashi","label":"원천 100% 직수","status":"confirmed","value":"공식 온천 표면에서 대욕장과 객실탕 모두 원천 100% 가케나가시로 표기됩니다.","source":"research/onsen-review-signals/yufuin-wazanho/platform_mapping_2026-07-08.json"}]'::jsonb,
    updated_at = NOW()
WHERE target_type = 'accommodation' AND target_slug = 'yufuin-wazanho';

-- beppu-yunosato-hayama: 天然温泉かけ流し / 源泉かけ流し
UPDATE public.onsen_accommodations
SET water_use_status = 'official_confirmed',
    water_source_type = 'free_flowing_source',
    water_criteria = '["spring_confirmed","direct_source"]'::jsonb,
    operation_notes = '["객실 노천탕 중심으로 정리했습니다","예약 조건과 운영 시간을 함께 확인하시기 바랍니다","공식 표면에서 원천가케나가시가 확인됩니다. 객실탕은 일부 객실 타입 중심입니다"]'::jsonb,
    content_updated_at = '2026-07-08',
    updated_at = NOW()
WHERE slug = 'beppu-yunosato-hayama';

UPDATE public.onsen_verdicts
SET fact_statuses = '[{"code":"water_kakenagashi","label":"원천 100% 직수","status":"confirmed","value":"공식 표면에서 천연온천 가케나가시와 원천가케나가시가 확인됩니다. 객실탕은 일부 객실 타입 중심입니다.","source":"research/onsen-review-signals/beppu-yunosato-hayama/review_signal_summary_2026-07-07.md"}]'::jsonb,
    updated_at = NOW()
WHERE target_type = 'accommodation' AND target_slug = 'beppu-yunosato-hayama';

-- ibusuki-ginsyo: 대욕장 내탕/노천 + 객실 노천 源泉かけ流し
UPDATE public.onsen_accommodations
SET water_use_status = 'official_confirmed',
    water_source_type = 'free_flowing_source',
    water_criteria = '["spring_confirmed","direct_source","water_texture"]'::jsonb,
    operation_notes = '["객실 노천탕 중심으로 정리했습니다","예약 조건과 운영 시간을 함께 확인하시기 바랍니다","대욕장과 객실 노천탕에 원천가케나가시 표기가 확인됩니다. 객실 노천탕은 공급 시간 조건을 함께 확인하세요"]'::jsonb,
    content_updated_at = '2026-07-08',
    updated_at = NOW()
WHERE slug = 'ibusuki-ginsyo';

UPDATE public.onsen_verdicts
SET fact_statuses = '[{"code":"water_kakenagashi","label":"원천 100% 직수","status":"confirmed","value":"공식 표면에서 대욕장 내탕/노천과 객실 노천탕의 원천가케나가시 표기가 확인됩니다. 객실 노천탕은 공급 시간 조건을 함께 봐야 합니다.","source":"research/onsen-review-signals/ibusuki-ginsyo/platform_mapping_2026-07-04.json"}]'::jsonb,
    updated_at = NOW()
WHERE target_type = 'accommodation' AND target_slug = 'ibusuki-ginsyo';

-- yufuin-warabino: 전 객실 원천가케나가시 온천 포함
UPDATE public.onsen_accommodations
SET water_use_status = 'official_confirmed',
    water_source_type = 'free_flowing_source',
    water_criteria = '["spring_confirmed","direct_source","water_texture"]'::jsonb,
    operation_notes = '["객실 노천탕 중심으로 정리했습니다","예약 조건과 운영 시간을 함께 확인하시기 바랍니다","전 객실 원천가케나가시 온천 포함 숙소로 정리된 근거가 있습니다"]'::jsonb,
    content_updated_at = '2026-07-08',
    updated_at = NOW()
WHERE slug = 'yufuin-warabino';

UPDATE public.onsen_verdicts
SET fact_statuses = '[{"code":"water_kakenagashi","label":"원천 100% 직수","status":"confirmed","value":"공식/OTA 시설 정보 기준 전 객실 원천가케나가시 온천 포함 숙소로 정리된 근거가 있습니다.","source":"research/onsen-review-signals/yufuin-tier2-deep-research/yufuin-warabino/review_signal_summary_curated_2026-07-02.json"}]'::jsonb,
    updated_at = NOW()
WHERE target_type = 'accommodation' AND target_slug = 'yufuin-warabino';

-- yufuin-konjakuan: 天然温泉100% / 温泉掛け流し / 모든 목욕탕 가족탕
UPDATE public.onsen_accommodations
SET water_use_status = 'official_confirmed',
    water_source_type = 'free_flowing_source',
    water_criteria = '["spring_confirmed","direct_source"]'::jsonb,
    operation_notes = '["객실 노천탕 중심으로 정리했습니다","천연온천 100%와 온천 가케나가시 표기가 확인됩니다. 객실탕과 대절 가족탕 구성을 분리해서 확인하세요"]'::jsonb,
    content_updated_at = '2026-07-08',
    updated_at = NOW()
WHERE slug = 'yufuin-konjakuan';

UPDATE public.onsen_verdicts
SET fact_statuses = '[{"code":"water_kakenagashi","label":"원천 100% 직수","status":"confirmed","value":"공식/Jalan 표면에서 천연온천 100%, 온천 가케나가시, 가족탕 중심 구성이 확인됩니다.","source":"research/onsen-review-signals/yufuin-konjakuan/platform_mapping_2026-07-08.json"}]'::jsonb,
    updated_at = NOW()
WHERE target_type = 'accommodation' AND target_slug = 'yufuin-konjakuan';

-- unzen-fukudaya: 源泉かけ流し / 白濁温泉
UPDATE public.onsen_accommodations
SET water_use_status = 'official_confirmed',
    water_source_type = 'free_flowing_source',
    water_criteria = '["spring_confirmed","direct_source","water_texture"]'::jsonb,
    operation_notes = '["공용 노천탕 중심으로 정리했습니다","예약 조건과 운영 시간을 함께 확인하시기 바랍니다","공식/OTA 표면에서 원천가케나가시 백탁온천 표기가 확인됩니다"]'::jsonb,
    content_updated_at = '2026-07-08',
    updated_at = NOW()
WHERE slug = 'unzen-fukudaya';

UPDATE public.onsen_verdicts
SET fact_statuses = '[{"code":"water_kakenagashi","label":"원천 100% 직수","status":"confirmed","value":"공식 메타/객실 페이지와 라쿠텐 온천 표면에서 원천가케나가시 백탁온천 표기가 확인됩니다.","source":"research/onsen-review-signals/unzen-fukudaya/platform_mapping_2026-07-04.json"}]'::jsonb,
    updated_at = NOW()
WHERE target_type = 'accommodation' AND target_slug = 'unzen-fukudaya';

-- hakone-gen-gora: 전 18실 원천가케나가시 객실 노천탕
UPDATE public.onsen_accommodations
SET water_use_status = 'official_confirmed',
    water_source_type = 'free_flowing_source',
    water_criteria = '["spring_confirmed","direct_source","water_texture"]'::jsonb,
    operation_notes = '["객실 노천탕 중심으로 정리했습니다","예약 조건과 운영 시간을 함께 확인하시기 바랍니다","전 객실 원천가케나가시 객실 노천탕으로 정리된 공식/시설 근거가 있습니다"]'::jsonb,
    content_updated_at = '2026-07-08',
    updated_at = NOW()
WHERE slug = 'hakone-gen-gora';

UPDATE public.onsen_verdicts
SET fact_statuses = '[{"code":"water_kakenagashi","label":"원천 100% 직수","status":"confirmed","value":"공식/시설 표면 기준 전 18실 원천가케나가시 객실 노천탕과 원천가케나가시 대욕장 표기가 확인됩니다.","source":"research/onsen-review-signals/hakone-gen-gora/review_signal_summary_2026-07-04.md"}]'::jsonb,
    updated_at = NOW()
WHERE target_type = 'accommodation' AND target_slug = 'hakone-gen-gora';

-- yufuin-sakuratei: 전 10동 별채 원천가케나가시 노천탕
UPDATE public.onsen_accommodations
SET water_use_status = 'official_confirmed',
    water_source_type = 'free_flowing_source',
    water_criteria = '["spring_confirmed","direct_source","water_texture"]'::jsonb,
    operation_notes = '["객실 노천탕 중심으로 정리했습니다","예약 조건과 운영 시간을 함께 확인하시기 바랍니다","전 10동 별채 원천가케나가시 노천탕 숙소로 소개되는 근거가 있습니다"]'::jsonb,
    content_updated_at = '2026-07-08',
    updated_at = NOW()
WHERE slug = 'yufuin-sakuratei';

UPDATE public.onsen_verdicts
SET fact_statuses = '[{"code":"water_kakenagashi","label":"원천 100% 직수","status":"confirmed","value":"Jalan/Rakuten/Yahoo/Ikkyu 표면에서 전 10동 별채 원천가케나가시 노천탕 숙소로 소개됩니다.","source":"research/onsen-review-signals/yufuin-sakuratei/review_signal_summary_2026-07-08.md"}]'::jsonb,
    updated_at = NOW()
WHERE target_type = 'accommodation' AND target_slug = 'yufuin-sakuratei';

-- yufuin-baien: 공식 온천 페이지 원천가케나가시
UPDATE public.onsen_accommodations
SET water_use_status = 'official_confirmed',
    water_source_type = 'free_flowing_source',
    water_criteria = '["spring_confirmed","direct_source"]'::jsonb,
    operation_notes = '["공용 노천탕 중심으로 정리했습니다","예약 조건과 운영 시간을 함께 확인하시기 바랍니다","공식 온천 페이지에서 원천가케나가시 표기가 확인됩니다. 객실 노천/반노천은 객실 타입별로 확인하세요"]'::jsonb,
    content_updated_at = '2026-07-08',
    updated_at = NOW()
WHERE slug = 'yufuin-baien';

UPDATE public.onsen_verdicts
SET fact_statuses = '[{"code":"water_kakenagashi","label":"원천 100% 직수","status":"confirmed","value":"공식 온천 페이지에서 원천가케나가시 표기가 확인됩니다. 객실 노천/반노천은 별채 객실 타입별로 확인해야 합니다.","source":"research/onsen-review-signals/yufuin-baien/review_signal_summary_curated_2026-07-01.json"}]'::jsonb,
    updated_at = NOW()
WHERE target_type = 'accommodation' AND target_slug = 'yufuin-baien';

-- hakone-yuyado-zen: all rooms 掛け流し / 天然掛け流しにごり湯
UPDATE public.onsen_accommodations
SET water_use_status = 'official_confirmed',
    water_source_type = 'free_flowing_source',
    water_criteria = '["spring_confirmed","direct_source","water_texture"]'::jsonb,
    operation_notes = '["객실 노천탕 중심으로 정리했습니다","전 객실 가케나가시 온천 표기가 확인됩니다. 뜨거운 원천과 온도 조절 신호를 함께 확인하세요"]'::jsonb,
    content_updated_at = '2026-07-08',
    updated_at = NOW()
WHERE slug = 'hakone-yuyado-zen';

UPDATE public.onsen_verdicts
SET fact_statuses = '[{"code":"water_kakenagashi","label":"원천 100% 직수","status":"confirmed","value":"공식 객실 페이지는 전 객실 가케나가시 온천, TOP 표면은 천연 가케나가시 니고리유로 설명합니다. 온도 조절 신호는 별도 확인이 필요합니다.","source":"research/onsen-review-signals/hakone-yuyado-zen/platform_mapping_2026-07-04.json"}]'::jsonb,
    updated_at = NOW()
WHERE target_type = 'accommodation' AND target_slug = 'hakone-yuyado-zen';

-- beppu-yutorelo: 自家源泉かけ流し / 自家源泉
UPDATE public.onsen_accommodations
SET water_use_status = 'official_confirmed',
    water_source_type = 'free_flowing_source',
    water_criteria = '["spring_confirmed","direct_source"]'::jsonb,
    operation_notes = '["객실 노천탕 중심으로 정리했습니다","예약 조건과 운영 시간을 함께 확인하시기 바랍니다","공식 계열 설명에서 자가 원천가케나가시 표기가 확인됩니다"]'::jsonb,
    content_updated_at = '2026-07-08',
    updated_at = NOW()
WHERE slug = 'beppu-yutorelo';

UPDATE public.onsen_verdicts
SET fact_statuses = '[{"code":"water_kakenagashi","label":"원천 100% 직수","status":"confirmed","value":"공식 계열 설명에서 자가 원천가케나가시와 자가 원천 온천 신호가 확인됩니다.","source":"research/onsen-review-signals/beppu-yutorelo/platform_mapping_2026-07-08.json"}]'::jsonb,
    updated_at = NOW()
WHERE target_type = 'accommodation' AND target_slug = 'beppu-yutorelo';

COMMIT;
