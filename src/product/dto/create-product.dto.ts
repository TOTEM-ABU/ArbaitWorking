import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUrl, ValidateNested } from 'class-validator';
import { ProductToolDto } from './product-tool.dto';
import { Type } from 'class-transformer';
import { ProductLevelDto } from './product-level.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'Product Name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'https://example.com.png/' })
  @IsString()
  @IsUrl()
  image: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  priceHourly: number;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  priceDaily: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  minWorkingHours: number;

  @ApiProperty({ type: [ProductToolDto] })
  @ValidateNested({ each: true })
  @Type(() => ProductToolDto)
  productTool: ProductToolDto[];

  @ApiProperty({ type: [ProductLevelDto] })
  @ValidateNested({ each: true })
  @Type(() => ProductLevelDto)
  productLevel: ProductLevelDto[];
}
