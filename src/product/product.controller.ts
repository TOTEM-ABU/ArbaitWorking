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
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiQuery } from '@nestjs/swagger';
import { RoleStatus } from '@prisma/client';
import { Roles } from 'src/user/decorators/roles.decorators';
import { RoleGuard } from 'src/role/role.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // @Roles(RoleStatus.ADMIN)
  // @UseGuards(RoleGuard)
  // @UseGuards(AuthGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'priceHourly', required: false, type: Number })
  @ApiQuery({ name: 'priceDaily', required: false, type: Number })
  @ApiQuery({ name: 'minWorkingHours', required: false, type: Number })
  @ApiQuery({ name: 'toolId', required: false, type: String })
  @ApiQuery({ name: 'levelId', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('name') name?: string,
    @Query('priceHourly') priceHourly?: number,
    @Query('priceDaily') priceDaily?: number,
    @Query('minWorkingHours') minWorkingHours?: number,
    @Query('toolId') toolId?: string,
    @Query('levelId') levelId?: string,
    @Query('sort') sort: 'asc' | 'desc' = 'asc',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.productService.findAll({
      name,
      priceHourly,
      priceDaily,
      minWorkingHours,
      toolId,
      levelId,
      sort,
      page,
      limit,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  // @Roles(RoleStatus.ADMIN, RoleStatus.SUPER_ADMIN)
  // @UseGuards(RoleGuard)
  // @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  // @Roles(RoleStatus.ADMIN)
  // @UseGuards(RoleGuard)
  // @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
