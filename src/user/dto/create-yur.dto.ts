import { ApiProperty } from '@nestjs/swagger';
import { RoleStatus } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateYurDto {
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

  @ApiProperty({ enum: RoleStatus, example: 'USER_YUR' })
  @IsEnum(RoleStatus)
  role: RoleStatus;

  @ApiProperty({ example: '123456789' })
  @IsOptional()
  @IsString()
  soliqRaqami?: string;

  @ApiProperty({ example: '01122' })
  @IsOptional()
  @IsString()
  bankKodi?: string;

  @ApiProperty({ example: '40817810012345678901' })
  @IsOptional()
  @IsString()
  hisobRaqami?: string;

  @ApiProperty({ example: 'O‘zmilliybank' })
  @IsOptional()
  @IsString()
  bankNomi?: string;

  @ApiProperty({ example: 'Savdo va xizmat ko‘rsatish' })
  @IsOptional()
  @IsString()
  faoliyatTuri?: string;

  @ApiProperty({ example: 'Toshkent shahri, Chilonzor tumani, 5-mavze' })
  @IsOptional()
  @IsString()
  bankAddress?: string;

  @ApiProperty({ example: 'UUID' })
  @IsString()
  @IsUUID()
  regionId: string;
}
