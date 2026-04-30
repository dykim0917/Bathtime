GRANT INSERT ON canonical_product TO authenticated;
GRANT INSERT ON product_presentation TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'canonical_product'
      AND policyname = 'content admin can insert product drafts'
  ) THEN
    CREATE POLICY "content admin can insert product drafts"
      ON canonical_product
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
      AND tablename = 'product_presentation'
      AND policyname = 'content admin can insert product presentation drafts'
  ) THEN
    CREATE POLICY "content admin can insert product presentation drafts"
      ON product_presentation
      FOR INSERT
      TO authenticated
      WITH CHECK (is_content_admin() AND status = 'draft');
  END IF;
END
$$;
