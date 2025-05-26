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
import { SessionGuard } from 'src/sessionguard/session.guard';

@Controller('basket')
export class BasketController {
  constructor(private readonly basketService: BasketService) {}

  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() data: CreateBasketDto, @Req() req: Request) {
    return this.basketService.create(data, req['user']);
  }

  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Get('mybasket')
  findOne(@Req() request: Request) {
    return this.basketService.myBasket(request['user']);
  }

  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateBasketDto) {
    return this.basketService.update(id, data);
  }

  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.basketService.remove(id);
  }
}
