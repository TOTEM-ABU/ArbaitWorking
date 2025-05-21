import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ToolService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateToolDto) {
    try {
      const toolCount = await this.prisma.tool.count();
      const generatedCode = `TL-${(toolCount + 1).toString().padStart(5, '0')}`;

      const tool = await this.prisma.tool.create({
        data: {
          name: data.name,
          decription: data.description,
          price: data.price,
          quantity: data.quantity,
          image: data.image,
          code: generatedCode,
        },
      });

      if (data.brands?.length) {
        await this.prisma.toolBrand.createMany({
          data: data.brands.map((brand) => ({
            toolId: tool.id,
            brandId: brand.brandId,
          })),
          skipDuplicates: true,
        });
      }

      if (data.sizes?.length) {
        await this.prisma.toolSize.createMany({
          data: data.sizes.map((size) => ({
            toolId: tool.id,
            sizeId: size.sizeId,
          })),
          skipDuplicates: true,
        });
      }

      if (data.capacities?.length) {
        await this.prisma.toolCapacity.createMany({
          data: data.capacities.map((capacity) => ({
            toolId: tool.id,
            capacityId: capacity.capacityId,
          })),
          skipDuplicates: true,
        });
      }

      return tool;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Tool yaratishda xatolik yuz berdi',
      );
    }
  }

  async findAll(query: {
    name?: string;
    description?: string;
    price?: number;
    brandId?: string;
    sizeId?: string;
    capacityId?: string;
    sortBy?: 'name' | 'price' | 'createdAt' | 'quantity'; // ✅ quantity qo‘shildi
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    try {
      const {
        name,
        description,
        price,
        brandId,
        sizeId,
        capacityId,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10,
      } = query;

      const where: any = {};

      if (name) {
        where.name = { contains: name, mode: 'insensitive' };
      }

      if (description) {
        where.description = { contains: description, mode: 'insensitive' }; // ✏️ typo: 'decription' -> 'description'
      }

      if (typeof price === 'number') {
        where.price = price;
      }

      if (brandId) {
        where.brandId = brandId;
      }

      if (sizeId) {
        where.sizeId = sizeId;
      }

      if (capacityId) {
        where.capacityId = capacityId;
      }

      const tools = await this.prisma.tool.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          ToolBrand: {
            include: {
              brand: true,
            },
          },
          ToolSize: {
            include: {
              size: true,
            },
          },
          ToolCapacity: {
            include: {
              capacity: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await this.prisma.tool.count({ where });

      return {
        data: tools,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Asboblar ro‘yxatini olishda xatolik yuz berdi',
      );
    }
  }

  async findOne(id: string) {
    try {
      const tool = await this.prisma.tool.findUnique({
        where: { id },
        include: {
          ToolBrand: true,
          ToolSize: true,
          ToolCapacity: true,
        },
      });
      if (!tool) {
        throw new BadRequestException('Asbob topilmadi');
      }
      return tool;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Asbob haqida ma‘lumot olishda xatolik yuz berdi',
      );
    }
  }

  async update(id: string, data: UpdateToolDto) {
    try {
      return await this.prisma.tool.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error(error);
      if (error.code === 'P2025') {
        throw new BadRequestException('Asbob topilmadi');
      }
      throw new InternalServerErrorException(
        'Asbobni yangilashda xatolik yuz berdi',
      );
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.tool.delete({
        where: { id },
      });

      return { message: 'Asbob muvaffaqiyatli o‘chirildi' };
    } catch (error) {
      console.error(error);
      if (error.code === 'P2025') {
        throw new BadRequestException('Asbob topilmadi');
      }
      throw new InternalServerErrorException(
        'Asbobni o‘chirishda xatolik yuz berdi',
      );
    }
  }
}
