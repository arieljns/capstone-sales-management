import { StageStatus } from 'src/kanban-ticket/kanban-ticket.entities';

export const STAGE_SLA_DAYS: Record<StageStatus, number> = {
  [StageStatus.QUOTATION_SENT]: 3,
  [StageStatus.FOLLOW_UP]: 5,
  [StageStatus.NEGOTIATION]: 7,
  [StageStatus.DECISION_PENDING]: 10,
  [StageStatus.CLOSED_WON]: 0,
  [StageStatus.CLOSED_LOST]: 0,
};
