import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { BeforeMeetingController } from './before-meeting.controller';
import { BeforeMeetingService } from './before-meeting.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/auth/guards/roles.guards';

describe('BeforeMeetingController (HTTP)', () => {
  let app: INestApplication;
  let service: {
    getMeetings: jest.Mock;
    getMeetingById: jest.Mock;
    moveMeetingStage: jest.Mock;
    createMeeting: jest.Mock;
    updateMeeting: jest.Mock;
    deleteMeeting: jest.Mock;
  };
  const jwtGuard = { canActivate: jest.fn() };
  const rolesGuard = { canActivate: jest.fn() };

  beforeEach(async () => {
    service = {
      getMeetings: jest.fn().mockResolvedValue([{ id: 'm-1' }]),
      getMeetingById: jest.fn().mockResolvedValue({ id: 'detail' }),
      moveMeetingStage: jest.fn().mockResolvedValue({ id: 'm-2', isMeetingStage: true }),
      createMeeting: jest.fn().mockResolvedValue({ success: true }),
      updateMeeting: jest.fn().mockResolvedValue({ id: 'm-3', name: 'Updated' }),
      deleteMeeting: jest.fn().mockResolvedValue({ message: 'deleted successfully', deletedId: 1 }),
    };

    jwtGuard.canActivate.mockImplementation((context) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 'user-1', role: 'user' };
      return true;
    });
    rolesGuard.canActivate.mockReturnValue(true);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BeforeMeetingController],
      providers: [{ provide: BeforeMeetingService, useValue: service }],
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

  it('GET /before lists meetings for authenticated user (status 200)', async () => {
    await request(app.getHttpServer()).get('/before').expect(200).expect([{ id: 'm-1' }]);
    expect(service.getMeetings).toHaveBeenCalledWith('user-1');
  });

  it('GET /before/:id fetches meeting by id', async () => {
    await request(app.getHttpServer()).get('/before/abc').expect(200).expect({ id: 'detail' });
    expect(service.getMeetingById).toHaveBeenCalledWith('abc');
  });

  it('PATCH /before/:id/move-stage updates stage and returns 200', async () => {
    await request(app.getHttpServer())
      .patch('/before/abc/move-stage')
      .expect(200)
      .expect({ id: 'm-2', isMeetingStage: true });
    expect(service.moveMeetingStage).toHaveBeenCalledWith('abc');
  });

  it('POST /before creates meeting payload when userId exists', async () => {
    const dto = { name: 'Deal', desc: 'Important' };

    await request(app.getHttpServer()).post('/before').send(dto).expect(201).expect({ success: true });
    expect(service.createMeeting).toHaveBeenCalledWith(dto, 'user-1');
  });

  it('POST /before fails with 500 when userId missing', async () => {
    jwtGuard.canActivate.mockImplementationOnce((context) => {
      context.switchToHttp().getRequest().user = {};
      return true;
    });

    await request(app.getHttpServer()).post('/before').send({}).expect(500);
    expect(service.createMeeting).not.toHaveBeenCalled();
  });

  it('POST /before/csv forwards payload array to service', async () => {
    const csv = [{ name: 'Deal' }];
    await request(app.getHttpServer()).post('/before/csv').send(csv).expect(201).expect({ success: true });
    expect(service.createMeeting).toHaveBeenCalledWith(csv, 'user-1');
  });

  it('PUT /before/:id updates meeting', async () => {
    const updateDto = { name: 'Updated' };
    await request(app.getHttpServer()).put('/before/xyz').send(updateDto).expect(200).expect({
      id: 'm-3',
      name: 'Updated',
    });
    expect(service.updateMeeting).toHaveBeenCalledWith('xyz', updateDto);
  });

  it('DELETE /before/:id removes meeting', async () => {
    await request(app.getHttpServer()).delete('/before/1').expect(200).expect({
      message: 'deleted successfully',
      deletedId: 1,
    });
    expect(service.deleteMeeting).toHaveBeenCalledWith('1');
  });
});
