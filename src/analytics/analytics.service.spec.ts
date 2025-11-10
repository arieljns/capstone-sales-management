import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { DataSource } from 'typeorm';
import * as fs from 'fs';

jest.mock('fs');

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let queryMock: jest.Mock;

  beforeEach(async () => {
    queryMock = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: DataSource, useValue: { query: queryMock } },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  describe('onModuleInit', () => {
    it('reads sql files, executes them, and logs success', async () => {
      (fs.readdirSync as jest.Mock).mockReturnValue(['a.sql', 'ignore.txt', 'b.sql']);
      (fs.readFileSync as jest.Mock).mockImplementation((file: string) => `${file}-content`);
      const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation();

      await service.onModuleInit();

      expect(queryMock).toHaveBeenCalledTimes(2);
      expect(queryMock).toHaveBeenNthCalledWith(1, expect.stringContaining('a.sql-content'));
      expect(queryMock).toHaveBeenNthCalledWith(2, expect.stringContaining('b.sql-content'));
      expect(logSpy).toHaveBeenNthCalledWith(1, expect.stringContaining('a.sql'));
      expect(logSpy).toHaveBeenNthCalledWith(2, expect.stringContaining('b.sql'));
      logSpy.mockRestore();
    });

    it('logs error when initialization throws', async () => {
      (fs.readdirSync as jest.Mock).mockImplementation(() => {
        throw new Error('fs failure');
      });
      const errorSpy = jest.spyOn(service['logger'], 'error').mockImplementation();

      await service.onModuleInit();

      expect(queryMock).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to initialize analytics materialized views',
        expect.any(Error),
      );
      errorSpy.mockRestore();
    });
  });

  describe('basic getters', () => {
    it('getManagerAnalytics proxies select to datasource', async () => {
      queryMock.mockResolvedValueOnce([{ id: 1 }]);
      await expect(service.getManagerAnalytics()).resolves.toEqual([{ id: 1 }]);
      expect(queryMock).toHaveBeenCalledWith('SELECT * FROM public.mv_manager_analytics');
    });

    it('getSalesFunnel proxies view query', async () => {
      queryMock.mockResolvedValueOnce([{ id: 2 }]);
      await service.getSalesFunnel();
      expect(queryMock).toHaveBeenCalledWith('SELECT * FROM public.mv_sales_funnel');
    });

    it('getRevenueTrend proxies view query', async () => {
      queryMock.mockResolvedValueOnce([{ id: 3 }]);
      await service.getRevenueTrend();
      expect(queryMock).toHaveBeenCalledWith('SELECT * FROM public.mv_revenue_trend');
    });

    it('getUserAnalytics queries mv_user_analytics', async () => {
      queryMock.mockResolvedValueOnce([{ id: 4 }]);
      await service.getUserAnalytics();
      expect(queryMock).toHaveBeenCalledWith('SELECT * FROM mv_user_analytics');
    });
  });

  describe('getTeamMemberMetricsById', () => {
    it('maps query results into MemberMetricDto objects', async () => {
      queryMock.mockResolvedValueOnce([
        {
          userUuid: 'eb8f0b2d-9a37-4a3b-9a95-1f31abc12345',
          userId: 'revina.arifin',
          email: 'rev.ari@indigo.io',
          name: 'Revina Arifin',
          initials: 'RA',
          leadCount: '56',
          totalDeals: '34',
          closedWon: '22',
          totalRevenue: '812000000',
          totalMrr: '92000000',
          conversionRate: '39.5',
        },
      ]);

      const result = await service.getTeamMemberMetricsById();

      expect(queryMock).toHaveBeenCalledWith(
        expect.stringContaining('FROM public.mv_member_metrics'),
        [],
      );
      expect(result).toEqual([
        {
          userUuid: 'eb8f0b2d-9a37-4a3b-9a95-1f31abc12345',
          userId: 'revina.arifin',
          email: 'rev.ari@indigo.io',
          name: 'Revina Arifin',
          initials: 'RA',
          leadCount: 56,
          totalDeals: 34,
          closedWon: 22,
          totalRevenue: 812000000,
          totalMrr: 92000000,
          conversionRate: 39.5,
        },
      ]);
    });

    it('applies filtering when user UUID is provided', async () => {
      queryMock.mockResolvedValueOnce([]);

      await service.getTeamMemberMetricsById('eb8f0b2d-9a37-4a3b-9a95-1f31abc12345');

      expect(queryMock).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_uuid = $1::uuid'),
        ['eb8f0b2d-9a37-4a3b-9a95-1f31abc12345'],
      );
    });
  });

  describe('getSalesmanAnalytics', () => {
    it('queries all salesmen when no identifier provided', async () => {
      queryMock.mockResolvedValueOnce([{ id: 1 }]);
      const result = await service.getSalesmanAnalytics();

      expect(queryMock).toHaveBeenCalledWith(
        'SELECT * FROM public.mv_salesman_analytics',
      );
      expect(result).toEqual([{ id: 1 }]);
    });

    it('passes salesman identifier to query parameters', async () => {
      queryMock.mockResolvedValueOnce([{ id: 2 }]);
      const result = await service.getSalesmanAnalytics('sales-1');

      expect(queryMock).toHaveBeenCalledWith(
        'SELECT * FROM public.mv_salesman_analytics WHERE salesman_id = $1',
        ['sales-1'],
      );
      expect(result).toEqual([{ id: 2 }]);
    });
  });

  describe('refreshAll', () => {
    it('issues refresh statements for every materialized view', async () => {
      queryMock.mockResolvedValue(undefined);

      await service.refreshAll();

      expect(queryMock).toHaveBeenCalledTimes(7);
      expect(queryMock.mock.calls[0][0]).toBe('REFRESH MATERIALIZED VIEW mv_manager_analytics');
      const lastCallIndex = queryMock.mock.calls.length - 1;
      expect(queryMock.mock.calls[lastCallIndex][0]).toBe(
        'REFRESH MATERIALIZED VIEW mv_user_analytics',
      );
    });
  });
});
