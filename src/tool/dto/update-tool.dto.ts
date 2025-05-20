import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { BrandToolDto } from './brandTool.dto';
import { Type } from 'class-transformer';
import { SizeToolDto } from './sizeTool.dto';
import { CapacityToolDto } from './capacityTool.dto';

export class UpdateToolDto {
  @ApiProperty({ example: 'Tool Name' })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Tool Description' })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ example: 1200 })
  @IsOptional()
  @IsNumber()
  price: number;

  @ApiProperty({ example: 100 })
  @IsOptional()
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 'toolPicture.png' })
  @IsOptional()
  @IsUrl()
  image: string;

  @ApiProperty({ type: [BrandToolDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BrandToolDto)
  brands: BrandToolDto[];

  @ApiProperty({ type: [SizeToolDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SizeToolDto)
  sizes: SizeToolDto[];

  @ApiProperty({ type: [CapacityToolDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CapacityToolDto)
  capacities: CapacityToolDto[];
}
