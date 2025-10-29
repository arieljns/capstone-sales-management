import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { UsersService } from 'src/users/users.service';
import { BeforeMeetingService } from 'src/before-meeting/before-meeting.service';
import { AfterMeetingService } from 'src/after-meeting/after-meeting.service';
import { KanbanTicketService } from 'src/kanban-ticket/kanban-ticket.service';
import { ensureTestDb, createTestUser } from './helpers';
import { StageStatus } from 'src/kanban-ticket/kanban-ticket.entities';

jest.setTimeout(30000);

describe('Integration: AfterMeeting + KanbanTicket services', () => {
  let app: INestApplication;
  let users: UsersService;
  let before: BeforeMeetingService;
  let after: AfterMeetingService;
  let kanban: KanbanTicketService;
  let userId: string;
  let beforeId: string;

  beforeAll(async () => {
    await ensureTestDb();
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    await app.init();
    users = app.get(UsersService);
    before = app.get(BeforeMeetingService);
    after = app.get(AfterMeetingService);
    kanban = app.get(KanbanTicketService);
    const { user } = await createTestUser(users);
    userId = user.id;

    await before.createMeeting(
      {
        name: 'Widget Co',
        desc: 'Discovery',
        totalTask: 2,
        completedTask: 0,
        companySize: '11-50',
        picName: 'Alex',
        picRole: ['Owner'],
        notes: 'none',
        currentSystem: ['Email'],
        systemRequirement: ['Billing'],
        budget: 2000,
        category: ['Ops'],
      } as any,
      userId,
    );
    const meetings = await before.getMeetings(userId);
    beforeId = meetings[0].id as any;
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates after-meeting debrief and kanban ticket, updates funnel, lists grouped tickets', async () => {
    const saved = await after.createMeetingDebriefRecord(
      {
        beforeMeeting: beforeId as any,
        sentiment: 'positive',
        status: 'OPEN',
        excitementLevel: 'high',
        promo: 'none',
        decisionMaker: 'Alex',
        activationAgreement: 'agreed',
        expiredDate: new Date() as any,
        products: [{ id: 'p1', name: 'Sub', price: 100, img: '', productCode: 'S1' }],
        totalEmployee: 10,
        discountRate: '0',
        termIn: '12m',
        totalAmount: 1200,
        mrr: 100,
        isFormSubmitted: false,
      } as any,
      userId,
    );
    expect(saved.id).toBeDefined();

    // Verify ticket grouped under QUOTATION_SENT
    const grouped = await kanban.getKanbanTicketData(userId);
    expect(Object.keys(grouped)).toEqual(
      expect.arrayContaining(['QuotationSent', 'FollowUp', 'Negotiation', 'DecisionPending', 'ClosedWon', 'ClosedLost'])
    );
    const quoteBucket = grouped['QuotationSent'];
    expect(quoteBucket.length).toBeGreaterThan(0);

    // Move to Negotiation
    const ticket = quoteBucket[0];
    const updated = await kanban.updateFunnelPosition(
      {
        destinationStage: StageStatus.NEGOTIATION as any,
        newIndex: 0,
        sourceStage: StageStatus.QUOTATION_SENT as any,
        ticketId: ticket.ticket_id,
      } as any,
      userId,
    );
    expect(updated.stage).toBe(StageStatus.NEGOTIATION);
  });
});

