DO $$
BEGIN
  IF to_regclass('public.saved_items') IS NULL THEN
    RAISE NOTICE 'saved_items table does not exist yet. Apply 2026-05-11_p0_user_auth_saved_submissions.postgres.sql first.';
    RETURN;
  END IF;

  DELETE FROM saved_items a
  USING saved_items b
  WHERE a.ctid < b.ctid
    AND a.user_id = b.user_id
    AND a.target_type = b.target_type
    AND a.target_id = b.target_id;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'saved_items_user_id_target_type_target_id_key'
      AND conrelid = 'saved_items'::regclass
  ) THEN
    ALTER TABLE saved_items
      ADD CONSTRAINT saved_items_user_id_target_type_target_id_key
      UNIQUE (user_id, target_type, target_id);
  END IF;
END
$$;
