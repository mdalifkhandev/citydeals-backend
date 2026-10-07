import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto.js';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) { }

  createTicket(userId: string | undefined, dto: CreateSupportTicketDto) {
    const formattedMessage = dto.subject?.trim()
      ? `[Subject: ${dto.subject.trim()}]\n\n${dto.message.trim()}`
      : dto.message.trim();

    return this.prisma.supportTicket.create({
      data: {
        userId: userId ?? null,
        fullName: dto.fullName.trim(),
        email: dto.email.trim().toLowerCase(),
        message: formattedMessage,
      },
    });
  }

  findAll() {
    return this.prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phoneNumber: true },
        },
      },
    });
    if (!ticket) {
      throw new NotFoundException(`Support ticket ${id} not found`);
    }
    return ticket;
  }

  updateStatus(id: string, status: string) {
    return this.prisma.supportTicket.update({
      where: { id },
      data: { status: status.toUpperCase() },
    });
  }

  replyTicket(id: string, response: string) {
    return this.prisma.supportTicket.update({
      where: { id },
      data: {
        response: response.trim(),
        status: 'PENDING',
      } as any,
    });
  }
}
