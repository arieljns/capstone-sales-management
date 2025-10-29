import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

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

  async refreshAll(): Promise<void> {
    const views = [
      'mv_manager_analytics',
      'mv_sales_funnel',
      'mv_revenue_trend',
      'mv_salesman_analytics',
    ];
    for (const v of views) {
      await this.dataSource.query(`REFRESH MATERIALIZED VIEW ${v}`);
    }
  }
}
