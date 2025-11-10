import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { UsersService } from 'src/users/users.service';
import { BeforeMeetingService } from 'src/before-meeting/before-meeting.service';
import { AfterMeetingService } from 'src/after-meeting/after-meeting.service';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { ensureTestDb, createTestUser, resetTestDatabase } from './helpers';

jest.setTimeout(30000);

describe('Integration: AnalyticsService materialized views', () => {
  let app: INestApplication;
  let users: UsersService;
  let before: BeforeMeetingService;
  let after: AfterMeetingService;
  let analytics: AnalyticsService;

  beforeAll(async () => {
    await ensureTestDb();
    await resetTestDatabase();
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    await app.init();
    users = app.get(UsersService);
    before = app.get(BeforeMeetingService);
    after = app.get(AfterMeetingService);
    analytics = app.get(AnalyticsService);
  });

  afterAll(async () => {
    await app.close();
    await resetTestDatabase();
  });

  it('initializes views and returns queryable data', async () => {
    const { user } = await createTestUser(users);
    const userId = user.id;
    await before.createMeeting(
      {
        name: 'Globex',
        desc: 'Intro',
        totalTask: 1,
        completedTask: 0,
        companySize: '201-500',
        picName: 'Pat',
        picRole: ['Mgr'],
        notes: '',
        currentSystem: ['CRM'],
        systemRequirement: ['Billing'],
        budget: 1000,
        category: ['Sales'],
      } as any,
      userId,
    );
    const bms = await before.getMeetings(userId);
    const bmId = bms[0].id as any;
    await after.createMeetingDebriefRecord(
      {
        beforeMeeting: bmId,
        sentiment: 'positive',
        status: 'OPEN',
        excitementLevel: 'high',
        promo: 'none',
        decisionMaker: 'Pat',
        activationAgreement: 'agreed',
        expiredDate: new Date() as any,
        products: [],
        totalEmployee: 10,
        discountRate: '0',
        termIn: '12m',
        totalAmount: 5000,
        mrr: 300,
        isFormSubmitted: false,
      } as any,
      userId,
    );

    // Refresh views after seeding
    await analytics.refreshAll();

    const manager = await analytics.getManagerAnalytics();
    const funnel = await analytics.getSalesFunnel();
    const revenue = await analytics.getRevenueTrend();
    const salesman = await analytics.getSalesmanAnalytics();
    const memberMetrics = await analytics.getTeamMemberMetricsById();
    const filteredSalesman = await analytics.getSalesmanAnalytics('non-existent-id');

    expect(Array.isArray(manager)).toBe(true);
    expect(Array.isArray(funnel)).toBe(true);
    expect(Array.isArray(revenue)).toBe(true);
    expect(Array.isArray(salesman)).toBe(true);
    expect(Array.isArray(memberMetrics)).toBe(true);
    expect(filteredSalesman).toEqual(expect.any(Array));
  });
});
