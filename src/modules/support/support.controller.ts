import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto.js';
import { SupportService } from './support.service.js';

@ApiTags('Support')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  createTicket(@GetUser() user: { id: string }, @Body() dto: CreateSupportTicketDto) {
    return this.supportService.createTicket(user.id, dto);
  }
}
