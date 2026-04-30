CREATE OR REPLACE FUNCTION log_admin_update_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id_column TEXT := COALESCE(TG_ARGV[0], 'id');
  target_id_value TEXT;
  actor_email_value TEXT := NULLIF(lower(auth.jwt() ->> 'email'), '');
BEGIN
  IF OLD IS NOT DISTINCT FROM NEW THEN
    RETURN NEW;
  END IF;

  target_id_value := COALESCE(to_jsonb(NEW) ->> target_id_column, to_jsonb(OLD) ->> target_id_column);

  INSERT INTO admin_action_log (
    actor_email,
    action,
    target_table,
    target_id,
    before_state,
    after_state
  )
  VALUES (
    COALESCE(actor_email_value, 'unknown'),
    'update',
    TG_TABLE_NAME,
    COALESCE(target_id_value, 'unknown'),
    to_jsonb(OLD),
    to_jsonb(NEW)
  );

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  DROP TRIGGER IF EXISTS audit_admin_canonical_product_update ON canonical_product;
  CREATE TRIGGER audit_admin_canonical_product_update
    AFTER UPDATE ON canonical_product
    FOR EACH ROW
    WHEN (OLD IS DISTINCT FROM NEW)
    EXECUTE FUNCTION log_admin_update_action('id');

  DROP TRIGGER IF EXISTS audit_admin_product_presentation_update ON product_presentation;
  CREATE TRIGGER audit_admin_product_presentation_update
    AFTER UPDATE ON product_presentation
    FOR EACH ROW
    WHEN (OLD IS DISTINCT FROM NEW)
    EXECUTE FUNCTION log_admin_update_action('canonical_product_id');

  DROP TRIGGER IF EXISTS audit_admin_care_intent_update ON care_intent;
  CREATE TRIGGER audit_admin_care_intent_update
    AFTER UPDATE ON care_intent
    FOR EACH ROW
    WHEN (OLD IS DISTINCT FROM NEW)
    EXECUTE FUNCTION log_admin_update_action('id');

  DROP TRIGGER IF EXISTS audit_admin_trip_theme_update ON trip_theme;
  CREATE TRIGGER audit_admin_trip_theme_update
    AFTER UPDATE ON trip_theme
    FOR EACH ROW
    WHEN (OLD IS DISTINCT FROM NEW)
    EXECUTE FUNCTION log_admin_update_action('id');

  DROP TRIGGER IF EXISTS audit_admin_audio_track_update ON audio_track;
  CREATE TRIGGER audit_admin_audio_track_update
    AFTER UPDATE ON audio_track
    FOR EACH ROW
    WHEN (OLD IS DISTINCT FROM NEW)
    EXECUTE FUNCTION log_admin_update_action('id');
END
$$;
