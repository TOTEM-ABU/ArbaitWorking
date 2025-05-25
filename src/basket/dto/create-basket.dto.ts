import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { measure } from '@prisma/client';
import {
  IsInt,
  IsString,
  IsNotEmpty,
  IsPositive,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateBasketDto {
  @ApiPropertyOptional({ example: "product's (UUID)" })
  @IsOptional()
  @IsString()
  productId: string;

  @ApiPropertyOptional({ example: "tool's (UUID)" })
  @IsOptional()
  @IsString()
  toolsId: string;

  @ApiPropertyOptional({ example: "level's (UUID)" })
  @IsOptional()
  @IsString()
  levelId: string;

  @ApiProperty({ example: 1000 })
  @IsPositive()
  @IsInt()
  total: string;

  @ApiProperty({ enum: measure, example: 'HOUR/DAY' })
  @IsNotEmpty()
  @IsString()
  measure: measure;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsPositive()
  time: number;
}
