import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateLevelDto {
  @ApiProperty({ example: 'BASIC/INTERMEDIATE/ADVANCED or other' })
  @IsString()
  name: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  minWorkingHours: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  priceHourly: number;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  priceDaily: number;
}
