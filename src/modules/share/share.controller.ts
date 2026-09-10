import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ShareService } from './share.service.js';

@ApiTags('Share')
@Controller('c')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Get(':shareSlug')
  getCouponShareData(@Param('shareSlug') shareSlug: string) {
    return this.shareService.getCouponShareData(shareSlug);
  }
}
