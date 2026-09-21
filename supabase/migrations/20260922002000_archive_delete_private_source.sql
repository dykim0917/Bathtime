-- A removed private save must not retain its source text and review history.
BEGIN;
UPDATE public.archive_requests SET canonical_key = encode(sha256(convert_to(canonical_key, 'UTF8')), 'hex');
CREATE OR REPLACE FUNCTION public.archive_request_link(p_request text, p_operation text, p_url text, p_key text, p_platform text, p_title text DEFAULT '')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_user uuid := auth.uid(); v_receipt archive_requests; v_source uuid;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  IF p_request IS NULL OR length(p_request) NOT BETWEEN 1 AND 100 OR p_operation NOT IN ('save', 'cancel') OR
    p_operation IS NULL OR p_key IS NULL OR length(p_key) NOT BETWEEN 1 AND 4200 THEN RAISE EXCEPTION 'Invalid request'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(v_user::text, 0));
  SELECT * INTO v_receipt FROM archive_requests WHERE user_id = v_user AND request_id = p_request;
  IF FOUND AND v_receipt.canonical_key <> encode(sha256(convert_to(p_key, 'UTF8')), 'hex') THEN RAISE EXCEPTION 'Request identity mismatch'; END IF;
  IF NOT FOUND THEN
    IF (SELECT count(*) FROM archive_requests WHERE user_id = v_user AND created_at > now() - interval '1 day') >= 120 THEN
      RAISE EXCEPTION 'Daily request limit reached';
    END IF;
    INSERT INTO archive_requests(user_id, request_id, canonical_key) VALUES (v_user, p_request, encode(sha256(convert_to(p_key, 'UTF8')), 'hex'))
      RETURNING * INTO v_receipt;
  END IF;
  IF p_operation = 'cancel' THEN
    UPDATE archive_requests SET cancelled = true WHERE user_id = v_user AND request_id = p_request;
    -- An old retry must not remove a later explicit save of the same URL.
    DELETE FROM archive_saves WHERE user_id = v_user AND source_id = v_receipt.source_id AND request_id = p_request;
    RETURN jsonb_build_object('cancelled', true, 'sourceId', v_receipt.source_id);
  END IF;
  IF v_receipt.cancelled THEN RETURN jsonb_build_object('cancelled', true, 'sourceId', v_receipt.source_id); END IF;
  IF v_receipt.source_id IS NOT NULL THEN
    RETURN jsonb_build_object('cancelled', false, 'sourceId', v_receipt.source_id);
  END IF;
  v_source := archive_save_link(p_url, p_key, p_platform, p_title);
  UPDATE archive_saves SET request_id = p_request WHERE user_id = v_user AND source_id = v_source;
  UPDATE archive_requests SET source_id = v_source WHERE user_id = v_user AND request_id = p_request;
  RETURN jsonb_build_object('cancelled', false, 'sourceId', v_source);
END $$;
REVOKE ALL ON FUNCTION public.archive_request_link(text,text,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.archive_request_link(text,text,text,text,text,text) TO authenticated;

CREATE FUNCTION public.archive_purge_source_details()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_entities uuid[];
BEGIN
  SELECT array_agg(DISTINCT entity_id) INTO v_entities FROM (
    SELECT entity_id FROM archive_source_entities WHERE source_id = OLD.id
    UNION
    SELECT (entry->>'id')::uuid FROM archive_review_history,
      LATERAL jsonb_array_elements(payload->'entities') entry
      WHERE source_id = OLD.id AND entry->>'id' IS NOT NULL
  ) linked;
  UPDATE archive_requests SET cancelled = true WHERE source_id = OLD.id;
  DELETE FROM archive_source_entities WHERE source_id = OLD.id;
  DELETE FROM archive_review_history WHERE source_id = OLD.id;
  DELETE FROM archive_entities e WHERE e.id = ANY(v_entities) AND NOT e.is_public
    AND NOT EXISTS (SELECT 1 FROM archive_source_entities l WHERE l.entity_id = e.id)
    AND NOT EXISTS (SELECT 1 FROM archive_review_history h,
      LATERAL jsonb_array_elements(h.payload->'entities') entry WHERE entry->>'id' = e.id::text);
  RETURN OLD;
END $$;
REVOKE ALL ON FUNCTION public.archive_purge_source_details() FROM PUBLIC;
CREATE TRIGGER archive_source_removed BEFORE DELETE ON public.archive_sources
FOR EACH ROW EXECUTE FUNCTION public.archive_purge_source_details();

CREATE FUNCTION public.archive_purge_removed_source()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  DELETE FROM archive_sources WHERE id = OLD.source_id AND owner_id = OLD.user_id
    AND NOT EXISTS (SELECT 1 FROM archive_saves WHERE source_id = OLD.source_id);
  RETURN OLD;
END $$;
REVOKE ALL ON FUNCTION public.archive_purge_removed_source() FROM PUBLIC;
CREATE TRIGGER archive_save_removed AFTER DELETE ON public.archive_saves
FOR EACH ROW EXECUTE FUNCTION public.archive_purge_removed_source();
COMMIT;
