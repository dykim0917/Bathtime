-- Read-only operator report. Run with an authorized admin connection.
-- The event cohort uses calendar days in Asia/Seoul, not a promised retention SLA.
SELECT status, count(*) AS sources, min(created_at) AS oldest_created_at
FROM public.archive_sources GROUP BY status ORDER BY status;

SELECT count(*) AS completed_jobs,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY extract(epoch FROM (completed_at - started_at))) AS median_processing_seconds,
  max(completed_at - created_at) AS longest_wait_to_completion
FROM public.archive_jobs
WHERE completed_at >= now() - interval '7 days' AND started_at IS NOT NULL;

SELECT event, count(*) AS events, count(DISTINCT user_id) AS users
FROM public.archive_events WHERE created_at >= now() - interval '7 days'
GROUP BY event ORDER BY event;

WITH cohort AS (
  SELECT owner_id, min(created_at) AS first_saved_at
  FROM public.archive_sources GROUP BY owner_id
), eligible AS (
  SELECT * FROM cohort WHERE first_saved_at < now() - interval '1 day'
    AND first_saved_at >= now() - interval '14 days'
)
SELECT count(*) AS eligible_savers,
  count(*) FILTER (WHERE EXISTS (
    SELECT 1 FROM public.archive_events e WHERE e.user_id = eligible.owner_id AND e.event = 'archive_opened'
      AND (e.created_at AT TIME ZONE 'Asia/Seoul')::date > (eligible.first_saved_at AT TIME ZONE 'Asia/Seoul')::date
  )) AS returned_on_a_later_day,
  count(*) FILTER (WHERE EXISTS (
    SELECT 1 FROM public.archive_events e WHERE e.user_id = eligible.owner_id
      AND e.event IN ('original_opened', 'action_opened') AND e.created_at > eligible.first_saved_at
  )) AS opened_a_saved_destination
FROM eligible;
