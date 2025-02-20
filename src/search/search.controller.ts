import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // 노래 및 앨범 통합 검색 로직
  @Get('')
  async findsearch(@Query('page') page : number, @Query('page_size') page_size : number, @Query('title') title? : string, @Query('singerName') singerName? : string){
    const find = await this.searchService.integration(page, page_size, title, singerName);
    return find;
  }
}
