CREATE TABLE IF NOT EXISTS product_presentation (
  canonical_product_id TEXT PRIMARY KEY REFERENCES canonical_product(id) ON DELETE CASCADE,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  emoji TEXT NOT NULL,
  bg_color TEXT NOT NULL,
  safety_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS care_intent (
  id TEXT PRIMARY KEY,
  intent_id TEXT NOT NULL UNIQUE,
  mapped_mode TEXT NOT NULL,
  allowed_environments JSONB NOT NULL DEFAULT '[]'::jsonb,
  copy_title TEXT NOT NULL,
  copy_subtitle_by_environment JSONB NOT NULL DEFAULT '{}'::jsonb,
  default_subprotocol_id TEXT NOT NULL,
  card_position INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS care_subprotocol (
  id TEXT PRIMARY KEY,
  intent_id TEXT NOT NULL REFERENCES care_intent(intent_id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  hint TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  partial_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audio_track (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  filename TEXT,
  remote_url TEXT,
  duration_seconds INTEGER NOT NULL,
  persona_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
  license_note TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trip_theme (
  id TEXT PRIMARY KEY,
  cover_style_id TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  base_temp INTEGER NOT NULL,
  color_hex TEXT NOT NULL,
  rec_scent TEXT NOT NULL,
  music_id TEXT NOT NULL REFERENCES audio_track(id),
  ambience_id TEXT NOT NULL REFERENCES audio_track(id),
  default_bath_type TEXT NOT NULL,
  recommended_environment TEXT NOT NULL,
  duration_minutes INTEGER,
  lighting TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trip_intent (
  id TEXT PRIMARY KEY,
  intent_id TEXT NOT NULL UNIQUE REFERENCES trip_theme(id) ON DELETE CASCADE,
  mapped_mode TEXT NOT NULL,
  allowed_environments JSONB NOT NULL DEFAULT '[]'::jsonb,
  copy_title TEXT NOT NULL,
  copy_subtitle_by_environment JSONB NOT NULL DEFAULT '{}'::jsonb,
  default_subprotocol_id TEXT NOT NULL,
  card_position INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trip_subprotocol (
  id TEXT PRIMARY KEY,
  intent_id TEXT NOT NULL REFERENCES trip_intent(intent_id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  hint TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  partial_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_presentation_status
  ON product_presentation (status);

CREATE INDEX IF NOT EXISTS idx_care_intent_status
  ON care_intent (status);

CREATE INDEX IF NOT EXISTS idx_care_intent_card_position
  ON care_intent (card_position);

CREATE INDEX IF NOT EXISTS idx_care_subprotocol_intent_id
  ON care_subprotocol (intent_id);

CREATE INDEX IF NOT EXISTS idx_care_subprotocol_status
  ON care_subprotocol (status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_care_subprotocol_one_default
  ON care_subprotocol (intent_id)
  WHERE is_default = TRUE AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_audio_track_type_status
  ON audio_track (type, status);

CREATE INDEX IF NOT EXISTS idx_audio_track_persona_codes_gin
  ON audio_track USING GIN (persona_codes);

CREATE INDEX IF NOT EXISTS idx_trip_theme_status
  ON trip_theme (status);

CREATE INDEX IF NOT EXISTS idx_trip_theme_music_id
  ON trip_theme (music_id);

CREATE INDEX IF NOT EXISTS idx_trip_theme_ambience_id
  ON trip_theme (ambience_id);

CREATE INDEX IF NOT EXISTS idx_trip_intent_status
  ON trip_intent (status);

CREATE INDEX IF NOT EXISTS idx_trip_intent_card_position
  ON trip_intent (card_position);

CREATE INDEX IF NOT EXISTS idx_trip_subprotocol_intent_id
  ON trip_subprotocol (intent_id);

CREATE INDEX IF NOT EXISTS idx_trip_subprotocol_status
  ON trip_subprotocol (status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_trip_subprotocol_one_default
  ON trip_subprotocol (intent_id)
  WHERE is_default = TRUE AND status = 'active';
