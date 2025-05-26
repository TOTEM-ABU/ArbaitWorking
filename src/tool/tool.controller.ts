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
import { ToolService } from './tool.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/user/decorators/roles.decorators';
import { RoleGuard } from 'src/role/role.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleStatus } from '@prisma/client';
import { SessionGuard } from 'src/sessionguard/session.guard';

@Controller('tool')
export class ToolController {
  constructor(private readonly toolService: ToolService) {}

  @Roles(RoleStatus.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createToolDto: CreateToolDto) {
    return this.toolService.create(createToolDto);
  }

  @Roles(RoleStatus.ADMIN, RoleStatus.SUPER_ADMIN, RoleStatus.VIEWER_ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Get()
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'description', required: false })
  @ApiQuery({ name: 'price', required: false, type: Number })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'sizeId', required: false })
  @ApiQuery({ name: 'capacityId', required: false })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'price', 'createdAt', 'quantity'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('name') name?: string,
    @Query('description') description?: string,
    @Query('price') price?: number,
    @Query('brandId') brandId?: string,
    @Query('sizeId') sizeId?: string,
    @Query('capacityId') capacityId?: string,
    @Query('sortBy')
    sortBy: 'name' | 'price' | 'createdAt' | 'quantity' = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.toolService.findAll({
      name,
      description,
      price: price ? Number(price) : undefined,
      brandId,
      sizeId,
      capacityId,
      sortBy,
      sortOrder,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Roles(RoleStatus.ADMIN, RoleStatus.SUPER_ADMIN, RoleStatus.VIEWER_ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.toolService.findOne(id);
  }

  @Roles(RoleStatus.ADMIN, RoleStatus.SUPER_ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateToolDto: UpdateToolDto) {
    return this.toolService.update(id, updateToolDto);
  }

  @Roles(RoleStatus.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.toolService.remove(id);
  }
}
