import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { measure, statusType } from '@prisma/client';
import { AddMastersToOrderDto } from './dto/addMasters.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto, userId: string) {
    let total = 0;

    const createdOrder = await this.prisma.order.create({
      data: {
        lat: dto.lat,
        long: dto.long,
        address: dto.address,
        date: new Date(dto.date),
        paymentType: dto.paymentType,
        withDelivery: dto.withDelivery,
        commentToDelivery: dto.commentToDelivery,
        userId,
        total: 0,
        status: statusType.PENDING,
      },
    });

    for (const orderProduct of dto.orderProducts) {
      const product = await this.prisma.product.findUnique({
        where: { id: orderProduct.productId },
      });

      if (!product) throw new NotFoundException('Product not found');

      if (product.quantity < orderProduct.count) {
        throw new BadRequestException('Not enough quantity in product');
      }

      const price =
        orderProduct.measure === measure.HOUR
          ? product.priceHourly
          : product.priceDaily;

      const subTotal = price * orderProduct.count;
      total += subTotal;

      const updatedQuantity = product.quantity - orderProduct.count;

      await this.prisma.product.update({
        where: { id: product.id },
        data: {
          quantity: updatedQuantity,
          isActive: updatedQuantity > 0,
        },
      });

      await this.prisma.orderProduct.create({
        data: {
          orderId: createdOrder.id,
          productId: orderProduct.productId,
          count: orderProduct.count,
          measure: orderProduct.measure,
          price: price,
          quantity: product.quantity - orderProduct.count,
        },
      });
    }

    if (dto.orderTools && dto.orderTools.length) {
      for (const orderTool of dto.orderTools) {
        const tool = await this.prisma.tool.findUnique({
          where: { id: orderTool.toolId },
        });

        if (!tool) throw new NotFoundException('Tool not found');

        if (tool.quantity < orderTool.count) {
          throw new BadRequestException('Not enough quantity in tool');
        }

        const updatedQuantity = tool.quantity - orderTool.count;

        await this.prisma.tool.update({
          where: { id: tool.id },
          data: {
            quantity: updatedQuantity,
            isActive: updatedQuantity > 0,
          },
        });

        await this.prisma.orderTool.create({
          data: {
            orderId: createdOrder.id,
            toolId: tool.id,
            count: orderTool.count,
          },
        });
      }
    }

    const finalOrder = await this.prisma.order.update({
      where: { id: createdOrder.id },
      data: {
        total,
      },
      include: {
        orderProducts: true,
        orderTools: true,
        masters: true,
      },
    });

    return finalOrder;
  }

  async addMastersToOrder(dto: AddMastersToOrderDto) {
    const { orderId, masterIds } = dto;
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order topilmadi');
    }

    const foundMasters = await this.prisma.master.findMany({
      where: {
        id: { in: masterIds },
      },
    });

    if (foundMasters.length !== masterIds.length) {
      throw new BadRequestException('Baʼzi masterlar topilmadi');
    }

    const orderMasters = masterIds.map((masterId) => ({
      orderId,
      masterId,
    }));

    await this.prisma.orderMaster.createMany({
      data: orderMasters,
      skipDuplicates: true,
    });

    await this.prisma.master.updateMany({
      where: {
        id: { in: masterIds },
      },
      data: {
        isActive: false,
      },
    });

    return { message: 'Masterlar muvaffaqiyatli biriktirildi' };
  }

  async findAll() {
    try {
      const order = this.prisma.order.findMany({
        include: {
          orderTools: {
            include: {
              Tool: true,
            },
          },
          orderProducts: {
            include: {
              Product: true,
            },
          },
          masters: {
            include: {
              Master: true,
            },
          },
        },
      });
      return order;
    } catch (error) {
      throw new NotFoundException('Orders not found');
    }
  }

  async findOne(id: string) {
    const orderexists = await this.prisma.order.findFirst({
      where: { id },
      include: {
        orderTools: {
          include: {
            Tool: true,
          },
        },
        orderProducts: {
          include: {
            Product: true,
          },
        },
        masters: {
          include: {
            Master: true,
          },
        },
      },
    });

    if (!orderexists) {
      throw new BadRequestException('Order not found');
    }

    try {
      const order = await this.prisma.order.findFirst({ where: { id } });
      return order;
    } catch (error) {
      throw new NotFoundException('Cannot get order');
    }
  }

  async update(id: string, data: UpdateOrderDto) {
    const orderexists = await this.prisma.order.findFirst({ where: { id } });

    if (!orderexists) {
      throw new BadRequestException('Order not found');
    }

    const { orderTools, orderProducts, ...updateData } = data;

    try {
      const update = await this.prisma.order.update({
        where: { id },
        data: updateData,
      });
      return update;
    } catch (error) {
      throw new BadRequestException('Cannot update orders');
    }
  }

  async myOrders(userId: string) {
    try {
      const order = await this.prisma.order.findFirst({ where: { userId } });
      if (!order) {
        throw new NotFoundException('User have not orders');
      }
      return order;
    } catch (error) {
      throw new NotFoundException('Orders not found');
    }
  }

  async remove(id: string) {
    const orderexists = await this.prisma.order.findFirst({ where: { id } });

    if (!orderexists) {
      throw new BadRequestException('Order not found');
    }
    try {
      const order = await this.prisma.order.delete({ where: { id } });
      return order;
    } catch (error) {}
  }
}
