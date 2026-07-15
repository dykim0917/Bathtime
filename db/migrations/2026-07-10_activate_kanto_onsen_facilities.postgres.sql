WITH facility_locations(slug, prefecture, municipality, onsen_area) AS (
  VALUES
    ('thermae-yu-shinjuku', 'tokyo', 'shinjuku', 'tokyo'),
    ('spa-laqua', 'tokyo', 'bunkyo', 'tokyo'),
    ('tokyo-toyosu-manyoclub', 'tokyo', 'koto', 'tokyo'),
    ('yokohama-manyoclub', 'kanagawa', 'yokohama', 'yokohama'),
    ('spa-herbs', 'saitama', 'saitama', 'saitama'),
    ('spa-metsa-otaka', 'chiba', 'nagareyama', 'nagareyama'),
    ('narita-sora-no-yu', 'chiba', 'shibayama', 'narita-airport'),
    ('kusatsu-ohtakinoyu', 'gunma', 'kusatsu', 'kusatsu'),
    ('kusatsu-gozanoyu', 'gunma', 'kusatsu', 'kusatsu'),
    ('kusatsu-sainokawara', 'gunma', 'kusatsu', 'kusatsu'),
    ('ikaho-ishidan-no-yu', 'gunma', 'shibukawa', 'ikaho'),
    ('ikaho-rotenburo', 'gunma', 'shibukawa', 'ikaho'),
    ('minakami-suzumori-no-yu', 'gunma', 'minakami', 'minakami'),
    ('hoshi-onsen-choujukan-dayuse', 'gunma', 'minakami', 'minakami'),
    ('takaragawa-sanso-dayuse', 'gunma', 'minakami', 'minakami'),
    ('shima-sekizenkan-dayuse', 'gunma', 'nakanojo', 'shima'),
    ('nasu-omaru-dayuse', 'tochigi', 'nasu', 'nasu'),
    ('nasu-shikanoyu', 'tochigi', 'nasu', 'nasu'),
    ('nikko-yumoto-onsenji', 'tochigi', 'nikko', 'nikko-yumoto')
)
UPDATE public.onsen_facilities AS facility
SET
  prefecture = location.prefecture,
  municipality = location.municipality,
  onsen_area = location.onsen_area,
  summary = COALESCE(
    facility.summary,
    CASE facility.facility_type
      WHEN 'historic_public_bath' THEN '역사적 공중탕과 당일입욕 경험을 중심으로 확인하는 온천 시설입니다.'
      WHEN 'wellness_spa' THEN '온천욕과 사우나·휴게 공간을 함께 이용하는 웰니스 시설입니다.'
      WHEN 'large_day_use_complex' THEN '여러 탕과 공용 온천을 중심으로 이용하는 대형 당일온천 시설입니다.'
      ELSE '공용 온천욕을 중심으로 이용하는 당일입욕 시설입니다.'
    END
  ),
  status = 'active',
  updated_at = NOW()
FROM facility_locations AS location
WHERE facility.slug = location.slug
  AND facility.status = 'draft';

UPDATE public.onsen_facilities
SET
  official_url = COALESCE(official_url, 'https://tokyo-toyosu.manyo.co.jp/'),
  official_source_urls = CASE
    WHEN jsonb_array_length(official_source_urls) = 0
      THEN '["https://tokyo-toyosu.manyo.co.jp/onsen/", "https://tokyo-toyosu.manyo.co.jp/price/"]'::jsonb
    ELSE official_source_urls
  END,
  official_checked_at = COALESCE(official_checked_at, DATE '2026-07-10'),
  updated_at = NOW()
WHERE slug = 'tokyo-toyosu-manyoclub';

COMMENT ON TABLE public.onsen_facilities IS
  'Active non-accommodation onsen facilities. Public filters use only confirmed ready official facts; review evidence remains separate.';
