import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LegalService } from './legal.service.js';

@ApiTags('Legal')
@Controller('legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  @Get('terms')
  getTerms() {
    return this.legalService.getTerms();
  }
}
