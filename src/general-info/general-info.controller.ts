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
import { GeneralInfoService } from './general-info.service';
import { CreateGeneralInfoDto } from './dto/create-general-info.dto';
import { UpdateGeneralInfoDto } from './dto/update-general-info.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoleStatus } from '@prisma/client';
import { Roles } from 'src/user/decorators/roles.decorators';
import { RoleGuard } from 'src/role/role.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('GeneralInfo')
@Controller('general-info')
export class GeneralInfoController {
  constructor(private readonly generalInfoService: GeneralInfoService) {}

  @Roles(RoleStatus.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createDto: CreateGeneralInfoDto) {
    return this.generalInfoService.create(createDto);
  }

  @Roles(RoleStatus.ADMIN, RoleStatus.SUPER_ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Get()
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'phones', required: false, type: String })
  @ApiQuery({ name: 'links', required: false, type: String })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('email') email?: string,
    @Query('phones') phones?: string,
    @Query('links') links?: string,
    @Query('sort') sort?: 'asc' | 'desc',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.generalInfoService.findAll({
      email,
      phones,
      links,
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
    return this.generalInfoService.findOne(id);
  }

  @Roles(RoleStatus.ADMIN, RoleStatus.SUPER_ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateGeneralInfoDto) {
    return this.generalInfoService.update(id, updateDto);
  }

  @Roles(RoleStatus.ADMIN, RoleStatus.SUPER_ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.generalInfoService.remove(id);
  }
}
