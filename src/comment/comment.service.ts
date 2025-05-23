import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCommentDto, userId: string ) {
    try {
      const comment = await this.prisma.comment.create({ data: { ...data, userId } });
      if (!comment) {
        throw new BadRequestException('Comment not created');
      }
      return comment;
    } catch (error) {
      throw new BadRequestException('Error creating comment');
    }
  }

  async findAll(query: {
    orderId?: string;
    sortBy?: string;
    sort?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      orderId,
      sortBy = 'createdAt',
      sort = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const where: any = {};
    if (orderId) {
      where.orderId = orderId;
    }

    const [comments, total] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where,
        include: {
          Order: {
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
            },
          },
        },
        orderBy: {
          [sortBy]: sort,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      data: comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: { id },
        include: {
          Order: {
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
            },
          },
        },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      return comment;
    } catch (error) {
      throw new InternalServerErrorException('Error get comment');
    }
  }

  async myComments(userId: string) {
    try {
      const myComments = await this.prisma.comment.findFirst({
        where: { userId },
      });

      if (!myComments) {
        throw new NotFoundException('No comments found for this user');
      }

      return myComments;
    } catch (error) {
      throw new InternalServerErrorException('Error get my comments');
    }
  }

  async update(id: string, data: UpdateCommentDto) {
    try {
      const comment = await this.prisma.comment.update({
        where: { id },
        data,
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      return comment;
    } catch (error) {
      throw new InternalServerErrorException('Error updating comment');
    }
  }

  async remove(id: string) {
    try {
      const comment = await this.prisma.comment.delete({
        where: { id },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      return comment;
    } catch (error) {
      throw new InternalServerErrorException('Error deleting comment');
    }
  }
}
