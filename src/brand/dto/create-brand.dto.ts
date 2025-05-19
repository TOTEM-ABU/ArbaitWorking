import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'Adidas' })
  @IsString()
  name: string;
}
