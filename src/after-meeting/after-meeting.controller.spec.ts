import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AfterMeetingController } from './after-meeting.controller';
import { AfterMeetingService } from './after-meeting.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/auth/guards/roles.guards';

describe('AfterMeetingController (HTTP)', () => {
  let app: INestApplication;
  let service: {
    getMeetingDataWithJoin: jest.Mock;
    findAfterMeetingDataById: jest.Mock;
    deleteAfterMeetingData: jest.Mock;
    createMeetingDebriefRecord: jest.Mock;
    createMeetingData: jest.Mock;
    getMeetingDataJoin: jest.Mock;
    getAllAfterMeetingDataByUser: jest.Mock;
  };
  const jwtGuard = { canActivate: jest.fn() };
  const rolesGuard = { canActivate: jest.fn() };

  beforeEach(async () => {
    service = {
      getMeetingDataWithJoin: jest.fn().mockResolvedValue([{ id: 1 }]),
      findAfterMeetingDataById: jest.fn(),
      deleteAfterMeetingData: jest.fn(),
      createMeetingDebriefRecord: jest.fn(),
      createMeetingData: jest.fn(),
      getMeetingDataJoin: jest.fn().mockResolvedValue([{ id: 'join' }]),
      getAllAfterMeetingDataByUser: jest.fn(),
    };

    jwtGuard.canActivate.mockImplementation((context) => {
      const req = context.switchToHttp().getRequest();
      req.user = req.user ?? { userId: 'user-1', role: 'user' };
      return true;
    });
    rolesGuard.canActivate.mockReturnValue(true);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AfterMeetingController],
      providers: [{ provide: AfterMeetingService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(jwtGuard)
      .overrideGuard(RolesGuard)
      .useValue(rolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /after returns meeting data with 200 status code', async () => {
    const response = await request(app.getHttpServer())
      .get('/after')
      .expect(200);

    expect(response.body).toEqual([{ id: 1 }]);
    expect(service.getMeetingDataWithJoin).toHaveBeenCalledWith('user-1');
  });

  it('GET /after returns 401 when guard does not attach userId', async () => {
    jwtGuard.canActivate.mockImplementationOnce((context) => {
      context.switchToHttp().getRequest().user = {};
      return true;
    });

    const response = await request(app.getHttpServer()).get('/after').expect(401);
    expect(response.body.message).toBe('User ID is missing in the request');
  });

  it('POST /after creates a debrief record and returns 201', async () => {
    const dto = { summary: 'done' };
    const created = { id: 15, ...dto };
    service.createMeetingDebriefRecord.mockResolvedValue(created);

    await request(app.getHttpServer()).post('/after').send(dto).expect(201).expect(created);
    expect(service.createMeetingDebriefRecord).toHaveBeenCalledWith(dto, 'user-1');
  });

  it('GET /after/:id fetches a single record', async () => {
    service.findAfterMeetingDataById.mockResolvedValue({ id: 5 });

    await request(app.getHttpServer()).get('/after/5').expect(200).expect({ id: 5 });
    expect(service.findAfterMeetingDataById).toHaveBeenCalledWith('5');
  });

  it('DELETE /after/:id delegates to service', async () => {
    service.deleteAfterMeetingData.mockResolvedValue({ affected: 1 });

    await request(app.getHttpServer()).delete('/after/7').expect(200).expect({ affected: 1 });
    expect(service.deleteAfterMeetingData).toHaveBeenCalledWith('7');
  });

  it('PATCH /after/:id proxies data for creation/update', async () => {
    const payload = { totalAmount: 1000 };
    service.createMeetingData.mockResolvedValue({ id: 8, ...payload });

    await request(app.getHttpServer())
      .patch('/after/8')
      .send(payload)
      .expect(200)
      .expect({ id: 8, ...payload });

    expect(service.createMeetingData).toHaveBeenCalledWith('8', payload);
  });

  it('GET /after/user/data propagates missing user error as 500', async () => {
    jwtGuard.canActivate.mockImplementationOnce((context) => {
      context.switchToHttp().getRequest().user = undefined;
      return true;
    });

    const response = await request(app.getHttpServer()).get('/after/user/data').expect(500);
    expect(response.body.message).toBe('Internal server error');
  });

  it('GET /after/user/data returns list when user id exists', async () => {
    service.getAllAfterMeetingDataByUser.mockResolvedValue([{ id: 1 }]);

    await request(app.getHttpServer()).get('/after/user/data').expect(200).expect([{ id: 1 }]);
    expect(service.getAllAfterMeetingDataByUser).toHaveBeenCalledWith('user-1');
  });

  it('GET /after/test/data returns join data', async () => {
    await request(app.getHttpServer()).get('/after/test/data').expect(200).expect([{ id: 'join' }]);
    expect(service.getMeetingDataJoin).toHaveBeenCalled();
  });

  it('handleRequest bubbles UnauthorizedException as HTTP 401', async () => {
    jwtGuard.canActivate.mockImplementationOnce(() => true);
    rolesGuard.canActivate.mockImplementationOnce(() => {
      throw new UnauthorizedException('blocked');
    });

    await request(app.getHttpServer()).get('/after').expect(401);
  });
});
