import { Injectable } from '@nestjs/common';

@Injectable()
export class AfterMeetingService {
  constructor() {}

  getAfterMeetingData():string {
    return 'this is after meeting data';
  }
}
