import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { SyncLocationDto } from './dto/sync-location.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('location/sync')
  syncLocation(@GetUser() user: { id: string }, @Body() dto: SyncLocationDto) {
    return this.authService.syncLocation(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('change-password')
  changePassword(@GetUser() user: { id: string }, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('logout')
  @Post('refresh')
  refreshTokens(@Body() body: { refreshToken: string }) {
    return this.authService.refreshTokens(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('logout')
  logout(@GetUser() user: { id: string }) {
    return this.authService.logout(user.id);
  }
}
