import { OnEvent } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BeforeMeetingHandler {
  private readonly logger = new Logger(BeforeMeetingHandler.name);
  constructor() {}

  @OnEvent('beforeMeeting.created', { async: true })
  handleBeforeMeetingCreated(event: any) {
    try {
      await this.auditRepo.append('before meeting event created', event);
    } catch (error) {
      this.logger.error(
        `Failed to handle beforeMeeting.created event: ${error.message}`,
      );
    }
  }


  @OnEvent('beforeMeeting.stageUpdated', { async: true })
  handleBeforeMeetingStageUpdated(event: any) {
    try {
      await this.auditRepo.append('before meeting stage updated', event);
    } catch (error) {
      this.logger.error(
        `Failed to handle beforeMeeting.stageUpdated event: ${error.message}`,
      );
    }
}
