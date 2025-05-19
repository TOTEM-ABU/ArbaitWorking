import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCapacityDto {
  @ApiProperty({ example: '5040RTX' })
  @IsString()
  name: string;
}
