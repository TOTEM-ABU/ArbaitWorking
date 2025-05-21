import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    let session = await this.prisma.session.findMany();

    if (session.length === 0) {
      throw new Error('Session topilmadi');
    }

    return session;
  }

  async remove(id: string) {
    return await this.prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id },
        select: { id: true, userId: true },
      });

      if (!session) {
        throw new Error('Session topilmadi');
      }

      await tx.session.delete({ where: { id } });

      await tx.user.update({
        where: { id: session.userId },
        data: { isVerified: false },
      });

      return { message: 'Session o‘chirildi, user isVerified false qilindi' };
    });
  }
}
