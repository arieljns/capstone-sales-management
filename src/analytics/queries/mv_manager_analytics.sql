CREATE MATERIALIZED VIEW IF NOT EXISTS mv_manager_analytics AS
SELECT
  COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) AS positive_sentiment,
  COUNT(CASE WHEN sentiment = 'neutral' THEN 1 END) AS neutral_sentiment,
  COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) AS negative_sentiment
FROM validation;
