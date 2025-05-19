import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSizeDto {
  @ApiProperty({ example: 'XL' })
  @IsString()
  name: string;
}
