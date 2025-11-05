CREATE MATERIALIZED VIEW IF NOT EXISTS PUBLIC.MV_MEMBER_ANALYTICS AS
  WITH PARAMS AS (
    SELECT
      DATE_TRUNC('month',
      CURRENT_DATE) AS START_DATE,
      (DATE_TRUNC('month',
      CURRENT_DATE) + INTERVAL '1 month') AS END_DATE
  ), LEAD_AGG AS (
    SELECT
      BM."userId"::UUID AS USER_ID,
      COUNT(*) AS LEAD_COUNT
    FROM
      PUBLIC.BEFORE_MEETING BM,
      PARAMS P
    WHERE
      COALESCE(BM."meetingDate", BM."createdAt") >= P.START_DATE
      AND COALESCE(BM."meetingDate", BM."createdAt") < P.END_DATE
    GROUP BY
      BM."userId"
  ), DEAL_AGG AS (
    SELECT
      K."userId"::UUID AS USER_ID,
      COUNT(*) AS TOTAL_DEALS,
      COUNT(*) FILTER (WHERE K.STAGE = 'ClosedWon') AS CLOSED_WON,
      COUNT(*) FILTER (WHERE K.STAGE = 'ClosedLost') AS CLOSED_LOST,
      COUNT(*) FILTER (WHERE K.STAGE NOT IN ('ClosedWon',
      'ClosedLost')) AS OPEN_DEALS,
      COALESCE(AVG(K."dealValue"),
      0) AS AVG_DEAL_VALUE
    FROM
      PUBLIC.TICKETS K,
      PARAMS P
    WHERE
      COALESCE(K."updatedAt", K."createdAt") >= P.START_DATE
      AND COALESCE(K."updatedAt", K."createdAt") < P.END_DATE
    GROUP BY
      K."userId"
  ), REVENUE_AGG AS (
    SELECT
      V."userId"::UUID AS USER_ID,
      COALESCE(SUM(V."totalAmount"),
      0) AS TOTAL_REVENUE,
      COALESCE(SUM(V."mrr"),
      0) AS TOTAL_MRR
    FROM
      PUBLIC.VALIDATION V
      JOIN PUBLIC.TICKETS K
      ON K."afterMeetingId" = V.ID
      JOIN PARAMS P
      ON TRUE
    WHERE
      K.STAGE = 'ClosedWon'
      AND COALESCE(V."createdAt", V."expiredDate") >= P.START_DATE
      AND COALESCE(V."createdAt", V."expiredDate") < P.END_DATE
    GROUP BY
      V."userId"
  ), ACTIVITY_AGG AS (
    SELECT
      X.USER_ID,
      MAX(X.ACTIVITY) AS LATEST_ACTIVITY
    FROM
      (
        SELECT
          BM."userId"::UUID AS USER_ID,
          BM."createdAt" AS ACTIVITY
        FROM
          PUBLIC.BEFORE_MEETING BM
        UNION
        ALL
        SELECT
          V."userId"::UUID,
          V."createdAt"
        FROM
          PUBLIC.VALIDATION V
        UNION
        ALL
        SELECT
          K."userId"::UUID,
          COALESCE(K."updatedAt",
          K."createdAt")
        FROM
          PUBLIC.TICKETS K
      ) X
    WHERE
      X.USER_ID IS NOT NULL
    GROUP BY
      X.USER_ID
  )
  SELECT
    U.ID AS USER_ID,
    U.EMAIL,
    COALESCE(L.LEAD_COUNT,
    0) AS LEAD_COUNT,
    COALESCE(D.TOTAL_DEALS,
    0) AS TOTAL_DEALS,
    COALESCE(D.CLOSED_WON,
    0) AS CLOSED_WON,
    COALESCE(D.CLOSED_LOST,
    0) AS CLOSED_LOST,
    COALESCE(D.OPEN_DEALS,
    0) AS OPEN_DEALS,
    COALESCE(ROUND(D.AVG_DEAL_VALUE,
    2),
    0) AS AVG_DEAL_VALUE,
    COALESCE(R.TOTAL_REVENUE,
    0) AS TOTAL_REVENUE,
    COALESCE(R.TOTAL_MRR,
    0) AS TOTAL_MRR,
    A.LATEST_ACTIVITY
  FROM
    PUBLIC."user_entity" U
    LEFT JOIN LEAD_AGG L
    ON L.USER_ID = U.ID
    LEFT JOIN DEAL_AGG D
    ON D.USER_ID = U.ID
    LEFT JOIN REVENUE_AGG R
    ON R.USER_ID = U.ID
    LEFT JOIN ACTIVITY_AGG A
    ON A.USER_ID = U.ID
  ORDER BY
    U.EMAIL ASC;