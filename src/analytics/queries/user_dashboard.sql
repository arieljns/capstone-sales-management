CREATE OR REPLACE VIEW public.mv_user_dashboard_monthly AS
WITH 
params AS (
  SELECT
    date_trunc('month', CURRENT_DATE) AS start_date,
    (date_trunc('month', CURRENT_DATE) + interval '1 month') AS end_date
),
users AS (
  SELECT id FROM public.user_entity
),


revenue AS (
  SELECT 
    u.id AS user_id,
    COALESCE(SUM(CASE WHEN t.stage = 'ClosedWon' THEN v."totalAmount" END), 0) AS total_revenue,
    COALESCE(SUM(CASE WHEN t.stage = 'ClosedLost' THEN v."totalAmount" END), 0) AS lost_revenue,
    COALESCE(
      COUNT(*) FILTER (WHERE t.stage = 'ClosedWon')::float / NULLIF(COUNT(t.id), 0),
      0
    ) AS conversion_rate
  FROM users u
  LEFT JOIN public.tickets t ON t."userId" = u.id
  LEFT JOIN public.validation v ON v.id = t."afterMeetingId"
  CROSS JOIN params p
  WHERE COALESCE(v."createdAt", t."createdAt") >= p.start_date
    AND COALESCE(v."createdAt", t."createdAt") < p.end_date
  GROUP BY u.id
),

target AS (
  SELECT 
    u.id AS user_id,
    COALESCE(AVG(v."totalAmount") * 3, 1000000000)::numeric AS target_amount
  FROM users u
  LEFT JOIN public.tickets t ON t."userId" = u.id
  LEFT JOIN public.validation v ON v.id = t."afterMeetingId"
  CROSS JOIN params p
  WHERE COALESCE(v."createdAt", t."createdAt") >= (p.start_date - interval '1 month')
    AND COALESCE(v."createdAt", t."createdAt") < p.end_date
  GROUP BY u.id
),


meetings AS (
  SELECT 
    u.id AS user_id,
    COUNT(bm.id) AS total_meetings,
    COUNT(CASE WHEN am."isFormSubmitted" = true THEN 1 END) AS completed_debriefs,
    COUNT(bm.id) - COUNT(CASE WHEN am."isFormSubmitted" = true THEN 1 END) AS pending_meetings
  FROM users u
  LEFT JOIN public.before_meeting bm ON bm."userId" = u.id
  LEFT JOIN public.validation am ON am."beforeMeetingId" = bm.id
  CROSS JOIN params p
  WHERE COALESCE(bm."meetingDate", bm."createdAt") >= p.start_date
    AND COALESCE(bm."meetingDate", bm."createdAt") < p.end_date
  GROUP BY u.id
),


sentiment AS (
  SELECT 
    u.id AS user_id,
    COUNT(CASE WHEN LOWER(v.sentiment) = 'positive' THEN 1 END) AS positive,
    COUNT(CASE WHEN LOWER(v.sentiment) = 'neutral' THEN 1 END) AS neutral,
    COUNT(CASE WHEN LOWER(v.sentiment) = 'negative' THEN 1 END) AS negative
  FROM users u
  LEFT JOIN public.validation v ON v."userId" = u.id
  CROSS JOIN params p
  WHERE v."createdAt" >= p.start_date AND v."createdAt" < p.end_date
  GROUP BY u.id
),

deals AS (
  SELECT 
    u.id AS user_id,
    COUNT(*) FILTER (WHERE t.stage IN ('ClosedWon', 'ClosedLost')) AS total_closed_deals
  FROM users u
  LEFT JOIN public.tickets t ON t."userId" = u.id
  CROSS JOIN params p
  WHERE t."createdAt" >= p.start_date AND t."createdAt" < p.end_date
  GROUP BY u.id
),


funnel_stage AS (
  SELECT 
    u.id AS user_id,
    t.stage,
    COUNT(*) AS total_deals,
    COALESCE(SUM(v."totalAmount"), 0) AS total_revenue
  FROM users u
  LEFT JOIN public.tickets t ON t."userId" = u.id
  LEFT JOIN public.validation v ON v.id = t."afterMeetingId"
  CROSS JOIN params p
  WHERE COALESCE(v."createdAt", t."createdAt") >= p.start_date
    AND COALESCE(v."createdAt", t."createdAt") < p.end_date
  GROUP BY u.id, t.stage
),
funnel AS (
  SELECT 
    user_id,
    json_agg(
      json_build_object(
        'stage', stage,
        'totalDeals', total_deals,
        'totalRevenue', total_revenue
      ) ORDER BY stage
    ) AS funnel_data
  FROM funnel_stage
  GROUP BY user_id
),

trend_stage AS (
  SELECT 
    u.id AS user_id,
    TO_CHAR(DATE_TRUNC('week', COALESCE(v."createdAt", t."createdAt")), 'FM"Week "W') AS period,
    SUM(CASE WHEN t.stage = 'ClosedWon' THEN v."totalAmount" ELSE 0 END) AS total_revenue,
    SUM(CASE WHEN t.stage = 'ClosedLost' THEN v."totalAmount" ELSE 0 END) AS lost_revenue
  FROM users u
  LEFT JOIN public.tickets t ON t."userId" = u.id
  LEFT JOIN public.validation v ON v.id = t."afterMeetingId"
  CROSS JOIN params p
  WHERE COALESCE(v."createdAt", t."createdAt") >= p.start_date
    AND COALESCE(v."createdAt", t."createdAt") < p.end_date
  GROUP BY u.id, period
),
trend AS (
  SELECT 
    user_id,
    json_agg(
      json_build_object(
        'period', period,
        'totalRevenue', total_revenue,
        'lostRevenue', lost_revenue
      ) ORDER BY period
    ) AS trend_data
  FROM trend_stage
  GROUP BY user_id
)

SELECT 
  u.id AS "userId",
  json_build_object(
    'totalRevenue', COALESCE(r.total_revenue, 0),
    'lostRevenue', COALESCE(r.lost_revenue, 0),
    'conversionRate', COALESCE(r.conversion_rate, 0),
    'trend', COALESCE(tr.trend_data, '[]'::json)
  ) AS revenue,
  json_build_object(
    'targetAmount', COALESCE(tg.target_amount, 0),
    'achievedAmount', COALESCE(r.total_revenue, 0),
    'remainingAmount', GREATEST(COALESCE(tg.target_amount, 0) - COALESCE(r.total_revenue, 0), 0)
  ) AS target,
  json_build_object(
    'totalMeetings', COALESCE(m.total_meetings, 0),
    'completedDebriefs', COALESCE(m.completed_debriefs, 0),
    'pendingMeetings', COALESCE(m.pending_meetings, 0)
  ) AS meetings,
  json_build_object(
    'positive', COALESCE(s.positive, 0),
    'neutral', COALESCE(s.neutral, 0),
    'negative', COALESCE(s.negative, 0)
  ) AS sentiment,
  COALESCE(f.funnel_data, '[]'::json) AS funnel,
  json_build_object(
    'totalClosedDeals', COALESCE(d.total_closed_deals, 0)
  ) AS deals
FROM users u
LEFT JOIN revenue r ON r.user_id = u.id
LEFT JOIN target tg ON tg.user_id = u.id
LEFT JOIN meetings m ON m.user_id = u.id
LEFT JOIN sentiment s ON s.user_id = u.id
LEFT JOIN deals d ON d.user_id = u.id
LEFT JOIN trend tr ON tr.user_id = u.id
LEFT JOIN funnel f ON f.user_id = u.id;
