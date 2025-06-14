import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateFaqDto) {
    try {
      const faq = await this.prisma.fAQ.create({ data });
      return faq;
    } catch (error) {
      throw new HttpException(
        'FAQ yaratishda xatolik yuz berdi',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(query: {
    question?: string;
    answer?: string;
    sortBy?: string;
    sort?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    try {
      const {
        question = '',
        answer = '',
        sortBy = 'createdAt',
        sort = 'asc',
        page = 1,
        limit = 10,
      } = query;

      const where: any = {
        question: { contains: question, mode: 'insensitive' },
        answer: { contains: answer, mode: 'insensitive' },
      };

      const faqs = await this.prisma.fAQ.findMany({
        where,
        orderBy: { [sortBy]: sort },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await this.prisma.fAQ.count({ where });

      return {
        data: faqs,
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException('FAQ larni olishda xatolik yuz berdi!');
    }
  }

  async findOne(id: string) {
    try {
      const faq = await this.prisma.fAQ.findUnique({ where: { id } });

      if (!faq) {
        throw new HttpException('FAQ topilmadi', HttpStatus.NOT_FOUND);
      }

      return faq;
    } catch (error) {
      throw new HttpException(
        'FAQni olishda xatolik',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, data: UpdateFaqDto) {
    try {
      const updated = await this.prisma.fAQ.update({
        where: { id },
        data,
      });
      if (!updated) {
        throw new NotFoundException('faq not found!');
      }
      return updated;
    } catch (error) {
      throw new HttpException(
        'FAQni yangilashda xatolik',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string) {
    try {
      const deleted = await this.prisma.fAQ.delete({
        where: { id },
      });
      if (!deleted) {
        throw new NotFoundException('faq not found!');
      }
      return deleted;
    } catch (error) {
      throw new HttpException(
        'FAQni o‘chirishda xatolik',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
