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
import { SizeService } from './size.service';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { ApiQuery } from '@nestjs/swagger';
import { RoleGuard } from 'src/role/role.guard';
import { Roles } from 'src/user/decorators/roles.decorators';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleStatus } from '@prisma/client';

@Controller('size')
export class SizeController {
  constructor(private readonly sizeService: SizeService) {}

  @Roles(RoleStatus.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() data: CreateSizeDto) {
    return this.sizeService.create(data);
  }

  @Roles(RoleStatus.ADMIN, RoleStatus.SUPER_ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Get()
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sort', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name'],
    example: 'name',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('search') search?: string,
    @Query('sort') sort?: 'asc' | 'desc',
    @Query('sortBy') sortBy?: 'name',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.sizeService.findAll({
      search,
      sort,
      sortBy,
      page,
      limit,
    });
  }

  @Roles(RoleStatus.ADMIN, RoleStatus.SUPER_ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sizeService.findOne(id);
  }

  @Roles(RoleStatus.ADMIN, RoleStatus.SUPER_ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateSizeDto) {
    return this.sizeService.update(id, data);
  }

  @Roles(RoleStatus.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sizeService.remove(id);
  }
}
