import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class MarkStarDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  masterId: string;

  @ApiProperty()
  @IsNumber()
  star: number;
}
