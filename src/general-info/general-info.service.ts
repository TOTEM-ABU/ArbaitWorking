import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGeneralInfoDto } from './dto/create-general-info.dto';
import { UpdateGeneralInfoDto } from './dto/update-general-info.dto';

@Injectable()
export class GeneralInfoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateGeneralInfoDto) {
    try {
      return await this.prisma.generalInfo.create({ data });
    } catch (error) {
      throw new BadRequestException('GeneralInfo yaratishda xatolik!');
    }
  }

  async findAll(query: {
    email?: string;
    phones?: string;
    links?: string;
    sort?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    try {
      const {
        email = '',
        phones = '',
        links = '',
        sort = 'asc',
        page = 1,
        limit = 10,
      } = query;

      const where: any = {
        email: { contains: email, mode: 'insensitive' },
        phones: { contains: phones, mode: 'insensitive' },
        links: { contains: links, mode: 'insensitive' },
      };

      const items = await this.prisma.generalInfo.findMany({
        where,
        orderBy: { email: sort },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await this.prisma.generalInfo.count({ where });

      return {
        data: items,
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException('GeneralInfo olishda xatolik!');
    }
  }

  async findOne(id: string) {
    try {
      const info = await this.prisma.generalInfo.findUnique({ where: { id } });
      if (!info) {
        throw new HttpException('GeneralInfo topilmadi', HttpStatus.NOT_FOUND);
      }
      return info;
    } catch (error) {
      throw new HttpException(
        'Topishda xatolik yuz berdi',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, data: UpdateGeneralInfoDto) {
    try {
      return await this.prisma.generalInfo.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException('Yangilashda xatolik yuz berdi!');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.generalInfo.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException('O‘chirishda xatolik yuz berdi!');
    }
  }
}
