CREATE OR REPLACE FUNCTION public.read_public_onsen_review_aggregate(
  p_target_type TEXT,
  p_target_slug TEXT
)
RETURNS TABLE (
  total_count BIGINT,
  calm_count BIGINT,
  clean_count BIGINT,
  revisit_positive_count BIGINT,
  revisit_response_count BIGINT,
  top_texture TEXT,
  top_texture_count BIGINT,
  top_temperature TEXT,
  top_temperature_count BIGINT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH filtered AS (
    SELECT
      review.water_texture,
      review.temperature_experience,
      review.crowding_level,
      review.cleanliness_level,
      review.revisit_intent
    FROM public.onsen_reviews review
    JOIN public.onsen_public_profiles profile
      ON profile.user_id = review.user_id
    WHERE review.status = 'approved'
      AND review.is_public = TRUE
      AND profile.passport_is_public = TRUE
      AND review.target_type = p_target_type
      AND review.target_slug = p_target_slug
  ),
  texture_counts AS (
    SELECT texture.value, count(*) AS mention_count
    FROM filtered
    CROSS JOIN LATERAL unnest(filtered.water_texture) AS texture(value)
    WHERE texture.value <> 'unclear'
    GROUP BY texture.value
  ),
  temperature_counts AS (
    SELECT filtered.temperature_experience AS value, count(*) AS mention_count
    FROM filtered
    WHERE filtered.temperature_experience <> 'unclear'
    GROUP BY filtered.temperature_experience
  )
  SELECT
    count(*),
    count(*) FILTER (WHERE filtered.crowding_level IN ('quiet', 'comfortable')),
    count(*) FILTER (WHERE filtered.cleanliness_level = 'good'),
    count(*) FILTER (WHERE filtered.revisit_intent IN ('yes', 'maybe')),
    count(*) FILTER (WHERE filtered.revisit_intent <> 'unsure'),
    (SELECT value FROM texture_counts ORDER BY mention_count DESC, value ASC LIMIT 1),
    COALESCE((SELECT mention_count FROM texture_counts ORDER BY mention_count DESC, value ASC LIMIT 1), 0),
    (SELECT value FROM temperature_counts ORDER BY mention_count DESC, value ASC LIMIT 1),
    COALESCE((SELECT mention_count FROM temperature_counts ORDER BY mention_count DESC, value ASC LIMIT 1), 0)
  FROM filtered;
$$;

REVOKE ALL ON FUNCTION public.read_public_onsen_review_aggregate(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.read_public_onsen_review_aggregate(TEXT, TEXT) TO anon, authenticated;

COMMENT ON FUNCTION public.read_public_onsen_review_aggregate(TEXT, TEXT) IS
  'Aggregate first-party public review signals for one accommodation or facility without exposing individual private review data.';
