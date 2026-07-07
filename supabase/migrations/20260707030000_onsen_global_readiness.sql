ALTER TABLE public.onsen_verdicts
  ADD COLUMN IF NOT EXISTS localized_copy JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.onsen_accommodations
  ADD COLUMN IF NOT EXISTS global_travel_facts JSONB NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'onsen_verdicts_localized_copy_object'
  ) THEN
    ALTER TABLE public.onsen_verdicts
      ADD CONSTRAINT onsen_verdicts_localized_copy_object
      CHECK (jsonb_typeof(localized_copy) = 'object');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'onsen_accommodations_global_travel_facts_object'
  ) THEN
    ALTER TABLE public.onsen_accommodations
      ADD CONSTRAINT onsen_accommodations_global_travel_facts_object
      CHECK (jsonb_typeof(global_travel_facts) = 'object');
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_onsen_verdicts_localized_copy_gin
  ON public.onsen_verdicts USING GIN (localized_copy);

CREATE INDEX IF NOT EXISTS idx_onsen_accommodations_global_travel_facts_gin
  ON public.onsen_accommodations USING GIN (global_travel_facts);

COMMENT ON COLUMN public.onsen_verdicts.localized_copy IS
  'Optional language or market-specific verdict copy keyed by locale, e.g. {"ko": {...}, "en": {...}}. Canonical counts and fact structure remain language-neutral.';

COMMENT ON COLUMN public.onsen_accommodations.global_travel_facts IS
  'Optional international traveler facts such as tattoo_policy, gender_policy, english_support, and couple_private_bath. Values should carry status/source metadata, not raw review text.';
