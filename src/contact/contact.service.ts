import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateContactDto) {
    try {
      return await this.prisma.contact.create({ data });
    } catch (error) {
      throw new BadRequestException('Contact yaratishda xatolik yuz berdi');
    }
  }

  async findAll(query: {
    name?: string;
    surName?: string;
    phone?: string;
    address?: string;
    message?: string;
    sort?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    try {
      const {
        name = '',
        surName = '',
        phone = '',
        address = '',
        message = '',
        sort = 'asc',
        page = 1,
        limit = 10,
      } = query;

      const where: any = {
        name: { contains: name, mode: 'insensitive' },
        surName: { contains: surName, mode: 'insensitive' },
        phone: { contains: phone, mode: 'insensitive' },
        address: { contains: address, mode: 'insensitive' },
        message: { contains: message, mode: 'insensitive' },
      };

      const contacts = await this.prisma.contact.findMany({
        where,
        orderBy: { name: sort },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await this.prisma.contact.count({ where });

      return {
        data: contacts,
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException('Contactlarni olishda xatolik yuz berdi!');
    }
  }

  async findOne(id: string) {
    try {
      const contact = await this.prisma.contact.findUnique({ where: { id } });
      if (!contact) {
        throw new HttpException('Contact topilmadi', HttpStatus.NOT_FOUND);
      }
      return contact;
    } catch (error) {
      throw new BadRequestException(
        'Contactlarni bittasini olishda xatolik yuz berdi!',
      );
    }
  }

  async update(id: string, data: UpdateContactDto) {
    try {
      return await this.prisma.contact.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException('Contactni yangilashda xatolik yuz berdi');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.contact.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException('Contactni o‘chirishda xatolik yuz berdi');
    }
  }
}
