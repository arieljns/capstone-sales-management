import { Controller } from '@nestjs/common';
import { Req } from '@nestjs/common';

@Controller('/followup-gap')
export class FollowUpController {
  constructor() {}

  getFollowUpGaps(@Req() req) {
    const salesRepId = req.user.userId;

    if (!salesRepId) {
      throw new Error('There is no sales rep id');
    }
  }
}
