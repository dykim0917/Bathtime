CREATE TABLE IF NOT EXISTS public.onsen_public_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  handle TEXT NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  passport_is_public BOOLEAN NOT NULL DEFAULT FALSE,
  show_visit_month BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT onsen_public_profiles_handle_format_check
    CHECK (
      handle = lower(handle)
      AND handle ~ '^[a-z0-9][a-z0-9_-]{2,23}$'
      AND handle NOT IN ('admin', 'api', 'auth', 'bathtime', 'me', 'onsen', 'passport')
    ),
  CONSTRAINT onsen_public_profiles_display_name_check
    CHECK (display_name = btrim(display_name) AND length(display_name) BETWEEN 2 AND 24),
  CONSTRAINT onsen_public_profiles_bio_check
    CHECK (bio IS NULL OR length(btrim(bio)) BETWEEN 1 AND 160)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_onsen_public_profiles_handle_lower
  ON public.onsen_public_profiles (lower(handle));

ALTER TABLE public.onsen_reviews
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_onsen_reviews_public_target
  ON public.onsen_reviews (target_type, target_slug, created_at DESC)
  WHERE status = 'approved' AND is_public = TRUE;

CREATE INDEX IF NOT EXISTS idx_onsen_reviews_public_user
  ON public.onsen_reviews (user_id, visited_on DESC NULLS LAST, created_at DESC)
  WHERE status = 'approved' AND is_public = TRUE;

ALTER TABLE public.onsen_public_profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.onsen_public_profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.onsen_public_profiles TO authenticated;
GRANT SELECT ON public.onsen_reviews TO authenticated;
REVOKE SELECT ON public.onsen_reviews FROM anon;
GRANT UPDATE (is_public, updated_at) ON public.onsen_reviews TO authenticated;
REVOKE UPDATE (status) ON public.onsen_reviews FROM authenticated;

DROP POLICY IF EXISTS "anyone can read public onsen profiles" ON public.onsen_public_profiles;
CREATE POLICY "anyone can read public onsen profiles"
  ON public.onsen_public_profiles
  FOR SELECT
  TO anon, authenticated
  USING (passport_is_public = TRUE);

DROP POLICY IF EXISTS "users can read own onsen public profile" ON public.onsen_public_profiles;
CREATE POLICY "users can read own onsen public profile"
  ON public.onsen_public_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users can create own onsen public profile" ON public.onsen_public_profiles;
CREATE POLICY "users can create own onsen public profile"
  ON public.onsen_public_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users can update own onsen public profile" ON public.onsen_public_profiles;
CREATE POLICY "users can update own onsen public profile"
  ON public.onsen_public_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "anyone can read approved onsen reviews" ON public.onsen_reviews;

DROP POLICY IF EXISTS "users can create own onsen reviews" ON public.onsen_reviews;
CREATE POLICY "users can create own onsen reviews"
  ON public.onsen_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      is_public = FALSE
      OR EXISTS (
        SELECT 1
        FROM public.onsen_public_profiles profile
        WHERE profile.user_id = auth.uid()
          AND profile.passport_is_public = TRUE
      )
    )
  );

DROP POLICY IF EXISTS "users can update own onsen review visibility" ON public.onsen_reviews;
CREATE POLICY "users can update own onsen review visibility"
  ON public.onsen_reviews
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND (
      is_public = FALSE
      OR EXISTS (
        SELECT 1
        FROM public.onsen_public_profiles profile
        WHERE profile.user_id = auth.uid()
          AND profile.passport_is_public = TRUE
      )
    )
  );

CREATE OR REPLACE FUNCTION public.read_public_onsen_reviews(
  p_target_type TEXT DEFAULT NULL,
  p_target_slugs TEXT[] DEFAULT NULL,
  p_author_handle TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  target_type TEXT,
  target_slug TEXT,
  target_name TEXT,
  bath_type TEXT,
  bath_areas TEXT[],
  water_feel TEXT,
  water_texture TEXT[],
  water_color TEXT,
  temperature_experience TEXT,
  crowding_level TEXT,
  cleanliness_level TEXT,
  revisit_intent TEXT,
  visited_month DATE,
  visit_season TEXT,
  caution_text TEXT,
  body TEXT,
  author_handle TEXT,
  author_display_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    review.id,
    review.target_type,
    review.target_slug,
    review.target_name,
    review.bath_type,
    review.bath_areas,
    review.water_feel,
    review.water_texture,
    review.water_color,
    review.temperature_experience,
    review.crowding_level,
    review.cleanliness_level,
    review.revisit_intent,
    CASE
      WHEN profile.show_visit_month THEN date_trunc('month', review.visited_on)::DATE
      ELSE NULL::DATE
    END,
    review.visit_season,
    review.caution_text,
    review.body,
    profile.handle,
    profile.display_name,
    review.created_at
  FROM public.onsen_reviews review
  JOIN public.onsen_public_profiles profile
    ON profile.user_id = review.user_id
  WHERE review.status = 'approved'
    AND review.is_public = TRUE
    AND profile.passport_is_public = TRUE
    AND (p_target_type IS NULL OR review.target_type = p_target_type)
    AND (p_target_slugs IS NULL OR review.target_slug = ANY (p_target_slugs))
    AND (p_author_handle IS NULL OR profile.handle = lower(p_author_handle))
  ORDER BY review.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 100), 1), 200);
$$;

CREATE OR REPLACE FUNCTION public.read_public_onsen_review_counts(
  p_target_type TEXT DEFAULT NULL,
  p_target_slugs TEXT[] DEFAULT NULL
)
RETURNS TABLE (target_slug TEXT, review_count BIGINT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT review.target_slug, count(*)
  FROM public.onsen_reviews review
  JOIN public.onsen_public_profiles profile
    ON profile.user_id = review.user_id
  WHERE review.status = 'approved'
    AND review.is_public = TRUE
    AND profile.passport_is_public = TRUE
    AND (p_target_type IS NULL OR review.target_type = p_target_type)
    AND (p_target_slugs IS NULL OR review.target_slug = ANY (p_target_slugs))
  GROUP BY review.target_slug;
$$;

REVOKE ALL ON FUNCTION public.read_public_onsen_reviews(TEXT, TEXT[], TEXT, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.read_public_onsen_review_counts(TEXT, TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.read_public_onsen_reviews(TEXT, TEXT[], TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.read_public_onsen_review_counts(TEXT, TEXT[]) TO anon, authenticated;

COMMENT ON TABLE public.onsen_public_profiles IS
  'Opt-in public identity for Bathtime onsen passports. Google profile fields remain private in user_profiles.';
COMMENT ON COLUMN public.onsen_public_profiles.handle IS
  'User-chosen public URL handle. Never copied automatically from the authentication provider.';
COMMENT ON COLUMN public.onsen_reviews.is_public IS
  'Explicit review-level publication consent. Approved status alone does not make a first-party review public.';
COMMENT ON FUNCTION public.read_public_onsen_reviews(TEXT, TEXT[], TEXT, INTEGER) IS
  'Public-safe first-party review feed. Exact visit dates and authentication-provider identity fields are never returned.';
