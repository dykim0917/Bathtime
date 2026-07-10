ALTER TABLE public.onsen_reviews
  ADD COLUMN IF NOT EXISTS target_type TEXT NOT NULL DEFAULT 'accommodation',
  ADD COLUMN IF NOT EXISTS target_slug TEXT,
  ADD COLUMN IF NOT EXISTS target_name TEXT,
  ADD COLUMN IF NOT EXISTS evidence_origin TEXT NOT NULL DEFAULT 'first_party',
  ADD COLUMN IF NOT EXISTS bath_areas TEXT[] NOT NULL DEFAULT ARRAY['other']::TEXT[],
  ADD COLUMN IF NOT EXISTS visited_on DATE,
  ADD COLUMN IF NOT EXISTS water_texture TEXT[] NOT NULL DEFAULT ARRAY['unclear']::TEXT[],
  ADD COLUMN IF NOT EXISTS water_color TEXT NOT NULL DEFAULT 'unclear',
  ADD COLUMN IF NOT EXISTS temperature_experience TEXT NOT NULL DEFAULT 'unclear',
  ADD COLUMN IF NOT EXISTS crowding_level TEXT NOT NULL DEFAULT 'unclear',
  ADD COLUMN IF NOT EXISTS cleanliness_level TEXT NOT NULL DEFAULT 'unclear',
  ADD COLUMN IF NOT EXISTS revisit_intent TEXT NOT NULL DEFAULT 'unsure',
  ADD COLUMN IF NOT EXISTS caution_text TEXT,
  ADD COLUMN IF NOT EXISTS visit_verification_status TEXT NOT NULL DEFAULT 'self_reported';

UPDATE public.onsen_reviews
SET
  target_slug = COALESCE(target_slug, accommodation_slug),
  bath_areas = CASE bath_type
    WHEN 'room_bath' THEN ARRAY['room_bath']::TEXT[]
    WHEN 'private_bath' THEN ARRAY['private_bath']::TEXT[]
    WHEN 'public_bath' THEN ARRAY['public_bath']::TEXT[]
    ELSE ARRAY['other']::TEXT[]
  END,
  water_texture = CASE water_feel
    WHEN 'soft' THEN ARRAY['soft']::TEXT[]
    WHEN 'strong' THEN ARRAY['distinctive']::TEXT[]
    WHEN 'clear' THEN ARRAY['neutral']::TEXT[]
    ELSE ARRAY['unclear']::TEXT[]
  END
WHERE target_slug IS NULL
   OR bath_areas = ARRAY['other']::TEXT[]
   OR water_texture = ARRAY['unclear']::TEXT[];

ALTER TABLE public.onsen_reviews
  ALTER COLUMN target_slug SET NOT NULL,
  ALTER COLUMN accommodation_slug DROP NOT NULL,
  DROP CONSTRAINT IF EXISTS onsen_reviews_bath_type_check,
  ADD CONSTRAINT onsen_reviews_bath_type_check
    CHECK (bath_type IN ('room_bath', 'private_bath', 'public_bath', 'open_air_public_bath', 'family_bath', 'sand_bath', 'steam_bath', 'sauna', 'stone_sauna', 'other')),
  ADD CONSTRAINT onsen_reviews_target_type_check
    CHECK (target_type IN ('accommodation', 'facility')),
  ADD CONSTRAINT onsen_reviews_evidence_origin_check
    CHECK (evidence_origin = 'first_party'),
  ADD CONSTRAINT onsen_reviews_bath_areas_check
    CHECK (
      cardinality(bath_areas) > 0
      AND bath_areas <@ ARRAY[
        'room_bath', 'private_bath', 'public_bath', 'open_air_public_bath', 'family_bath',
        'sand_bath', 'steam_bath', 'sauna', 'stone_sauna', 'other'
      ]::TEXT[]
    ),
  ADD CONSTRAINT onsen_reviews_water_texture_check
    CHECK (
      cardinality(water_texture) > 0
      AND water_texture <@ ARRAY['slippery', 'soft', 'distinctive', 'neutral', 'dry', 'unclear']::TEXT[]
    ),
  ADD CONSTRAINT onsen_reviews_water_color_check
    CHECK (water_color IN ('clear', 'white', 'brown', 'green', 'other', 'unclear')),
  ADD CONSTRAINT onsen_reviews_temperature_experience_check
    CHECK (temperature_experience IN ('cool', 'lukewarm', 'comfortable', 'hot', 'mixed', 'unclear')),
  ADD CONSTRAINT onsen_reviews_crowding_level_check
    CHECK (crowding_level IN ('quiet', 'comfortable', 'busy', 'packed', 'unclear')),
  ADD CONSTRAINT onsen_reviews_cleanliness_level_check
    CHECK (cleanliness_level IN ('good', 'neutral', 'concern', 'unclear')),
  ADD CONSTRAINT onsen_reviews_revisit_intent_check
    CHECK (revisit_intent IN ('yes', 'maybe', 'no', 'unsure')),
  ADD CONSTRAINT onsen_reviews_visit_verification_status_check
    CHECK (visit_verification_status IN ('self_reported', 'verified', 'rejected')),
  ADD CONSTRAINT onsen_reviews_caution_text_length_check
    CHECK (caution_text IS NULL OR length(btrim(caution_text)) BETWEEN 2 AND 300),
  ADD CONSTRAINT onsen_reviews_target_legacy_alignment_check
    CHECK (
      (target_type = 'accommodation' AND accommodation_slug = target_slug)
      OR (target_type = 'facility' AND accommodation_slug IS NULL)
    );

CREATE INDEX IF NOT EXISTS idx_onsen_reviews_target_status
  ON public.onsen_reviews (target_type, target_slug, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_onsen_reviews_user_passport
  ON public.onsen_reviews (user_id, visited_on DESC NULLS LAST, created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'onsen_reviews'
      AND policyname = 'users can read own onsen reviews'
  ) THEN
    CREATE POLICY "users can read own onsen reviews"
      ON public.onsen_reviews
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END
$$;

COMMENT ON TABLE public.onsen_reviews IS
  'First-party Bathtime visit reviews. Keep these counts separate from external visible review pools and directly read external review evidence.';

COMMENT ON COLUMN public.onsen_reviews.target_type IS
  'Polymorphic review target. Accommodation and non-accommodation facility records remain separate.';
COMMENT ON COLUMN public.onsen_reviews.evidence_origin IS
  'Always first_party. This table must never be used as an external directly-read review denominator.';
COMMENT ON COLUMN public.onsen_reviews.visit_verification_status IS
  'Self-reported by default. Verified status is reserved for a later receipt, booking, or location verification flow.';
