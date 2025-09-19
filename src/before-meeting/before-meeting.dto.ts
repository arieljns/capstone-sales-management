import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsDate,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';

export class beforeMeetingDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  desc: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalTask: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  completedTask: number;

  @IsNotEmpty()
  @IsString()
  companySize: string;

  @IsNotEmpty()
  @IsString()
  picName: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  picRole: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  currentSystem: string[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  systemRequirement: string[];

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  budget: number;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  category: string[];

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  meetingDate: Date;
}
