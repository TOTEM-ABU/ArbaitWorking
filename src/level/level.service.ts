import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LevelService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateLevelDto) {
    try {
      const level = await this.prisma.level.create({
        data,
      });

      if (!level) {
        throw new InternalServerErrorException('Level creation failed');
      }

      return level;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create level');
    }
  }

  async findAll(query: {
    name?: string;
    sortBy?: 'name' | 'minWorkingHours' | 'priceHourly' | 'priceDaily'; 
    sort?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    try {
      const {
        name,
        sortBy = 'name',
        sort = 'asc',
        page = 1,
        limit = 10,
      } = query;

      const where: any = {};

      if (name) {
        where.name = { contains: name, mode: 'insensitive' };
      }

      const levels = await this.prisma.level.findMany({
        where,
        orderBy: {
          [sortBy]: sort,
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await this.prisma.level.count({ where });

      return {
        data: levels,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to get levels');
    }
  }

  async findOne(id: string) {
    try {
      const level = await this.prisma.level.findUnique({
        where: { id },
      });
      if (!level) {
        throw new InternalServerErrorException('Level not found!');
      }
      return level;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get one level');
    }
  }

  async update(id: string, data: UpdateLevelDto) {
    try {
      const level = await this.prisma.level.update({
        where: { id },
        data,
      });
      if (!level) {
        throw new InternalServerErrorException('Level not found!');
      }
      return level;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update level');
    }
  }

  async remove(id: string) {
    try {
      const level = await this.prisma.level.delete({
        where: { id },
      });
      if (!level) {
        throw new InternalServerErrorException('Level not found!');
      }
      return level;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete level');
    }
  }
}
