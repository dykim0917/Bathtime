BEGIN;

-- hakone-byakudan: water_source_type=free_flowing_source / water_kakenagashi
UPDATE public.onsen_accommodations
SET water_use_status = 'official_confirmed',
    water_source_type = 'free_flowing_source',
    water_criteria = '["spring_confirmed","direct_source","water_texture"]'::jsonb,
    operation_notes = '["객실 노천탕 중심으로 정리했습니다","자가 원천을 흘려보내는 직수 방식으로 확인됩니다"]'::jsonb,
    content_updated_at = '2026-07-08',
    updated_at = NOW()
WHERE slug = 'hakone-byakudan';

UPDATE public.onsen_verdicts
SET fact_statuses = '[{"code":"water_kakenagashi","label":"원천 100% 직수","status":"confirmed","value":"전 객실 객실 노천탕과 공용탕에 자가 원천을 직수 방식으로 공급한다는 이전 검증 근거가 있습니다.","source":"research/onsen-review-signals/hakone-byakudan/platform_mapping_2026-07-04.json"}]'::jsonb,
    updated_at = NOW()
WHERE target_type = 'accommodation' AND target_slug = 'hakone-byakudan';

-- tokachigawa-seijakubou: 全室源泉かけ流し露天風呂付きの宿
UPDATE public.onsen_accommodations
SET water_use_status = 'official_confirmed',
    water_source_type = 'free_flowing_source',
    water_criteria = '["spring_confirmed","direct_source","water_texture"]'::jsonb,
    operation_notes = '["객실 노천탕 중심으로 정리했습니다","예약 조건과 운영 시간을 함께 확인하시기 바랍니다","전 객실 노천탕이 원천가케나가시로 표기됩니다"]'::jsonb,
    content_updated_at = '2026-07-08',
    updated_at = NOW()
WHERE slug = 'tokachigawa-seijakubou';

UPDATE public.onsen_verdicts
SET fact_statuses = '[{"code":"water_kakenagashi","label":"원천 100% 직수","status":"confirmed","value":"일본어 숙소명 표면에서 전 객실 원천가케나가시 노천탕 구성이 확인됩니다.","source":"research/onsen-db-seed/hokkaido_reconciliation_seed_2026-07-08.json"}]'::jsonb,
    updated_at = NOW()
WHERE target_type = 'accommodation' AND target_slug = 'tokachigawa-seijakubou';

-- yunohira-gyounso: 源泉掛け流し大人限定宿
UPDATE public.onsen_accommodations
SET water_use_status = 'official_confirmed',
    water_source_type = 'free_flowing_source',
    water_criteria = '["spring_confirmed","direct_source","water_texture"]'::jsonb,
    operation_notes = '["객실 내 프라이빗탕 중심으로 정리했습니다","예약 조건과 운영 시간을 함께 확인하시기 바랍니다","공식 표면에서 원천가케나가시 표기가 확인됩니다"]'::jsonb,
    content_updated_at = '2026-07-08',
    updated_at = NOW()
WHERE slug = 'yunohira-gyounso';

UPDATE public.onsen_verdicts
SET fact_statuses = '[{"code":"water_kakenagashi","label":"원천 100% 직수","status":"confirmed","value":"일본어 숙소명 표면에서 원천가케나가시 숙소임이 확인됩니다.","source":"research/onsen-db-seed/kyushu_qa_seed_3rd_2026-07-08.json"}]'::jsonb,
    updated_at = NOW()
WHERE target_type = 'accommodation' AND target_slug = 'yunohira-gyounso';

-- shirahama-yanagiya: 百割源泉 / 源泉百% 掛け流し
UPDATE public.onsen_accommodations
SET water_use_status = 'official_confirmed',
    water_source_type = 'free_flowing_source',
    water_criteria = '["spring_confirmed","direct_source","water_texture"]'::jsonb,
    operation_notes = '["객실 노천탕 중심으로 정리했습니다","예약 조건과 운영 시간을 함께 확인하시기 바랍니다","원천 100% 직수 표기가 확인됩니다. 일부 반노천 객실은 끓인 물 표기라 객실 타입을 함께 확인하세요"]'::jsonb,
    content_updated_at = '2026-07-08',
    updated_at = NOW()
WHERE slug = 'shirahama-yanagiya';

UPDATE public.onsen_verdicts
SET fact_statuses = '[{"code":"water_kakenagashi","label":"원천 100% 직수","status":"confirmed","value":"공식 표면에서 백할원천과 원천 100% 가케나가시가 확인됩니다. 일부 반노천 객실은 끓인 물 표기라 객실 타입 확인이 필요합니다.","source":"research/onsen-deep-research/shirahama-yanagiya-2026-07-04/review_signal_summary_2026-07-04.md"}]'::jsonb,
    updated_at = NOW()
WHERE target_type = 'accommodation' AND target_slug = 'shirahama-yanagiya';

COMMIT;
