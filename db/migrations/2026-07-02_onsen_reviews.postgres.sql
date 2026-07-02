CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS onsen_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_slug TEXT NOT NULL,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  bath_type TEXT NOT NULL CHECK (bath_type IN ('room_bath', 'private_bath', 'public_bath', 'other')),
  water_feel TEXT NOT NULL CHECK (water_feel IN ('clear', 'soft', 'strong', 'unclear')),
  visit_season TEXT,
  body TEXT NOT NULL CHECK (length(btrim(body)) >= 12),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onsen_reviews_slug_status
  ON onsen_reviews (accommodation_slug, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_onsen_reviews_user_created
  ON onsen_reviews (user_id, created_at DESC);

ALTER TABLE onsen_reviews ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON onsen_reviews TO anon, authenticated;
GRANT INSERT ON onsen_reviews TO authenticated;
GRANT UPDATE (status, updated_at) ON onsen_reviews TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'onsen_reviews'
      AND policyname = 'anyone can read approved onsen reviews'
  ) THEN
    CREATE POLICY "anyone can read approved onsen reviews"
      ON onsen_reviews
      FOR SELECT
      TO anon, authenticated
      USING (status = 'approved');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'onsen_reviews'
      AND policyname = 'content admins can read onsen reviews'
  ) THEN
    CREATE POLICY "content admins can read onsen reviews"
      ON onsen_reviews
      FOR SELECT
      TO authenticated
      USING (is_content_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'onsen_reviews'
      AND policyname = 'users can create own onsen reviews'
  ) THEN
    CREATE POLICY "users can create own onsen reviews"
      ON onsen_reviews
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'onsen_reviews'
      AND policyname = 'content admins can update onsen reviews'
  ) THEN
    CREATE POLICY "content admins can update onsen reviews"
      ON onsen_reviews
      FOR UPDATE
      TO authenticated
      USING (is_content_admin())
      WITH CHECK (is_content_admin());
  END IF;
END
$$;
