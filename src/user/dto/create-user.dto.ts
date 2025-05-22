import { ApiProperty } from '@nestjs/swagger';
import { RoleStatus } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Length,
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
  @Length(2, 6)
  password: string;

  @ApiProperty({ example: '+998883334545' })
  @IsString()
  @IsPhoneNumber('UZ')
  phoneNumber: string;

  @ApiProperty({ example: 'Kokcha mahallasi' })
  @IsString()
  district: string;

  @ApiProperty({ enum: RoleStatus, example: 'USER_FIZ' })
  @IsEnum(RoleStatus)
  role: RoleStatus;

  @ApiProperty({ example: 'UUID' })
  @IsString()
  @IsUUID()
  regionId: string;
}
