import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNumber,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LevelMasterDto } from './level-master.dto';
import { ProductMasterDto } from './product-master.dto';

export class CreateMasterDto {
  @ApiProperty({ example: 'Ivanov Ivan Ivanovich' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+998XXXXXXXXX' })
  @IsPhoneNumber('UZ')
  @IsString()
  phone: string;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: '2000-01-01' })
  year: Date;

  @ApiProperty({ example: 2 })
  @IsNumber()
  minWorkingHours: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  priceHourly: number;

  @ApiProperty({ example: 2400 })
  @IsNumber()
  priceDaily: number;

  @ApiProperty({ example: 7 })
  @IsNumber()
  experience: number;

  @ApiProperty({ example: 'https://example.png/' })
  @IsString()
  @IsUrl()
  image: string;

  @ApiProperty({ example: 'AA456F453' })
  @IsString()
  @Length(5, 20)
  passportImage: string;

  @ApiProperty({ example: 'Professional worker' })
  @IsString()
  about: string;

  @ApiProperty({ type: [LevelMasterDto] })
  @ValidateNested({ each: true })
  @Type(() => LevelMasterDto)
  masterLevel: LevelMasterDto[];

  @ApiProperty({ type: [ProductMasterDto] })
  @ValidateNested({ each: true })
  @Type(() => ProductMasterDto)
  masterProduct: ProductMasterDto[];
}
