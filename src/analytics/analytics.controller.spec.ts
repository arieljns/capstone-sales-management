import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  const serviceMock = {
    getManagerAnalytics: jest.fn().mockResolvedValue(['manager']),
    getSalesFunnel: jest.fn().mockResolvedValue(['funnel']),
    getRevenueTrend: jest.fn().mockResolvedValue(['revenue']),
    getSalesmanAnalytics: jest.fn().mockResolvedValue(['salesman']),
    getTeamMemberMetricsById: jest.fn().mockResolvedValue(['team']),
    getUserAnalytics: jest.fn().mockResolvedValue(['user']),
    refreshAll: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    Object.values(serviceMock).forEach((fn) =>
      typeof fn === 'function' ? fn.mockClear() : null,
    );

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [{ provide: AnalyticsService, useValue: serviceMock }],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns manager analytics from service', async () => {
    await expect(controller.getManagerAnalytics()).resolves.toEqual(['manager']);
    expect(serviceMock.getManagerAnalytics).toHaveBeenCalled();
  });

  it('requests funnel data from service', async () => {
    await expect(controller.getSalesFunnel()).resolves.toEqual(['funnel']);
    expect(serviceMock.getSalesFunnel).toHaveBeenCalled();
  });

  it('requests revenue trend', async () => {
    await expect(controller.getRevenueTrend()).resolves.toEqual(['revenue']);
    expect(serviceMock.getRevenueTrend).toHaveBeenCalled();
  });

  it('delegates salesman analytics with and without id', async () => {
    await controller.getAllSalesmanAnalytics();
    expect(serviceMock.getSalesmanAnalytics).toHaveBeenCalledWith();

    await controller.getSalesmanAnalytics('abc');
    expect(serviceMock.getSalesmanAnalytics).toHaveBeenCalledWith('abc');
  });

  it('retrieves aggregated team metrics', async () => {
    await controller.getTeamMetrics();
    expect(serviceMock.getTeamMemberMetricsById).toHaveBeenCalledWith();

    await controller.getTeamMember('user-uuid');
    expect(serviceMock.getTeamMemberMetricsById).toHaveBeenLastCalledWith('user-uuid');
  });

  it('refreshes materialized views on demand', async () => {
    await controller.refreshMaterializedViews();
    expect(serviceMock.refreshAll).toHaveBeenCalledTimes(1);
  });
});
