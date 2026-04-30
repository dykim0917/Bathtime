GRANT UPDATE (tags, emoji, bg_color, safety_flags) ON product_presentation TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'product_presentation'
      AND policyname = 'content admin can update product presentation'
  ) THEN
    CREATE POLICY "content admin can update product presentation"
      ON product_presentation
      FOR UPDATE
      TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;
END
$$;
