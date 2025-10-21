import { IsEnum, IsNumber } from 'class-validator';
import { StageStatus } from '../kanban-ticket.entities';

export class UpdateKanbanDto {

  @IsNumber()
  ticketId: number;

  @IsEnum(StageStatus)
  sourceStage: StageStatus;

  @IsEnum(StageStatus)
  destinationStage: StageStatus;

  @IsNumber()
  newIndex: number;
}
