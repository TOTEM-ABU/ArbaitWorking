import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBasketDto } from './dto/create-basket.dto';
import { UpdateBasketDto } from './dto/update-basket.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BasketService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBasketDto, userId: string) {
    try {
      let product = await this.prisma.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw new NotFoundException('Some products not found');
      }

      let tool = await this.prisma.tool.findUnique({
        where: { id: data.toolsId },
      });

      if (!tool) {
        throw new NotFoundException('Some tools not found');
      }

      let level = await this.prisma.level.findUnique({
        where: { id: data.levelId },
      });

      if (!level) {
        throw new NotFoundException('Some levels not found');
      }

      let basket = await this.prisma.basket.create({
        data: { ...data, userId: userId, total: Number(data.total) },
      });

      return basket;
    } catch (error) {
      throw new BadRequestException('Cannot create basket');
    }
  }

  async myBasket(request: Request) {
    try {
      let userId = request['user'];
      let mybasket = await this.prisma.basket.findMany({
        where: { userId: userId },
      });

      if (!mybasket) {
        throw new NotFoundException("You don't have basket yet");
      }

      return mybasket;
    } catch (error) {
      throw new NotFoundException("You don't have basket yet");
    }
  }

  async update(id: string, data: UpdateBasketDto) {
    try {
      const updateData: any = { ...data };

      if (updateData.productId !== undefined) {
        updateData.productId = Number(updateData.productId);
      }

      if (updateData.toolsId !== undefined) {
        updateData.toolsId = Number(updateData.toolsId);
      }

      if (updateData.levelId !== undefined) {
        updateData.levelId = Number(updateData.levelId);
      }

      if (updateData.total !== undefined) {
        updateData.total = Number(updateData.total);
      }

      let updatedBasket = await this.prisma.basket.update({
        where: { id: Number(id) },
        data: updateData,
      });
      return { updatedBasket };
    } catch (error) {
      throw new BadRequestException('Cannot update basket');
    }
  }

  async remove(id: string) {
    try {
      const basket = await this.prisma.basket.delete({
        where: { id: Number(id) },
      });

      if (!basket) {
        throw new NotFoundException('Cannot find basket');
      }

      return basket;
    } catch (error) {
      throw new NotFoundException('Cannot find basket');
    }
  }
}
