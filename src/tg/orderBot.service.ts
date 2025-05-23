import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { measure, statusType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { InjectBot } from 'nestjs-telegraf';
import { AppUpdate } from './tg.update';

@Injectable()
export class OrderService {
  private readonly CHANNEL_ID = 'https://t.me/suitcas';

  constructor(
    private readonly prisma: PrismaService,
    private readonly appUpdate: AppUpdate,
    @InjectBot() private readonly bot: Telegraf<any>,
  ) {}

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
      if (product.quantity < orderProduct.count)
        throw new BadRequestException('Not enough quantity in product');

      const price =
        orderProduct.measure === measure.HOUR
          ? product.priceHourly
          : product.priceDaily;
      const subTotal = price * orderProduct.count;
      total += subTotal;

      const updatedQuantity = product.quantity - orderProduct.count;
      await this.prisma.product.update({
        where: { id: product.id },
        data: { quantity: updatedQuantity, isActive: updatedQuantity > 0 },
      });

      await this.prisma.orderProduct.create({
        data: {
          orderId: createdOrder.id,
          productId: orderProduct.productId,
          count: orderProduct.count,
          measure: orderProduct.measure,
          price,
          quantity: updatedQuantity,
        },
      });
    }

    if (dto.orderTools?.length) {
      for (const orderTool of dto.orderTools) {
        const tool = await this.prisma.tool.findUnique({
          where: { id: orderTool.toolId },
        });
        if (!tool) throw new NotFoundException('Tool not found');
        if (tool.quantity < orderTool.count)
          throw new BadRequestException('Not enough quantity in tool');

        const updatedQuantity = tool.quantity - orderTool.count;
        await this.prisma.tool.update({
          where: { id: tool.id },
          data: { quantity: updatedQuantity, isActive: updatedQuantity > 0 },
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
      data: { total },
      include: {
        orderProducts: { include: { Product: true } },
        orderTools: { include: { Tool: true } },
        masters: { include: { Master: true } },
      },
    });
    console.log('Telegramga xabar yuborishga urinilmoqda...');
    try {
      await this.appUpdate.sendOrderToTelegram(finalOrder);
      console.log('Xabar muvaffaqiyatli yuborildi');
    } catch (error) {
      console.error('Xabar yuborishda xatolik:', error);
    }
  }
}
