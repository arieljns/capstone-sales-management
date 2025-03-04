import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class afterMeetingDto {
  @IsNumber()
  @IsNotEmpty()
  monthlyRecurringRevenue: number;

  @IsString()
  @IsNotEmpty()
  paket: string;

  @IsString()
  @IsNotEmpty()
  notes: string;

  @IsString()
  @IsNotEmpty()
  sistem: string;
}
