GRANT SELECT ON archive_content TO anon;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'archive_content'
      AND policyname = 'public can read published archive content'
  ) THEN
    CREATE POLICY "public can read published archive content"
      ON archive_content
      FOR SELECT
      TO anon, authenticated
      USING (is_published = TRUE AND status = 'active');
  END IF;
END
$$;
