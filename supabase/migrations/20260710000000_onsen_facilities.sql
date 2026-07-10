CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.onsen_facilities (
  slug TEXT PRIMARY KEY,
  name_ko TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  name_en TEXT,
  aliases JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(aliases) = 'array'),
  country TEXT NOT NULL DEFAULT 'JP',
  region_group TEXT NOT NULL,
  prefecture TEXT,
  municipality TEXT,
  onsen_area TEXT,
  address TEXT,
  facility_type TEXT NOT NULL
    CHECK (facility_type IN (
      'large_day_use_complex',
      'historic_public_bath',
      'public_bath_facility',
      'family_private_bath_facility',
      'sand_bath_facility',
      'steam_bath_facility',
      'footbath',
      'wellness_spa',
      'route_or_pass',
      'area_cluster',
      'non_bathing_tourism',
      'unclear'
    )),
  facility_model TEXT NOT NULL
    CHECK (facility_model IN ('bathe', 'reserve_private', 'experience', 'stopover', 'route_or_pass')),
  primary_archetype TEXT NOT NULL
    CHECK (primary_archetype IN ('public_bathing', 'experience_led', 'private_use', 'mixed', 'route_or_pass')),
  lodging_available TEXT NOT NULL DEFAULT 'unclear'
    CHECK (lodging_available IN ('true', 'false', 'unclear')),
  cleanup_status TEXT NOT NULL DEFAULT 'keep_facility'
    CHECK (cleanup_status IN ('keep_facility', 'split_needed', 'route_or_pass', 'area_cluster', 'footbath_only', 'exclude_or_hold')),
  official_url TEXT,
  map_or_review_url TEXT,
  official_profile JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(official_profile) = 'object'),
  official_source_urls JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(official_source_urls) = 'array'),
  official_checked_at DATE,
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('active', 'draft', 'paused', 'retired')),
  content_updated_at DATE NOT NULL DEFAULT CURRENT_DATE,
  source_file TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onsen_facilities_region
  ON public.onsen_facilities (region_group, prefecture, municipality);

CREATE INDEX IF NOT EXISTS idx_onsen_facilities_type_status
  ON public.onsen_facilities (facility_type, status);

CREATE INDEX IF NOT EXISTS idx_onsen_facilities_model_status
  ON public.onsen_facilities (facility_model, status);

CREATE INDEX IF NOT EXISTS idx_onsen_facilities_official_profile_gin
  ON public.onsen_facilities USING GIN (official_profile);

CREATE TABLE IF NOT EXISTS public.onsen_facility_water_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_slug TEXT NOT NULL REFERENCES public.onsen_facilities(slug) ON DELETE CASCADE,
  facility_area TEXT NOT NULL
    CHECK (facility_area IN (
      'public_bath',
      'open_air_public_bath',
      'family_bath',
      'private_bath',
      'sand_bath',
      'steam_bath',
      'footbath',
      'drinking_spring',
      'inhalation',
      'sauna',
      'stone_sauna',
      'rest_area',
      'food_area',
      'food_steam',
      'overnight_rest',
      'route_or_pass',
      'area_cluster',
      'facility_wide',
      'unclear'
    )),
  scope_key TEXT NOT NULL,
  scope_label_ko TEXT,
  day_use_available TEXT NOT NULL DEFAULT 'unknown'
    CHECK (day_use_available IN ('confirmed', 'not_available', 'unknown')),
  water_system TEXT
    CHECK (water_system IN ('kakenagashi_pure', 'kakenagashi', 'junkan')),
  kasui TEXT NOT NULL DEFAULT 'unknown'
    CHECK (kasui IN ('present', 'not_present', 'unknown')),
  kaon TEXT NOT NULL DEFAULT 'unknown'
    CHECK (kaon IN ('present', 'not_present', 'unknown')),
  disinfection TEXT NOT NULL DEFAULT 'unknown'
    CHECK (disinfection IN ('present', 'not_present', 'unknown')),
  spring_types JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(spring_types) = 'array'),
  texture_filter_candidates JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(texture_filter_candidates) = 'array'),
  water_color TEXT NOT NULL DEFAULT 'unknown'
    CHECK (water_color IN ('white', 'brown', 'clear', 'unknown')),
  method_render_status TEXT NOT NULL DEFAULT 'no_badge'
    CHECK (method_render_status IN ('no_badge', 'hold', 'scope_split_required', 'candidate_after_recheck', 'ready')),
  texture_filter_status TEXT NOT NULL DEFAULT 'not_eligible'
    CHECK (texture_filter_status IN ('not_eligible', 'official_candidate', 'ready_with_review_count')),
  color_filter_status TEXT NOT NULL DEFAULT 'not_eligible'
    CHECK (color_filter_status IN ('not_eligible', 'official_candidate', 'ready')),
  official_original_text TEXT NOT NULL,
  official_source_url TEXT NOT NULL,
  official_source_checked_at DATE NOT NULL,
  source_file TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (facility_slug, scope_key),
  CHECK (
    water_system <> 'kakenagashi_pure'
    OR (kasui = 'not_present' AND kaon = 'not_present')
  ),
  CHECK (method_render_status <> 'ready' OR water_system IS NOT NULL),
  CHECK (color_filter_status <> 'ready' OR water_color IN ('white', 'brown')),
  CHECK (texture_filter_status <> 'ready_with_review_count' OR jsonb_array_length(texture_filter_candidates) > 0)
);

