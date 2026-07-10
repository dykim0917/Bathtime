CREATE TABLE IF NOT EXISTS public.onsen_accommodation_official_filter_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_slug TEXT NOT NULL REFERENCES public.onsen_accommodations(slug) ON DELETE CASCADE,
  filter_code TEXT NOT NULL
    CHECK (filter_code IN (
      'day_use', 'lodging', 'open_air_bath', 'private_bath', 'family_bath', 'mixed_bathing',
      'sauna', 'loyly', 'water_bath', 'stone_sauna', 'private_sauna', 'sand_bath', 'steam_bath',
      'enzyme_bath', 'health_retreat', 'jet_bath', 'sleeping_bath', 'morning_bath', 'late_night',
      'station_walk_10m', 'parking', 'shuttle', 'tattoo_allowed', 'barrier_free',
      'wheelchair_accessible', 'english_support', 'meal_service', 'rest_area', 'wifi',
      'ocean_view', 'snow_view', 'autumn_foliage_view', 'adult_day_use_price',
      'spring_bicarbonate', 'spring_chloride', 'spring_sulfur', 'spring_sulfate', 'spring_iron',
      'spring_acidic', 'spring_carbon_dioxide', 'spring_radon', 'spring_radioactive',
      'spring_simple', 'spring_alkaline_simple'
    )),
  scope_key TEXT NOT NULL DEFAULT 'facility_wide',
  scope_label_ko TEXT,
  availability TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (availability IN ('confirmed', 'conditional', 'not_available')),
  filter_value JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(filter_value) = 'object'),
  filter_status TEXT NOT NULL DEFAULT 'hold'
    CHECK (filter_status IN ('ready', 'hold', 'expired', 'deprecated')),
  official_original_text TEXT NOT NULL,
  official_source_url TEXT NOT NULL,
  source_kind TEXT NOT NULL
    CHECK (source_kind IN ('operator_official', 'municipal_official', 'tourism_association', 'official_analysis_document')),
  official_source_checked_at DATE NOT NULL,
  valid_until DATE,
  source_file TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (accommodation_slug, filter_code, scope_key)
);

CREATE INDEX IF NOT EXISTS idx_onsen_accommodation_official_filter_facts_lookup
  ON public.onsen_accommodation_official_filter_facts (filter_code, availability, filter_status);

CREATE INDEX IF NOT EXISTS idx_onsen_accommodation_official_filter_facts_target
  ON public.onsen_accommodation_official_filter_facts (accommodation_slug, scope_key);

CREATE INDEX IF NOT EXISTS idx_onsen_accommodation_official_filter_facts_value_gin
  ON public.onsen_accommodation_official_filter_facts USING GIN (filter_value);

CREATE TABLE IF NOT EXISTS public.onsen_facility_official_filter_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_slug TEXT NOT NULL REFERENCES public.onsen_facilities(slug) ON DELETE CASCADE,
  filter_code TEXT NOT NULL
    CHECK (filter_code IN (
      'day_use', 'lodging', 'open_air_bath', 'private_bath', 'family_bath', 'mixed_bathing',
      'sauna', 'loyly', 'water_bath', 'stone_sauna', 'private_sauna', 'sand_bath', 'steam_bath',
      'enzyme_bath', 'health_retreat', 'jet_bath', 'sleeping_bath', 'morning_bath', 'late_night',
      'station_walk_10m', 'parking', 'shuttle', 'tattoo_allowed', 'barrier_free',
      'wheelchair_accessible', 'english_support', 'meal_service', 'rest_area', 'wifi',
      'ocean_view', 'snow_view', 'autumn_foliage_view', 'adult_day_use_price',
      'spring_bicarbonate', 'spring_chloride', 'spring_sulfur', 'spring_sulfate', 'spring_iron',
      'spring_acidic', 'spring_carbon_dioxide', 'spring_radon', 'spring_radioactive',
      'spring_simple', 'spring_alkaline_simple'
    )),
  scope_key TEXT NOT NULL DEFAULT 'facility_wide',
  scope_label_ko TEXT,
  availability TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (availability IN ('confirmed', 'conditional', 'not_available')),
  filter_value JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(filter_value) = 'object'),
  filter_status TEXT NOT NULL DEFAULT 'hold'
    CHECK (filter_status IN ('ready', 'hold', 'expired', 'deprecated')),
  official_original_text TEXT NOT NULL,
  official_source_url TEXT NOT NULL,
  source_kind TEXT NOT NULL
    CHECK (source_kind IN ('operator_official', 'municipal_official', 'tourism_association', 'official_analysis_document')),
  official_source_checked_at DATE NOT NULL,
  valid_until DATE,
  source_file TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (facility_slug, filter_code, scope_key)
);

CREATE INDEX IF NOT EXISTS idx_onsen_facility_official_filter_facts_lookup
  ON public.onsen_facility_official_filter_facts (filter_code, availability, filter_status);

CREATE INDEX IF NOT EXISTS idx_onsen_facility_official_filter_facts_target
  ON public.onsen_facility_official_filter_facts (facility_slug, scope_key);

CREATE INDEX IF NOT EXISTS idx_onsen_facility_official_filter_facts_value_gin
  ON public.onsen_facility_official_filter_facts USING GIN (filter_value);

ALTER TABLE public.onsen_accommodation_official_filter_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onsen_facility_official_filter_facts ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.onsen_accommodation_official_filter_facts, public.onsen_facility_official_filter_facts
  TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.onsen_accommodation_official_filter_facts,
  public.onsen_facility_official_filter_facts TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'onsen_accommodation_official_filter_facts'
      AND policyname = 'public can read active accommodation official filter facts'
  ) THEN
    CREATE POLICY "public can read active accommodation official filter facts"
      ON public.onsen_accommodation_official_filter_facts
      FOR SELECT TO anon, authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.onsen_accommodations
          WHERE slug = accommodation_slug AND status = 'active'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'onsen_accommodation_official_filter_facts'
      AND policyname = 'content admin can manage accommodation official filter facts'
  ) THEN
    CREATE POLICY "content admin can manage accommodation official filter facts"
      ON public.onsen_accommodation_official_filter_facts
      FOR ALL TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'onsen_facility_official_filter_facts'
      AND policyname = 'public can read active facility official filter facts'
  ) THEN
    CREATE POLICY "public can read active facility official filter facts"
      ON public.onsen_facility_official_filter_facts
      FOR SELECT TO anon, authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.onsen_facilities
          WHERE slug = facility_slug AND status = 'active'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'onsen_facility_official_filter_facts'
      AND policyname = 'content admin can manage facility official filter facts'
  ) THEN
    CREATE POLICY "content admin can manage facility official filter facts"
      ON public.onsen_facility_official_filter_facts
      FOR ALL TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;
END
$$;

COMMENT ON TABLE public.onsen_accommodation_official_filter_facts IS
  'Officially sourced accommodation filter facts. Do not populate from review, snippet, or platform labels alone.';

COMMENT ON TABLE public.onsen_facility_official_filter_facts IS
  'Officially sourced non-accommodation facility filter facts. Do not populate from review, snippet, or platform labels alone.';
