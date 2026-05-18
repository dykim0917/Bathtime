CREATE TABLE IF NOT EXISTS archive_content (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  summary TEXT NOT NULL,
  category TEXT NOT NULL,
  content_type TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  hero_image JSONB,
  body JSONB NOT NULL DEFAULT '[]'::jsonb,
  structured_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  related_routine_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_item_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_place_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft',
  content_created_at DATE NOT NULL,
  content_updated_at DATE NOT NULL,
  source_canonical JSONB,
  quality JSONB,
  audit JSONB,
  web_content_plan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_archive_content_status
  ON archive_content (status);

CREATE INDEX IF NOT EXISTS idx_archive_content_category_status
  ON archive_content (category, status);

CREATE INDEX IF NOT EXISTS idx_archive_content_tags_gin
  ON archive_content USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_archive_content_body_gin
  ON archive_content USING GIN (body);