CREATE INDEX IF NOT EXISTS idx_onsen_facility_water_facts_facility
  ON public.onsen_facility_water_facts (facility_slug, facility_area);

CREATE INDEX IF NOT EXISTS idx_onsen_facility_water_facts_system
  ON public.onsen_facility_water_facts (water_system, method_render_status);

CREATE TABLE IF NOT EXISTS public.onsen_facility_review_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_slug TEXT NOT NULL REFERENCES public.onsen_facilities(slug) ON DELETE CASCADE,
  collection_key TEXT NOT NULL,
  collected_on DATE NOT NULL,
  visible_review_pools JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(visible_review_pools) = 'array'),
  direct_review_manifest JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(direct_review_manifest) = 'array'),
  raw_direct_reviews INTEGER NOT NULL DEFAULT 0 CHECK (raw_direct_reviews >= 0),
  deduped_direct_reviews INTEGER NOT NULL DEFAULT 0 CHECK (deduped_direct_reviews >= 0),
  facility_related_direct_reviews INTEGER NOT NULL DEFAULT 0 CHECK (facility_related_direct_reviews >= 0),
  dayuse_only_direct_reviews INTEGER CHECK (dayuse_only_direct_reviews >= 0),
  lodging_bath_only_direct_reviews INTEGER CHECK (lodging_bath_only_direct_reviews >= 0),
  excluded_direct_reviews INTEGER NOT NULL DEFAULT 0 CHECK (excluded_direct_reviews >= 0),
  direct_body_platform_count INTEGER NOT NULL DEFAULT 0 CHECK (direct_body_platform_count >= 0),
  evidence_grade TEXT NOT NULL DEFAULT 'D'
    CHECK (evidence_grade IN ('A', 'B', 'C', 'D')),
  collection_readiness TEXT NOT NULL DEFAULT 'hold'
    CHECK (collection_readiness IN ('ready', 'needs_reinforcement', 'scope_split', 'hold')),
  collection_note TEXT,
  source_file TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (facility_slug, collection_key),
  CHECK (deduped_direct_reviews <= raw_direct_reviews),
  CHECK (facility_related_direct_reviews <= deduped_direct_reviews),
  CHECK (dayuse_only_direct_reviews <= facility_related_direct_reviews),
  CHECK (lodging_bath_only_direct_reviews <= facility_related_direct_reviews),
  CHECK (dayuse_only_direct_reviews + lodging_bath_only_direct_reviews <= facility_related_direct_reviews),
  CHECK (excluded_direct_reviews <= raw_direct_reviews)
);

CREATE INDEX IF NOT EXISTS idx_onsen_facility_review_evidence_facility
  ON public.onsen_facility_review_evidence (facility_slug, collected_on DESC);

CREATE INDEX IF NOT EXISTS idx_onsen_facility_review_evidence_readiness
  ON public.onsen_facility_review_evidence (collection_readiness, evidence_grade);

CREATE TABLE IF NOT EXISTS public.onsen_facility_review_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id UUID NOT NULL REFERENCES public.onsen_facility_review_evidence(id) ON DELETE CASCADE,
  facility_area TEXT NOT NULL
    CHECK (facility_area IN (
      'public_bath',
      'open_air_public_bath',
      'family_bath',
      'private_bath',
      'sand_bath',
      'steam_bath',
      'footbath',
      'drinking_spring',
      'inhalation',
      'sauna',
      'stone_sauna',
      'rest_area',
      'food_area',
      'food_steam',
      'overnight_rest',
      'route_or_pass',
      'area_cluster',
      'facility_wide',
      'unclear'
    )),
  facility_area_confidence TEXT NOT NULL
    CHECK (facility_area_confidence IN ('specific', 'probable', 'facility_wide', 'unclear')),
  signal_type TEXT NOT NULL
    CHECK (signal_type IN (
      'water_texture',
      'distinctive_spring_character',
      'chlorine_smell',
      'weak_onsen_feeling',
      'temperature_experience',
      'weather_season',
      'historic_bath_context',
      'bath_variety',
      'sand_or_steam_experience',
      'family_private_bath_experience',
      'crowding_or_wait',
      'reservation_or_queue_confusion',
      'cleanliness_amenities',
      'price_payment_value',
      'accessibility',
      'tourist_expectation_gap',
      'local_user_culture',
      'eligibility_or_use_scope',
      'operation_volatility'
    )),
  signal_direction TEXT NOT NULL
    CHECK (signal_direction IN ('positive', 'negative', 'mixed', 'neutral')),
  mention_count INTEGER NOT NULL CHECK (mention_count >= 0),
  source_count INTEGER NOT NULL CHECK (source_count >= 0),
  platform_count INTEGER NOT NULL CHECK (platform_count >= 0),
  contradiction_level TEXT NOT NULL DEFAULT 'not_assessed'
    CHECK (contradiction_level IN ('low', 'medium', 'high', 'not_assessed')),
  review_signal_status TEXT NOT NULL
    CHECK (review_signal_status IN ('strong_signal', 'moderate_signal', 'weak_signal', 'conflicting', 'insufficient')),
  evidence_summary TEXT,
  evidence_sources JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(evidence_sources) = 'array'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (source_count <= mention_count),
  CHECK (platform_count <= source_count)
);

