import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto.js';
import { SupportService } from './support.service.js';

@ApiTags('Support')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Submit a new support ticket (Guest or Logged in)' })
  createTicket(
    @GetUser() user: { id: string } | undefined,
    @Body() dto: CreateSupportTicketDto,
  ) {
    return this.supportService.createTicket(user?.id, dto);
  }

  @Get('tickets')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List all support tickets (Admin only)' })
  findAll() {
    return this.supportService.findAll();
  }

  @Get('tickets/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get support ticket details (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.supportService.findOne(id);
  }

  @Patch('tickets/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update support ticket status (Admin only)' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.supportService.updateStatus(id, status);
  }

  @Patch('tickets/:id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Reply to support ticket (Admin only)' })
  replyTicket(@Param('id') id: string, @Body('response') response: string) {
    return this.supportService.replyTicket(id, response);
  }
}


