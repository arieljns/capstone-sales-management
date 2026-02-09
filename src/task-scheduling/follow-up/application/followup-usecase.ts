import { Injectable } from '@nestjs/common';
import { OpportunityReader } from '../reader/followup-reader';
import { FOLLOW_UP_SLA_BY_STAGE } from '../domain/followup-policy';

@Injectable()
export class EvaluateFollowUpUseCase {
  constructor(private readonly opportunityReader: OpportunityReader) {}

  async execute(salesRepId: string) {
    const rows = await this.opportunityReader.findStalledBySalesRep(salesRepId);

    return rows.filter((row) => {
      const slaDays = FOLLOW_UP_SLA_BY_STAGE[row.stage];
      if (!slaDays) return false;
      return row.daysInStage > slaDays;
    });
  }
}
