import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { MemberMetricDto } from './dto/member-metric.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    const queriesDir = path.join(process.cwd(), 'src/analytics/queries');
    try {
      const files = fs
        .readdirSync(queriesDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();

      for (const file of files) {
        const sql = fs.readFileSync(path.join(queriesDir, file), 'utf8');
        await this.dataSource.query(sql);
        this.logger.log(`Applied analytics SQL: ${file}`);
      }
    } catch (err) {
      this.logger.error(
        'Failed to initialize analytics materialized views',
        err as any,
      );
    }
  }

  async getManagerAnalytics(): Promise<any[]> {
    return this.dataSource.query('SELECT * FROM admin_weekly_summary_view');
  }

  async getSalesFunnel(): Promise<any[]> {
    return this.dataSource.query('SELECT * FROM public.mv_sales_funnel');
  }

  async getRevenueTrend(): Promise<any[]> {
    return this.dataSource.query('SELECT * FROM public.mv_revenue_trend');
  }

  async getSalesmanAnalytics(salesmanId?: string): Promise<any[]> {
    if (salesmanId) {
      return this.dataSource.query(
        'SELECT * FROM public.mv_salesman_analytics WHERE salesman_id = $1',
        [salesmanId],
      );
    }
    return this.dataSource.query('SELECT * FROM public.mv_salesman_analytics');
  }

  async getTeamMemberMetricsById(
    userUuid?: string,
  ): Promise<MemberMetricDto[]> {
    let query = `SELECT
      user_uuid AS "userUuid",
      user_id AS "userId",
      email,
      name,
      initials,
      lead_count AS "leadCount",
      total_deals AS "totalDeals",
      closed_won AS "closedWon",
      total_revenue AS "totalRevenue",
      total_mrr AS "totalMrr",
      conversion_rate AS "conversionRate"
    FROM public.mv_member_metrics`;
    const params: string[] = [];

    if (userUuid) {
      query += ' WHERE user_uuid = $1::uuid';
      params.push(userUuid);
    }

    query += ' ORDER BY user_id';

    const rows = await this.dataSource.query(query, params);

    return rows.map((row) => ({
      userUuid: row.userUuid,
      userId: row.userId,
      email: row.email,
      name: row.name,
      initials: row.initials,
      leadCount: Number(row.leadCount ?? 0),
      totalDeals: Number(row.totalDeals ?? 0),
      closedWon: Number(row.closedWon ?? 0),
      totalRevenue: Number(row.totalRevenue ?? 0),
      totalMrr: Number(row.totalMrr ?? 0),
      conversionRate: Number(row.conversionRate ?? 0),
    }));
  }

  async getUserAnalytics(userId: string): Promise<any> {
    console.log(userId);
    try {
      const result = await this.dataSource.query(
        `
        SELECT 
          "userId",
          revenue,
          target,
          meetings,
          sentiment,
          funnel,
          deals
        FROM public.mv_user_dashboard_monthly
        WHERE "userId" = $1
        LIMIT 1;
        `,
        [userId],
      );

      if (!result.length) {
        this.logger.warn(`No dashboard record found for user ${userId}`);
        return {
          userId,
          revenue: {
            totalRevenue: 0,
            lostRevenue: 0,
            conversionRate: 0,
            trend: [],
          },
          target: {
            targetAmount: 1000000000,
            achievedAmount: 0,
            remainingAmount: 1000000000,
          },
          meetings: {
            totalMeetings: 0,
            completedDebriefs: 0,
            pendingMeetings: 0,
          },
          sentiment: { positive: 0, neutral: 0, negative: 0 },
          funnel: [],
          deals: { totalClosedDeals: 0 },
        };
      }

      return result[0];
    } catch (err) {
      this.logger.error(
        `Error fetching user dashboard for ${userId}`,
        err.stack,
      );
      throw err;
    }
  }

  async refreshAll(): Promise<void> {
    const views = [
      'mv_manager_analytics',
      'mv_sales_funnel',
      'mv_revenue_trend',
      'mv_salesman_analytics',
      'mv_member_analytics',
      'mv_member_metrics',
      'mv_user_analytics',
    ];
    for (const v of views) {
      await this.dataSource.query(`REFRESH MATERIALIZED VIEW ${v}`);
    }
  }
}
