CREATE TABLE IF NOT EXISTS canonical_product (
  id TEXT PRIMARY KEY,
  ingredient_key TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  mechanism TEXT NOT NULL,
  price_tier TEXT NOT NULL,
  environments JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT NOT NULL,
  editorial_eyebrow TEXT NOT NULL,
  editorial_footer_hint TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  last_verified_at DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_market_listing (
  id TEXT PRIMARY KEY,
  canonical_product_id TEXT NOT NULL REFERENCES canonical_product(id) ON DELETE CASCADE,
  market TEXT NOT NULL,
  source_url TEXT NOT NULL,
  title_snapshot TEXT NOT NULL,
  seller_snapshot TEXT,
  price_snapshot_krw INTEGER,
  availability TEXT NOT NULL DEFAULT 'unknown',
  verified_at DATE NOT NULL,
  source_confidence NUMERIC(3,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_match_rule (
  id TEXT PRIMARY KEY,
  canonical_product_id TEXT NOT NULL REFERENCES canonical_product(id) ON DELETE CASCADE,
  ingredient_keys JSONB NOT NULL DEFAULT '[]'::jsonb,
  allowed_environments JSONB NOT NULL DEFAULT '[]'::jsonb,
  mode_bias JSONB,
  priority_weight INTEGER NOT NULL,
  is_sommelier_pick_candidate BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_canonical_product_ingredient_key
  ON canonical_product (ingredient_key);

CREATE INDEX IF NOT EXISTS idx_canonical_product_status
  ON canonical_product (status);

CREATE INDEX IF NOT EXISTS idx_product_market_listing_canonical_product_id
  ON product_market_listing (canonical_product_id);

CREATE INDEX IF NOT EXISTS idx_product_market_listing_market
  ON product_market_listing (market);

CREATE INDEX IF NOT EXISTS idx_product_market_listing_availability
  ON product_market_listing (availability);

CREATE INDEX IF NOT EXISTS idx_product_match_rule_canonical_product_id
  ON product_match_rule (canonical_product_id);

CREATE INDEX IF NOT EXISTS idx_canonical_product_environments_gin
  ON canonical_product USING GIN (environments);

CREATE INDEX IF NOT EXISTS idx_product_match_rule_ingredient_keys_gin
  ON product_match_rule USING GIN (ingredient_keys);

CREATE INDEX IF NOT EXISTS idx_product_match_rule_allowed_environments_gin
  ON product_match_rule USING GIN (allowed_environments);
