import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BrandService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBrandDto) {
    try {
      const brand = await this.prisma.brand.create({ data });
      return brand;
    } catch (error) {
      throw new HttpException(
        'Brend yaratishda xatolik yuz berdi',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(query: {
    search?: string;
    sort?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    try {
      const { search = '', sort = 'asc', page = 1, limit = 10 } = query;

      const brands = await this.prisma.brand.findMany({
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        orderBy: {
          name: sort,
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await this.prisma.brand.count({
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      });

      return {
        data: brands,
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException('Brendlar hali mavjud emas!');
    }
  }

  async findOne(id: string) {
    try {
      const brand = await this.prisma.brand.findUnique({
        where: { id },
      });

      if (!brand) {
        throw new HttpException('Brend topilmadi', HttpStatus.NOT_FOUND);
      }

      return brand;
    } catch (error) {
      throw new HttpException(
        'Brendni olishda xatolik',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, data: UpdateBrandDto) {
    try {
      const updated = await this.prisma.brand.update({
        where: { id },
        data,
      });
      return updated;
    } catch (error) {
      throw new HttpException(
        'Brendni yangilashda xatolik',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    try {
      const deleted = await this.prisma.brand.delete({
        where: { id },
      });
      return deleted;
    } catch (error) {
      throw new HttpException(
        'Brendni o‘chirishda xatolik',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
