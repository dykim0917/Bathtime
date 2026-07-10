ALTER TABLE public.onsen_reviews
  DROP CONSTRAINT IF EXISTS onsen_reviews_bath_areas_semantics_check,
  ADD CONSTRAINT onsen_reviews_bath_areas_semantics_check
    CHECK (
      NOT ('other' = ANY (bath_areas) AND cardinality(bath_areas) > 1)
      AND NOT (target_type = 'facility' AND 'room_bath' = ANY (bath_areas))
    ),
  DROP CONSTRAINT IF EXISTS onsen_reviews_water_texture_semantics_check,
  ADD CONSTRAINT onsen_reviews_water_texture_semantics_check
    CHECK (
      cardinality(water_texture) <= 2
      AND NOT ('unclear' = ANY (water_texture) AND cardinality(water_texture) > 1)
    );

COMMENT ON CONSTRAINT onsen_reviews_bath_areas_semantics_check ON public.onsen_reviews IS
  'Other is exclusive, and non-accommodation facilities cannot claim a room bath.';
COMMENT ON CONSTRAINT onsen_reviews_water_texture_semantics_check ON public.onsen_reviews IS
  'Water texture records accept at most two concrete impressions, or unclear by itself.';
