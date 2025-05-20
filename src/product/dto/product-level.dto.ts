import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class ProductLevelDto {
  @ApiProperty({ example: 'levelID(UUID)' })
  @IsString()
  @IsUUID()
  levelId: string;
}
