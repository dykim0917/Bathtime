ALTER TABLE onsen_accommodations
  ADD COLUMN IF NOT EXISTS display_name_ko TEXT,
  ADD COLUMN IF NOT EXISTS name_ja TEXT,
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS name_romaji TEXT,
  ADD COLUMN IF NOT EXISTS aliases_ko TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS aliases_ja TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS aliases_en TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS name_verification_status TEXT NOT NULL DEFAULT 'needs_review'
    CHECK (name_verification_status IN ('verified', 'needs_review', 'conflicting')),
  ADD COLUMN IF NOT EXISTS name_source_note TEXT;

UPDATE onsen_accommodations
SET
  display_name_ko = COALESCE(display_name_ko, name),
  name_ja = COALESCE(name_ja, ja_name)
WHERE display_name_ko IS NULL
   OR name_ja IS NULL;

CREATE INDEX IF NOT EXISTS idx_onsen_accommodations_display_name_ko
  ON onsen_accommodations (display_name_ko);

CREATE INDEX IF NOT EXISTS idx_onsen_accommodations_name_verification_status
  ON onsen_accommodations (name_verification_status);
