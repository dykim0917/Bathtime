CREATE OR REPLACE FUNCTION public.read_public_onsen_reviews_page(
  p_target_type TEXT,
  p_target_slug TEXT,
  p_sort TEXT DEFAULT 'latest',
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
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
    AND review.target_type = p_target_type
    AND review.target_slug = p_target_slug
  ORDER BY
    CASE
      WHEN p_sort = 'visit' AND profile.show_visit_month
        THEN date_trunc('month', review.visited_on)::DATE
      ELSE NULL::DATE
    END DESC NULLS LAST,
    review.created_at DESC,
    review.id DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 10), 1), 50)
  OFFSET LEAST(GREATEST(COALESCE(p_offset, 0), 0), 10000);
$$;

REVOKE ALL ON FUNCTION public.read_public_onsen_reviews_page(TEXT, TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.read_public_onsen_reviews_page(TEXT, TEXT, TEXT, INTEGER, INTEGER) TO anon, authenticated;

COMMENT ON FUNCTION public.read_public_onsen_reviews_page(TEXT, TEXT, TEXT, INTEGER, INTEGER) IS
  'Paginated public-safe first-party review feed for one accommodation or facility. Exact visit dates are never returned.';
