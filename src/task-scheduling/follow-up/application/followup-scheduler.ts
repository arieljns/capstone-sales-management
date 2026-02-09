import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';


@Injectable()
export class FollowUpScheduler{
  constructor(private useCase: EvaluateFollowUpUseCase){}
  @Cron('0 * * * *')
  handleCron() {
    await.
  }
}