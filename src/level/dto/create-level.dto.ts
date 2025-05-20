import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateLevelDto {
  @ApiProperty({ example: 'BASIC/INTERMEDIATE/ADVANCED or other' })
  @IsString()
  name: string;
}
