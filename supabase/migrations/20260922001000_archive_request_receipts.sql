-- Receipts make a retried request safe even when its first response was lost.
BEGIN;
ALTER TABLE public.archive_saves ADD COLUMN request_id text;
CREATE TABLE public.archive_requests (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id text NOT NULL CHECK (length(request_id) BETWEEN 1 AND 100),
  canonical_key text NOT NULL,
  source_id uuid REFERENCES public.archive_sources(id) ON DELETE SET NULL,
  cancelled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, request_id)
);
ALTER TABLE public.archive_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.archive_requests FROM anon, authenticated;

CREATE FUNCTION public.archive_request_link(p_request text, p_operation text, p_url text, p_key text, p_platform text, p_title text DEFAULT '')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_user uuid := auth.uid(); v_receipt archive_requests; v_source uuid;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  IF p_request IS NULL OR length(p_request) NOT BETWEEN 1 AND 100 OR p_operation NOT IN ('save', 'cancel') OR
    p_operation IS NULL OR p_key IS NULL OR length(p_key) NOT BETWEEN 1 AND 4200 THEN RAISE EXCEPTION 'Invalid request'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(v_user::text, 0));
  SELECT * INTO v_receipt FROM archive_requests WHERE user_id = v_user AND request_id = p_request;
  IF FOUND AND v_receipt.canonical_key <> p_key THEN RAISE EXCEPTION 'Request identity mismatch'; END IF;
  IF NOT FOUND THEN
    IF (SELECT count(*) FROM archive_requests WHERE user_id = v_user AND created_at > now() - interval '1 day') >= 120 THEN
      RAISE EXCEPTION 'Daily request limit reached';
    END IF;
    INSERT INTO archive_requests(user_id, request_id, canonical_key) VALUES (v_user, p_request, p_key)
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
COMMIT;
