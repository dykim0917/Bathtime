CREATE OR REPLACE FUNCTION public.can_publish_onsen_review()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.onsen_public_profiles profile
    WHERE profile.user_id = auth.uid()
      AND profile.passport_is_public = TRUE
  );
$$;

REVOKE ALL ON FUNCTION public.can_publish_onsen_review() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_publish_onsen_review() TO authenticated;

REVOKE INSERT ON public.onsen_reviews FROM authenticated;
GRANT INSERT (
  accommodation_slug,
  target_type,
  target_slug,
  target_name,
  bath_type,
  bath_areas,
  water_feel,
  water_texture,
  water_color,
  temperature_experience,
  crowding_level,
  cleanliness_level,
  revisit_intent,
  visited_on,
  visit_season,
  caution_text,
  body,
  is_public
) ON public.onsen_reviews TO authenticated;

DROP POLICY IF EXISTS "users can create own onsen reviews" ON public.onsen_reviews;
CREATE POLICY "users can create own onsen reviews"
  ON public.onsen_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND visit_verification_status = 'self_reported'
    AND evidence_origin = 'first_party'
    AND (
      is_public = FALSE
      OR public.can_publish_onsen_review()
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
      OR public.can_publish_onsen_review()
    )
  );

REVOKE SELECT ON public.onsen_public_profiles FROM anon, authenticated;
GRANT SELECT (
  handle,
  display_name,
  bio,
  passport_is_public,
  show_visit_month,
  created_at,
  updated_at
) ON public.onsen_public_profiles TO anon, authenticated;

REVOKE INSERT, UPDATE ON public.onsen_public_profiles FROM authenticated;

CREATE OR REPLACE FUNCTION public.guard_onsen_review_moderation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
    AND current_user NOT IN ('postgres', 'service_role', 'supabase_admin')
    AND NOT public.is_content_admin()
  THEN
    RAISE EXCEPTION 'Only content admins can moderate onsen reviews' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_onsen_review_moderation() FROM PUBLIC;

DROP TRIGGER IF EXISTS guard_onsen_review_moderation ON public.onsen_reviews;
CREATE TRIGGER guard_onsen_review_moderation
  BEFORE UPDATE OF status ON public.onsen_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_onsen_review_moderation();

GRANT UPDATE (status, updated_at) ON public.onsen_reviews TO authenticated;

CREATE OR REPLACE FUNCTION public.read_my_onsen_public_profile()
RETURNS TABLE (
  handle TEXT,
  display_name TEXT,
  bio TEXT,
  passport_is_public BOOLEAN,
  show_visit_month BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    profile.handle,
    profile.display_name,
    profile.bio,
    profile.passport_is_public,
    profile.show_visit_month,
    profile.created_at,
    profile.updated_at
  FROM public.onsen_public_profiles profile
  WHERE profile.user_id = auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.read_my_onsen_public_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.read_my_onsen_public_profile() TO authenticated;

CREATE OR REPLACE FUNCTION public.upsert_my_onsen_public_profile(
  p_handle TEXT,
  p_display_name TEXT,
  p_bio TEXT,
  p_passport_is_public BOOLEAN,
  p_show_visit_month BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.onsen_public_profiles (
    user_id,
    handle,
    display_name,
    bio,
    passport_is_public,
    show_visit_month,
    updated_at
  ) VALUES (
    current_user_id,
    lower(btrim(p_handle)),
    btrim(p_display_name),
    NULLIF(btrim(p_bio), ''),
    COALESCE(p_passport_is_public, FALSE),
    COALESCE(p_show_visit_month, TRUE),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    handle = EXCLUDED.handle,
    display_name = EXCLUDED.display_name,
    bio = EXCLUDED.bio,
    passport_is_public = EXCLUDED.passport_is_public,
    show_visit_month = EXCLUDED.show_visit_month,
    updated_at = NOW();
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_my_onsen_public_profile(TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_my_onsen_public_profile(TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN) TO authenticated;

COMMENT ON FUNCTION public.read_my_onsen_public_profile() IS
  'Return the signed-in user public passport settings without exposing authentication user IDs through the public profile table.';
COMMENT ON FUNCTION public.upsert_my_onsen_public_profile(TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN) IS
  'Create or update only the signed-in user public passport settings without granting direct table writes.';
COMMENT ON FUNCTION public.can_publish_onsen_review() IS
  'Check review publication eligibility without exposing public-profile authentication IDs to the caller.';
COMMENT ON FUNCTION public.guard_onsen_review_moderation() IS
  'Preserve direct moderation for allowlisted content admins while blocking review authors from changing their own approval status.';
