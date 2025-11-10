import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { KanbanTicketController } from './kanban-ticket.controller';
import { KanbanTicketService } from './kanban-ticket.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/auth/guards/roles.guards';

describe('KanbanTicketController (HTTP)', () => {
  let app: INestApplication;
  let service: { getKanbanTicketData: jest.Mock; updateFunnelPosition: jest.Mock };
  const jwtGuard = { canActivate: jest.fn() };
  const rolesGuard = { canActivate: jest.fn() };

  beforeEach(async () => {
    service = {
      getKanbanTicketData: jest.fn().mockResolvedValue({ QuotationSent: [] }),
      updateFunnelPosition: jest.fn().mockResolvedValue({ id: 'ticket-1' }),
    };
    jwtGuard.canActivate.mockImplementation((context) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 'user-1', role: 'user' };
      return true;
    });
    rolesGuard.canActivate.mockReturnValue(true);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [KanbanTicketController],
      providers: [{ provide: KanbanTicketService, useValue: service }],
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

  it('GET /kanban returns grouped tickets with status 200', async () => {
    await request(app.getHttpServer())
      .get('/kanban')
      .expect(200)
      .expect({ QuotationSent: [] });
    expect(service.getKanbanTicketData).toHaveBeenCalledWith('user-1');
  });

  it('GET /kanban throws 401 when guard strips user id', async () => {
    jwtGuard.canActivate.mockImplementationOnce((context) => {
      context.switchToHttp().getRequest().user = {};
      return true;
    });

    await request(app.getHttpServer()).get('/kanban').expect(401);
  });

  it('PATCH /kanban updates funnel position and returns 200', async () => {
    const dto = {
      ticketId: 't1',
      destinationStage: 'ClosedWon',
      sourceStage: 'FollowUp',
      newIndex: 1,
    };

    await request(app.getHttpServer()).patch('/kanban').send(dto).expect(200).expect({ id: 'ticket-1' });
    expect(service.updateFunnelPosition).toHaveBeenCalledWith(dto, 'user-1');
  });

  it('PATCH /kanban returns 500 when guard fails to attach user id', async () => {
    jwtGuard.canActivate.mockImplementationOnce((context) => {
      context.switchToHttp().getRequest().user = undefined;
      return true;
    });

    const response = await request(app.getHttpServer())
      .patch('/kanban')
      .send({ ticketId: '1' })
      .expect(500);

    expect(response.body.message).toBe('Internal server error');
    expect(service.updateFunnelPosition).not.toHaveBeenCalled();
  });

  it('propagates errors thrown from RolesGuard as authorization failures', async () => {
    rolesGuard.canActivate.mockImplementationOnce(() => {
      throw new UnauthorizedException();
    });
    await request(app.getHttpServer()).get('/kanban').expect(401);
  });
});
