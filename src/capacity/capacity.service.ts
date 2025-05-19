import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { CreateCapacityDto } from './dto/create-capacity.dto';
import { UpdateCapacityDto } from './dto/update-capacity.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CapacityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCapacityDto) {
    try {
      const capacity = await this.prisma.capacity.create({ data });
      return capacity;
    } catch (error) {
      throw new HttpException(
        'Sig‘im yaratishda xatolik yuz berdi',
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

      const capacities = await this.prisma.capacity.findMany({
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

      const total = await this.prisma.capacity.count({
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      });

      return {
        data: capacities,
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException('Sig‘imlar hali mavjud emas!');
    }
  }

  async findOne(id: string) {
    try {
      const capacity = await this.prisma.capacity.findUnique({
        where: { id },
      });

      if (!capacity) {
        throw new HttpException('Sig‘im topilmadi', HttpStatus.NOT_FOUND);
      }

      return capacity;
    } catch (error) {
      throw new HttpException(
        'Sig‘imni olishda xatolik',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, data: UpdateCapacityDto) {
    try {
      const updated = await this.prisma.capacity.update({
        where: { id },
        data,
      });
      return updated;
    } catch (error) {
      throw new HttpException(
        'Sig‘imni yangilashda xatolik',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    try {
      const deleted = await this.prisma.capacity.delete({
        where: { id },
      });
      return deleted;
    } catch (error) {
      throw new HttpException(
        'Sig‘imni o‘chirishda xatolik',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
