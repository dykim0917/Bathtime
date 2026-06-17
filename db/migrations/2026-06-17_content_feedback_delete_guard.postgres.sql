REVOKE DELETE ON content_feedback FROM anon, authenticated;

DROP POLICY IF EXISTS "visitors can delete content feedback" ON content_feedback;

CREATE OR REPLACE FUNCTION delete_content_feedback(
  p_content_id TEXT,
  p_visitor_key TEXT
)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM content_feedback
  WHERE content_id = p_content_id
    AND visitor_key = p_visitor_key
    AND p_visitor_key IS NOT NULL
    AND length(p_visitor_key) >= 24;
$$;

REVOKE ALL ON FUNCTION delete_content_feedback(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION delete_content_feedback(TEXT, TEXT) TO anon, authenticated;
