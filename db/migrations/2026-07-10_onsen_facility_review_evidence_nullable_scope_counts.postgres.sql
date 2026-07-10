ALTER TABLE public.onsen_facility_review_evidence
  ALTER COLUMN dayuse_only_direct_reviews DROP NOT NULL,
  ALTER COLUMN dayuse_only_direct_reviews DROP DEFAULT,
  ALTER COLUMN lodging_bath_only_direct_reviews DROP NOT NULL,
  ALTER COLUMN lodging_bath_only_direct_reviews DROP DEFAULT;

COMMENT ON COLUMN public.onsen_facility_review_evidence.dayuse_only_direct_reviews IS
  'Direct reviews confirmed as day-use-only. NULL means the collection did not split this count; zero means none were confirmed.';

COMMENT ON COLUMN public.onsen_facility_review_evidence.lodging_bath_only_direct_reviews IS
  'Lodging review bodies used only as shared-bath supporting evidence. NULL means the collection did not split this count; zero means none were used.';
