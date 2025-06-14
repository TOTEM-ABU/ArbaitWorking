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

    await this.clearUserBasket(userId);

    return finalOrder;
  }

  private async clearUserBasket(userId: string) {
    try {
      await this.prisma.basket.deleteMany({
        where: {
          userId: userId,
        },
      });

      await this.prisma.basket.deleteMany({
        where: {
          userId: userId,
        },
      });
    } catch (error) {
      console.error('Failed to clear user basket:', error);
    }
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
        isActive: true,
      },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: statusType.IN_PROGRESS },
    });

    return { message: 'Masterlar muvaffaqiyatli biriktirildi' };
  }

  async findAll(query: any) {
    const {
      total,
      lat,
      long,
      address,
      date,
      paymentType,
      withDelivery,
      status,
      toolId,
      productId,
      masterId,
      sort,
      page = 1,
      limit = 10,
    } = query;

    const where: any = {};

    if (total !== undefined) where.total = total;
    if (lat !== undefined) where.lat = lat;
    if (long !== undefined) where.long = long;
    if (address !== undefined)
      where.address = { contains: address, mode: 'insensitive' };
    if (date !== undefined) where.date = new Date(date);
    if (paymentType !== undefined) where.paymentType = paymentType;
    if (withDelivery !== undefined) where.withDelivery = withDelivery;
    if (status !== undefined) where.status = status;

    // Filter by relation ids:
    if (toolId && toolId.length > 0) {
      where.orderTools = {
        some: {
          toolId: { in: toolId },
        },
      };
    }

    if (productId && productId.length > 0) {
      where.orderProducts = {
        some: {
          productId: { in: productId },
        },
      };
    }

    if (masterId && masterId.length > 0) {
      where.masters = {
        some: {
          masterId: { in: masterId },
        },
      };
    }

    // Sorting
    let orderBy = {};
    if (sort) {
      // sort example: "date:asc" or "total:desc"
      const [field, order] = sort.split(':');
      orderBy = {
        [field]: order,
      };
    } else {
      orderBy = { date: 'desc' }; // default sort
    }

    const skip = (page - 1) * limit;

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        orderTools: { include: { Tool: true } },
        orderProducts: { include: { Product: true } },
        masters: { include: { Master: true } },
        comment: true,
      },
      orderBy,
      skip,
      take: limit,
    });

    return orders;
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
        comment: true,
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
