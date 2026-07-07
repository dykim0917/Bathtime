CREATE OR REPLACE FUNCTION public.is_onsen_verdict_counts_valid(briefing JSONB, items JSONB)
RETURNS BOOLEAN
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT COALESCE(
    BOOL_AND(
      CASE
        WHEN jsonb_typeof(item -> 'counts') <> 'object' THEN FALSE
        WHEN NOT ((item -> 'counts' ->> 'mentions') ~ '^[0-9]+$') THEN FALSE
        WHEN NOT ((item -> 'counts' ->> 'negative') ~ '^[0-9]+$') THEN FALSE
        WHEN NOT ((item -> 'counts' ->> 'denominator') IN ('experiences_read', 'onsen_related')) THEN FALSE
        WHEN (item -> 'counts' ->> 'denominator') = 'experiences_read'
          AND NOT ((briefing ->> 'experiences_read') ~ '^[0-9]+$') THEN FALSE
        WHEN (item -> 'counts' ->> 'denominator') = 'onsen_related'
          AND NOT ((briefing ->> 'onsen_related') ~ '^[0-9]+$') THEN FALSE
        WHEN (item -> 'counts' ->> 'negative')::INTEGER > (item -> 'counts' ->> 'mentions')::INTEGER THEN FALSE
        WHEN (item -> 'counts' ->> 'denominator') = 'experiences_read'
          THEN (item -> 'counts' ->> 'mentions')::INTEGER <= (briefing ->> 'experiences_read')::INTEGER
        ELSE (item -> 'counts' ->> 'mentions')::INTEGER <= (briefing ->> 'onsen_related')::INTEGER
      END
    ),
    TRUE
  )
  FROM jsonb_array_elements(items) AS item;
$$;

ALTER TABLE public.onsen_verdicts
  ADD CONSTRAINT onsen_verdicts_published_counts_valid
  CHECK (status <> 'published' OR public.is_onsen_verdict_counts_valid(briefing, items));
