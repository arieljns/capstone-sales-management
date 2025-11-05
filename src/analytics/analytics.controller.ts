import { Controller, Get, Param, Post } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  getManagerAnalytics() {
    return this.analyticsService.getManagerAnalytics();
  }

  @Get('funnel')
  getSalesFunnel() {
    return this.analyticsService.getSalesFunnel();
  }

  @Get('user')
  getUserAnalytics() {
    return this.analyticsService.getUserAnalytics();
  }

  @Get('revenue')
  getRevenueTrend() {
    return this.analyticsService.getRevenueTrend();
  }

  @Get('salesmen')
  getAllSalesmanAnalytics() {
    return this.analyticsService.getSalesmanAnalytics();
  }

  @Get('salesmen/:id')
  getSalesmanAnalytics(@Param('id') id: string) {
    return this.analyticsService.getSalesmanAnalytics(id);
  }

  @Get('/team-metrics')
  getTeamMetricsAnalytics() {
    return this.analyticsService.getTeamMemberAnalytics();
  }

  @Post('refresh')
  refreshMaterializedViews() {
    return this.analyticsService.refreshAll();
  }
}
