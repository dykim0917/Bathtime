INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bathtime-assets',
  'bathtime-assets',
  TRUE,
  4194304,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'public can read bathtime archive assets'
  ) THEN
    CREATE POLICY "public can read bathtime archive assets"
      ON storage.objects
      FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'bathtime-assets' AND name LIKE 'archive/%');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'content admin can upload bathtime archive assets'
  ) THEN
    CREATE POLICY "content admin can upload bathtime archive assets"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'bathtime-assets'
        AND name LIKE 'archive/%'
        AND is_content_admin()
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'content admin can update bathtime archive assets'
  ) THEN
    CREATE POLICY "content admin can update bathtime archive assets"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'bathtime-assets'
        AND name LIKE 'archive/%'
        AND is_content_admin()
      )
      WITH CHECK (
        bucket_id = 'bathtime-assets'
        AND name LIKE 'archive/%'
        AND is_content_admin()
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'content admin can delete bathtime archive assets'
  ) THEN
    CREATE POLICY "content admin can delete bathtime archive assets"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'bathtime-assets'
        AND name LIKE 'archive/%'
        AND is_content_admin()
      );
  END IF;
END
$$;
