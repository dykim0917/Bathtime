GRANT UPDATE (
  title,
  subtitle,
  base_temp,
  color_hex,
  rec_scent,
  default_bath_type,
  recommended_environment,
  duration_minutes,
  lighting
) ON trip_theme TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'trip_theme'
      AND policyname = 'content admin can update trip basic fields'
  ) THEN
    CREATE POLICY "content admin can update trip basic fields"
      ON trip_theme
      FOR UPDATE
      TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;
END
$$;
