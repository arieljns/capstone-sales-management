import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ensureTestDb, resetTestDatabase } from './integration/helpers';

describe('Sales workflow (e2e)', () => {
  let app: INestApplication;
  let server: any;
  const password = 'P@ssw0rd!';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_NAME = process.env.DB_NAME || 'capstone_sales_test';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    process.env.TYPEORM_SYNC = process.env.TYPEORM_SYNC || 'true';

    await ensureTestDb();
    await resetTestDatabase();

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await resetTestDatabase();
    await app.close();
  });

  it('registers, authenticates, and runs before/after/kanban/analytics flow', async () => {
    const email = `e2e_${Date.now()}@example.com`;

    const signUpRes = await request(server)
      .post('/users/sign-up')
      .send({ email, password, role: 'user' })
      .expect(201);
    expect(signUpRes.body.email).toBe(email);

    const signInRes = await request(server)
      .post('/users/sign-in')
      .send({ email, password })
      .expect(201);
    const token = signInRes.body.token;
    expect(token).toBeDefined();
    const authHeader = { Authorization: `Bearer ${token}` };

    const beforePayload = {
      name: 'E2E Discovery',
      desc: 'Initial scoping call',
      totalTask: 2,
      completedTask: 0,
      companySize: '11-50',
      picName: 'Alex',
      picRole: ['Owner'],
      notes: 'auto-seeded',
      currentSystem: ['Email'],
      systemRequirement: ['Billing'],
      budget: 5000,
      category: ['Sales'],
      meetingDate: new Date().toISOString(),
    };

    await request(server).post('/before').set(authHeader).send(beforePayload).expect(201);

    const listBeforeRes = await request(server).get('/before').set(authHeader).expect(200);
    expect(Array.isArray(listBeforeRes.body)).toBe(true);
    const matching = listBeforeRes.body.find((item) => item.name === beforePayload.name);
    expect(matching).toBeDefined();
    const beforeId = matching.id;

    await request(server)
      .patch(`/before/${beforeId}/move-stage`)
      .set(authHeader)
      .expect(200);

    const afterPayload = {
      beforeMeeting: String(beforeId),
      sentiment: 'positive',
      status: 'OPEN',
      excitementLevel: 'high',
      promo: 'none',
      decisionMaker: 'Alex',
      activationAgreement: 'agreed',
      expiredDate: new Date(Date.now() + 86400000).toISOString(),
      products: [
        {
          id: 'prod-1',
          name: 'Subscription',
          price: 100,
          img: 'https://example.com/img.png',
          productCode: 'SUB-1',
        },
      ],
      totalEmployee: 25,
      totalAmount: 1200,
      mrr: 100,
      discountRate: '0',
      termIn: '12m',
    };

    const afterRes = await request(server).post('/after').set(authHeader).send(afterPayload).expect(201);
    expect(afterRes.body.id).toBeDefined();
    const afterId = afterRes.body.id;

    const afterList = await request(server).get('/after/user/data').set(authHeader).expect(200);
    expect(afterList.body.some((record) => record.id === afterId)).toBe(true);

    const kanbanRes = await request(server).get('/kanban').set(authHeader).expect(200);
    const quotationTickets = kanbanRes.body?.QuotationSent || [];
    expect(quotationTickets.length).toBeGreaterThan(0);
    const ticketId = quotationTickets[0].ticket_id;

    const updatedTicket = await request(server)
      .patch('/kanban')
      .set(authHeader)
      .send({
        destinationStage: 'Negotiation',
        newIndex: 0,
        sourceStage: 'QuotationSent',
        ticketId,
      })
      .expect(200);
    expect(updatedTicket.body.stage).toBe('Negotiation');

    await request(server).post('/analytics/refresh').expect(201);
    const analyticsRes = await request(server).get('/analytics/funnel').expect(200);
    expect(Array.isArray(analyticsRes.body)).toBe(true);

  });
});
