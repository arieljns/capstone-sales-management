import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { DataSource } from 'typeorm';

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTeamMemberMetrics', () => {
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

      const result = await service.getTeamMemberMetrics();

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

    it('applies filtering when userId is provided', async () => {
      queryMock.mockResolvedValueOnce([]);

      await service.getTeamMemberMetrics('revina.arifin');

      expect(queryMock).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1'),
        ['revina.arifin'],
      );
    });
  });
});
