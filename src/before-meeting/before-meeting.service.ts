import { Injectable } from '@nestjs/common';

@Injectable()
export class BeforeMeetingService {
  getGreetings(): string {
    return 'this is before meeting service';
  }
}
