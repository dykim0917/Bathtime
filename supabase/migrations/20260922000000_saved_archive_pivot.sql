-- Additive migration: legacy saved_items and archive_content remain unchanged.
BEGIN;

CREATE TABLE public.archive_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  canonical_key text NOT NULL CHECK (length(canonical_key) BETWEEN 1 AND 4200),
  platform text NOT NULL CHECK (platform IN ('instagram', 'youtube', 'web')),
  url text NOT NULL CHECK (url ~ '^https?://' AND length(url) <= 4096),
  title text NOT NULL DEFAULT '' CHECK (length(title) <= 200),
  summary text NOT NULL DEFAULT '',
  creator text NOT NULL DEFAULT '',
  posted_at date,
  checked_at date,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'ready', 'unavailable')),
  reason text,
  revision integer NOT NULL DEFAULT 0,
  reusable boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, canonical_key)
);

CREATE TABLE public.archive_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES public.archive_sources(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, source_id)
);
CREATE INDEX archive_saves_user_created ON public.archive_saves(user_id, created_at DESC);

CREATE TABLE public.archive_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('place', 'product')),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 160),
  location text NOT NULL DEFAULT '' CHECK (length(location) <= 200),
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Facts belong to a source, not to the shared entity: private-source facts never
-- appear merely because another user saved the same place/product.
CREATE TABLE public.archive_source_entities (
  source_id uuid NOT NULL REFERENCES public.archive_sources(id) ON DELETE CASCADE,
  entity_id uuid NOT NULL REFERENCES public.archive_entities(id),
  details jsonb NOT NULL CHECK (jsonb_typeof(details) = 'object'),
  position integer NOT NULL DEFAULT 0,
  PRIMARY KEY (source_id, entity_id)
);
CREATE INDEX archive_source_entities_entity ON public.archive_source_entities(entity_id);

CREATE TABLE public.archive_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL UNIQUE REFERENCES public.archive_sources(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'ready', 'unavailable')),
  attempts integer NOT NULL DEFAULT 0,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at timestamptz,
  completed_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX archive_jobs_pending ON public.archive_jobs(status, created_at);

CREATE TABLE public.archive_review_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.archive_sources(id) ON DELETE CASCADE,
  revision integer NOT NULL,
  payload jsonb NOT NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_id, revision)
);

CREATE TABLE public.archive_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event text NOT NULL CHECK (event IN ('archive_opened', 'detail_opened', 'original_opened', 'action_opened', 'save_removed')),
  source_id uuid REFERENCES public.archive_sources(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX archive_events_user_created ON public.archive_events(user_id, created_at DESC);

ALTER TABLE public.archive_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_source_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_review_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY archive_saves_own_read ON public.archive_saves FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY archive_saves_own_delete ON public.archive_saves FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY archive_sources_read ON public.archive_sources FOR SELECT TO authenticated USING (
  public.is_content_admin() OR (owner_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.archive_saves s WHERE s.source_id = archive_sources.id AND s.user_id = auth.uid()
  ))
);
CREATE POLICY archive_links_read ON public.archive_source_entities FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.archive_sources s WHERE s.id = source_id)
);
CREATE POLICY archive_entities_read ON public.archive_entities FOR SELECT TO authenticated USING (
  is_public OR public.is_content_admin() OR EXISTS (
    SELECT 1 FROM public.archive_source_entities l WHERE l.entity_id = archive_entities.id
  )
);
CREATE POLICY archive_jobs_admin ON public.archive_jobs FOR SELECT TO authenticated USING (public.is_content_admin());
CREATE POLICY archive_reviews_admin ON public.archive_review_history FOR SELECT TO authenticated USING (public.is_content_admin());
CREATE POLICY archive_events_read ON public.archive_events FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_content_admin());
CREATE POLICY archive_events_insert ON public.archive_events FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND (source_id IS NULL OR EXISTS (SELECT 1 FROM public.archive_sources s WHERE s.id = source_id))
);

-- Supabase projects may have broad default table grants; revoke them explicitly.
REVOKE ALL ON public.archive_sources, public.archive_saves, public.archive_entities,
  public.archive_source_entities, public.archive_jobs, public.archive_review_history, public.archive_events FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.archive_events_id_seq FROM anon, authenticated;
GRANT SELECT ON public.archive_sources, public.archive_saves, public.archive_entities,
  public.archive_source_entities, public.archive_jobs, public.archive_review_history, public.archive_events TO authenticated;
GRANT DELETE ON public.archive_saves TO authenticated;
GRANT INSERT (user_id, event, source_id) ON public.archive_events TO authenticated;
GRANT USAGE ON SEQUENCE public.archive_events_id_seq TO authenticated;

