import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SearchController } from './search.controller.js';
import { SearchService } from './search.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
