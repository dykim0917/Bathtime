GRANT UPDATE (status) ON audio_track TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'audio_track'
      AND policyname = 'content admin can update audio status'
  ) THEN
    CREATE POLICY "content admin can update audio status"
      ON audio_track
      FOR UPDATE
      TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;
END
$$;
