CREATE MATERIALIZED VIEW IF NOT EXISTS mv_sales_funnel AS
SELECT
  date_trunc('week', "createdAt") AS week,
  COUNT(*) AS total_tickets,
  COUNT(CASE WHEN stage = 'QuotationSent' THEN 1 END) AS quotation_sent,
  COUNT(CASE WHEN stage = 'FollowUp' THEN 1 END) AS follow_up,
  COUNT(CASE WHEN stage = 'Negotiation' THEN 1 END) AS negotiation,
  COUNT(CASE WHEN stage = 'DecisionPending' THEN 1 END) AS decision_pending,
  COUNT(CASE WHEN stage = 'ClosedWon' THEN 1 END) AS closed_won,
  COUNT(CASE WHEN stage = 'ClosedLost' THEN 1 END) AS closed_lost,
  CASE WHEN COUNT(*) = 0 THEN 0
       ELSE ROUND((COUNT(CASE WHEN stage = 'ClosedWon' THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2)
  END AS conversion_rate_pct
FROM tickets
GROUP BY week
ORDER BY week DESC;
