GRANT SELECT ON archive_content TO anon;

DROP POLICY IF EXISTS "public can read published archive content" ON archive_content;

CREATE POLICY "public can read published archive content"
  ON archive_content
  FOR SELECT
  TO anon, authenticated
  USING (is_published = TRUE AND status = 'active');
