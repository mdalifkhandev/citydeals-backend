import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOkResponse({ description: 'Backend health check.' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
