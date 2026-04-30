GRANT INSERT ON audio_track TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'audio_track'
      AND policyname = 'content admin can insert audio track drafts'
  ) THEN
    CREATE POLICY "content admin can insert audio track drafts"
      ON audio_track
      FOR INSERT
      TO authenticated
      WITH CHECK (is_content_admin() AND status = 'draft');
  END IF;
END
$$;
