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
    return this.dataSource.query('SELECT * FROM public.mv_manager_analytics');
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

  async getTeamMemberMetricsById(userUuid?: string): Promise<MemberMetricDto[]> {
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

  async getUserAnalytics(): Promise<any[]> {
    return this.dataSource.query('SELECT * FROM mv_user_analytics');
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
