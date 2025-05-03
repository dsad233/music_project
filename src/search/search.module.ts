import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from 'src/posts/entities/posts.entity';
import { Albums } from 'src/albums/entities/album.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Posts, Albums])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
