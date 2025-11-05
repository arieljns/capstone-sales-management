CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_user_analytics AS
WITH REVENUE_DATA AS
  (
    SELECT
      TO_CHAR(DATE_TRUNC('month',
      COALESCE(V."createdAt",
      V."expiredDate")),
      'Mon') AS MONTH_LABEL,
      SUM(V."totalAmount")::NUMERIC AS REVENUE,
      SUM(V."mrr")::NUMERIC AS MRR
    FROM
      PUBLIC.VALIDATION V
      JOIN PUBLIC.TICKETS K
      ON K."afterMeetingId" = V.ID
    WHERE
      K.STAGE = 'ClosedWon'
    GROUP BY
      1
    ORDER BY
      MIN(DATE_TRUNC('month', COALESCE(V."createdAt", V."expiredDate")))
  ), REVENUE_JSON AS (
    SELECT
      JSON_BUILD_OBJECT( 'categories',
      JSON_AGG(MONTH_LABEL ORDER BY MONTH_LABEL),
      'revenue',
      JSON_AGG(COALESCE(REVENUE,
      0) ORDER BY MONTH_LABEL),
      'forecast',
      JSON_AGG((COALESCE(REVENUE,
      0) * 1.05)::INT ORDER BY MONTH_LABEL) ) AS REVENUE
    FROM
      REVENUE_DATA
  ), MEETING_COUNTS AS (
    SELECT
      CONCAT('Week ',
      EXTRACT(WEEK FROM BM."meetingDate")::INT) AS WEEK_LABEL,
      COUNT(*) AS TOTAL_MEETINGS,
      COUNT(*) FILTER (WHERE BM."meetingDate" > NOW()) AS UPCOMING_MEETINGS
    FROM
      PUBLIC.BEFORE_MEETING BM
    GROUP BY
      1
    ORDER BY
      MIN(BM."meetingDate")
  ), MEETINGS_JSON AS (
    SELECT
      JSON_BUILD_OBJECT( 'categories',
      JSON_AGG(WEEK_LABEL ORDER BY WEEK_LABEL),
      'totalMeetings',
      JSON_AGG(TOTAL_MEETINGS ORDER BY WEEK_LABEL),
      'upcomingMeetings',
      JSON_AGG(UPCOMING_MEETINGS ORDER BY WEEK_LABEL) ) AS MEETINGS
    FROM
      MEETING_COUNTS
  ), SALES_FUNNEL_COUNTS AS (
    SELECT
      K.STAGE,
      COUNT(*) AS FUNNEL,
      COUNT(*) AS KANBAN
    FROM
      PUBLIC.TICKETS K
    GROUP BY
      K.STAGE
    ORDER BY
      K.STAGE
  ), SALES_FUNNEL_JSON AS (
    SELECT
      JSON_AGG( JSON_BUILD_OBJECT('stage',
      STAGE,
      'funnel',
      FUNNEL,
      'kanban',
      KANBAN) ORDER BY STAGE ) AS SALESFUNNEL
    FROM
      SALES_FUNNEL_COUNTS
  ), SALES_TARGET_VALUES AS (
    SELECT
      COALESCE(SUM(V."totalAmount"),
      0)::NUMERIC AS ACHIEVED
    FROM
      PUBLIC.VALIDATION V
      JOIN PUBLIC.TICKETS K
      ON K."afterMeetingId" = V.ID
    WHERE
      K.STAGE = 'ClosedWon'
  ), SALES_TARGET_JSON AS (
    SELECT
      JSON_BUILD_OBJECT( 'achieved',
      ACHIEVED,
      'target',
      1000000000,
      'velocity',
      ARRAY[18,
      22,
      24,
      27,
      29,
      33,
      35,
      38],
      'velocityPeriods',
      ARRAY['W1',
      'W2',
      'W3',
      'W4',
      'W5',
      'W6',
      'W7',
      'W8'] ) AS SALESTARGET
    FROM
      SALES_TARGET_VALUES
  ), LEADS_PERF AS (
    SELECT
      SPLIT_PART(U.EMAIL,
      '@',
      1) AS OWNER,
      COALESCE(SUM(
        CASE
          WHEN K.STAGE = 'ClosedWon' THEN
            1
          ELSE
            0
        END),
      0) AS WON,
      COALESCE(SUM(
        CASE
          WHEN K.STAGE = 'ClosedLost' THEN
            1
          ELSE
            0
        END),
      0) AS LOST
    FROM
      PUBLIC."user_entity" U
      LEFT JOIN PUBLIC.TICKETS K
      ON K."userId" = U.ID
    GROUP BY
      OWNER
    ORDER BY
      OWNER
  ), LEADS_PERFORMANCE_JSON AS (
    SELECT
      JSON_AGG(JSON_BUILD_OBJECT('owner',
      OWNER,
      'won',
      WON,
      'lost',
      LOST)) AS LEADSPERFORMANCE
    FROM
      LEADS_PERF
  ), PACKAGES_COUNTS AS (
    SELECT
      V.PROMO AS LABEL,
      COUNT(*) AS COUNT
    FROM
      PUBLIC.VALIDATION V
    GROUP BY
      V.PROMO
    ORDER BY
      V.PROMO
  ), PACKAGES_JSON AS (
    SELECT
      JSON_AGG(JSON_BUILD_OBJECT('label',
      LABEL,
      'count',
      COUNT)) AS PACKAGES
    FROM
      PACKAGES_COUNTS
  ), DEALS_CLOSED_COUNTS AS (
    SELECT
      TO_CHAR(DATE_TRUNC('month',
      COALESCE(K."updatedAt",
      K."createdAt")),
      'Mon') AS MONTH_LABEL,
      COUNT(*) AS COUNT
    FROM
      PUBLIC.TICKETS K
    WHERE
      K.STAGE = 'ClosedWon'
    GROUP BY
      1
    ORDER BY
      MIN(DATE_TRUNC('month', COALESCE(K."updatedAt", K."createdAt")))
  ), DEALS_CLOSED_JSON AS (
    SELECT
      JSON_AGG(JSON_BUILD_OBJECT('month',
      MONTH_LABEL,
      'count',
      COUNT) ORDER BY MONTH_LABEL) AS DEALSCLOSED
    FROM
      DEALS_CLOSED_COUNTS
  ), CONVERSION_DATA AS (
    SELECT
      *
    FROM
      ( VALUES ('Outbound',
      ROUND(RANDOM()*30 + 10)),
      ('Inbound',
      ROUND(RANDOM()*30 + 10)),
      ('Referral',
      ROUND(RANDOM()*30 + 10)),
      ('Partnership',
      ROUND(RANDOM()*30 + 10)),
      ('Events',
      ROUND(RANDOM()*30 + 10)) ) AS C(CHANNEL,
      PERCENTAGE)
  ), CONVERSION_JSON AS (
    SELECT
      JSON_AGG(JSON_BUILD_OBJECT('channel',
      CHANNEL,
      'percentage',
      PERCENTAGE)) AS CONVERSION
    FROM
      CONVERSION_DATA
  ), SENTIMENT_COUNTS AS (
    SELECT
      V.SENTIMENT,
      COUNT(*) AS SCORE
    FROM
      PUBLIC.VALIDATION V
    GROUP BY
      V.SENTIMENT
    ORDER BY
      V.SENTIMENT
  ), MEETING_SENTIMENT_JSON AS (
    SELECT
      JSON_AGG(JSON_BUILD_OBJECT('sentiment',
      SENTIMENT,
      'score',
      SCORE)) AS MEETINGSENTIMENT
    FROM
      SENTIMENT_COUNTS
  )
  SELECT
    JSON_BUILD_OBJECT( 'revenue',
    (
      SELECT
        REVENUE
      FROM
        REVENUE_JSON
    ),
    'meetings',
    (
      SELECT
        MEETINGS
      FROM
        MEETINGS_JSON
    ),
    'salesFunnel',
    (
      SELECT
        SALESFUNNEL
      FROM
        SALES_FUNNEL_JSON
    ),
    'salesTarget',
    (
      SELECT
        SALESTARGET
      FROM
        SALES_TARGET_JSON
    ),
    'leadsPerformance',
    (
      SELECT
        LEADSPERFORMANCE
      FROM
        LEADS_PERFORMANCE_JSON
    ),
    'packages',
    (
      SELECT
        PACKAGES
      FROM
        PACKAGES_JSON
    ),
    'dealsClosed',
    (
      SELECT
        DEALSCLOSED
      FROM
        DEALS_CLOSED_JSON
    ),
    'conversion',
    (
      SELECT
        CONVERSION
      FROM
        CONVERSION_JSON
    ),
    'meetingSentiment',
    (
      SELECT
        MEETINGSENTIMENT
      FROM
        MEETING_SENTIMENT_JSON
    ) ) AS DASHBOARD_JSON;