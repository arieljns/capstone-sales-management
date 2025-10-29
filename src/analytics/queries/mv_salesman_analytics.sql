CREATE MATERIALIZED VIEW IF NOT EXISTS mv_salesman_analytics AS
SELECT 
  "userId" AS salesman_id,
  date_trunc('week', "updatedAt") AS week,
  COUNT(*) AS lead_count,
  SUM(COALESCE("dealValue", 0)) AS total_value,
  SUM(CASE WHEN stage = 'ClosedWon' THEN COALESCE("dealValue", 0) ELSE 0 END) AS won_value,
  COUNT(CASE WHEN stage = 'ClosedWon' THEN 1 END) AS won_count,
  COUNT(CASE WHEN stage = 'ClosedLost' THEN 1 END) AS lost_count,
  CASE WHEN COUNT(*) = 0 THEN 0
       ELSE ROUND((COUNT(CASE WHEN stage = 'ClosedWon' THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2)
  END AS conversion_rate_pct
FROM tickets
GROUP BY salesman_id, week
ORDER BY week DESC;
