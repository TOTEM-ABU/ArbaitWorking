import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateMasterDto } from './dto/create-master.dto';
import { UpdateMasterDto } from './dto/update-master.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MasterService {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateMasterDto) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const master = await tx.master.create({
          data: {
            name: data.name,
            phone: data.phone,
            year: data.year,
            minWorkingHours: data.minWorkingHours,
            priceHourly: data.priceHourly,
            priceDaily: data.priceDaily,
            experience: data.experience,
            image: data.image,
            passportImage: data.passportImage,
            about: data.about,
          },
        });
        
        if (data.masterLevel?.length) {
          await tx.masterLevel.createMany({
            data: data.masterLevel.map((level) => ({
              masterId: master.id,
              levelId: level.levelId,
            })),
            skipDuplicates: true,
          });
        }

        if (data.masterProduct?.length) {
          await tx.masterProduct.createMany({
            data: data.masterProduct.map((product) => ({
              masterId: master.id,
              productId: product.productId,
            })),
            skipDuplicates: true,
          });
        }
        return result;
      });
    } catch (error) {
      throw new InternalServerErrorException('Master yaratishda xatolik');
    }
  }

  async findAll(query: any) {
    const {
      name,
      phone,
      passportImage,
      year,
      minWorkingHours,
      priceHourly,
      priceDaily,
      experience,
      levelId,
      toolId,
      productId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;

    try {
      const masters = await this.prisma.master.findMany({
        where: {
          name: name ? { contains: name, mode: 'insensitive' } : undefined,
          phone: phone ? { contains: phone, mode: 'insensitive' } : undefined,
          passportImage: passportImage
            ? { contains: passportImage, mode: 'insensitive' }
            : undefined,
          year: year ? new Date(year) : undefined,
          minWorkingHours: minWorkingHours
            ? Number(minWorkingHours)
            : undefined,
          priceHourly: priceHourly ? Number(priceHourly) : undefined,
          priceDaily: priceDaily ? Number(priceDaily) : undefined,
          experience: experience ? Number(experience) : undefined,
          masterLevels: levelId
            ? {
                some: {
                  levelId,
                },
              }
            : undefined,
          masterProduct: productId
            ? {
                some: {
                  productId,
                },
              }
            : undefined,
        },
        include: {
          masterLevels: {
            include: {
              level: true,
            },
          },
          masterProduct: {
            include: {
              Product: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: Number(skip),
        take: Number(limit),
      });

      return masters;
    } catch (error) {
      throw new InternalServerErrorException('Masterlarni olishda xatolik');
    }
  }

  async findOne(id: string) {
    try {
      let master = await this.prisma.master.findFirst({
        where: { id },
        include: {
          masterLevels: {
            include: {
              level: true,
            },
          },
          masterProduct: {
            include: {
              Product: true,
            },
          },
        },
      });

      if (!master) {
        throw new InternalServerErrorException('Bunday master topilmadi');
      }
      return master;
    } catch (error) {
      throw new InternalServerErrorException('Masterni olishda xatolik');
    }
  }
  async update(id: string, data: UpdateMasterDto) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const master = await tx.master.update({
          where: { id },
          data: {
            name: data.name,
            phone: data.phone,
            year: data.year,
            minWorkingHours: data.minWorkingHours,
            priceHourly: data.priceHourly,
            priceDaily: data.priceDaily,
            experience: data.experience,
            image: data.image,
            passportImage: data.passportImage,
            about: data.about,
          },
        });
        
        if (data.masterLevel?.length) {
          await tx.masterLevel.deleteMany({
            where: { masterId: id },
          });
          await tx.masterLevel.createMany({
            data: data.masterLevel.map((level) => ({
              masterId: master.id,
              levelId: level.levelId,
            })),
            skipDuplicates: true,
          });
        }

        if (data.masterProduct?.length) {
          await tx.masterProduct.deleteMany({
            where: { masterId: id },
          });
          await tx.masterProduct.createMany({
            data: data.masterProduct.map((product) => ({
              masterId: master.id,
              productId: product.productId,
            })),
            skipDuplicates: true,
          });
        }
        return result;
      });
    } catch (error) {
      throw new InternalServerErrorException('Masterni yangilashda xatolik');
    }
  }

  async remove(id: string) {
    try {
      const result = await this.prisma.master.delete({
        where: { id },
      });
      if (!result) {
        throw new InternalServerErrorException('Bunday master topilmadi');
      }
      return result;
    } catch (error) {
      throw new InternalServerErrorException("Masterni o'chirishda xatolik");
    }
  }
}
