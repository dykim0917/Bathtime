ALTER TABLE submissions
  ALTER COLUMN user_id DROP NOT NULL;

GRANT INSERT ON submissions TO anon;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'submissions'
      AND policyname = 'anonymous users can create submissions'
  ) THEN
    CREATE POLICY "anonymous users can create submissions"
      ON submissions
      FOR INSERT
      TO anon
      WITH CHECK (user_id IS NULL);
  END IF;
END
$$;
