ALTER TABLE onsen_accommodations
  ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'JP',
  ADD COLUMN IF NOT EXISTS region_group TEXT NOT NULL DEFAULT 'kyushu',
  ADD COLUMN IF NOT EXISTS prefecture TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS onsen_area TEXT,
  ADD COLUMN IF NOT EXISTS travel_contexts JSONB NOT NULL DEFAULT '["ryokan_stay"]'::jsonb,
  ADD COLUMN IF NOT EXISTS bath_contexts JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS water_criteria JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE onsen_accommodations
SET
  country = COALESCE(country, 'JP'),
  region_group = COALESCE(region_group, 'kyushu'),
  prefecture = COALESCE(prefecture, 'oita'),
  city = COALESCE(city, 'yufu'),
  onsen_area = COALESCE(onsen_area, region),
  travel_contexts = CASE
    WHEN travel_contexts = '[]'::jsonb THEN '["ryokan_stay"]'::jsonb
    ELSE travel_contexts
  END
WHERE region = 'yufuin';

CREATE INDEX IF NOT EXISTS idx_onsen_accommodations_region_group
  ON onsen_accommodations (region_group);

CREATE INDEX IF NOT EXISTS idx_onsen_accommodations_onsen_area
  ON onsen_accommodations (onsen_area);

CREATE INDEX IF NOT EXISTS idx_onsen_accommodations_travel_contexts_gin
  ON onsen_accommodations USING GIN (travel_contexts);

CREATE INDEX IF NOT EXISTS idx_onsen_accommodations_bath_contexts_gin
  ON onsen_accommodations USING GIN (bath_contexts);

CREATE INDEX IF NOT EXISTS idx_onsen_accommodations_water_criteria_gin
  ON onsen_accommodations USING GIN (water_criteria);
