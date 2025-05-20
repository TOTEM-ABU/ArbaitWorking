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

  @Post('resend-otp')
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.userService.resendOtp(dto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.userService.verifyOtp(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto, @Req() req: Request) {
    return this.userService.login(dto, req);
  }

  @Post('refresh-token')
  async refreshAccessToken(@Body() dto: RefreshTokenDto) {
    return this.userService.refreshAccessToken(dto);
  }

  @UseGuards(AuthGuard)
  @Patch('update-password/:id')
  async updatePassword(@Req() req: Request, @Body() dto: UpdatePasswordDto) {
    return this.userService.updatePassword(req['user'], dto);
  }

  @UseGuards(AuthGuard)
  @Patch('promoteToAdmin/:id')
  async promoteToAdmin(@Req() req: Request) {
    return this.userService.promoteToAdmin(req['user']);
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
  async findAll() {
    return this.userService.findAll();
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
