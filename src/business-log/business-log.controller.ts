import { Controller, Get } from '@nestjs/common';
import { BusinessLogService } from './business-log.service';

@Controller('/log')
export class BusinessLogController {
  constructor(private readonly businessLogService: BusinessLogService) {}

  @Get()
  getLogs() {
    return this.businessLogService.getLogs();
  }
}
