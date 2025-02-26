import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class beforeMeetingDto {
  @IsString()
  @IsNotEmpty()
  namaPerusahaan: string;

  @IsString()
  @IsNotEmpty()
  namaPic: string;

  @IsString()
  @IsNotEmpty()
  jabatanPic: string;

  @IsNumber()
  @IsNotEmpty()
  jumlahKaryawan: number;

  @IsString()
  @IsNotEmpty()
  sistem: string;
}