-- Atomic intake. No caller-supplied user ID and no direct table INSERT grants.
CREATE FUNCTION public.archive_save_link(p_url text, p_key text, p_platform text, p_title text DEFAULT '')
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_user uuid := auth.uid(); v_source uuid;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  IF p_url !~ '^https?://[^/@[:space:]]+\.[^/@[:space:]]+' OR length(p_url) > 4096
    OR length(p_key) NOT BETWEEN 1 AND 4200 OR p_platform NOT IN ('instagram', 'youtube', 'web') THEN
    RAISE EXCEPTION 'Invalid link';
  END IF;
  IF p_key IS DISTINCT FROM (CASE p_platform
      WHEN 'instagram' THEN 'instagram:' || substring(p_url FROM '^https://www\.instagram\.com/p/([A-Za-z0-9_-]+)/$')
      WHEN 'youtube' THEN 'youtube:' || substring(p_url FROM '^https://www\.youtube\.com/watch\?v=([A-Za-z0-9_-]{11})$')
      ELSE 'web:' || p_url END) THEN RAISE EXCEPTION 'Link identity mismatch'; END IF;
  -- Serializes a user's intake so rate limits and duplicate saves stay reliable.
  PERFORM pg_advisory_xact_lock(hashtextextended(v_user::text, 0));
  SELECT id INTO v_source FROM archive_sources WHERE owner_id = v_user AND canonical_key = p_key;
  IF v_source IS NULL THEN
    IF (SELECT count(*) FROM archive_sources WHERE owner_id = v_user AND created_at > now() - interval '1 day') >= 30 THEN
      RAISE EXCEPTION 'Daily new-link limit reached' USING ERRCODE = 'P0001';
    END IF;
    INSERT INTO archive_sources(owner_id, canonical_key, platform, url, title)
      VALUES (v_user, p_key, p_platform, p_url, left(coalesce(p_title, ''), 200)) RETURNING id INTO v_source;
    INSERT INTO archive_jobs(source_id) VALUES (v_source);
  END IF;
  INSERT INTO archive_saves(user_id, source_id) VALUES (v_user, v_source) ON CONFLICT DO NOTHING;
  RETURN v_source;
END $$;

