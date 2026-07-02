CREATE TABLE IF NOT EXISTS onsen_accommodations (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ja_name TEXT,
  region TEXT NOT NULL,
  area TEXT,
  summary TEXT NOT NULL,
  primary_bath TEXT,
  water_use_status TEXT NOT NULL DEFAULT 'unclear'
    CHECK (water_use_status IN ('official_confirmed', 'review_supported', 'needs_official_check', 'unclear')),
  water_source_type TEXT NOT NULL DEFAULT 'needs_check'
    CHECK (water_source_type IN ('natural_100', 'free_flowing_source', 'hot_spring_confirmed', 'needs_check')),
  bath_scope TEXT NOT NULL DEFAULT 'unclear'
    CHECK (bath_scope IN ('all_rooms', 'some_rooms', 'room_signal_only', 'public_bath_only', 'unclear')),
  operation_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
  evidence_grade TEXT NOT NULL DEFAULT 'D'
    CHECK (evidence_grade IN ('A', 'B', 'C', 'D')),
  evidence_note TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('active', 'draft', 'paused', 'retired')),
  source_file TEXT,
  content_updated_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onsen_accommodations_region
  ON onsen_accommodations (region);

CREATE INDEX IF NOT EXISTS idx_onsen_accommodations_status
  ON onsen_accommodations (status);

CREATE INDEX IF NOT EXISTS idx_onsen_accommodations_water_use_status
  ON onsen_accommodations (water_use_status);

CREATE INDEX IF NOT EXISTS idx_onsen_accommodations_bath_scope
  ON onsen_accommodations (bath_scope);

CREATE INDEX IF NOT EXISTS idx_onsen_accommodations_evidence_counts_gin
  ON onsen_accommodations USING GIN (evidence_counts);

ALTER TABLE onsen_accommodations ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE, INSERT ON onsen_accommodations TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'onsen_accommodations'
      AND policyname = 'content admin can read onsen accommodations'
  ) THEN
    CREATE POLICY "content admin can read onsen accommodations"
      ON onsen_accommodations
      FOR SELECT
      TO authenticated
      USING (is_content_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'onsen_accommodations'
      AND policyname = 'content admin can insert onsen accommodations'
  ) THEN
    CREATE POLICY "content admin can insert onsen accommodations"
      ON onsen_accommodations
      FOR INSERT
      TO authenticated
      WITH CHECK (is_content_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'onsen_accommodations'
      AND policyname = 'content admin can update onsen accommodations'
  ) THEN
    CREATE POLICY "content admin can update onsen accommodations"
      ON onsen_accommodations
      FOR UPDATE
      TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;
END
$$;
