import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            name: data.name,
            image: data.image,
            minWorkingHours: data.minWorkingHours,
            priceHourly: data.priceHourly,
            priceDaily: data.priceDaily,
          },
        });

        if (data.productTool?.length) {
          await tx.toolProduct.createMany({
            data: data.productTool.map((tool) => ({
              productId: product.id,
              toolId: tool.toolId,
            })),
            skipDuplicates: true,
          });
        }

        if (data.productLevel?.length) {
          await tx.productLevel.createMany({
            data: data.productLevel.map((level) => ({
              productId: product.id,
              levelId: level.levelId,
            })),
            skipDuplicates: true,
          });
        }

        return product;
      });

      return result;
    } catch (error) {
      throw new InternalServerErrorException('Product yaratishda xatolik');
    }
  }

  async findAll(query) {
    try {
      const {
        name,
        priceHourly,
        priceDaily,
        minWorkingHours,
        toolId,
        levelId,
        sort,
        page = '1',
        limit = '10',
      } = query;

      const where: any = {
        ...(name && {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        }),
        ...(priceHourly && { priceHourly: Number(priceHourly) }),
        ...(priceDaily && { priceDaily: Number(priceDaily) }),
        ...(minWorkingHours && { minWorkingHours: Number(minWorkingHours) }),
        ...(toolId && {
          toolProduct: {
            some: {
              toolId,
            },
          },
        }),
        ...(levelId && {
          productLevels: {
            some: {
              levelId,
            },
          },
        }),
      };

      const [sortField, sortOrder] = sort?.split(':') ?? ['name', 'asc'];

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const [products, total] = await this.prisma.$transaction([
        this.prisma.product.findMany({
          where,
          orderBy: {
            [sortField]: sortOrder,
          },
          skip,
          take,
          include: {
            toolProduct: {
              include: {
                Tool: {
                  include: {
                    ToolBrand: { include: { brand: true } },
                    ToolSize: { include: { size: true } },
                    ToolCapacity: { include: { capacity: true } },
                  },
                },
              },
            },
            productLevels: {
              include: {
                level: true,
              },
            },
          },
        }),
        this.prisma.product.count({ where }),
      ]);

      return {
        data: products,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          lastPage: Math.ceil(total / Number(limit)),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Productlarni olishda xatolik');
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          toolProduct: {
            include: {
              Tool: {
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
              },
            },
          },
          productLevels: {
            include: {
              level: true,
            },
          },
        },
      });
      if (!product) {
        throw new InternalServerErrorException('Product topilmadi');
      }
      return product;
    } catch (error) {
      throw new InternalServerErrorException('Productni olishda xatolik');
    }
  }

  async update(id: string, data: UpdateProductDto) {
    try {
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException('Bunday product topilmadi');
      }

      const product = await this.prisma.product.update({ where: { id }, data });
      return product;
    } catch (error) {
      throw new InternalServerErrorException('Productni yangilashda xatolik');
    }
  }

  async remove(id: string) {
    try {
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException('Bunday product topilmadi');
      }

      const product = await this.prisma.product.delete({ where: { id } });
      return product;
    } catch (error) {
      throw new InternalServerErrorException("Productni o'chirishda xatolik");
    }
  }
}
