GRANT UPDATE (status) ON care_intent TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'care_intent'
      AND policyname = 'content admin can update care status'
  ) THEN
    CREATE POLICY "content admin can update care status"
      ON care_intent
      FOR UPDATE
      TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;
END
$$;
