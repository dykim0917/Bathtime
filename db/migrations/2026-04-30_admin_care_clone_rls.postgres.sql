GRANT INSERT ON care_intent TO authenticated;
GRANT INSERT ON care_subprotocol TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'care_intent'
      AND policyname = 'content admin can insert care intent drafts'
  ) THEN
    CREATE POLICY "content admin can insert care intent drafts"
      ON care_intent
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
      AND tablename = 'care_subprotocol'
      AND policyname = 'content admin can insert care subprotocol drafts'
  ) THEN
    CREATE POLICY "content admin can insert care subprotocol drafts"
      ON care_subprotocol
      FOR INSERT
      TO authenticated
      WITH CHECK (is_content_admin() AND status = 'draft');
  END IF;
END
$$;
