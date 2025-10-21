import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  IsPositive,
  IsUrl,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SelectedProductDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty({ message: 'Product name cannot be empty' })
  name: string;

  @IsNumber()
  @Min(0, { message: 'Price must be 0 or greater' })
  price: number;

  @IsUrl({}, { message: 'Image URL must be valid' })
  img: string;

  @IsString()
  @IsNotEmpty({ message: 'Product code cannot be empty' })
  productCode: string;
}

export class afterMeetingDto {
  @IsString()
  @IsNotEmpty({ message: 'Sentiment required' })
  sentiment: string;

  @IsString()
  @IsNotEmpty({ message: 'Status required' })
  status: string;

  @IsString()
  @IsNotEmpty({ message: 'Excitement level required' })
  excitementLevel: string;

  @IsString()
  @IsNotEmpty({ message: 'Promo required' })
  promo: string;

  @IsString()
  @IsNotEmpty({ message: 'Decision maker required' })
  decisionMaker: string;

  @IsString()
  @IsNotEmpty({ message: 'Activation agreement required' })
  activationAgreement: string;

  @IsDateString({}, { message: 'Expired date must be a valid date string' })
  expiredDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedProductDto)
  products: SelectedProductDto[];

  @IsNumber()
  @Min(1, { message: 'Total Employee must exist' })
  totalEmployee: number;

  @IsNumber()
  @Min(1, { message: 'must have total amount ' })
  totalAmount: number;

  @IsNumber()
  @Min(1, { message: 'must have mrr value' })
  mrr: number;

  @IsString()
  @IsNotEmpty({ message: 'Discount Rate Required' })
  discountRate: string;

  @IsString()
  @IsNotEmpty({ message: 'Before Meeting ID required' })
  beforeMeeting: string;

  @IsString()
  @IsNotEmpty({ message: 'Term In required' })
  termIn: string;
}
