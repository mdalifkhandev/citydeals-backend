import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { SyncLocationDto } from '../auth/dto/sync-location.dto.js';
import { LocationService } from './location.service.js';

@UseGuards(JwtAuthGuard)
@ApiTags('Location')
@ApiBearerAuth('access-token')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('sync')
  sync(@GetUser() user: { id: string }, @Body() dto: SyncLocationDto) {
    return this.locationService.sync(user, dto);
  }
}
