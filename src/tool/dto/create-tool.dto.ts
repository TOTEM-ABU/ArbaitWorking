import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { BrandToolDto } from './brandTool.dto';
import { Type } from 'class-transformer';
import { SizeToolDto } from './sizeTool.dto';
import { CapacityToolDto } from './capacityTool.dto';

export class CreateToolDto {
  @ApiProperty({ example: 'Tool Name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Tool Description' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1200 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 'toolPicture.png' })
  @IsUrl()
  image: string;

  @ApiProperty({ type: [BrandToolDto] })
  @ValidateNested({ each: true })
  @Type(() => BrandToolDto)
  brands: BrandToolDto[];

  @ApiProperty({ type: [SizeToolDto] })
  @ValidateNested({ each: true })
  @Type(() => SizeToolDto)
  sizes: SizeToolDto[];

  @ApiProperty({ type: [CapacityToolDto] })
  @ValidateNested({ each: true })
  @Type(() => CapacityToolDto)
  capacities: CapacityToolDto[];
}
