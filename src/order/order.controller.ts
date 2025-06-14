import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';
import { RoleStatus } from '@prisma/client';
import { AddMastersToOrderDto } from './dto/addMasters.dto';
import { RoleGuard } from 'src/role/role.guard';
import { Roles } from 'src/user/decorators/roles.decorators';
import { SessionGuard } from 'src/sessionguard/session.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    return this.orderService.create(createOrderDto, req['user']);
  }

  @Roles(RoleStatus.ADMIN, RoleStatus.SUPER_ADMIN, RoleStatus.VIEWER_ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Get()
  @ApiQuery({ name: 'total', required: false })
  @ApiQuery({ name: 'lat', required: false })
  @ApiQuery({ name: 'long', required: false })
  @ApiQuery({ name: 'address', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'paymentType', enum: ['CASH', 'CARD'], required: false })
  @ApiQuery({ name: 'withDelivery', required: false, type: Boolean })
  @ApiQuery({
    name: 'status',
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    required: false,
  })
  @ApiQuery({ name: 'toolId', required: false })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'masterId', required: false })
  @ApiQuery({ name: 'sortBy', required: false, example: 'date' })
  @ApiQuery({ name: 'sort', enum: ['asc', 'desc'], required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('total') total?: number,
    @Query('lat') lat?: number,
    @Query('long') long?: number,
    @Query('address') address?: string,
    @Query('date') date?: string,
    @Query('paymentType') paymentType?: 'CASH' | 'CARD',
    @Query('withDelivery') withDelivery?: string,
    @Query('status')
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    @Query('toolId') toolId?: string,
    @Query('productId') productId?: string,
    @Query('masterId') masterId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sort') sort?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.orderService.findAll({
      total,
      lat,
      long,
      address,
      date,
      paymentType,
      withDelivery:
        withDelivery === 'true'
          ? true
          : withDelivery === 'false'
            ? false
            : undefined,
      status,
      toolId,
      productId,
      masterId,
      sortBy,
      sort,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Get('myOrders/:id')
  get(@Req() req: Request) {
    return this.orderService.myOrders(req['user']);
  }

  @Roles(RoleStatus.ADMIN, RoleStatus.SUPER_ADMIN, RoleStatus.VIEWER_ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }

  @Roles(RoleStatus.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Post('addMasters')
  addMasters(@Body() data: AddMastersToOrderDto) {
    return this.orderService.addMastersToOrder(data);
  }
}
