import { Injectable } from '@nestjs/common';

@Injectable()
export class BusinessLogService {
  constructor() {}

  getLogs() {
    return 'this is business log service';
  }
}
