CREATE TABLE IF NOT EXISTS admin_user_allowlist (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE admin_user_allowlist ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_content_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_user_allowlist
    WHERE lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

GRANT EXECUTE ON FUNCTION is_content_admin() TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_user_allowlist'
      AND policyname = 'content admin can read self allowlist row'
  ) THEN
    CREATE POLICY "content admin can read self allowlist row"
      ON admin_user_allowlist
      FOR SELECT
      TO authenticated
      USING (lower(email) = lower(auth.jwt() ->> 'email'));
  END IF;
END
$$;

ALTER TABLE canonical_product ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_market_listing ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_match_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_presentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_intent ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_subprotocol ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_track ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_theme ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_intent ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_subprotocol ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON
  canonical_product,
  product_market_listing,
  product_match_rule,
  product_presentation,
  care_intent,
  care_subprotocol,
  audio_track,
  trip_theme,
  trip_intent,
  trip_subprotocol
TO authenticated;

GRANT UPDATE (status) ON canonical_product TO authenticated;

DO $$
DECLARE
  content_table TEXT;
BEGIN
  FOREACH content_table IN ARRAY ARRAY[
    'canonical_product',
    'product_market_listing',
    'product_match_rule',
    'product_presentation',
    'care_intent',
    'care_subprotocol',
    'audio_track',
    'trip_theme',
    'trip_intent',
    'trip_subprotocol'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = content_table
        AND policyname = 'content admin can read'
    ) THEN
      EXECUTE format(
        'CREATE POLICY "content admin can read" ON %I FOR SELECT TO authenticated USING (is_content_admin())',
        content_table
      );
    END IF;
  END LOOP;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'canonical_product'
      AND policyname = 'content admin can update product status'
  ) THEN
    CREATE POLICY "content admin can update product status"
      ON canonical_product
      FOR UPDATE
      TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;
END
$$;
