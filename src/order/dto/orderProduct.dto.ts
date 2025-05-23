import {
  IsEnum,
  IsInt,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { measure } from '@prisma/client';
import { Type } from 'class-transformer';
import { ProductToolDto } from './productTool.dto';

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

  @ApiProperty({ type: [ProductToolDto] })
  @ValidateNested({ each: true })
  @Type(() => ProductToolDto)
  orderProducts: ProductToolDto[];
}
