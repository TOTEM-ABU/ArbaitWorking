import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Any message' })
  @IsString()
  message: string;

  @ApiProperty({ example: 'orderID(UUID)' })
  @IsString()
  orderId: string;
}
