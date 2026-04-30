GRANT UPDATE (name_ko, brand, category, summary, last_verified_at) ON canonical_product TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'canonical_product'
      AND policyname = 'content admin can update product basics'
  ) THEN
    CREATE POLICY "content admin can update product basics"
      ON canonical_product
      FOR UPDATE
      TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;
END
$$;
