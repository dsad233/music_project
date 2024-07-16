import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { ImageModule } from 'src/image/image.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from './entities/post.entity';
import { Albums } from 'src/albums/entities/album.entity';

@Module({
  imports : [ImageModule, TypeOrmModule.forFeature([Posts, Albums])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
