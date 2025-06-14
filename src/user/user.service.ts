import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import * as bcrypt from 'bcrypt';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Request } from 'express';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { AddAdminDto } from './dto/addAdmin.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailer: MailService,
  ) {}

  async findUser(email: string) {
    try {
      const user = await this.prisma.user.findFirst({ where: { email } });
      if (!user) {
        throw new NotFoundException('User not found!');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to find user');
    }
  }

  async findAll(query: any) {
    const {
      name,
      email,
      phoneNumber,
      role,
      regionId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;

    try {
      const users = await this.prisma.user.findMany({
        where: {
          name: name ? { contains: name, mode: 'insensitive' } : undefined,
          email: email ? { contains: email, mode: 'insensitive' } : undefined,
          phoneNumber: phoneNumber
            ? { contains: phoneNumber, mode: 'insensitive' }
            : undefined,
          role: role ? role : undefined,
          regionId: regionId ? regionId : undefined,
        },
        include: {
          Region: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: Number(skip),
        take: Number(limit),
      });

      const total = await this.prisma.user.count({
        where: {
          name: name ? { contains: name, mode: 'insensitive' } : undefined,
          email: email ? { contains: email, mode: 'insensitive' } : undefined,
          phoneNumber: phoneNumber
            ? { contains: phoneNumber, mode: 'insensitive' }
            : undefined,
          role: role ? role : undefined,
          regionId: regionId ? regionId : undefined,
        },
      });

      return {
        data: users,
        total,
        page: Number(page),
        limit: Number(limit),
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  private generateOTP(length = 6): string {
    try {
      const digits = '0123456789';
      let otp = '';
      for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
      }
      return otp;
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate OTP');
    }
  }

  async register(data: CreateUserDto) {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: { email: data.email },
      });

      if (
        (data.role && data.role.toUpperCase() === 'ADMIN',
        data.role.toUpperCase() === 'SUPER_ADMIN',
        data.role.toUpperCase() === 'VIEWER_ADMIN')
      ) {
        throw new BadRequestException(
          'You are not allowed to register as ADMIN!',
        );
      }

      if (existingUser) {
        throw new BadRequestException('User already exists!');
      }

      const hash = bcrypt.hashSync(data.password, 10);
      const otp = this.generateOTP();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

      const newUser = await this.prisma.user.create({
        data: {
          ...data,
          password: hash,
        },
      });

      try {
        await this.mailer.sendMail(
          data.email,
          'Your OTP Code',
          `Your OTP code is: ${otp}\n\nIt will expire in 5 minutes.`,
        );
      } catch (mailError) {
        console.error('Failed to send OTP: ', mailError);
        await this.prisma.user.delete({ where: { id: newUser.id } });
        throw new InternalServerErrorException('Failed to send OTP');
      }

      return newUser;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async addAdmin(data: AddAdminDto) {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: { email: data.email },
      });

      if (data.role !== 'ADMIN') {
        throw new BadRequestException('Only ADMIN is allowed!');
      }

      if (existingUser) {
        throw new BadRequestException('User already exists!');
      }

      const hash = bcrypt.hashSync(data.password, 10);
      const otp = this.generateOTP();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

      const newUser = await this.prisma.user.create({
        data: {
          ...data,
          password: hash,
        },
      });

      try {
        await this.mailer.sendMail(
          data.email,
          'Your OTP Code',
          `Your OTP code is: ${otp}\n\nIt will expire in 5 minutes.`,
        );
        return newUser;
      } catch (mailError) {
        console.error('Failed to send OTP: ', mailError);
        await this.prisma.user.delete({ where: { id: newUser.id } });
        throw new InternalServerErrorException('Failed to send OTP');
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to add admin');
    }
  }

  async me(id: string) {
    try {
      let userMe = await this.prisma.user.findFirst({
        where: { id: id },
        include: { Region: true },
      });
      return userMe;
    } catch (error) {
      return error;
    }
  }

  async verifyOtp(data: VerifyOtpDto) {
    try {
      const { email, otp } = data;

      const user = await this.prisma.user.findFirst({ where: { email } });

      if (!user) throw new NotFoundException('User not found!');

      if (user.isVerified) return { message: 'User already verified' };

      if (data.otp !== otp) throw new BadRequestException('Invalid OTP!');

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
        },
      });

      await this.mailer.sendMail(
        data.email,
        'Registered successfully!',
        'Thank you for registering!🫱🏼‍🫲🏽✅',
      );

      return { message: 'Email verified successfully!' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to verify OTP');
    }
  }

  async resendOtp(data: ResendOtpDto) {
    try {
      const { email } = data;

      const user = await this.prisma.user.findFirst({ where: { email } });

      if (!user) throw new NotFoundException('User not found!');

      if (user.isVerified) return { message: 'User already verified' };

      const otp = this.generateOTP();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await this.mailer.sendMail(
        data.email,
        'Your OTP Code',
        `Your OTP code is: ${otp}\n\nIt will expire in 5 minutes.`,
      );

      return { message: 'OTP resent successfully!' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to resend OTP');
    }
  }

  async login(data: LoginUserDto, request: Request) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email: data.email },
      });

      if (!user) {
        throw new NotFoundException('User not found!');
      }

      if (!user.isVerified) {
        throw new BadRequestException('Please verify your email first');
      }

      const match =
        user && (await bcrypt.compare(data.password, user.password));

      if (!match) {
        throw new BadRequestException('Wrong credentials!');
      }

      const payload = { id: user.id, role: user.role };

      const access_token = this.jwt.sign(payload, {
        secret: 'accessSecret',
        expiresIn: '15m',
      });

      const refresh_token = this.jwt.sign(payload, {
        secret: 'refreshSecret',
        expiresIn: '7d',
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await this.prisma.session.create({
        data: {
          userId: user.id,
          token: refresh_token,
          ipAddress: request.ip || '',
          expiresAt: expiresAt,
          deviceInfo: request.headers['user-agent'] || '',
        },
      });

      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: refresh_token },
      });

      await this.mailer.sendMail(
        data.email,
        'Logged in',
        'You have successfully logged in ✅',
      );

      return { access_token, refresh_token };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to login');
    }
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) throw new NotFoundException('User not found');

      const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      return { message: 'Password updated successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update password');
    }
  }

  async refreshAccessToken(data: RefreshTokenDto) {
    try {
      const payload = this.jwt.verify(data.refresh_token, {
        secret: 'refreshSecret',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user || user.refreshToken !== data.refresh_token) {
        throw new BadRequestException('Invalid refresh token');
      }

      const newAccessToken = this.jwt.sign(
        { id: user.id, role: user.role },
        {
          secret: 'accessSecret',
          expiresIn: '15m',
        },
      );

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to refresh access token');
    }
  }

  async updateUser(id: string, data: UpdateUserDto) {
    try {
      const user = await this.prisma.user.update({ where: { id }, data });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async delete(id: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.prisma.user.delete({ where: { id } });
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
