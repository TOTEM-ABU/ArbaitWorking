import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class ProductToolDto {
  @ApiProperty({ example: 'toolID(UUID)' })
  @IsString()
  @IsUUID()
  toolId: string;
}
