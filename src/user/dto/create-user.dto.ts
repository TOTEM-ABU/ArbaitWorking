import { ApiProperty } from '@nestjs/swagger';
import { RoleStatus } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Karimov Karim Karimovich' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'string1234@gmail.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'string1234' })
  @IsString()
  password: string;

  @ApiProperty({ example: '+998883334545' })
  @IsString()
  @IsPhoneNumber('UZ')
  phoneNumber: string;

  @ApiProperty({ example: 'Kokcha mahallasi' })
  @IsString()
  district: string;

  @ApiProperty({ enum: RoleStatus })
  @IsEnum(RoleStatus)
  role: RoleStatus;

  @ApiProperty({ example: 'UUID' })
  @IsString()
  @IsUUID()
  regionId: string;
}
