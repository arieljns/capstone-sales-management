import { Controller } from '@nestjs/common';
import { Req } from '@nestjs/common';
import { FollowUpScheduler } from './application/followup-scheduler';

@Controller('/followup-gap')
export class FollowUpController {
  constructor(private followUpScheduler: FollowUpScheduler) {}

  getFollowUpGaps(@Req() req) {
    const salesRepId = req.user.userId;

    if (!salesRepId) {
      throw new Error('There is no sales rep id');
    }

    return this.followUpScheduler.handleCron();
  }
}
