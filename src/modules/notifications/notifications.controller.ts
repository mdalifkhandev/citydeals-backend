import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { ListNotificationsDto } from './dto/list-notifications.dto.js';
import { NotificationsService } from './notifications.service.js';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findMine(@GetUser() user: { id: string }, @Query() query: ListNotificationsDto) {
    return this.notificationsService.findMine(user.id, query);
  }

  @Patch(':id/read')
  markAsRead(@GetUser() user: { id: string }, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.id, id);
  }
}