CREATE INDEX IF NOT EXISTS idx_onsen_facility_review_signals_evidence
  ON public.onsen_facility_review_signals (evidence_id, facility_area, signal_type);

CREATE INDEX IF NOT EXISTS idx_onsen_facility_review_signals_type
  ON public.onsen_facility_review_signals (signal_type, review_signal_status);

ALTER TABLE public.onsen_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onsen_facility_water_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onsen_facility_review_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onsen_facility_review_signals ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.onsen_facilities, public.onsen_facility_water_facts,
  public.onsen_facility_review_evidence, public.onsen_facility_review_signals
  TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.onsen_facilities,
  public.onsen_facility_water_facts, public.onsen_facility_review_evidence,
  public.onsen_facility_review_signals
  TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'onsen_facilities'
      AND policyname = 'public can read active onsen facilities'
  ) THEN
    CREATE POLICY "public can read active onsen facilities"
      ON public.onsen_facilities
      FOR SELECT TO anon, authenticated
      USING (status = 'active');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'onsen_facilities'
      AND policyname = 'content admin can manage onsen facilities'
  ) THEN
    CREATE POLICY "content admin can manage onsen facilities"
      ON public.onsen_facilities
      FOR ALL TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'onsen_facility_water_facts'
      AND policyname = 'public can read active onsen facility water facts'
  ) THEN
    CREATE POLICY "public can read active onsen facility water facts"
      ON public.onsen_facility_water_facts
      FOR SELECT TO anon, authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.onsen_facilities facility
          WHERE facility.slug = facility_slug AND facility.status = 'active'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'onsen_facility_water_facts'
      AND policyname = 'content admin can manage onsen facility water facts'
  ) THEN
    CREATE POLICY "content admin can manage onsen facility water facts"
      ON public.onsen_facility_water_facts
      FOR ALL TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'onsen_facility_review_evidence'
      AND policyname = 'public can read active onsen facility review evidence'
  ) THEN
    CREATE POLICY "public can read active onsen facility review evidence"
      ON public.onsen_facility_review_evidence
      FOR SELECT TO anon, authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.onsen_facilities facility
          WHERE facility.slug = facility_slug AND facility.status = 'active'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'onsen_facility_review_evidence'
      AND policyname = 'content admin can manage onsen facility review evidence'
  ) THEN
    CREATE POLICY "content admin can manage onsen facility review evidence"
      ON public.onsen_facility_review_evidence
      FOR ALL TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'onsen_facility_review_signals'
      AND policyname = 'public can read active onsen facility review signals'
  ) THEN
    CREATE POLICY "public can read active onsen facility review signals"
      ON public.onsen_facility_review_signals
      FOR SELECT TO anon, authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.onsen_facility_review_evidence evidence
          JOIN public.onsen_facilities facility ON facility.slug = evidence.facility_slug
          WHERE evidence.id = evidence_id AND facility.status = 'active'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'onsen_facility_review_signals'
      AND policyname = 'content admin can manage onsen facility review signals'
  ) THEN
    CREATE POLICY "content admin can manage onsen facility review signals"
      ON public.onsen_facility_review_signals
      FOR ALL TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;
END
$$;

COMMENT ON TABLE public.onsen_facilities IS
  'Non-accommodation onsen facilities. Keep this model separate from onsen_accommodations.';

COMMENT ON TABLE public.onsen_facility_water_facts IS
  'Official water-operation facts only. Review signals cannot establish a water_system or method badge.';

COMMENT ON TABLE public.onsen_facility_review_evidence IS
  'Collection-level counts. Platform-visible counts and directly read counts remain separate.';

COMMENT ON TABLE public.onsen_facility_review_signals IS
  'Aggregated direct-review signals. Do not store snippets, AI summaries, or long review bodies.';
