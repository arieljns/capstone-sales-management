import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { UsersService } from 'src/users/users.service';
import { BeforeMeetingService } from 'src/before-meeting/before-meeting.service';
import { ensureTestDb, createTestUser, resetTestDatabase } from './helpers';

jest.setTimeout(30000);

describe('Integration: BeforeMeetingService', () => {
  let app: INestApplication;
  let users: UsersService;
  let before: BeforeMeetingService;
  let userId: string;
  let meetingId: string;

  beforeAll(async () => {
    await ensureTestDb();
    await resetTestDatabase();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    users = app.get(UsersService);
    before = app.get(BeforeMeetingService);
    const { user } = await createTestUser(users);
    userId = user.id;
  });

  afterAll(async () => {
    await app.close();
    await resetTestDatabase();
  });

  it('creates, reads, updates, moves stage, and deletes meeting', async () => {
    const createRes = await before.createMeeting(
      {
        name: 'Acme Discovery',
        desc: 'Initial discovery call',
        totalTask: 3,
        completedTask: 0,
        companySize: '51-200',
        picName: 'Dana',
        picRole: ['Manager'],
        notes: 'Bring deck',
        currentSystem: ['Sheets'],
        systemRequirement: ['CRM'],
        budget: 5000,
        category: ['Sales'],
      } as any,
      userId,
    );
    expect(createRes.success).toBe(true);

    const meetings = await before.getMeetings(userId);
    expect(meetings.length).toBeGreaterThan(0);
    meetingId = meetings[0].id as any;

    const byId = await before.getMeetingById(meetingId);
    expect(byId).toBeDefined();
    expect(byId.name).toBe('Acme Discovery');

    const moved = await before.moveMeetingStage(meetingId);
    expect(moved.isMeetingStage).toBe(true);

    const updated = await before.updateMeeting(meetingId, { notes: 'Updated notes' } as any);
    expect(updated.notes).toBe('Updated notes');

    const del = await before.deleteMeeting(Number(meetingId));
    expect((del as any).message).toContain('deleted');

    await expect(before.getMeetingById(meetingId)).rejects.toThrow(
      'An error occurred while fetching the meeting',
    );
  });
});
