import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SizeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSizeDto) {
    try {
      const size = await this.prisma.size.create({ data });
      return size;
    } catch (error) {
      throw new HttpException(
        'O‘lcham yaratishda xatolik yuz berdi',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(query: {
    search?: string;
    sort?: 'asc' | 'desc';
    sortBy?: 'name';
    page?: number;
    limit?: number;
  }) {
    try {
      const {
        search = '',
        sort = 'asc',
        sortBy = 'name',
        page = 1,
        limit = 10,
      } = query;

      const take = Number(limit);
      const skip = (Number(page) - 1) * take;

      const sizes = await this.prisma.size.findMany({
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        orderBy: {
          [sortBy]: sort,
        },
        skip,
        take,
      });

      const total = await this.prisma.size.count({
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      });

      return {
        data: sizes,
        meta: {
          total,
          page: Number(page),
          limit: take,
          lastPage: Math.ceil(total / take),
        },
      };
    } catch (error) {
      throw new BadRequestException('O‘lchamlar hali mavjud emas!');
    }
  }

  async findOne(id: string) {
    try {
      const size = await this.prisma.size.findUnique({
        where: { id },
      });

      if (!size) {
        throw new HttpException('O‘lcham topilmadi', HttpStatus.NOT_FOUND);
      }

      return size;
    } catch (error) {
      throw new HttpException(
        'O‘lchamni olishda xatolik',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, data: UpdateSizeDto) {
    try {
      const updated = await this.prisma.size.update({
        where: { id },
        data,
      });
      return updated;
    } catch (error) {
      throw new HttpException(
        'O‘lchamni yangilashda xatolik',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    try {
      const deleted = await this.prisma.size.delete({
        where: { id },
      });
      return deleted;
    } catch (error) {
      throw new HttpException(
        'O‘lchamni o‘chirishda xatolik',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
