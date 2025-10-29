import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { UsersService } from 'src/users/users.service';
import { BeforeMeetingService } from 'src/before-meeting/before-meeting.service';
import { AfterMeetingService } from 'src/after-meeting/after-meeting.service';
import { FormBuilderService } from 'src/form-builder/form-builder.service';
import { ensureTestDb, createTestUser } from './helpers';

jest.setTimeout(30000);

describe('Integration: FormBuilderService', () => {
  let app: INestApplication;
  let users: UsersService;
  let before: BeforeMeetingService;
  let after: AfterMeetingService;
  let form: FormBuilderService;

  beforeAll(async () => {
    await ensureTestDb();
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    await app.init();
    users = app.get(UsersService);
    before = app.get(BeforeMeetingService);
    after = app.get(AfterMeetingService);
    form = app.get(FormBuilderService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('fetches form data for an existing after-meeting', async () => {
    const { user } = await createTestUser(users);
    const userId = user.id;
    await before.createMeeting(
      {
        name: 'Contoso',
        desc: 'Scope',
        totalTask: 1,
        completedTask: 0,
        companySize: '1-10',
        picName: 'Casey',
        picRole: ['Lead'],
        notes: '',
        currentSystem: ['None'],
        systemRequirement: ['Billing'],
        budget: 500,
        category: ['Sales'],
      } as any,
      userId,
    );
    const bms = await before.getMeetings(userId);
    const bmId = bms[0].id as any;
    const saved = await after.createMeetingDebriefRecord(
      {
        beforeMeeting: bmId,
        sentiment: 'neutral',
        status: 'OPEN',
        excitementLevel: 'med',
        promo: 'none',
        decisionMaker: 'Casey',
        activationAgreement: 'pending',
        expiredDate: new Date() as any,
        products: [],
        totalEmployee: 3,
        discountRate: '0',
        termIn: '6m',
        totalAmount: 300,
        mrr: 50,
        isFormSubmitted: false,
      } as any,
      userId,
    );

    const fetched = await form.getFormData(saved.id);
    expect(fetched).toBeDefined();
    expect(fetched.id).toBe(saved.id);
  });
});

