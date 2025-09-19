import {
  IsString,
  IsNumber,
  IsArray,
  IsDate,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class csvHandlerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsNumber()
  @ValidateIf((obj) => obj.totalTask !== null)
  totalTask?: number;

  @IsOptional()
  @IsNumber()
  @ValidateIf((obj) => obj.completedTask !== null)
  completedTask?: number;

  @IsOptional()
  @IsString()
  companySize?: string;

  @IsOptional()
  @IsString()
  picName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  picRole?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  currentSystem?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  systemRequirement?: string[];

  @IsOptional()
  @IsNumber()
  @ValidateIf((obj) => obj.budget !== null)
  budget?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  category?: string[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ValidateIf((obj) => obj.meetingDate !== null)
  meetingDate?: Date;
}
