ALTER TABLE archive_content ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON archive_content TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'archive_content'
      AND policyname = 'content admin can read archive content'
  ) THEN
    CREATE POLICY "content admin can read archive content"
      ON archive_content
      FOR SELECT
      TO authenticated
      USING (is_content_admin());
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'archive_content'
      AND policyname = 'content admin can insert archive content'
  ) THEN
    CREATE POLICY "content admin can insert archive content"
      ON archive_content
      FOR INSERT
      TO authenticated
      WITH CHECK (is_content_admin());
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'archive_content'
      AND policyname = 'content admin can update archive content'
  ) THEN
    CREATE POLICY "content admin can update archive content"
      ON archive_content
      FOR UPDATE
      TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;
END
$$;