CREATE FUNCTION public.archive_claim_job(p_source uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF NOT public.is_content_admin() THEN RAISE EXCEPTION 'Admin required' USING ERRCODE = '42501'; END IF;
  UPDATE archive_jobs SET status = 'processing', assigned_to = auth.uid(), started_at = now(),
    attempts = attempts + 1, completed_at = NULL, last_error = NULL
    WHERE source_id = p_source AND (status <> 'processing' OR assigned_to = auth.uid() OR started_at < now() - interval '2 hours');
  IF NOT FOUND THEN RAISE EXCEPTION 'Job is already assigned'; END IF;
  UPDATE archive_sources SET status = 'processing', updated_at = now() WHERE id = p_source;
END $$;

-- Validates both browser imports and direct RPC calls. Applying a revision never
-- recreates a user's deleted save; all changes commit together or none do.
CREATE FUNCTION public.archive_apply_review(p_result jsonb)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_source archive_sources; v_entity jsonb; v_fact jsonb; v_id uuid;
  v_entities jsonb; v_revision integer; v_position integer := 0; v_ids uuid[] := '{}';
BEGIN
  IF NOT public.is_content_admin() THEN RAISE EXCEPTION 'Admin required' USING ERRCODE = '42501'; END IF;
  SELECT * INTO v_source FROM archive_sources WHERE id = (p_result->>'sourceId')::uuid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source not found'; END IF;
  IF (p_result->>'version')::integer IS DISTINCT FROM 1 OR
    (p_result->>'expectedRevision')::integer IS DISTINCT FROM v_source.revision THEN RAISE EXCEPTION 'Review revision conflict'; END IF;
  IF coalesce(p_result->>'status', '') NOT IN ('ready', 'unavailable') OR
    coalesce(length(btrim(p_result->>'title')), 0) NOT BETWEEN 1 AND 200 OR
    jsonb_typeof(p_result->'entities') IS DISTINCT FROM 'array' OR
    coalesce(length(p_result->>'summary'), 0) > 4000 OR coalesce(length(p_result->>'creator'), 0) > 160 OR
    coalesce(p_result->>'checkedAt', '') !~ '^\d{4}-\d{2}-\d{2}$' THEN RAISE EXCEPTION 'Invalid review'; END IF;
  v_entities := p_result->'entities';
  IF jsonb_array_length(v_entities) > 20 OR (p_result->>'status' = 'unavailable' AND
    (jsonb_array_length(v_entities) <> 0 OR coalesce(length(btrim(p_result->>'reason')), 0) NOT BETWEEN 1 AND 500)) THEN
    RAISE EXCEPTION 'Invalid review entities';
  END IF;
  FOR v_entity IN SELECT value FROM jsonb_array_elements(v_entities) LOOP
    IF coalesce(v_entity->>'kind', '') NOT IN ('place', 'product') OR
      coalesce(length(btrim(v_entity->>'name')), 0) NOT BETWEEN 1 AND 160 OR
      coalesce(length(v_entity->>'location'), 0) > 200 OR coalesce(length(v_entity->>'summary'), 0) > 2000 OR
      jsonb_typeof(v_entity->'facts') IS DISTINCT FROM 'array' OR jsonb_typeof(v_entity->'tags') IS DISTINCT FROM 'array' THEN
      RAISE EXCEPTION 'Invalid entity';
    END IF;
    IF jsonb_array_length(v_entity->'facts') > 20 OR jsonb_array_length(v_entity->'tags') > 12 OR
      EXISTS (SELECT 1 FROM jsonb_array_elements(v_entity->'tags') t WHERE jsonb_typeof(t) <> 'string' OR length(t #>> '{}') NOT BETWEEN 1 AND 40) THEN
      RAISE EXCEPTION 'Invalid entity fields';
    END IF;
    IF v_entity ? 'actionUrl' AND (v_entity->>'actionUrl' !~ '^https?://[^[:space:]]+$' OR length(v_entity->>'actionUrl') > 4096) THEN
      RAISE EXCEPTION 'Invalid action URL';
    END IF;
    FOR v_fact IN SELECT value FROM jsonb_array_elements(v_entity->'facts') LOOP
      IF coalesce(length(btrim(v_fact->>'label')), 0) NOT BETWEEN 1 AND 80 OR
        coalesce(length(btrim(v_fact->>'value')), 0) NOT BETWEEN 1 AND 1000 OR
        coalesce(v_fact->>'basis', '') NOT IN ('official', 'post') OR
        coalesce(v_fact->>'sourceUrl', '') !~ '^https?://[^[:space:]]+$' OR length(v_fact->>'sourceUrl') > 4096 OR
        coalesce(v_fact->>'checkedAt', '') !~ '^\d{4}-\d{2}-\d{2}$' THEN RAISE EXCEPTION 'Invalid fact'; END IF;
      PERFORM (v_fact->>'checkedAt')::date;
    END LOOP;
    v_id := (v_entity->>'id')::uuid;
    IF v_id IS NULL THEN
      INSERT INTO archive_entities(kind, name, location) VALUES (v_entity->>'kind', v_entity->>'name', coalesce(v_entity->>'location', '')) RETURNING id INTO v_id;
    ELSE
      -- Private identities cannot be used to expose another owner's material.
      IF NOT EXISTS (SELECT 1 FROM archive_entities e WHERE e.id = v_id AND e.kind = v_entity->>'kind' AND
        (e.is_public OR EXISTS (SELECT 1 FROM archive_source_entities l JOIN archive_sources s ON s.id = l.source_id
          WHERE l.entity_id = e.id AND s.owner_id = v_source.owner_id) OR
          EXISTS (SELECT 1 FROM archive_review_history h JOIN archive_sources s ON s.id = h.source_id
            CROSS JOIN LATERAL jsonb_array_elements(h.payload->'entities') old_entity
            WHERE s.owner_id = v_source.owner_id AND old_entity->>'id' = e.id::text))) THEN
        RAISE EXCEPTION 'Entity is not available for this source';
      END IF;
    END IF;
    IF v_id = ANY(v_ids) THEN RAISE EXCEPTION 'Duplicate entity'; END IF;
    v_ids := array_append(v_ids, v_id);
    v_entities := jsonb_set(v_entities, ARRAY[v_position::text, 'id'], to_jsonb(v_id::text));
    INSERT INTO archive_source_entities(source_id, entity_id, details, position)
      VALUES (v_source.id, v_id, v_entity - 'id' - 'name' - 'kind' - 'location', v_position)
      ON CONFLICT (source_id, entity_id) DO UPDATE SET details = excluded.details, position = excluded.position;
    v_position := v_position + 1;
  END LOOP;
  DELETE FROM archive_source_entities WHERE source_id = v_source.id AND NOT (entity_id = ANY(v_ids));
  v_revision := v_source.revision + 1;
  UPDATE archive_sources SET title = p_result->>'title', summary = coalesce(p_result->>'summary', ''),
    creator = coalesce(p_result->>'creator', ''), posted_at = (p_result->>'postedAt')::date,
    checked_at = (p_result->>'checkedAt')::date, status = p_result->>'status', reason = p_result->>'reason',
    revision = v_revision, reusable = false, updated_at = now() WHERE id = v_source.id;
  INSERT INTO archive_review_history(source_id, revision, payload, actor_id)
    VALUES (v_source.id, v_revision, jsonb_set(p_result, '{entities}', v_entities), auth.uid());
  UPDATE archive_jobs SET status = p_result->>'status', completed_at = now(), last_error = p_result->>'reason'
    WHERE source_id = v_source.id;
  RETURN v_revision;
END $$;

REVOKE ALL ON FUNCTION public.archive_save_link(text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.archive_claim_job(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.archive_apply_review(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.archive_save_link(text, text, text, text),
  public.archive_claim_job(uuid), public.archive_apply_review(jsonb) TO authenticated;

COMMIT;
