import { Injectable } from '@nestjs/common';
import { AuditLogEntity } from './business-log.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BusinessLogService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private auditLogRepo: Repository<AuditLogEntity>,
  ) {}

  async append(eventType: string, eventData: any) {
    await this.auditLogRepo.save({
      eventType,
      eventData,
    });
  }
}
