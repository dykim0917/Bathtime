CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS content_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  visitor_key TEXT,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('helpful', 'needs_improvement')),
  reason TEXT CHECK (
    reason IS NULL OR reason IN (
      'missing_info',
      'needs_images',
      'conditions_unclear',
      'needs_more_candidates',
      'tone_unclear',
      'other'
    )
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_feedback_content_created
  ON content_feedback (content_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_feedback_content_type
  ON content_feedback (content_id, feedback_type);

CREATE INDEX IF NOT EXISTS idx_content_feedback_user_created
  ON content_feedback (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

ALTER TABLE content_feedback ENABLE ROW LEVEL SECURITY;

GRANT INSERT, DELETE ON content_feedback TO anon, authenticated;
GRANT SELECT ON content_feedback TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'content_feedback'
      AND policyname = 'anyone can create content feedback'
  ) THEN
    CREATE POLICY "anyone can create content feedback"
      ON content_feedback
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (user_id IS NULL OR user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'content_feedback'
      AND policyname = 'visitors can delete content feedback'
  ) THEN
    CREATE POLICY "visitors can delete content feedback"
      ON content_feedback
      FOR DELETE
      TO anon, authenticated
      USING (visitor_key IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'content_feedback'
      AND policyname = 'content admins can read content feedback'
  ) THEN
    CREATE POLICY "content admins can read content feedback"
      ON content_feedback
      FOR SELECT
      TO authenticated
      USING (is_content_admin());
  END IF;
END
$$;
