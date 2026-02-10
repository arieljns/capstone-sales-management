import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EvaluateFollowUpUseCase } from '../application/followup-usecase';

@Injectable()
export class FollowUpScheduler {
  constructor(private useCase: EvaluateFollowUpUseCase) {}
  @Cron('0 * * * *')
  handleCron() {
    await this.useCase.execute();
  }
}
