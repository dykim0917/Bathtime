GRANT INSERT ON trip_theme TO authenticated;
GRANT INSERT ON trip_intent TO authenticated;
GRANT INSERT ON trip_subprotocol TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'trip_theme'
      AND policyname = 'content admin can insert trip theme drafts'
  ) THEN
    CREATE POLICY "content admin can insert trip theme drafts"
      ON trip_theme
      FOR INSERT
      TO authenticated
      WITH CHECK (is_content_admin() AND status = 'draft');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'trip_intent'
      AND policyname = 'content admin can insert trip intent drafts'
  ) THEN
    CREATE POLICY "content admin can insert trip intent drafts"
      ON trip_intent
      FOR INSERT
      TO authenticated
      WITH CHECK (is_content_admin() AND status = 'draft');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'trip_subprotocol'
      AND policyname = 'content admin can insert trip subprotocol drafts'
  ) THEN
    CREATE POLICY "content admin can insert trip subprotocol drafts"
      ON trip_subprotocol
      FOR INSERT
      TO authenticated
      WITH CHECK (is_content_admin() AND status = 'draft');
  END IF;
END
$$;
