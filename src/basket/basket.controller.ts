import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BasketService } from './basket.service';
import { CreateBasketDto } from './dto/create-basket.dto';
import { UpdateBasketDto } from './dto/update-basket.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';

@Controller('basket')
export class BasketController {
  constructor(private readonly basketService: BasketService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() data: CreateBasketDto, @Req() req: Request) {
    return this.basketService.create(data, req['user']);
  }

  @UseGuards(AuthGuard)
  @Get('mybasket')
  findOne(@Req() request: Request) {
    return this.basketService.myBasket(request['user']);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateBasketDto) {
    return this.basketService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.basketService.remove(id);
  }
}
