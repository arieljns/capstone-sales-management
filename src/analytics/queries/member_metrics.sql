
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_member_metrics AS
WITH user_base AS (
  SELECT
    u.id AS user_uuid,
    SPLIT_PART(u.email, '@', 1) AS user_id,
    u.email,
    INITCAP(
      REGEXP_REPLACE(
        REPLACE(REPLACE(SPLIT_PART(u.email, '@', 1), '.', ' '), '_', ' '),
        '\s+',
        ' ',
        'g'
      )
    ) AS display_name,
    (
      SELECT
        UPPER(
          COALESCE(
            STRING_AGG(SUBSTRING(token_value, 1, 1), ''),
            ''
          )
        )
      FROM regexp_split_to_table(
        REGEXP_REPLACE(
          REPLACE(REPLACE(SPLIT_PART(u.email, '@', 1), '.', ' '), '_', ' '),
          '\s+',
          ' ',
          'g'
        ),
        ' '
      ) AS token(token_value)
    ) AS initials
  FROM public."user_entity" u
),
lead_agg AS (
  SELECT
    bm."userId"::uuid AS user_uuid,
    COUNT(*) AS lead_count
  FROM public.before_meeting bm
  WHERE bm."userId" IS NOT NULL
  GROUP BY bm."userId"
),
deal_agg AS (
  SELECT
    k."userId"::uuid AS user_uuid,
    COUNT(*) AS total_deals,
    COUNT(*) FILTER (WHERE k.stage = 'ClosedWon') AS closed_won
  FROM public.tickets k
  WHERE k."userId" IS NOT NULL
  GROUP BY k."userId"
),
revenue_agg AS (
  SELECT
    v."userId"::uuid AS user_uuid,
    COALESCE(SUM(v."totalAmount"), 0)::numeric AS total_revenue,
    COALESCE(SUM(v.mrr), 0)::numeric AS total_mrr
  FROM public.validation v
  JOIN public.tickets k ON k."afterMeetingId" = v.id
  WHERE v."userId" IS NOT NULL
    AND k.stage = 'ClosedWon'
  GROUP BY v."userId"
)
SELECT
  ub.user_uuid,
  ub.user_id,
  ub.email,
  COALESCE(NULLIF(ub.display_name, ''), INITCAP(ub.user_id)) AS name,
  COALESCE(NULLIF(ub.initials, ''), UPPER(SUBSTRING(ub.user_id FROM 1 FOR 1))) AS initials,
  COALESCE(l.lead_count, 0) AS lead_count,
  COALESCE(d.total_deals, 0) AS total_deals,
  COALESCE(d.closed_won, 0) AS closed_won,
  COALESCE(r.total_revenue, 0) AS total_revenue,
  COALESCE(r.total_mrr, 0) AS total_mrr,
  CASE
    WHEN COALESCE(l.lead_count, 0) = 0 THEN 0
    ELSE ROUND(
      (COALESCE(d.closed_won, 0)::numeric / NULLIF(COALESCE(l.lead_count, 0), 0)) * 100,
      1
    )
  END AS conversion_rate
FROM user_base ub
LEFT JOIN lead_agg l ON l.user_uuid = ub.user_uuid
LEFT JOIN deal_agg d ON d.user_uuid = ub.user_uuid
LEFT JOIN revenue_agg r ON r.user_uuid = ub.user_uuid
ORDER BY ub.user_id;
