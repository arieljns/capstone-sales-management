import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Req } from '@nestjs/common';

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Get('user')
  getUserAnalytics(@Req() req) {
    console.log('user analytics get triggered')
    return this.analyticsService.getUserAnalytics(req.user.userId);
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

  @Get('team-metrics')
  getTeamMetrics() {
    return this.analyticsService.getTeamMemberMetricsById();
  }

  @Get('team-metrics/:userId')
  getTeamMember(@Param('userId') userUuid: string) {
    console.log('Requested userId:', userUuid);
    return this.analyticsService.getTeamMemberMetricsById(userUuid);
  }

  @Post('refresh')
  refreshMaterializedViews() {
    return this.analyticsService.refreshAll();
  }
}
