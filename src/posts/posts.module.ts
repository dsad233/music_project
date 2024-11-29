import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { ImageModule } from 'src/image/image.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from './entities/post.entity';
import { Albums } from 'src/albums/entities/album.entity';
import { PostCommentsModule } from './post-comments/post-comments.module';

@Module({
  imports : [ImageModule, TypeOrmModule.forFeature([Posts, Albums]), PostCommentsModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
