GRANT UPDATE (
  mapped_mode,
  allowed_environments,
  copy_title,
  default_subprotocol_id
) ON care_intent TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'care_intent'
      AND policyname = 'content admin can update care basic fields'
  ) THEN
    CREATE POLICY "content admin can update care basic fields"
      ON care_intent
      FOR UPDATE
      TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;
END
$$;
