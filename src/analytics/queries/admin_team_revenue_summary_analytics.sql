CREATE OR REPLACE VIEW admin_weekly_summary_view AS
WITH won AS (
    SELECT
        t."id" AS ticket_id,
        t."dealValue" AS deal_value,
        t."afterMeetingId",
        DATE_TRUNC('week', t."updatedAt") AS week_start
    FROM tickets t
    INNER JOIN user_entity u ON u."id" = t."userId"
    WHERE u."role" = 'user'
      AND t."stage" = 'ClosedWon'
      AND DATE_TRUNC('month', t."updatedAt") = DATE_TRUNC('month', NOW())
),

lost AS (
    SELECT
        t."id" AS ticket_id,
        t."dealValue" AS deal_value,
        DATE_TRUNC('week', t."updatedAt") AS week_start
    FROM tickets t
    INNER JOIN user_entity u ON u."id" = t."userId"
    WHERE u."role" = 'user'
      AND t."stage" = 'ClosedLost'
      AND DATE_TRUNC('month', t."updatedAt") = DATE_TRUNC('month', NOW())
),

open_deals AS (
    SELECT
        t."id" AS ticket_id,
        DATE_TRUNC('week', t."updatedAt") AS week_start
    FROM tickets t
    INNER JOIN user_entity u ON u."id" = t."userId"
    WHERE u."role" = 'user'
      AND t."stage" IN ('QuotationSent', 'FollowUp', 'Negotiation', 'DecisionPending')
      AND DATE_TRUNC('month', t."updatedAt") = DATE_TRUNC('month', NOW())
),

after_meeting_join AS (
    SELECT
        w.week_start,
        w.deal_value,
        am."products",
        am."id" AS after_meeting_id
    FROM won w
    INNER JOIN validation am ON am."id" = w."afterMeetingId"
),

expanded_products AS (
    SELECT
        amj.week_start,
        (p->>'id') AS product_id,
        (p->>'name') AS product_name,
        (p->>'price')::numeric AS price,
        1 AS qty
    FROM after_meeting_join amj,
    LATERAL jsonb_array_elements(amj."products") AS p
),

product_agg AS (
    SELECT
        week_start,
        product_id,
        product_name,
        COUNT(*) AS total_qty_sold,
        SUM(price) AS total_revenue
    FROM expanded_products
    GROUP BY week_start, product_id, product_name
),

summary AS (
    SELECT
        week_start,

        -- won metrics
        (SELECT SUM(deal_value) FROM won w WHERE w.week_start = s.week_start) AS total_revenue_won,
        (SELECT COUNT(*) FROM won w WHERE w.week_start = s.week_start) AS total_closed_won,

        -- lost metrics
        (SELECT SUM(deal_value) FROM lost l WHERE l.week_start = s.week_start) AS total_revenue_lost,
        (SELECT COUNT(*) FROM lost l WHERE l.week_start = s.week_start) AS total_closed_lost,

        -- open deals
        (SELECT COUNT(*) FROM open_deals o WHERE o.week_start = s.week_start) AS total_open_deals,

        -- products
        (SELECT SUM(total_qty_sold) FROM product_agg pa WHERE pa.week_start = s.week_start) AS total_products_sold

    FROM (
        SELECT DISTINCT week_start
        FROM (
            SELECT week_start FROM won
            UNION
            SELECT week_start FROM lost
            UNION
            SELECT week_start FROM open_deals
        ) AS w
    ) AS s
)

SELECT
    TO_CHAR(week_start, 'YYYY-MM-DD') AS week_start,
    total_revenue_won,
    total_revenue_lost,
    total_open_deals,
    total_closed_won,
    total_closed_lost,

    CASE 
        WHEN (total_closed_won + total_closed_lost) = 0 
        THEN 0
        ELSE ROUND((total_closed_won::numeric / (total_closed_won + total_closed_lost)) * 100, 2)
    END AS conversion_rate,

    total_products_sold,

    COALESCE(
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'product_id', pa.product_id,
                    'product_name', pa.product_name,
                    'total_qty_sold', pa.total_qty_sold,
                    'total_revenue', pa.total_revenue
                )
            )
            FROM product_agg pa
            WHERE pa.week_start = summary.week_start
        ),
        '[]'
    ) AS product_performance

FROM summary
ORDER BY week_start;
