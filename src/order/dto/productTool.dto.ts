import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID } from 'class-validator';

export class ProductToolDto {
  @ApiProperty({ description: "tool's (UUID)" })
  @IsUUID()
  toolId: string;

  @ApiProperty({ description: "tool's count" })
  @IsInt()
  count: number;
}
