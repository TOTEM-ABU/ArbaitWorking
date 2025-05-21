import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateYurDto } from './dto/create-yur.dto';
import { RoleGuard } from 'src/role/role.guard';
import { Roles } from './decorators/roles.decorators';
import { RoleStatus } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { AddAdminDto } from './dto/addAdmin.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('registerYuridik')
  async registerYuridik(@Body() dto: CreateYurDto) {
    return this.userService.registerYuridik(dto);
  }

  @Post('registerFizik')
  async register(@Body() dto: CreateUserDto) {
    return this.userService.register(dto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.userService.verifyOtp(dto);
  }

  @Post('resend-otp')
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.userService.resendOtp(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto, @Req() req: Request) {
    return this.userService.login(dto, req);
  }

  @Post('refresh-token')
  async refreshAccessToken(@Body() dto: RefreshTokenDto) {
    return this.userService.refreshAccessToken(dto);
  }

  @Post('add-admin')
  async addAdmin(@Body() dto: AddAdminDto) {
    return this.userService.addAdmin(dto);
  }

  @UseGuards(AuthGuard)
  @Patch('update-password/:id')
  async updatePassword(@Req() req: Request, @Body() dto: UpdatePasswordDto) {
    return this.userService.updatePassword(req['user'], dto);
  }

  @Roles(RoleStatus.ADMIN, RoleStatus.SUPER_ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Get()
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'phoneNumber', required: false })
  @ApiQuery({ name: 'role', enum: RoleStatus, required: false })
  @ApiQuery({ name: 'regionId', required: false })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'name'],
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('phoneNumber') phoneNumber?: string,
    @Query('role') role?: RoleStatus,
    @Query('regionId') regionId?: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.userService.findAll({
      name,
      email,
      phoneNumber,
      role,
      regionId,
      sortBy,
      sortOrder,
      page,
      limit,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Get('me/:id')
  async me(@Req() req: Request) {
    return this.userService.me(req['user']);
  }
}
