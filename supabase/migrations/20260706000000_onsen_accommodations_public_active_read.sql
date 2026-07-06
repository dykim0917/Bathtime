GRANT SELECT ON onsen_accommodations TO anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'onsen_accommodations'
      AND policyname = 'public can read active onsen accommodations'
  ) THEN
    CREATE POLICY "public can read active onsen accommodations"
      ON onsen_accommodations
      FOR SELECT
      TO anon, authenticated
      USING (status = 'active');
  END IF;
END
$$;
