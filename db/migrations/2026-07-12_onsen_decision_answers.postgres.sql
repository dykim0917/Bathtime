CREATE TABLE IF NOT EXISTS public.onsen_decision_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL
    CHECK (target_type IN ('accommodation', 'facility')),
  target_slug TEXT NOT NULL,
  journey TEXT NOT NULL,
  question_code TEXT NOT NULL
    CHECK (question_code IN (
      'together_private_eligibility',
      'bath_layout_scope',
      'private_bath_booking_flow',
      'private_bath_terms_limits',
      'day_use_operation',
      'bath_experience_richness',
      'water_operation_method'
    )),
  question_ko TEXT NOT NULL,
  answer_status TEXT NOT NULL
    CHECK (answer_status IN ('verified', 'conditional', 'needs_check')),
  applicability TEXT NOT NULL DEFAULT 'applicable'
    CHECK (applicability IN ('applicable', 'not_applicable')),
  answer_ko TEXT NOT NULL,
  check_what TEXT,
  official_source_url TEXT,
  official_source_checked_at DATE,
  target_readiness TEXT NOT NULL DEFAULT 'conditional'
    CHECK (target_readiness IN ('ready', 'conditional', 'hold')),
  source_file TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (target_type, target_slug, question_code),
  CHECK (LENGTH(BTRIM(journey)) > 0),
  CHECK (LENGTH(BTRIM(question_ko)) > 0),
  CHECK (LENGTH(BTRIM(answer_ko)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_onsen_decision_answers_target
  ON public.onsen_decision_answers (target_type, target_slug);

CREATE INDEX IF NOT EXISTS idx_onsen_decision_answers_readiness
  ON public.onsen_decision_answers (target_readiness, answer_status);

ALTER TABLE public.onsen_decision_answers ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.onsen_decision_answers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.onsen_decision_answers TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'onsen_decision_answers'
      AND policyname = 'public can read active onsen decision answers'
  ) THEN
    CREATE POLICY "public can read active onsen decision answers"
      ON public.onsen_decision_answers
      FOR SELECT TO anon, authenticated
      USING (
        (
          target_type = 'accommodation'
          AND EXISTS (
            SELECT 1 FROM public.onsen_accommodations
            WHERE slug = target_slug AND status = 'active'
          )
        )
        OR
        (
          target_type = 'facility'
          AND EXISTS (
            SELECT 1 FROM public.onsen_facilities
            WHERE slug = target_slug AND status = 'active'
          )
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'onsen_decision_answers'
      AND policyname = 'content admin can manage onsen decision answers'
  ) THEN
    CREATE POLICY "content admin can manage onsen decision answers"
      ON public.onsen_decision_answers
      FOR ALL TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;
END
$$;

COMMENT ON TABLE public.onsen_decision_answers IS
  'Officially sourced answers to Bathtime decision questions. Review signals and first-party reviews must not be used as official answers.';
