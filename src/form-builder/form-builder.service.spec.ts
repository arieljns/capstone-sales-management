import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormBuilderService } from './form-builder.service';
import { AfterMeetingEntity } from 'src/after-meeting/after-meeting.entities';

describe('FormBuilderService', () => {
  let service: FormBuilderService;
  let afterRepo: jest.Mocked<Repository<AfterMeetingEntity>>;

  beforeEach(async () => {
    const afterMock: Partial<jest.Mocked<Repository<AfterMeetingEntity>>> = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormBuilderService,
        { provide: getRepositoryToken(AfterMeetingEntity), useValue: afterMock },
      ],
    }).compile();

    service = module.get(FormBuilderService);
    afterRepo = module.get(getRepositoryToken(AfterMeetingEntity));
  });

  it('returns form data by id', async () => {
    const entity = { id: 1 } as any;
    afterRepo.findOne.mockResolvedValue(entity);
    const result = await service.getFormData(1);
    expect(afterRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(entity);
  });

  it('throws when not found', async () => {
    afterRepo.findOne.mockResolvedValue(null as any);
    await expect(service.getFormData(999)).rejects.toBeInstanceOf(Error);
  });
});
