CREATE TABLE IF NOT EXISTS canonical_product (
  id TEXT PRIMARY KEY,
  ingredient_key TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  mechanism TEXT NOT NULL,
  price_tier TEXT NOT NULL,
  environments_json TEXT NOT NULL,
  summary TEXT NOT NULL,
  editorial_eyebrow TEXT NOT NULL,
  editorial_footer_hint TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  last_verified_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_market_listing (
  id TEXT PRIMARY KEY,
  canonical_product_id TEXT NOT NULL,
  market TEXT NOT NULL,
  source_url TEXT NOT NULL,
  title_snapshot TEXT NOT NULL,
  seller_snapshot TEXT,
  price_snapshot_krw INTEGER,
  availability TEXT NOT NULL DEFAULT 'unknown',
  verified_at TEXT NOT NULL,
  source_confidence REAL NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (canonical_product_id) REFERENCES canonical_product(id)
);

CREATE TABLE IF NOT EXISTS product_match_rule (
  id TEXT PRIMARY KEY,
  canonical_product_id TEXT NOT NULL,
  ingredient_keys_json TEXT NOT NULL,
  allowed_environments_json TEXT NOT NULL,
  mode_bias_json TEXT,
  priority_weight INTEGER NOT NULL,
  is_sommelier_pick_candidate INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (canonical_product_id) REFERENCES canonical_product(id)
);

CREATE INDEX IF NOT EXISTS idx_canonical_product_ingredient_key
  ON canonical_product (ingredient_key);

CREATE INDEX IF NOT EXISTS idx_product_market_listing_canonical_product_id
  ON product_market_listing (canonical_product_id);

CREATE INDEX IF NOT EXISTS idx_product_market_listing_market
  ON product_market_listing (market);

CREATE INDEX IF NOT EXISTS idx_product_match_rule_canonical_product_id
  ON product_match_rule (canonical_product_id);
