import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { SearchQueryDto } from './dto/search-query.dto.js';
import { SearchService } from './search.service.js';

@ApiTags('Search')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@GetUser() user: { role: string; areaId?: string | null }, @Query() query: SearchQueryDto) {
    return this.searchService.search(user, query);
  }
}
