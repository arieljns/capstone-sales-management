-- Monthly revenue and MRR trend from validation (after_meeting) records
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_revenue_trend AS
SELECT
  date_trunc('month', "createdAt") AS month,
  SUM(CASE WHEN status IS NOT NULL THEN COALESCE("totalAmount", 0) ELSE 0 END) AS total_amount,
  SUM(COALESCE(mrr, 0)) AS total_mrr,
  AVG(NULLIF(mrr, 0)) AS avg_mrr
FROM validation
GROUP BY month
ORDER BY month DESC;
