import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { of } from 'rxjs';
import { AirtableService } from '../airtable.service';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';
import { AfterMeetingEntity } from 'src/after-meeting/after-meeting.entities';
import { KanbanTicketEntity } from 'src/kanban-ticket/kanban-ticket.entities';

describe('AirtableService', () => {
  let service: AirtableService;
  let http: jest.Mocked<HttpService>;
  let configGet: jest.Mock;
  let dataSource: { getRepository: jest.Mock };

  const buildQueryBuilder = () => {
    const qb = {
      delete: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({}),
    };
    return qb;
  };

  const beforeRepo: Partial<jest.Mocked<Repository<BeforeMeetingEntity>>> = {
    findOne: jest.fn(),
    delete: jest.fn(),
  };
  const afterRepo: Partial<jest.Mocked<Repository<AfterMeetingEntity>>> = {
    findOne: jest.fn(),
    delete: jest.fn(),
  };
  const kanbanRepo: any = {
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    http = {
      post: jest.fn(),
    } as unknown as jest.Mocked<HttpService>;

    configGet = jest.fn((key: string) => {
      switch (key) {
        case 'AIRTABLE_TOKEN':
          return 'token';
        case 'AIRTABLE_BASE_ID':
          return 'base123';
        case 'AIRTABLE_TABLE_NAME':
          return 'Leads';
        default:
          return null;
      }
    });

    dataSource = {
      getRepository: jest.fn((entity) => {
        if (entity === BeforeMeetingEntity) return beforeRepo;
        if (entity === AfterMeetingEntity) return afterRepo;
        if (entity === KanbanTicketEntity) return kanbanRepo;
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AirtableService,
        { provide: HttpService, useValue: http },
        { provide: ConfigService, useValue: { get: configGet } },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(AirtableService);

    jest.clearAllMocks();
  });

  it('creates airtable record and cleans local meeting graph', async () => {
    const meeting = {
      id: 'bm-1',
      name: 'Acme Inc',
      picName: 'Alex',
      desc: 'Discovery',
      picEmail: 'alex@acme.co',
      picWhatsapp: '12345',
      picRole: ['Owner'],
    } as BeforeMeetingEntity;

    (beforeRepo.findOne as jest.Mock).mockResolvedValue(meeting);
    (beforeRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 });

    const qb = buildQueryBuilder();
    kanbanRepo.createQueryBuilder.mockReturnValue(qb);

    (afterRepo.findOne as jest.Mock).mockResolvedValue({ id: 42 });

    http.post.mockReturnValue(
      of({
        data: { id: 'rec1' },
      } as any),
    );

    const result = await service.upsertMeetingFromBeforeMeetingRepo('bm-1');

    expect(result).toEqual({ id: 'rec1' });
    expect(http.post).toHaveBeenCalledWith(
      'https://api.airtable.com/v0/base123/Leads',
      {
        fields: {
          'Name & organization': 'Acme Inc',
          'PIC Name': 'Alex',
          Description: 'Discovery',
          Email: 'alex@acme.co',
          Whatsapp: '12345',
          'PIC Role': 'Owner',
        },
      },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token',
        }),
      }),
    );
    expect(kanbanRepo.createQueryBuilder).toHaveBeenCalled();
    expect(qb.orWhere).toHaveBeenCalledWith('afterMeetingId = :afterMeetingId', {
      afterMeetingId: 42,
    });
    expect(afterRepo.delete).toHaveBeenCalledWith(42);
    expect(beforeRepo.delete).toHaveBeenCalledWith('bm-1');
  });

  it('skips Airtable call when meeting missing', async () => {
    (beforeRepo.findOne as jest.Mock).mockResolvedValue(null);

    const result = await service.upsertMeetingFromBeforeMeetingRepo('missing');

    expect(result).toEqual({ message: 'No meeting found', meetingId: 'missing' });
    expect(http.post).not.toHaveBeenCalled();
    expect(beforeRepo.delete).not.toHaveBeenCalled();
  });
});
