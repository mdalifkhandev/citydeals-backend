import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AreasService } from './areas.service.js';

@ApiTags('Directory')
@Controller('directory')
export class DirectoryController {
  constructor(private readonly areasService: AreasService) {}

  @Get(':slug')
  findDirectory(@Param('slug') slug: string) {
    return this.areasService.getDirectoryData(slug);
  }
}
