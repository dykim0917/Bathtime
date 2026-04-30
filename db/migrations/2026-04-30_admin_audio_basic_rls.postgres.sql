GRANT UPDATE (
  title,
  filename,
  remote_url,
  duration_seconds,
  persona_codes,
  license_note
) ON audio_track TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'audio_track'
      AND policyname = 'content admin can update audio basic fields'
  ) THEN
    CREATE POLICY "content admin can update audio basic fields"
      ON audio_track
      FOR UPDATE
      TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;
END
$$;
