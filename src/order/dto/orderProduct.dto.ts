import {
  IsEnum,
  IsInt,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { measure } from '@prisma/client';

export class OrderProductDto {
  @ApiProperty({ example: "product's (UUID)" })
  @IsString()
  @IsUUID()
  productId: string;

  @ApiProperty({ example: "level's (UUID)" })
  @IsString()
  @IsUUID()
  levelId: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  count: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  quantity: number;

  @ApiProperty({ enum: measure, example: 'HOUR/DAY' })
  @IsEnum(measure)
  @IsString()
  measure: measure;
}
