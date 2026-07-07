CREATE TABLE IF NOT EXISTS onsen_verdicts (
  id BIGSERIAL PRIMARY KEY,
  target_type TEXT NOT NULL DEFAULT 'accommodation'
    CHECK (target_type IN ('accommodation', 'facility')),
  target_slug TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'draft'
    CHECK (level IN ('full', 'lite', 'draft')),
  headline TEXT NOT NULL,
  briefing JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(briefing) = 'object'),
  items JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(items) = 'array'),
  fact_statuses JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(fact_statuses) = 'array'),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('published', 'draft', 'archived')),
  verified_at DATE,
  source_file TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status <> 'published' OR level <> 'draft'),
  CHECK (
    status <> 'published'
    OR (
      LENGTH(BTRIM(headline)) > 0
      AND briefing ? 'platforms'
      AND jsonb_typeof(briefing -> 'platforms') = 'array'
      AND jsonb_array_length(briefing -> 'platforms') >= 1
    )
  ),
  CHECK (status <> 'published' OR level <> 'full' OR jsonb_array_length(items) >= 3),
  CHECK (status <> 'published' OR level <> 'lite' OR jsonb_array_length(items) <= 2),
  UNIQUE (target_type, target_slug)
);

CREATE INDEX IF NOT EXISTS idx_onsen_verdicts_target
  ON onsen_verdicts (target_type, target_slug);

CREATE INDEX IF NOT EXISTS idx_onsen_verdicts_status
  ON onsen_verdicts (status);

CREATE INDEX IF NOT EXISTS idx_onsen_verdicts_level
  ON onsen_verdicts (level);

CREATE INDEX IF NOT EXISTS idx_onsen_verdicts_items_gin
  ON onsen_verdicts USING GIN (items);

ALTER TABLE onsen_verdicts ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON onsen_verdicts TO anon, authenticated;
GRANT SELECT, UPDATE, INSERT, DELETE ON onsen_verdicts TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE onsen_verdicts_id_seq TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'onsen_verdicts'
      AND policyname = 'public can read published onsen verdicts'
  ) THEN
    CREATE POLICY "public can read published onsen verdicts"
      ON onsen_verdicts
      FOR SELECT
      TO anon, authenticated
      USING (status = 'published');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'onsen_verdicts'
      AND policyname = 'content admin can read onsen verdicts'
  ) THEN
    CREATE POLICY "content admin can read onsen verdicts"
      ON onsen_verdicts
      FOR SELECT
      TO authenticated
      USING (is_content_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'onsen_verdicts'
      AND policyname = 'content admin can insert onsen verdicts'
  ) THEN
    CREATE POLICY "content admin can insert onsen verdicts"
      ON onsen_verdicts
      FOR INSERT
      TO authenticated
      WITH CHECK (is_content_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'onsen_verdicts'
      AND policyname = 'content admin can update onsen verdicts'
  ) THEN
    CREATE POLICY "content admin can update onsen verdicts"
      ON onsen_verdicts
      FOR UPDATE
      TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'onsen_verdicts'
      AND policyname = 'content admin can delete onsen verdicts'
  ) THEN
    CREATE POLICY "content admin can delete onsen verdicts"
      ON onsen_verdicts
      FOR DELETE
      TO authenticated
      USING (is_content_admin());
  END IF;
END
$$;
