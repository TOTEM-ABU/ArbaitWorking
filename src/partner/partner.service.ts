import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; image: string }) {
    try {
      const partner = await this.prisma.partner.create({ data });
      return partner;
    } catch (error) {
      throw new BadRequestException('Partner yaratishda xatolik yuz berdi');
    }
  }

  async findAll(query: {
    name?: string;
    sort?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    try {
      const { name = '', sort = 'asc', page = 1, limit = 10 } = query;

      const where: Prisma.PartnerWhereInput = {
        name: {
          contains: name,
          mode: Prisma.QueryMode.insensitive,
        },
      };

      const partners = await this.prisma.partner.findMany({
        where,
        orderBy: { name: sort },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await this.prisma.partner.count({ where });

      return {
        data: partners,
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException('Partnerlarni olishda xatolik yuz berdi');
    }
  }

  async findOne(id: string) {
    try {
      const partner = await this.prisma.partner.findUnique({ where: { id } });
      if (!partner) {
        throw new BadRequestException('Partner topilmadi');
      }
      return partner;
    } catch (error) {
      throw new BadRequestException('Partnerni olishda xatolik yuz berdi');
    }
  }

  async update(id: string, data: UpdatePartnerDto) {
    try {
      const updated = await this.prisma.partner.update({
        where: { id },
        data,
      });
      return updated;
    } catch (error) {
      throw new BadRequestException('Partnerni yangilashda xatolik yuz berdi');
    }
  }

  async remove(id: string) {
    try {
      const deleted = await this.prisma.partner.delete({ where: { id } });
      return deleted;
    } catch (error) {
      throw new BadRequestException('Partnerni o‘chirishda xatolik yuz berdi');
    }
  }
}
