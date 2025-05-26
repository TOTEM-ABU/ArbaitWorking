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
import { MasterService } from './master.service';
import { CreateMasterDto } from './dto/create-master.dto';
import { UpdateMasterDto } from './dto/update-master.dto';
import { ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/user/decorators/roles.decorators';
import { RoleStatus } from '@prisma/client';
import { RoleGuard } from 'src/role/role.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { MarkStarDto } from './dto/markstart-dto';
import { SessionGuard } from 'src/sessionguard/session.guard';

@Controller('master')
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  @Roles(RoleStatus.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createMasterDto: CreateMasterDto) {
    return this.masterService.create(createMasterDto);
  }

  @Roles(RoleStatus.ADMIN, RoleStatus.SUPER_ADMIN, RoleStatus.VIEWER_ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Get()
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'phone', required: false })
  @ApiQuery({ name: 'passportImage', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'minWorkingHours', required: false, type: Number })
  @ApiQuery({ name: 'priceHourly', required: false, type: Number })
  @ApiQuery({ name: 'priceDaily', required: false, type: Number })
  @ApiQuery({ name: 'experience', required: false, type: Number })
  @ApiQuery({ name: 'levelId', required: false })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: [
      'name',
      'minWorkingHours',
      'priceHourly',
      'priceDaily',
      'experience',
      'createdAt',
    ],
    example: 'createdAt',
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('name') name?: string,
    @Query('phone') phone?: string,
    @Query('passportImage') passportImage?: string,
    @Query('year') year?: string,
    @Query('minWorkingHours') minWorkingHours?: number,
    @Query('priceHourly') priceHourly?: number,
    @Query('priceDaily') priceDaily?: number,
    @Query('experience') experience?: number,
    @Query('levelId') levelId?: string,
    @Query('productId') productId?: string,
    @Query('sortBy')
    sortBy:
      | 'name'
      | 'minWorkingHours'
      | 'priceHourly'
      | 'priceDaily'
      | 'experience'
      | 'createdAt' = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.masterService.findAll({
      name,
      phone,
      passportImage,
      year,
      minWorkingHours,
      priceHourly,
      priceDaily,
      experience,
      levelId,
      productId,
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
    return this.masterService.findOne(id);
  }

  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Post('star')
  async markStar(@Body() dto: MarkStarDto, @Req() req: any) {
    return this.masterService.markStarForMaster(dto, req['user']);
  }

  @Roles(RoleStatus.ADMIN, RoleStatus.SUPER_ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMasterDto: UpdateMasterDto) {
    return this.masterService.update(id, updateMasterDto);
  }

  @Roles(RoleStatus.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(SessionGuard)
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.masterService.remove(id);
  }
}
