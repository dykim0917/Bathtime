GRANT UPDATE (status) ON trip_theme TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'trip_theme'
      AND policyname = 'content admin can update trip status'
  ) THEN
    CREATE POLICY "content admin can update trip status"
      ON trip_theme
      FOR UPDATE
      TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;
END
$$;
