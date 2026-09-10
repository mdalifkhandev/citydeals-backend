import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { UpdateLanguageDto } from './dto/update-language.dto.js';
import { UpdateMeDto } from './dto/update-me.dto.js';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@GetUser() user: { id: string }) {
    return this.usersService.getMe(user.id);
  }

  @Patch('me')
  updateMe(@GetUser() user: { id: string }, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(user.id, dto);
  }

  @Patch('me/language')
  updateLanguage(@GetUser() user: { id: string }, @Body() dto: UpdateLanguageDto) {
    return this.usersService.updateLanguage(user.id, dto);
  }

  @Patch('me/notifications')
  updateNotificationSettings(
    @GetUser() user: { id: string },
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    return this.usersService.updateNotificationSettings(user.id, dto);
  }
}
