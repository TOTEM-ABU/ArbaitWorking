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
import { LevelService } from './level.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/user/decorators/roles.decorators';
import { RoleStatus } from '@prisma/client';
import { RoleGuard } from 'src/role/role.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('level')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Roles(RoleStatus.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createLevelDto: CreateLevelDto) {
    return this.levelService.create(createLevelDto);
  }

  @Get()
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'minWorkingHours', 'priceHourly', 'priceDaily'],
  })
  @ApiQuery({ name: 'sort', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('name') name?: string,
    @Query('sortBy')
    sortBy: 'name' | 'minWorkingHours' | 'priceHourly' | 'priceDaily' = 'name',
    @Query('sort') sort: 'asc' | 'desc' = 'asc',
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.levelService.findAll({
      name,
      sortBy,
      sort,
      page,
      limit,
    });
  }

  @Roles(RoleStatus.ADMIN, RoleStatus.SUPER_ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.levelService.findOne(id);
  }

  @Roles(RoleStatus.ADMIN, RoleStatus.SUPER_ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLevelDto: UpdateLevelDto) {
    return this.levelService.update(id, updateLevelDto);
  }

  @Roles(RoleStatus.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.levelService.remove(id);
  }
}
