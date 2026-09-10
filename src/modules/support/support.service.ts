import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto.js';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  createTicket(userId: string | undefined, dto: CreateSupportTicketDto) {
    return this.prisma.supportTicket.create({
      data: {
        userId,
        fullName: dto.fullName,
        email: dto.email,
        message: dto.message,
      },
    });
  }
}
